import { Zap } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";

/** Daily Summary — Figma 57:2. Title 20px + summary sentence with bold figures
 *  + divider + Total time / Percent of work day + 4 grayscale donut rings.
 *  Right-column card: border #e4e4e7, px-24 py-18, gap-14. */

function Donut({ pct, label, ring }: { pct: number; label: string; ring: string }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative size-[50px]">
        <svg viewBox="0 0 50 50" className="size-full -rotate-90">
          <circle cx="25" cy="25" r={r} fill="none" stroke="var(--color-track)" strokeWidth="6" />
          <circle
            cx="25" cy="25" r={r} fill="none" stroke={ring} strokeWidth="6"
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink tnum">{pct}%</span>
      </div>
      <span className="text-sm-minus text-tertiary">{label}</span>
    </div>
  );
}

export function DailySummary() {
  const { metrics } = useDashboard();
  const d = metrics.daily;

  return (
    <div className="flex flex-col gap-3.5 border border-line-2 bg-card px-6 py-[18px]">
      <span className="text-summary font-semibold tracking-[-0.2px] text-ink">Daily Summary</span>

      <div className="flex w-full items-start gap-2.5">
        <span className="flex size-[30px] shrink-0 items-center justify-center bg-icon-tile">
          <Zap className="size-[15px] text-ink" />
        </span>
        <p className="flex-1 text-md-minus leading-[1.45] text-[#3f3f46]">
          {d.sentence.lead} you tracked <strong className="font-semibold text-ink">{d.sentence.time}</strong> across{" "}
          <strong className="font-semibold text-ink">{d.sentence.projects}</strong>{" "}
          {d.sentence.projects === "1" ? "project" : "projects"}, over{" "}
          <strong className="font-semibold text-ink">{d.sentence.tasks}</strong>{" "}
          {d.sentence.tasks === "1" ? "session" : "sessions"}.
        </p>
      </div>

      <div className="h-px w-full bg-line-2" />

      <div className="flex w-full items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-tertiary">Total time worked</span>
          <span className="text-widget font-semibold tracking-[-0.18px] text-ink tnum">{d.totalTimeLabel}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-tertiary">Percent of work day</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-widget font-semibold tracking-[-0.18px] text-ink tnum">{d.percentOfDay}%</span>
            <span className="text-sm text-tertiary">of {d.dayBaseLabel}</span>
          </div>
        </div>
      </div>

      <div className="flex w-full items-start justify-between">
        <Donut pct={d.donuts.focus} label="Focus" ring="var(--color-hm-4)" />
        <Donut pct={d.donuts.meetings} label="Meetings" ring="var(--color-hm-3)" />
        <Donut pct={d.donuts.breaks} label="Breaks" ring="var(--color-hm-2)" />
        <Donut pct={d.donuts.other} label="Other" ring="var(--color-hm-1)" />
      </div>
    </div>
  );
}
