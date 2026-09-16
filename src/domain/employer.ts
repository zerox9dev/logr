import type { Client, Project, UserSettings } from "@/types/database";

/** Hourly rate implied by an employer client's salary, or null for regular
 *  clients (and employers with no salary set). `weeklyGoalHours` doubles as the
 *  "how long is a full work week" assumption; 40 when the user hasn't set one. */
export function impliedHourlyRate(
  client: Client | undefined,
  weeklyGoalHours: number | null,
): number | null {
  if (!client || client.client_type !== "employer" || !client.salary_amount) return null;
  const hoursPerWeek = weeklyGoalHours ?? 40;
  if (hoursPerWeek <= 0) return null;
  switch (client.salary_period) {
    case "monthly":
      return client.salary_amount / ((hoursPerWeek * 52) / 12);
    case "annual":
      return client.salary_amount / (hoursPerWeek * 52);
    default:
      return client.salary_amount;
  }
}

/** The rate a new session gets baked with, in the one order every creation
 *  path uses: an employer client's salary-implied hourly rate first, then the
 *  project's own rate, then the user's default, then zero. */
export function resolveSessionRate(
  client: Client | undefined,
  project: Pick<Project, "rate"> | undefined,
  settings: Pick<UserSettings, "weekly_goal_hours" | "default_rate"> | null,
): number {
  return (
    impliedHourlyRate(client, settings?.weekly_goal_hours ?? null) ??
    project?.rate ??
    settings?.default_rate ??
    0
  );
}
