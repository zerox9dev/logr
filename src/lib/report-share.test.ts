import { describe, it, expect } from "vitest";
import type { Client, Session } from "@/types/database";
import {
  getRangeStart,
  encodeSharedReport,
  decodeSharedReport,
  generateCSV,
  createReportSummary,
  type SharedReportPayload,
} from "./report-share";
import { fmtDurationCompact as formatDuration, getCurrencySymbol } from "./format";

// ── Fixtures ──

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "s1",
    user_id: "u1",
    client_id: null,
    project_id: null,
    name: "Work",
    notes: null,
    tags: [],
    started_at: "2026-06-10T10:00:00.000Z",
    duration_seconds: 3600,
    rate: 0,
    billing_type: "hourly",
    payment_status: "unpaid",
    created_at: "2026-06-10T10:00:00.000Z",
    ...overrides,
  };
}

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: "c1",
    user_id: "u1",
    name: "Acme",
    email: null,
    phone: null,
    company: null,
    address: null,
    country: null,
    website: null,
    tags: [],
    notes: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getRangeStart", () => {
  it("returns null for 'all'", () => {
    expect(getRangeStart("all")).toBeNull();
  });

  it("returns first of month for 'month'", () => {
    const now = new Date(2026, 5, 15, 13, 30); // June 15 2026, local
    const start = getRangeStart("month", now)!;
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(5);
    expect(start.getDate()).toBe(1);
  });

  it("returns Monday 00:00 for 'week'", () => {
    // June 15 2026 is a Monday.
    const monday = new Date(2026, 5, 15, 13, 30);
    const start = getRangeStart("week", monday)!;
    expect(start.getDay()).toBe(1); // Monday
    expect(start.getDate()).toBe(15);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
  });

  it("rolls back to Monday when 'now' is Sunday", () => {
    // June 21 2026 is a Sunday.
    const sunday = new Date(2026, 5, 21, 9, 0);
    const start = getRangeStart("week", sunday)!;
    expect(start.getDay()).toBe(1); // Monday
    expect(start.getDate()).toBe(15); // previous Monday
  });
});

describe("formatDuration", () => {
  it("formats sub-hour as minutes only", () => {
    expect(formatDuration(1800)).toBe("30m");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(3660)).toBe("1h 1m");
  });

  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0m");
  });
});

describe("getCurrencySymbol", () => {
  it("maps known currencies", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
    expect(getCurrencySymbol("EUR")).toBe("€");
    expect(getCurrencySymbol("GBP")).toBe("£");
    expect(getCurrencySymbol("UAH")).toBe("₴");
    expect(getCurrencySymbol("PLN")).toBe("zł");
  });

  it("falls back to $ for unknown", () => {
    expect(getCurrencySymbol("XYZ")).toBe("$");
  });
});

describe("encode/decode shared report", () => {
  const payload: SharedReportPayload = {
    version: 1,
    range: "month",
    currency: "EUR",
    totalSeconds: 7200,
    billableSeconds: 3600,
    billableAmount: 100,
    paidAmount: 50,
    generatedAt: "2026-06-15T00:00:00.000Z",
    sessions: [],
    topProjects: [],
    topClients: [],
  };

  it("round-trips a payload", () => {
    const encoded = encodeSharedReport(payload);
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
    expect(decodeSharedReport(encoded)).toEqual(payload);
  });

  it("returns null for garbage input", () => {
    expect(decodeSharedReport("!!!not base64!!!")).toBeNull();
  });

  it("returns null for wrong version", () => {
    const bad = encodeSharedReport({ ...payload, version: 2 as 1 });
    expect(decodeSharedReport(bad)).toBeNull();
  });
});

describe("generateCSV", () => {
  it("emits a header and one row", () => {
    const report: SharedReportPayload = {
      version: 1,
      range: "all",
      currency: "USD",
      totalSeconds: 3600,
      billableSeconds: 3600,
      billableAmount: 50,
      paidAmount: 0,
      generatedAt: "2026-06-15T00:00:00.000Z",
      sessions: [
        {
          id: "s1",
          name: "Build feature",
          projectName: "Website",
          startedAt: "2026-06-10T10:00:00.000Z",
          durationSeconds: 3600,
          rate: 50,
          amount: 50,
          paymentStatus: "unpaid",
          billingType: "hourly",
        },
      ],
      topProjects: [],
      topClients: [],
    };

    const csv = generateCSV(report);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(
      "Date,Description,Project,Duration (sec),Duration (h),Rate,Amount,Status",
    );
    expect(lines[1]).toBe('2026-06-10,"Build feature","Website",3600,1.00,50,50.00,unpaid');
  });
});

describe("createReportSummary", () => {
  it("computes hourly billable and paid amounts", () => {
    const sessions: Session[] = [
      makeSession({
        id: "h1",
        project_id: "p1",
        client_id: "c1",
        rate: 100,
        duration_seconds: 3600, // 1h
        billing_type: "hourly",
        payment_status: "paid",
      }),
      makeSession({
        id: "h2",
        project_id: "p1",
        client_id: "c1",
        rate: 100,
        duration_seconds: 1800, // 0.5h
        billing_type: "hourly",
        payment_status: "unpaid",
      }),
    ];

    const summary = createReportSummary({
      sessions,
      clients: [makeClient()],
      range: "all",
      getProjectById: (id) =>
        id === "p1"
          ? { id: "p1", name: "Hourly Project", rate: 100, client_id: "c1", billing_type: "hourly" }
          : undefined,
    });

    // billable = 1h*100 + 0.5h*100 = 150; paid = only the paid 1h*100 = 100
    expect(summary.billableAmount).toBe(150);
    expect(summary.paidAmount).toBe(100);
    expect(summary.totalSeconds).toBe(5400);
    expect(summary.billableSeconds).toBe(5400);
    expect(summary.sessions).toHaveLength(2);
  });

  it("computes fixed-budget amounts split across sessions", () => {
    const sessions: Session[] = [
      makeSession({
        id: "f1",
        project_id: "p2",
        client_id: "c1",
        rate: 0,
        duration_seconds: 3600,
        billing_type: "fixed",
        payment_status: "paid",
      }),
      makeSession({
        id: "f2",
        project_id: "p2",
        client_id: "c1",
        rate: 0,
        duration_seconds: 3600,
        billing_type: "fixed",
        payment_status: "unpaid",
      }),
    ];

    const summary = createReportSummary({
      sessions,
      clients: [makeClient()],
      range: "all",
      getProjectById: (id) =>
        id === "p2"
          ? { id: "p2", name: "Fixed Project", rate: null, client_id: "c1", billing_type: "fixed", fixed_budget: 2000 }
          : undefined,
    });

    // Fixed budget counted once for the project (2000). Paid because one session is paid.
    expect(summary.billableAmount).toBe(2000);
    expect(summary.paidAmount).toBe(2000);
    // billableSeconds only counts hourly sessions → 0 here.
    expect(summary.billableSeconds).toBe(0);
    // Per-session amount = fixed_budget / number of sibling sessions = 2000/2 = 1000.
    const amounts = summary.sessions.map((s) => s.amount).sort();
    expect(amounts).toEqual([1000, 1000]);
  });
});
