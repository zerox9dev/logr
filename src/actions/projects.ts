"use server";

import { getAuthedPb } from "@/lib/pocketbase-server";
import { filterValue } from "@/lib/pocketbase";
import { toProjectRow, fromProject } from "@/lib/pocketbase-mappers";
import type { Project, ProjectInsert, ProjectUpdate } from "@/types/database";

export async function list(): Promise<Project[]> {
  const { pb, userId } = await getAuthedPb();
  const records = await pb.collection("projects").getFullList({
    filter: `user = "${filterValue(userId)}"`,
    sort: "-created",
  });
  return records.map(toProjectRow);
}

export async function create(data: ProjectInsert): Promise<Project> {
  const { pb, userId } = await getAuthedPb();
  const record = await pb.collection("projects").create({ ...fromProject(data), user: userId });
  return toProjectRow(record);
}

export async function update(id: string, data: ProjectUpdate): Promise<Project> {
  const { pb } = await getAuthedPb();
  const record = await pb.collection("projects").update(id, fromProject(data));
  return toProjectRow(record);
}

async function remove(id: string): Promise<void> {
  const { pb } = await getAuthedPb();
  await pb.collection("projects").delete(id);
}

export { remove as delete };
