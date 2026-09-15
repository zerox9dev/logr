"use server";

import { getAuthedPb } from "@/lib/pocketbase-server";
import { filterValue } from "@/lib/pocketbase";
import { toActivityRow, fromActivity } from "@/lib/pocketbase-mappers";
import type { Activity, ActivityInsert } from "@/types/database";

export async function list(limit = 50): Promise<Activity[]> {
  const { pb, userId } = await getAuthedPb();
  const page = await pb.collection("activities").getList(1, limit, {
    filter: `user = "${filterValue(userId)}"`,
    sort: "-created",
  });
  return page.items.map(toActivityRow);
}

export async function listByClient(clientId: string): Promise<Activity[]> {
  const { pb, userId } = await getAuthedPb();
  const records = await pb.collection("activities").getFullList({
    filter: `user = "${filterValue(userId)}" && client = "${filterValue(clientId)}"`,
    sort: "-created",
  });
  return records.map(toActivityRow);
}

export async function create(data: ActivityInsert): Promise<Activity> {
  const { pb, userId } = await getAuthedPb();
  const record = await pb.collection("activities").create({ ...fromActivity(data), user: userId });
  return toActivityRow(record);
}

async function remove(id: string): Promise<void> {
  const { pb } = await getAuthedPb();
  await pb.collection("activities").delete(id);
}

export { remove as delete };
