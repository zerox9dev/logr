import type { Session, Invoice, InvoiceItemInsert } from "@/types/database";

/** A line item before it is attached to an invoice (no invoice_id yet). */
export type DraftInvoiceItem = Omit<InvoiceItemInsert, "invoice_id">;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Client's billable (rate > 0) sessions not yet attached to any invoice,
 *  oldest first so line items read chronologically. */
export function unbilledSessions(
  sessions: Session[],
  clientId: string,
  billedSessionIds: ReadonlySet<string>,
): Session[] {
  return sessions
    .filter((s) => s.client_id === clientId && (s.rate || 0) > 0 && !billedSessionIds.has(s.id))
    .sort((a, b) => a.started_at.localeCompare(b.started_at));
}

/** Turn a session into a draft line item: quantity = hours, amount = hours × rate. */
export function sessionToInvoiceItem(s: Session): DraftInvoiceItem {
  const quantity = round2(s.duration_seconds / 3600);
  return {
    session_id: s.id,
    description: s.name || "Untitled",
    quantity,
    rate: s.rate,
    amount: round2(quantity * s.rate),
  };
}

export interface InvoiceTotals {
  subtotal: number;
  tax_amount: number;
  total: number;
}

/** Subtotal from line items, tax from a percentage rate (e.g. 20 → 20%). */
export function computeInvoiceTotals(items: DraftInvoiceItem[], taxRatePct: number): InvoiceTotals {
  const subtotal = round2(items.reduce((sum, i) => sum + i.amount, 0));
  const tax_amount = round2(subtotal * (taxRatePct || 0) / 100);
  return { subtotal, tax_amount, total: round2(subtotal + tax_amount) };
}

/** Next sequential invoice number "INV-0001" based on existing invoices. */
export function nextInvoiceNumber(invoices: Invoice[]): string {
  const max = invoices.reduce((m, inv) => {
    const match = /(\d+)\s*$/.exec(inv.invoice_number || "");
    const n = match ? Number(match[1]) : 0;
    return n > m ? n : m;
  }, 0);
  return `INV-${String(max + 1).padStart(4, "0")}`;
}
