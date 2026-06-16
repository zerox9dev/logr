/** Activity — Figma 57:44. GitHub-style heatmap, 30 weeks × 7 days, 5-level
 *  grayscale, month labels, weekday labels (Mon/Wed/Fri), Less…More legend.
 *  Right-column card: border #e4e4e7, px-24 py-18, gap-8. */
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { useT } from "@/lib/i18n";

const LEVELS = ["var(--color-hm-0)", "var(--color-hm-1)", "var(--color-hm-2)", "var(--color-hm-3)", "var(--color-hm-4)"];

export function ActivityHeatmap() {
  const { metrics } = useDashboard();
  const t = useT();
  const { weeks, months, totalHoursLabel } = metrics.heatmap;
  const WEEKDAYS = ["", t("activity.mon"), "", t("activity.wed"), "", t("activity.fri"), ""];

  return (
    <div className="flex flex-col gap-2 border border-line-2 bg-card px-6 py-[18px]">
      <div className="flex flex-col gap-0.5">
        <span className="text-summary font-semibold tracking-[-0.2px] text-ink">{t("activity.title")}</span>
        <span className="text-sm text-tertiary tnum">{totalHoursLabel}</span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: "320px" }}>
          {/* Month labels */}
          <div className="flex w-full justify-between pl-[26px] text-xs text-tertiary">
            {months.map((m, i) => <span key={`${m}-${i}`}>{m}</span>)}
          </div>

          {/* Weekday column + week columns */}
          <div className="flex items-start gap-1.5">
            <div className="flex flex-col gap-0.5">
              {WEEKDAYS.map((d, i) => (
                <div key={i} className="flex h-[9px] w-5 items-center text-[9px] text-tertiary">{d}</div>
              ))}
            </div>
            <div className="flex flex-1 justify-between">
              {weeks.map((days, w) => (
                <div key={w} className="flex flex-col gap-0.5">
                  {days.map((day, d) => (
                    <span key={d} title={day.title} className="size-[9px]" style={{ background: LEVELS[day.level] }} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex w-full items-center justify-end gap-[5px]">
            <span className="text-xs text-tertiary">{t("activity.less")}</span>
            {LEVELS.map((c) => <span key={c} className="size-[9px]" style={{ background: c }} />)}
            <span className="text-xs text-tertiary">{t("activity.more")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
