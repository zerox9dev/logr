import { describe, it, expect } from "vitest";
import { encodeSharedInvoice, decodeSharedInvoice, type SharedInvoicePayload } from "./invoice-share";

const payload: SharedInvoicePayload = {
  version: 1,
  invoiceNumber: "INV-0001",
  status: "sent",
  currency: "USD",
  clientName: "Acme Co",
  issuedAt: "2026-01-01T00:00:00.000Z",
  dueDate: "2026-01-15",
  notes: "Thanks!",
  items: [{ description: "Design", quantity: 2, rate: 100, amount: 200 }],
  subtotal: 200,
  taxRate: 20,
  taxAmount: 40,
  total: 240,
};

describe("invoice share codec", () => {
  it("round-trips a payload", () => {
    expect(decodeSharedInvoice(encodeSharedInvoice(payload))).toEqual(payload);
  });

  it("produces a URL-safe string (no +, /, =)", () => {
    expect(encodeSharedInvoice(payload)).not.toMatch(/[+/=]/);
  });

  it("returns null for garbage", () => {
    expect(decodeSharedInvoice("!!!not-base64!!!")).toBeNull();
  });

  it("returns null for a wrong-version payload", () => {
    const bad = encodeSharedInvoice({ ...payload, version: 2 as unknown as 1 });
    expect(decodeSharedInvoice(bad)).toBeNull();
  });
});
