import { describe, it, expect } from "vitest";
import type { Session, Invoice } from "@/types/database";
import {
  unbilledSessions,
  sessionToInvoiceItem,
  computeInvoiceTotals,
  nextInvoiceNumber,
} from "./invoicing";

function session(over: Partial<Session> = {}): Session {
  return {
    id: "s1", user_id: "u1", client_id: "c1", project_id: null,
    name: "Work", notes: null, tags: [],
    started_at: "2026-01-01T10:00:00.000Z", duration_seconds: 3600,
    rate: 100, billing_type: "hourly", payment_status: "unpaid",
    created_at: "2026-01-01T10:00:00.000Z",
    ...over,
  };
}

function invoice(over: Partial<Invoice> = {}): Invoice {
  return {
    id: "i1", user_id: "u1", client_id: "c1", invoice_number: "INV-0001",
    subtotal: 0, tax_rate: 0, tax_amount: 0, total: 0, currency: "USD",
    status: "draft", due_date: null, sent_at: null, paid_at: null,
    notes: null, created_at: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

describe("unbilledSessions", () => {
  it("keeps only the client's billable, not-yet-billed sessions", () => {
    const sessions = [
      session({ id: "a", client_id: "c1", rate: 100 }),
      session({ id: "b", client_id: "c2", rate: 100 }), // other client
      session({ id: "c", client_id: "c1", rate: 0 }),   // non-billable
      session({ id: "d", client_id: "c1", rate: 50 }),  // already billed
    ];
    const result = unbilledSessions(sessions, "c1", new Set(["d"]));
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });

  it("sorts oldest first", () => {
    const sessions = [
      session({ id: "new", started_at: "2026-02-01T10:00:00.000Z" }),
      session({ id: "old", started_at: "2026-01-01T10:00:00.000Z" }),
    ];
    expect(unbilledSessions(sessions, "c1", new Set()).map((s) => s.id)).toEqual(["old", "new"]);
  });
});

describe("sessionToInvoiceItem", () => {
  it("converts duration to hours and computes amount", () => {
    const item = sessionToInvoiceItem(session({ duration_seconds: 5400, rate: 80 })); // 1.5h
    expect(item.quantity).toBe(1.5);
    expect(item.rate).toBe(80);
    expect(item.amount).toBe(120);
  });

  it("falls back to Untitled for empty names", () => {
    expect(sessionToInvoiceItem(session({ name: "" })).description).toBe("Untitled");
  });
});

describe("computeInvoiceTotals", () => {
  it("sums amounts and applies a tax percentage", () => {
    const items = [
      sessionToInvoiceItem(session({ duration_seconds: 3600, rate: 100 })), // 100
      sessionToInvoiceItem(session({ duration_seconds: 1800, rate: 100 })), // 50
    ];
    expect(computeInvoiceTotals(items, 20)).toEqual({ subtotal: 150, tax_amount: 30, total: 180 });
  });

  it("handles zero tax", () => {
    const items = [sessionToInvoiceItem(session({ duration_seconds: 3600, rate: 100 }))];
    expect(computeInvoiceTotals(items, 0)).toEqual({ subtotal: 100, tax_amount: 0, total: 100 });
  });
});

describe("nextInvoiceNumber", () => {
  it("starts at INV-0001 with no invoices", () => {
    expect(nextInvoiceNumber([])).toBe("INV-0001");
  });

  it("increments the highest existing number", () => {
    expect(nextInvoiceNumber([invoice({ invoice_number: "INV-0007" }), invoice({ invoice_number: "INV-0003" })])).toBe("INV-0008");
  });
});
