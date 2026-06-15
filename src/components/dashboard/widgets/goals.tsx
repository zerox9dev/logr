/** Goals — Figma 57:317. Weekly goal progress + current/longest streak.
 *  Right-column card: border #e4e4e7, px-24 py-18, gap-14. */
import { useDashboard } from "@/components/dashboard/dashboard-context";

export function Goals() {
  const { metrics } = useDashboard();
  const g = metrics.goals;

  return (
    <div className="flex flex-col gap-3.5 border border-line-2 bg-card px-6 py-[18px]">
      <span className="text-summary font-semibold tracking-[-0.2px] text-ink">Goals</span>

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-tertiary">Weekly goal</span>
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
          <span className="text-sm text-tertiary">Current streak</span>
          <span className="text-widget font-semibold tracking-[-0.18px] text-ink tnum">{g.currentStreak} days</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-tertiary">Longest streak</span>
          <span className="text-widget font-semibold tracking-[-0.18px] text-ink tnum">{g.longestStreak} days</span>
        </div>
      </div>
    </div>
  );
}
