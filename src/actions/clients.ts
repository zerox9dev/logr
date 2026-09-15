"use server";

import { getAuthedPb } from "@/lib/pocketbase-server";
import { filterValue } from "@/lib/pocketbase";
import { toClientRow, fromClient } from "@/lib/pocketbase-mappers";
import type { Client, ClientInsert, ClientUpdate } from "@/types/database";

export async function list(): Promise<Client[]> {
  const { pb, userId } = await getAuthedPb();
  const records = await pb.collection("clients").getFullList({
    filter: `user = "${filterValue(userId)}"`,
    sort: "-created",
  });
  return records.map(toClientRow);
}

export async function create(data: ClientInsert): Promise<Client> {
  const { pb, userId } = await getAuthedPb();
  const record = await pb.collection("clients").create({ ...fromClient(data), user: userId });
  return toClientRow(record);
}

export async function update(id: string, data: ClientUpdate): Promise<Client> {
  const { pb } = await getAuthedPb();
  const record = await pb.collection("clients").update(id, fromClient(data));
  return toClientRow(record);
}

async function remove(id: string): Promise<void> {
  const { pb } = await getAuthedPb();
  await pb.collection("clients").delete(id);
}

export { remove as delete };
