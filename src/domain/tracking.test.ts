import { describe, expect, it } from "vitest";
import type { Project } from "@/types/database";
import { buildSession, trackedTotals } from "./tracking";

function project(over: Partial<Project> = {}): Project {
  return {
    id: "p1", user_id: "u1", client_id: "c1", name: "Website",
    billing_type: "hourly", rate: 80, fixed_budget: null, status: "active",
    jira_avatar_url: null, created_at: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

describe("buildSession", () => {
  const at = new Date(2026, 9, 21, 9, 0).getTime();

  it("files the session under the project and its client", () => {
    const s = buildSession(project(), "Homepage", at, 3600, 80);
    expect(s).toMatchObject({
      project_id: "p1",
      client_id: "c1",
      name: "Homepage",
      duration_seconds: 3600,
      rate: 80,
      billing_type: "hourly",
      payment_status: "unpaid",
    });
    expect(new Date(s.started_at).getTime()).toBe(at);
  });

  it("keeps the rate it is given rather than the project's", () => {
    expect(buildSession(project({ rate: 80 }), "x", at, 60, 65).rate).toBe(65);
  });

  it("names an empty task Untitled", () => {
    expect(buildSession(project(), "   ", at, 60, 0).name).toBe("Untitled");
  });

  it("takes the billing type from the project", () => {
    expect(buildSession(project({ billing_type: "fixed" }), "x", at, 60, 0).billing_type).toBe("fixed");
  });

  it("logs without a project", () => {
    expect(buildSession(undefined, "x", at, 60, 0)).toMatchObject({ project_id: null, client_id: null, billing_type: "hourly" });
  });
});

describe("trackedTotals", () => {
  // Wednesday 21 Oct 2026, 15:00 local; the week runs Mon 19 – Sun 25.
  const now = new Date(2026, 9, 21, 15, 0);
  const at = (d: number, h: number) => new Date(2026, 9, d, h, 0).toISOString();
  const row = (project_id: string | null, started_at: string, duration_seconds: number, rate = 0) => ({
    project_id, started_at, duration_seconds, rate,
  });

  it("splits today from the rest of the week, per project", () => {
    const out = trackedTotals(
      [row("a", at(21, 9), 3600), row("a", at(19, 9), 1800), row("b", at(21, 11), 900)],
      now,
    );
    expect(out.today).toBe(4500);
    expect(out.week).toBe(6300);
    expect(out.byProject.get("a")).toEqual({ today: 3600, week: 5400 });
    expect(out.byProject.get("b")).toEqual({ today: 900, week: 900 });
  });

  it("leaves out sessions from other weeks", () => {
    const out = trackedTotals([row("a", at(18, 9), 3600), row("a", at(26, 9), 3600)], now);
    expect(out.week).toBe(0);
    expect(out.byProject.size).toBe(0);
  });

  it("counts a later day this week toward the week but not today", () => {
    const out = trackedTotals([row("a", at(23, 9), 3600)], now);
    expect(out.today).toBe(0);
    expect(out.week).toBe(3600);
  });

  it("files sessions without a project under an empty key", () => {
    expect(trackedTotals([row(null, at(21, 9), 600)], now).byProject.get("")).toEqual({ today: 600, week: 600 });
  });

  it("earns at each session's own rate", () => {
    const out = trackedTotals([row("a", at(21, 9), 3600, 80), row("b", at(20, 9), 1800, 120)], now);
    expect(out.weekEarned).toBe(140);
  });

  it("counts the running timer as today", () => {
    const out = trackedTotals([row("a", at(21, 9), 3600, 80)], now, { projectId: "a", seconds: 1800, rate: 80 });
    expect(out.today).toBe(5400);
    expect(out.byProject.get("a")?.today).toBe(5400);
    expect(out.weekEarned).toBe(120);
  });
});
