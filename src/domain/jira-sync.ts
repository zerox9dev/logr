import { resolveSessionRate } from "@/domain/employer";
import type {
  Client,
  JiraProjectMapping,
  Project,
  SessionInsert,
  UserSettings,
} from "@/types/database";

/** A Jira worklog flattened to only what a session needs, so the planner below
 *  stays pure and testable without any Jira API shapes leaking into it. */
export interface JiraWorklogEntry {
  worklogId: string;
  issueKey: string;
  issueSummary: string;
  projectKey: string;
  /** Jira's `started`, already normalized to ISO. */
  startedAt: string;
  durationSeconds: number;
}

export interface JiraProjectOption {
  key: string;
  name: string;
}

export interface JiraSyncSummary {
  imported: number;
  skippedUnmapped: number;
  skippedDuplicate: number;
}

export interface ImportContext {
  mappings: JiraProjectMapping[];
  /** `jira_worklog_id` of every session already imported for this user. */
  existingWorklogIds: Iterable<string>;
  clients: Client[];
  projects: Project[];
  settings: Pick<UserSettings, "weekly_goal_hours" | "default_rate"> | null;
}

export interface ImportPlan extends Omit<JiraSyncSummary, "imported"> {
  inserts: Omit<SessionInsert, "user_id">[];
}

/** Jira serialises `started` as "2024-01-31T09:00:00.000+0000" — a numeric
 *  offset with no colon, which is outside the ISO 8601 shape `Date` promises
 *  to parse. */
export function worklogStartToIso(started: string): string {
  const withColon = started.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const parsed = new Date(withColon);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

/** Looks up the project a Jira project's worklogs fall back to when the mapping
 *  names no project: one named after the Jira project, under the mapped client.
 *  Name matching is what keeps a repeated sync from creating a second copy. */
export function findProjectByName(
  projects: Project[],
  clientId: string,
  name: string,
): Project | undefined {
  const wanted = name.trim().toLocaleLowerCase();
  return projects.find(
    (p) => p.client_id === clientId && p.name.trim().toLocaleLowerCase() === wanted,
  );
}

/** Turns Jira worklogs into session inserts, dropping the ones whose Jira
 *  project has no mapping and the ones already imported. `jira_worklog_id` is
 *  the dedup key both here and, as a unique index, in the database. */
export function planWorklogImport(worklogs: JiraWorklogEntry[], ctx: ImportContext): ImportPlan {
  const mappingByKey = new Map(ctx.mappings.map((m) => [m.jira_project_key, m]));
  const clientById = new Map(ctx.clients.map((c) => [c.id, c]));
  const projectById = new Map(ctx.projects.map((p) => [p.id, p]));
  const seen = new Set(ctx.existingWorklogIds);

  const inserts: Omit<SessionInsert, "user_id">[] = [];
  let skippedUnmapped = 0;
  let skippedDuplicate = 0;

  for (const worklog of worklogs) {
    const mapping = mappingByKey.get(worklog.projectKey);
    if (!mapping || (!mapping.client_id && !mapping.project_id)) {
      skippedUnmapped++;
      continue;
    }
    if (seen.has(worklog.worklogId)) {
      skippedDuplicate++;
      continue;
    }
    seen.add(worklog.worklogId);

    const project = mapping.project_id ? projectById.get(mapping.project_id) : undefined;
    const clientId = mapping.client_id ?? project?.client_id ?? null;
    const client = clientId ? clientById.get(clientId) : undefined;
    const summary = worklog.issueSummary.trim();

    inserts.push({
      client_id: clientId,
      project_id: project?.id ?? null,
      name: summary ? `${worklog.issueKey} ${summary}` : worklog.issueKey,
      notes: null,
      tags: [],
      started_at: worklog.startedAt,
      duration_seconds: worklog.durationSeconds,
      rate: resolveSessionRate(client, project, ctx.settings),
      billing_type: project?.billing_type ?? "hourly",
      payment_status: "unpaid",
      jira_worklog_id: worklog.worklogId,
    });
  }

  return { inserts, skippedUnmapped, skippedDuplicate };
}
