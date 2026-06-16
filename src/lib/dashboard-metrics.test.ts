import { describe, it, expect } from "vitest";
import type { Session, Project, Client, Invoice, Activity, UserSettings } from "@/types/database";
import {
  rangeFor,
  shiftDate,
  isAtCurrentPeriod,
  fmtDuration,
  fmtClock,
  fmtMoney,
  computeMetrics,
  type MetricsInput,
} from "./dashboard-metrics";

// ── Fixtures ──

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "s1",
    user_id: "u1",
    client_id: null,
    project_id: null,
    name: "Work",
    notes: null,
    started_at: "2026-06-15T10:00:00.000Z",
    duration_seconds: 3600,
    rate: 0,
    billing_type: "hourly",
    payment_status: "unpaid",
    created_at: "2026-06-15T10:00:00.000Z",
    ...overrides,
  };
}

// ── Formatters ──

describe("fmtDuration", () => {
  it("rounds to nearest minute and zero-pads minutes with hours", () => {
    expect(fmtDuration(3 * 3600 + 26 * 60)).toBe("3 hr 26 min");
    expect(fmtDuration(2 * 3600 + 6 * 60)).toBe("2 hr 06 min");
    expect(fmtDuration(55 * 60)).toBe("55 min");
  });

  it("clamps negatives to 0 min", () => {
    expect(fmtDuration(-100)).toBe("0 min");
  });
});

describe("fmtClock", () => {
  it("formats HH:MM:SS zero-padded", () => {
    expect(fmtClock(2 * 3600 + 47 * 60 + 18)).toBe("02:47:18");
    expect(fmtClock(0)).toBe("00:00:00");
  });
});

describe("fmtMoney", () => {
  it("formats with thousands and 2 decimals", () => {
    expect(fmtMoney(222.5)).toBe("$222.50");
    expect(fmtMoney(1890)).toBe("$1,890.00");
  });
});

// ── Range math ──

describe("rangeFor", () => {
  it("Day range is [startOfDay, +1 day)", () => {
    const now = new Date(2026, 5, 15, 13, 30);
    const r = rangeFor("Day", now);
    expect(r.start.getHours()).toBe(0);
    expect(r.start.getDate()).toBe(15);
    expect(r.end.getDate()).toBe(16);
  });

  it("Week range starts Monday and spans 7 days", () => {
    // June 17 2026 is a Wednesday → week starts Monday June 15.
    const now = new Date(2026, 5, 17, 9, 0);
    const r = rangeFor("Week", now);
    expect(r.start.getDay()).toBe(1); // Monday
    expect(r.start.getDate()).toBe(15);
    const days = (r.end.getTime() - r.start.getTime()) / 86400000;
    expect(days).toBe(7);
  });

  it("Month range covers the calendar month", () => {
    const now = new Date(2026, 5, 17, 9, 0);
    const r = rangeFor("Month", now);
    expect(r.start.getDate()).toBe(1);
    expect(r.start.getMonth()).toBe(5);
    expect(r.end.getMonth()).toBe(6);
    expect(r.end.getDate()).toBe(1);
  });

  it("All range starts at epoch", () => {
    const now = new Date(2026, 5, 17, 9, 0);
    const r = rangeFor("All", now);
    expect(r.start.getTime()).toBe(0);
  });
});

describe("shiftDate", () => {
  it("moves day/week/month by direction", () => {
    const d = new Date(2026, 5, 15);
    expect(shiftDate(d, "Day", 1).getDate()).toBe(16);
    expect(shiftDate(d, "Day", -1).getDate()).toBe(14);
    expect(shiftDate(d, "Week", 1).getDate()).toBe(22);
    expect(shiftDate(d, "Month", 1).getMonth()).toBe(6);
  });
});

