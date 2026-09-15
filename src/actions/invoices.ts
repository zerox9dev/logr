"use server";

import { getAuthedPb } from "@/lib/pocketbase-server";
import { filterValue } from "@/lib/pocketbase";
import { toInvoiceRow, fromInvoice } from "@/lib/pocketbase-mappers";
import type { Invoice, InvoiceInsert, InvoiceUpdate } from "@/types/database";

export async function list(): Promise<Invoice[]> {
  const { pb, userId } = await getAuthedPb();
  const records = await pb.collection("invoices").getFullList({
    filter: `user = "${filterValue(userId)}"`,
    sort: "-created",
  });
  return records.map(toInvoiceRow);
}

export async function create(data: InvoiceInsert): Promise<Invoice> {
  const { pb, userId } = await getAuthedPb();
  const record = await pb.collection("invoices").create({ ...fromInvoice(data), user: userId });
  return toInvoiceRow(record);
}

export async function update(id: string, data: InvoiceUpdate): Promise<Invoice> {
  const { pb } = await getAuthedPb();
  const record = await pb.collection("invoices").update(id, fromInvoice(data));
  return toInvoiceRow(record);
}

async function remove(id: string): Promise<void> {
  const { pb } = await getAuthedPb();
  await pb.collection("invoices").delete(id);
}

export { remove as delete };
