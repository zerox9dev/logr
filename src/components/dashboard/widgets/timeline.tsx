/** Timeline — Figma 1:50. Hour axis 9:00…0:00 (9:00-origin, each hour =
 *  81.034px in the 955px frame). Two modes from the period:
 *   • Day → each session as a positioned block, green = billable / red = not,
 *     plus a category strip and the "now" marker.
 *   • Week/Month/All → an hour-of-day histogram (bar height = total time
 *     tracked in that hour across the range), so it stays readable.
 *  Left-column card: border #ececec, px-28 pt-24 pb-20, gap-18. */
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { useT } from "@/lib/i18n";

const W = 955;
const PLOT_TOP = 8;
const PLOT_H = 150;
const pct = (v: number) => `${(v / W) * 100}%`;

const HOURS = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "0:00"];

export function Timeline() {
  const { metrics } = useDashboard();
  const t = useT();
  const { mode, blocks, hours, nowLeft, nowLabel, showNow } = metrics.timeline;
  const nowVisible = showNow && nowLeft >= 10 && nowLeft <= W;

  return (
    <div className="flex flex-col gap-[18px] border border-line bg-card px-[28px] pb-[20px] pt-[24px]">
      <span className="text-widget font-semibold text-heading">{t("timeline.title")}</span>

      <div className="relative h-[230px] w-full overflow-hidden">
        {/* Hour gridlines + labels */}
        {HOURS.map((h, i) => {
          const x = 10 + i * 81.034;
          return (
            <div key={h} className="absolute top-0" style={{ left: pct(x) }}>
              <div className="h-[170px] w-px bg-grid" />
              <span className="absolute left-[-12px] top-[200px] text-md text-muted tnum">{h}</span>
            </div>
          );
        })}

        {/* Day: session blocks, colored by billable */}
        {mode === "sessions" && blocks.map((b, i) => (
          <div
            key={i}
            className="absolute top-2 h-[150px]"
            style={{ left: pct(b.left), width: pct(b.width), background: b.color }}
          />
        ))}

        {/* Week/Month/All: hour-of-day histogram (monochrome, height = time) */}
        {mode === "hourly" && hours.map((b, i) => {
          const h = Math.max(3, b.heightPct * PLOT_H);
          return (
            <div
              key={i}
              className="absolute bg-timeline"
              style={{ left: pct(b.left), width: pct(b.width), top: PLOT_TOP + (PLOT_H - h), height: h }}
            />
          );
        })}

        {/* "Now" marker line (Day only) */}
        {nowVisible && (
          <div className="absolute top-2 h-[170px] w-0.5 bg-timeline" style={{ left: pct(nowLeft) }} />
        )}

        {/* Category strip background + per-session segments (Day only) */}
        <div className="absolute h-[18px] bg-timeline-track" style={{ left: pct(10), top: 162, width: pct(940) }} />
        {mode === "sessions" && blocks.map((b, i) => (
          <div
            key={i}
            className="absolute h-2"
            style={{ left: pct(b.left), top: 167, width: pct(b.width), background: b.color }}
          />
        ))}

        {/* Current-time pill (Day only) */}
        {nowVisible && (
          <div className="absolute top-[192px] flex items-start border-[1.5px] border-timeline bg-card px-2 py-[3px]" style={{ left: pct(nowLeft - 26) }}>
            <span className="text-md font-semibold text-heading tnum">{nowLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
