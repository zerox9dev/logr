/** Goals — Figma 57:317. Weekly goal progress + current/longest streak.
 *  Right-column card: border #e4e4e7, px-24 py-18, gap-14. */
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { useT } from "@/lib/i18n";

const GOAL_LABEL_KEYS: Record<string, string> = {
  Day: "goals.goalToday",
  Week: "goals.weeklyGoal",
  Month: "goals.goalMonth",
  All: "goals.goalAll",
};

export function Goals() {
  const { metrics, period } = useDashboard();
  const t = useT();
  const g = metrics.goals;

  return (
    <div className="flex flex-col gap-3.5 border border-line-2 bg-card px-6 py-[18px]">
      <span className="text-summary font-semibold tracking-[-0.2px] text-ink">{t("goals.title")}</span>

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-tertiary">{t(GOAL_LABEL_KEYS[period] ?? "goals.weeklyGoal")}</span>
          <span className="text-md-minus font-semibold text-ink tnum">{g.weeklyPct}%</span>
        </div>
        <div className="h-2 w-full bg-line-2">
          <div className="h-2 bg-ink" style={{ width: `${g.weeklyPct}%` }} />
        </div>
        <span className="text-sm text-tertiary tnum">{g.weeklyLabel}</span>
      </div>

      <div className="h-px w-full bg-line-2" />

      <div className="flex w-full items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-tertiary">{t("goals.currentStreak")}</span>
          <span className="text-widget font-semibold tracking-[-0.18px] text-ink tnum">{g.currentStreak} {t("goals.days")}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-tertiary">{t("goals.longestStreak")}</span>
          <span className="text-widget font-semibold tracking-[-0.18px] text-ink tnum">{g.longestStreak} {t("goals.days")}</span>
        </div>
      </div>
    </div>
  );
}
