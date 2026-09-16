import { describe, it, expect } from "vitest";
import type { Client, JiraProjectMapping, Project } from "@/types/database";
import {
  findProjectByName,
  planWorklogImport,
  worklogStartToIso,
  type JiraWorklogEntry,
} from "./jira-sync";

function client(over: Partial<Client> = {}): Client {
  return {
    id: "c1", user_id: "u1", name: "Acme",
    email: null, phone: null, company: null, address: null, country: null,
    website: null, tags: [], notes: null,
    client_type: "client", salary_amount: null, salary_period: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

function project(over: Partial<Project> = {}): Project {
  return {
    id: "p1", user_id: "u1", client_id: "c1", name: "Sprint 42",
    billing_type: "hourly", rate: 90, fixed_budget: null, status: "active",
    created_at: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

function mapping(over: Partial<JiraProjectMapping> = {}): JiraProjectMapping {
  return {
    id: "m1", user_id: "u1", jira_project_key: "ENG", jira_project_name: "Engineering",
    client_id: "c1", project_id: "p1",
    ...over,
  };
}

function worklog(over: Partial<JiraWorklogEntry> = {}): JiraWorklogEntry {
  return {
    worklogId: "10001",
    issueKey: "ENG-7",
    issueSummary: "Fix the importer",
    projectKey: "ENG",
    startedAt: "2026-02-01T09:00:00.000Z",
    durationSeconds: 3600,
    ...over,
  };
}

const ctx = (over: Partial<Parameters<typeof planWorklogImport>[1]> = {}) => ({
  mappings: [mapping()],
  existingWorklogIds: [],
  clients: [client()],
  projects: [project()],
  settings: { weekly_goal_hours: 40, default_rate: 50 },
  ...over,
});

describe("worklogStartToIso", () => {
  it("parses Jira's colon-less UTC offset", () => {
    expect(worklogStartToIso("2026-02-01T12:00:00.000+0000")).toBe("2026-02-01T12:00:00.000Z");
  });

  it("parses a non-zero offset", () => {
    expect(worklogStartToIso("2026-02-01T12:00:00.000+0200")).toBe("2026-02-01T10:00:00.000Z");
  });
});

describe("findProjectByName", () => {
  const existing = project({ id: "p9", name: "Crypto Attention (old EVAI)" });

  it("reuses the project already created for that Jira project", () => {
    expect(findProjectByName([existing], "c1", "Crypto Attention (old EVAI)")?.id).toBe("p9");
  });

  it("ignores surrounding whitespace and case", () => {
    expect(findProjectByName([existing], "c1", "  crypto attention (OLD EVAI) ")?.id).toBe("p9");
  });

  it("does not reuse a same-named project of another client", () => {
    expect(findProjectByName([existing], "c2", "Crypto Attention (old EVAI)")).toBeUndefined();
  });
});

describe("planWorklogImport", () => {
  it("builds one session per mapped worklog", () => {
    const plan = planWorklogImport([worklog()], ctx());
    expect(plan.inserts).toHaveLength(1);
    expect(plan.inserts[0]).toMatchObject({
      client_id: "c1",
      project_id: "p1",
      name: "ENG-7 Fix the importer",
      duration_seconds: 3600,
      payment_status: "unpaid",
      jira_worklog_id: "10001",
    });
  });

  it("skips worklogs from projects with no mapping", () => {
    const plan = planWorklogImport([worklog({ projectKey: "OPS" })], ctx());
    expect(plan.inserts).toHaveLength(0);
    expect(plan.skippedUnmapped).toBe(1);
  });

  it("skips a mapping that points at neither a client nor a project", () => {
    const plan = planWorklogImport(
      [worklog()],
      ctx({ mappings: [mapping({ client_id: null, project_id: null })] }),
    );
    expect(plan.skippedUnmapped).toBe(1);
  });

  it("skips worklogs already imported", () => {
    const plan = planWorklogImport([worklog()], ctx({ existingWorklogIds: ["10001"] }));
    expect(plan.inserts).toHaveLength(0);
    expect(plan.skippedDuplicate).toBe(1);
  });

  it("dedups repeats inside the same batch", () => {
    const plan = planWorklogImport([worklog(), worklog()], ctx());
    expect(plan.inserts).toHaveLength(1);
    expect(plan.skippedDuplicate).toBe(1);
  });

  it("takes the project's rate for a regular client", () => {
    expect(planWorklogImport([worklog()], ctx()).inserts[0].rate).toBe(90);
  });

  it("falls back to the default rate when the project has none", () => {
    const plan = planWorklogImport([worklog()], ctx({ projects: [project({ rate: null })] }));
    expect(plan.inserts[0].rate).toBe(50);
  });

  it("prefers an employer client's salary-implied rate over the project rate", () => {
    const employer = client({ client_type: "employer", salary_amount: 6000, salary_period: "monthly" });
    const plan = planWorklogImport([worklog()], ctx({ clients: [employer] }));
    // 6000 / (40 * 52 / 12) ≈ 34.6153…, the same figure the timer bakes in.
    expect(plan.inserts[0].rate).toBeCloseTo(6000 / ((40 * 52) / 12), 6);
  });

  it("derives the client from the mapped project when the mapping has none", () => {
    const plan = planWorklogImport([worklog()], ctx({ mappings: [mapping({ client_id: null })] }));
    expect(plan.inserts[0].client_id).toBe("c1");
  });

  it("uses the issue key alone when the summary is empty", () => {
    const plan = planWorklogImport([worklog({ issueSummary: "  " })], ctx());
    expect(plan.inserts[0].name).toBe("ENG-7");
  });
});
