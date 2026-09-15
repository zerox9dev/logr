"use server";

import { getAuthedPb } from "@/lib/pocketbase-server";
import { filterValue } from "@/lib/pocketbase";
import { toInvoiceItemRow, fromInvoiceItem } from "@/lib/pocketbase-mappers";
import type { InvoiceItem, InvoiceItemInsert, InvoiceItemUpdate } from "@/types/database";

// invoice_items has no `user` relation of its own — ownership is expressed
// through the parent invoice, so every filter goes via the relation path.
function ownedBy(userId: string): string {
  return `invoice.user = "${filterValue(userId)}"`;
}

export async function listByInvoice(invoiceId: string): Promise<InvoiceItem[]> {
  const { pb, userId } = await getAuthedPb();
  const records = await pb.collection("invoice_items").getFullList({
    filter: `${ownedBy(userId)} && invoice = "${filterValue(invoiceId)}"`,
  });
  return records.map(toInvoiceItemRow);
}

/** Session ids already attached to an invoice — used to find unbilled sessions. */
export async function listBilledSessionIds(): Promise<string[]> {
  const { pb, userId } = await getAuthedPb();
  const records = await pb.collection("invoice_items").getFullList({
    filter: `${ownedBy(userId)} && session != ""`,
    fields: "session",
  });
  return records
    .map((r) => (typeof r.session === "string" ? r.session : ""))
    .filter((id): id is string => id !== "");
}

export async function create(data: InvoiceItemInsert): Promise<InvoiceItem> {
  const { pb } = await getAuthedPb();
  const record = await pb.collection("invoice_items").create(fromInvoiceItem(data));
  return toInvoiceItemRow(record);
}

export async function createMany(items: InvoiceItemInsert[]): Promise<InvoiceItem[]> {
  const { pb } = await getAuthedPb();
  const records = await Promise.all(
    items.map((item) => pb.collection("invoice_items").create(fromInvoiceItem(item))),
  );
  return records.map(toInvoiceItemRow);
}

export async function update(id: string, data: InvoiceItemUpdate): Promise<InvoiceItem> {
  const { pb } = await getAuthedPb();
  const record = await pb.collection("invoice_items").update(id, fromInvoiceItem(data));
  return toInvoiceItemRow(record);
}

async function remove(id: string): Promise<void> {
  const { pb } = await getAuthedPb();
  await pb.collection("invoice_items").delete(id);
}

export async function deleteByInvoice(invoiceId: string): Promise<void> {
  const { pb, userId } = await getAuthedPb();
  const records = await pb.collection("invoice_items").getFullList({
    filter: `${ownedBy(userId)} && invoice = "${filterValue(invoiceId)}"`,
    fields: "id",
  });
  await Promise.all(records.map((r) => pb.collection("invoice_items").delete(r.id)));
}

export { remove as delete };