describe("isAtCurrentPeriod", () => {
  it("is always true for All", () => {
    expect(isAtCurrentPeriod("All", new Date(2020, 0, 1), new Date(2026, 5, 15))).toBe(true);
  });

  it("is true when ref is in the same day as today", () => {
    const today = new Date(2026, 5, 15, 18, 0);
    const ref = new Date(2026, 5, 15, 9, 0);
    expect(isAtCurrentPeriod("Day", ref, today)).toBe(true);
  });

  it("is false when ref is a past day", () => {
    const today = new Date(2026, 5, 15);
    const ref = new Date(2026, 5, 10);
    expect(isAtCurrentPeriod("Day", ref, today)).toBe(false);
  });
});

// ── computeMetrics (deterministic parts) ──

describe("computeMetrics", () => {
  const settings: UserSettings = {
    id: "set1",
    user_id: "u1",
    full_name: null,
    company: null,
    email: null,
    phone: null,
    address: null,
    default_currency: "USD",
    default_rate: 75,
    logo_url: null,
    weekly_goal_hours: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };

  const projects: Project[] = [
    { id: "p1", user_id: "u1", client_id: "c1", name: "Website", billing_type: "hourly", rate: 100, fixed_budget: null, status: "active", created_at: "2026-01-01T00:00:00.000Z" },
  ];
  const clients: Client[] = [
    { id: "c1", user_id: "u1", name: "Acme", email: null, phone: null, company: null, address: null, country: null, website: null, tags: [], notes: null, created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z" },
  ];
  const invoices: Invoice[] = [];
  const activities: Activity[] = [];

  // Anchor on a fixed local-time day so range filtering is deterministic.
  const now = new Date(2026, 5, 15, 23, 0); // June 15 2026, local
  const today = now;

  function input(sessions: Session[]): MetricsInput {
    return { sessions, projects, clients, invoices, activities, settings, now, today, period: "Day" };
  }

  it("exposes the default rate in the tracking view", () => {
    const m = computeMetrics(input([]));
    expect(m.tracking.rate).toBe(75);
    expect(m.tracking.rateLabel).toBe("$75/hr");
  });

  it("marks projects view empty when no sessions in range", () => {
    const m = computeMetrics(input([]));
    expect(m.projects.empty).toBe(true);
    expect(m.projects.rows).toHaveLength(0);
  });

  it("aggregates billable vs non-billable for in-range sessions", () => {
    // Two sessions on June 15 (local): one billable (rate>0), one not.
    const billableSession = makeSession({
      id: "b1",
      project_id: "p1",
      client_id: "c1",
      rate: 100,
      duration_seconds: 7200, // 2h
      started_at: new Date(2026, 5, 15, 10, 0).toISOString(),
    });
    const internalSession = makeSession({
      id: "n1",
      rate: 0,
      duration_seconds: 3600, // 1h
      started_at: new Date(2026, 5, 15, 14, 0).toISOString(),
    });

    const m = computeMetrics(input([billableSession, internalSession]));

    // 2h billable of 3h total → 67%.
    expect(m.billable.billablePct).toBe(67);
    expect(m.billable.nonBillablePct).toBe(33);
    expect(m.billable.billableTimeLabel).toBe("2 hr 00 min");
    // earned = 2h * $100 = $200.
    expect(m.billable.billableEarnedLabel).toBe("$200.00 earned");
    // One client row + an "Internal" row.
    expect(m.billable.clients.some((c) => c.internal)).toBe(true);
    expect(m.billable.clients.some((c) => c.name === "Acme")).toBe(true);
  });

  it("excludes out-of-range sessions from the Day scope", () => {
    const inRange = makeSession({ id: "in", project_id: "p1", rate: 100, started_at: new Date(2026, 5, 15, 10, 0).toISOString() });
    const lastWeek = makeSession({ id: "out", project_id: "p1", rate: 100, started_at: new Date(2026, 5, 1, 10, 0).toISOString() });

    const m = computeMetrics(input([inRange, lastWeek]));
    // Only the in-range session contributes to projects.
    expect(m.projects.rows).toHaveLength(1);
    expect(m.daily.sentence.tasks).toBe("1");
  });
});
