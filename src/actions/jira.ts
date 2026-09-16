"use server";

import type PocketBase from "pocketbase";
import { getAuthedPb } from "@/lib/pocketbase-server";
import { filterValue } from "@/lib/pocketbase";
import {
  TOKEN_EXPIRY_BUFFER_MS,
  atlassianCredentials,
  jiraApiBase,
  refreshTokens,
} from "@/lib/atlassian-oauth";
import {
  fromJiraProjectMapping,
  fromProject,
  fromSession,
  toClientRow,
  toJiraConnectionRow,
  toJiraProjectMappingRow,
  toProjectRow,
  toUserSettingsRow,
} from "@/lib/pocketbase-mappers";
import {
  findProjectByName,
  planWorklogImport,
  worklogStartToIso,
  type JiraProjectOption,
  type JiraSyncSummary,
  type JiraWorklogEntry,
} from "@/domain/jira-sync";
import type {
  JiraConnection,
  JiraConnectionSummary,
  JiraProjectMapping,
  JiraProjectMappingInput,
  Project,
} from "@/types/database";

/** How far back a first-ever sync reaches. Unbounded history would turn one
 *  button press into an unexpectedly massive import. */
const FIRST_SYNC_LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;

/** Jira's own per-request caps: 1000 worklogs per page and per id lookup, 100
 *  issues per bulk fetch, 100 projects per project-search page. */
const WORKLOG_PAGE_LIMIT = 20;
const WORKLOG_ID_CHUNK = 1000;
const ISSUE_CHUNK = 100;
const PROJECT_PAGE_SIZE = 100;
const INSERT_CHUNK = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function findConnection(pb: PocketBase, userId: string): Promise<JiraConnection | null> {
  try {
    const record = await pb
      .collection("jira_connections")
      .getFirstListItem(`user = "${filterValue(userId)}"`);
    return toJiraConnectionRow(record);
  } catch {
    return null;
  }
}

/** Current access token, refreshed in place when it is at or near expiry.
 *  Atlassian rotates the refresh token on every use, so both are rewritten. */
async function validAccessToken(pb: PocketBase, connection: JiraConnection): Promise<string> {
  const expiresAt = connection.token_expires_at ? Date.parse(connection.token_expires_at) : 0;
  if (expiresAt - TOKEN_EXPIRY_BUFFER_MS > Date.now()) return connection.access_token;

  const credentials = atlassianCredentials();
  if (!credentials) throw new Error("Jira integration is not configured");

  const tokens = await refreshTokens(credentials, connection.refresh_token);
  if (!tokens) throw new Error("Jira session expired — reconnect the integration");

  await pb.collection("jira_connections").update(connection.id, {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    token_expires_at: tokens.expiresAt,
  });
  return tokens.accessToken;
}

