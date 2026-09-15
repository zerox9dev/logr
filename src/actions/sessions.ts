"use server";

import { getAuthedPb } from "@/lib/pocketbase-server";
import { filterValue } from "@/lib/pocketbase";
import { toSessionRow, fromSession } from "@/lib/pocketbase-mappers";
import type { Session, SessionInsert, SessionUpdate } from "@/types/database";

/** Bulk inserts go out in batches so one import never becomes a single huge burst. */
const BULK_CHUNK = 100;

export async function list(): Promise<Session[]> {
  const { pb, userId } = await getAuthedPb();
  const records = await pb.collection("sessions").getFullList({
    filter: `user = "${filterValue(userId)}"`,
    sort: "-started_at",
  });
  return records.map(toSessionRow);
}

export async function create(data: SessionInsert): Promise<Session> {
  const { pb, userId } = await getAuthedPb();
  const record = await pb.collection("sessions").create({ ...fromSession(data), user: userId });
  return toSessionRow(record);
}

export async function createMany(rows: SessionInsert[]): Promise<Session[]> {
  const { pb, userId } = await getAuthedPb();
  const created: Session[] = [];
  for (let i = 0; i < rows.length; i += BULK_CHUNK) {
    const chunk = rows.slice(i, i + BULK_CHUNK);
    const records = await Promise.all(
      chunk.map((row) => pb.collection("sessions").create({ ...fromSession(row), user: userId })),
    );
    created.push(...records.map(toSessionRow));
  }
  return created;
}

export async function update(id: string, data: SessionUpdate): Promise<Session> {
  const { pb } = await getAuthedPb();
  const record = await pb.collection("sessions").update(id, fromSession(data));
  return toSessionRow(record);
}

async function remove(id: string): Promise<void> {
  const { pb } = await getAuthedPb();
  await pb.collection("sessions").delete(id);
}

export { remove as delete };
