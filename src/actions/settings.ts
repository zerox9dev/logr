"use server";

import { getAuthedPb } from "@/lib/pocketbase-server";
import { filterValue } from "@/lib/pocketbase";
import { toUserSettingsRow, fromUserSettings } from "@/lib/pocketbase-mappers";
import type { UserSettings, UserSettingsUpdate } from "@/types/database";

export async function get(): Promise<UserSettings | null> {
  const { pb, userId } = await getAuthedPb();
  try {
    const record = await pb
      .collection("user_settings")
      .getFirstListItem(`user = "${filterValue(userId)}"`);
    return toUserSettingsRow(record);
  } catch {
    // No settings row yet — the dashboard renders defaults until one is saved.
    return null;
  }
}

export async function upsert(_userId: string, update: UserSettingsUpdate): Promise<UserSettings> {
  const { pb, userId } = await getAuthedPb();
  const payload = fromUserSettings(userId, update);
  try {
    const existing = await pb
      .collection("user_settings")
      .getFirstListItem(`user = "${filterValue(userId)}"`);
    return toUserSettingsRow(await pb.collection("user_settings").update(existing.id, payload));
  } catch {
    return toUserSettingsRow(await pb.collection("user_settings").create(payload));
  }
}