async function jiraFetch(
  url: string,
  accessToken: string,
  init?: { method: "POST"; body: unknown },
): Promise<unknown> {
  const response = await fetch(url, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(init ? { "Content-Type": "application/json" } : {}),
    },
    body: init ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Jira request failed (${response.status})`);
  return response.json();
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

// ── Connection ──

/** Sanitized view for client code: the stored tokens are deliberately absent
 *  and must never be built into anything a `"use client"` component receives. */
export async function getConnection(): Promise<JiraConnectionSummary | null> {
  const { pb, userId } = await getAuthedPb();
  const connection = await findConnection(pb, userId);
  if (!connection) return null;
  return {
    connected: true,
    siteName: connection.site_name,
    siteUrl: connection.site_url,
    atlassianEmail: connection.atlassian_email,
    lastSyncedAt: connection.last_synced_at,
  };
}

export async function isConfigured(): Promise<boolean> {
  return atlassianCredentials() !== null;
}

export async function disconnect(): Promise<void> {
  const { pb, userId } = await getAuthedPb();
  const connection = await findConnection(pb, userId);
  if (connection) await pb.collection("jira_connections").delete(connection.id);
}

// ── Projects and mappings ──

/** Live project list from Jira, for the mapping UI. */
export async function listJiraProjects(): Promise<JiraProjectOption[]> {
  const { pb, userId } = await getAuthedPb();
  const connection = await findConnection(pb, userId);
  if (!connection) throw new Error("Jira is not connected");
  const token = await validAccessToken(pb, connection);
  const base = jiraApiBase(connection.cloud_id);

  const options: JiraProjectOption[] = [];
  let startAt = 0;
  for (;;) {
    const page = asRecord(
      await jiraFetch(
        `${base}/rest/api/3/project/search?startAt=${startAt}&maxResults=${PROJECT_PAGE_SIZE}&orderBy=name`,
        token,
      ),
    );
    for (const entry of asArray(page.values)) {
      const project = asRecord(entry);
      if (typeof project.key !== "string") continue;
      options.push({
        key: project.key,
        name: typeof project.name === "string" ? project.name : project.key,
      });
    }
    if (page.isLast !== false) break;
    startAt += PROJECT_PAGE_SIZE;
  }
  return options;
}

export async function listMappings(): Promise<JiraProjectMapping[]> {
  const { pb, userId } = await getAuthedPb();
  const records = await pb.collection("jira_project_mappings").getFullList({
    filter: `user = "${filterValue(userId)}"`,
    sort: "jira_project_key",
  });
  return records.map(toJiraProjectMappingRow);
}

/** Upsert by Jira project key. Clearing both targets removes the mapping —
 *  a row that points nowhere would only be skipped by the sync anyway. */
export async function saveMapping(data: JiraProjectMappingInput): Promise<JiraProjectMapping | null> {
  const { pb, userId } = await getAuthedPb();
  const key = data.jira_project_key.trim();
  if (!key) throw new Error("Jira project key is required");

  const existing = await pb
    .collection("jira_project_mappings")
    .getFirstListItem(`user = "${filterValue(userId)}" && jira_project_key = "${filterValue(key)}"`)
    .catch(() => null);

  if (!data.client_id && !data.project_id) {
    if (existing) await pb.collection("jira_project_mappings").delete(existing.id);
    return null;
  }

  const payload = { ...fromJiraProjectMapping({ ...data, jira_project_key: key }), user: userId };
  const record = existing
    ? await pb.collection("jira_project_mappings").update(existing.id, payload)
    : await pb.collection("jira_project_mappings").create(payload);
  return toJiraProjectMappingRow(record);
}

// ── Sync ──

async function fetchWorklogIds(base: string, token: string, sinceMs: number): Promise<number[]> {
  const ids: number[] = [];
  let url = `${base}/rest/api/3/worklog/updated?since=${sinceMs}`;
  for (let page = 0; page < WORKLOG_PAGE_LIMIT; page++) {
    const body = asRecord(await jiraFetch(url, token));
    for (const entry of asArray(body.values)) {
      const worklogId = asRecord(entry).worklogId;
      if (typeof worklogId === "number") ids.push(worklogId);
    }
    const nextPage = body.nextPage;
    if (body.lastPage !== false || typeof nextPage !== "string") break;
    if (!nextPage.startsWith("https://api.atlassian.com/")) break;
    url = nextPage;
  }
  return ids;
}

interface RawWorklog {
  worklogId: string;
  issueId: string;
  startedAt: string;
  durationSeconds: number;
}

async function fetchWorklogs(
  base: string,
  token: string,
  ids: number[],
  accountId: string | null,
): Promise<RawWorklog[]> {
  const out: RawWorklog[] = [];
  for (const batch of chunk(ids, WORKLOG_ID_CHUNK)) {
    const body = await jiraFetch(`${base}/rest/api/3/worklog/list`, token, {
      method: "POST",
      body: { ids: batch },
    });
    for (const entry of asArray(body)) {
      const worklog = asRecord(entry);
      const author = asRecord(worklog.author);
      // `worklog/updated` is site-wide; only the connected account's own time
      // belongs in this user's sessions.
      if (accountId && author.accountId !== accountId) continue;
      if (typeof worklog.id !== "string" || typeof worklog.issueId !== "string") continue;
      if (typeof worklog.started !== "string") continue;
      out.push({
        worklogId: worklog.id,
        issueId: worklog.issueId,
        startedAt: worklogStartToIso(worklog.started),
        durationSeconds: typeof worklog.timeSpentSeconds === "number" ? worklog.timeSpentSeconds : 0,
      });
    }
  }
  return out;
}

interface IssueInfo {
  key: string;
  summary: string;
  projectKey: string;
}

async function fetchIssues(
  base: string,
  token: string,
  issueIds: string[],
): Promise<Map<string, IssueInfo>> {
  const byId = new Map<string, IssueInfo>();
  for (const batch of chunk(issueIds, ISSUE_CHUNK)) {
    const body = asRecord(
      await jiraFetch(`${base}/rest/api/3/issue/bulkfetch`, token, {
        method: "POST",
        body: { issueIdsOrKeys: batch, fields: ["summary", "project"] },
      }),
    );
    for (const entry of asArray(body.issues)) {
      const issue = asRecord(entry);
      const fields = asRecord(issue.fields);
      const project = asRecord(fields.project);
      if (typeof issue.id !== "string" || typeof project.key !== "string") continue;
      byId.set(issue.id, {
        key: typeof issue.key === "string" ? issue.key : issue.id,
        summary: typeof fields.summary === "string" ? fields.summary : "",
        projectKey: project.key,
      });
    }
  }
  return byId;
}

/** Fills in the project for mappings that name only a client: worklogs land in a
 *  logr project named after the Jira project instead of no project at all. The
 *  project is looked up by name under the client first, so only the first sync
 *  after such a mapping is saved actually creates one. `projects` is extended in
 *  place with anything created, so the planner can resolve rates from it. */
async function resolveMappingProjects(
  pb: PocketBase,
  userId: string,
  mappings: JiraProjectMapping[],
  projects: Project[],
): Promise<JiraProjectMapping[]> {
  const resolved: JiraProjectMapping[] = [];

  for (const mapping of mappings) {
    if (mapping.project_id || !mapping.client_id) {
      resolved.push(mapping);
      continue;
    }
    const name = mapping.jira_project_name?.trim() || mapping.jira_project_key;
    let project = findProjectByName(projects, mapping.client_id, name);
    if (!project) {
      const record = await pb.collection("projects").create({
        ...fromProject({
          user_id: userId,
          client_id: mapping.client_id,
          name,
          billing_type: "hourly",
          rate: null,
          fixed_budget: null,
          status: "active",
        }),
        user: userId,
      });
      project = toProjectRow(record);
      projects.push(project);
    }
    resolved.push({ ...mapping, project_id: project.id });
  }

  return resolved;
}

/** Pulls worklogs changed since the last sync (or the last 30 days on a first
 *  run) and turns the mapped ones into sessions. Insert-only: a worklog edited
 *  in Jira after import is not re-applied. */
export async function triggerSync(): Promise<JiraSyncSummary> {
  const { pb, userId } = await getAuthedPb();
  const connection = await findConnection(pb, userId);
  if (!connection) throw new Error("Jira is not connected");

  const token = await validAccessToken(pb, connection);
  const base = jiraApiBase(connection.cloud_id);
  const sinceMs = connection.last_synced_at
    ? Date.parse(connection.last_synced_at)
    : Date.now() - FIRST_SYNC_LOOKBACK_MS;
  // `worklog/updated` never reports the minute preceding the request, so the
  // next sync has to start slightly in the past or that minute is lost.
  const syncedThrough = new Date(Date.now() - 60_000).toISOString();

  const ids = await fetchWorklogIds(base, token, sinceMs);
  const raw = await fetchWorklogs(base, token, ids, connection.atlassian_account_id);
  const issues = await fetchIssues(base, token, [...new Set(raw.map((w) => w.issueId))]);

  const entries: JiraWorklogEntry[] = raw.flatMap((worklog) => {
    const issue = issues.get(worklog.issueId);
    if (!issue) return [];
    return [
      {
        worklogId: worklog.worklogId,
        issueKey: issue.key,
        issueSummary: issue.summary,
        projectKey: issue.projectKey,
        startedAt: worklog.startedAt,
        durationSeconds: worklog.durationSeconds,
      },
    ];
  });

  const [mappings, clientRecords, projectRecords, settingsRecord, importedRecords] = await Promise.all([
    listMappings(),
    pb.collection("clients").getFullList({ filter: `user = "${filterValue(userId)}"` }),
    pb.collection("projects").getFullList({ filter: `user = "${filterValue(userId)}"` }),
    pb
      .collection("user_settings")
      .getFirstListItem(`user = "${filterValue(userId)}"`)
      .catch(() => null),
    pb.collection("sessions").getFullList({
      filter: `user = "${filterValue(userId)}" && jira_worklog_id != ""`,
      fields: "jira_worklog_id",
    }),
  ]);

  const projects = projectRecords.map(toProjectRow);
  const resolvedMappings = await resolveMappingProjects(pb, userId, mappings, projects);

  const plan = planWorklogImport(entries, {
    mappings: resolvedMappings,
    existingWorklogIds: importedRecords
      .map((r) => (typeof r.jira_worklog_id === "string" ? r.jira_worklog_id : ""))
      .filter(Boolean),
    clients: clientRecords.map(toClientRow),
    projects,
    settings: settingsRecord ? toUserSettingsRow(settingsRecord) : null,
  });

  let imported = 0;
  let skippedDuplicate = plan.skippedDuplicate;
  for (const batch of chunk(plan.inserts, INSERT_CHUNK)) {
    const results = await Promise.allSettled(
      batch.map((row) =>
        pb.collection("sessions").create({ ...fromSession({ ...row, user_id: userId }), user: userId }),
      ),
    );
    // A rejected row is almost always the unique (user, jira_worklog_id)
    // index rejecting a worklog imported by an overlapping earlier sync —
    // counted as a duplicate rather than aborting the whole batch.
    for (const result of results) {
      if (result.status === "fulfilled") imported++;
      else skippedDuplicate++;
    }
  }

  await pb.collection("jira_connections").update(connection.id, { last_synced_at: syncedThrough });

  return { imported, skippedUnmapped: plan.skippedUnmapped, skippedDuplicate };
}
