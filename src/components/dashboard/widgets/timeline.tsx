/** Timeline — Figma 310:3340 (filled) / 310:3419 (empty). A single 10px strip
 *  covering 09:00–20:00 with one segment per session, a 6-tick hour axis, and a
 *  Focus / Meetings / Breaks legend carrying each lane's total.
 *  Left-column card: border #ececec, p-24, gap-8. */
import { useDashboard } from "@/contexts/dashboard-context";
import { useT } from "@/i18n";
import type { TimelineCategory } from "@/domain/dashboard-metrics";

const SEGMENT_BG: Record<TimelineCategory, string> = {
  focus: "bg-brand-ink",
  meetings: "bg-placeholder",
  breaks: "bg-error-soft",
};

const LEGEND_TEXT: Record<TimelineCategory, string> = {
  focus: "text-brand-ink",
  meetings: "text-placeholder",
  breaks: "text-error-soft",
};

const LEGEND_KEYS: Record<TimelineCategory, string> = {
  focus: "daily.focus",
  meetings: "daily.meetings",
  breaks: "daily.breaks",
};

const LANES: TimelineCategory[] = ["focus", "meetings", "breaks"];

export function Timeline() {
  const { metrics, period } = useDashboard();
  const t = useT();
  const { segments, ticks, legend, empty, outsideRangeCount } = metrics.timeline;

  return (
    <div className="card-radius flex flex-col gap-2 border border-line bg-card p-6">
      <span className="text-widget font-semibold text-heading">{t("timeline.title")}</span>

      <div className={`relative h-2.5 w-full overflow-hidden ${empty ? "bg-track" : "bg-grid"}`}>
        {segments.map((s, i) => (
          <div
            key={i}
            className={`absolute top-0 h-2.5 ${SEGMENT_BG[s.category]}`}
            style={{ left: `${s.leftPct}%`, width: `${s.widthPct}%` }}
          />
        ))}
      </div>

      <div className="relative h-4 w-full">
        {ticks.map((tick) => (
          <span
            key={tick.label}
            className="absolute top-0 text-sm-minus text-muted-foreground tnum"
            style={{ left: `${tick.leftPct}%` }}
          >
            {tick.label}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-1.5">
        {LANES.map((lane) => (
          <div key={lane} className="flex items-center gap-1.5">
            <span className={`size-2.5 shrink-0 ${SEGMENT_BG[lane]} ${empty ? "opacity-40" : ""}`} />
            <span className={`text-sm ${LEGEND_TEXT[lane]}`}>
              {t(LEGEND_KEYS[lane])} · <span className="tnum">{legend[lane]}</span>
            </span>
          </div>
        ))}
      </div>

      {period === "Day" && outsideRangeCount > 0 && (
        <p className="text-md-minus text-muted-foreground">
          {t("timeline.outsideRange").replace("{n}", String(outsideRangeCount))}
        </p>
      )}
    </div>
  );
}
