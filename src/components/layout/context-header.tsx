import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "lucide-react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useT, useLang } from "@/i18n";
import type { Period } from "@/domain/dashboard-metrics";

const VIEWS: Period[] = ["Day", "Week", "Month", "All"];
// "Day" period is surfaced as "Today" — selecting it also jumps to the current day.
const VIEW_KEYS: Record<Period, string> = {
  Day: "tabs.today",
  Week: "tabs.week",
  Month: "tabs.month",
  All: "tabs.all",
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Build a 6x7 grid (Monday-first) of dates covering the displayed month. */
function buildGrid(viewMonth: Date): Date[] {
  const first = startOfMonth(viewMonth);
  // JS getDay(): 0=Sun..6=Sat. Convert to Monday-first offset (Mon=0..Sun=6).
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
  return Array.from({ length: 42 }, (_, i) =>
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}

/** Calendar date picker rendered inside a Radix Popover. The new header
 *  (Figma 296:1215) has no calendar button of its own, so the date label
 *  itself is the trigger. */
function DatePicker({ disabled = false, label }: { disabled?: boolean; label: string }) {
  const { refDate, goToDate } = useDashboard();
  const t = useT();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(refDate));
  const [today] = useState(() => new Date());

  const days = buildGrid(viewMonth);

  // Monday-first weekday labels derived from the active language.
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    // 2024-01-01 is a Monday; offsetting by i yields Mon..Sun.
    new Date(2024, 0, 1 + i).toLocaleDateString(lang, { weekday: "short" }),
  );

  const handleSelect = (d: Date) => {
    goToDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
    setOpen(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        if (disabled) return;
        setOpen(o);
        if (o) setViewMonth(startOfMonth(refDate));
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-disabled={disabled}
          aria-label={t("ctx.pickDate")}
          title={t("ctx.pickDate")}
          className="flex items-center gap-2 text-widget font-semibold text-ink tnum disabled:cursor-default"
        >
          {label}
          {!disabled && <Calendar className="size-4 text-tertiary" aria-hidden="true" />}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 border border-line bg-card p-3 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)]"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label={t("ctx.prevMonth")}
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="flex size-7 items-center justify-center text-xl leading-none text-heading hover:bg-wash"
            >
              ‹
            </button>
            <span className="text-base font-semibold text-heading">
              {viewMonth.toLocaleDateString(lang, { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              aria-label={t("ctx.nextMonth")}
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="flex size-7 items-center justify-center text-xl leading-none text-heading hover:bg-wash"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {weekdays.map((w, i) => (
              <div key={i} className="flex h-7 items-center justify-center text-xs font-medium text-muted-foreground">
                {w}
              </div>
            ))}
            {days.map((d) => {
              const inMonth = d.getMonth() === viewMonth.getMonth();
              const selected = sameDay(d, refDate);
              const isToday = sameDay(d, today);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  aria-label={d.toLocaleDateString(lang, {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                  onClick={() => handleSelect(d)}
                  className={[
                    "flex size-9 items-center justify-center text-base tnum",
                    selected
                      ? "bg-ink text-card"
                      : inMonth
                        ? "text-heading hover:bg-wash"
                        : "text-muted-foreground hover:bg-wash",
                    !selected && isToday ? "border border-line" : "",
                  ].join(" ")}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** "Header — date & period" card. Figma node 296:1215.
 *  Left: current date (also the date-picker trigger) + ‹ › 32px step buttons.
 *  Right: Today/Week/Month/All tabs (Today also jumps to the current day). */
export function ContextHeader() {
  const { period, setPeriod, metrics, pageDate, goToToday, canPageBack, canPageForward } = useDashboard();
  const t = useT();

  const stepButton =
    "flex size-8 shrink-0 items-center justify-center border border-gray-300 bg-card text-lg leading-none text-tertiary transition-colors hover:bg-wash disabled:text-gray-300 disabled:hover:bg-card";

  return (
    <div className="card-radius mx-4 mb-2 mt-2 flex flex-wrap items-center justify-between gap-3 bg-card px-5 py-3 lg:mx-2">
      <div className="flex items-center gap-3">
        <h1 className="min-w-0">
          <DatePicker disabled={period === "All"} label={metrics.header.dateLabel} />
        </h1>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => pageDate(-1)}
            disabled={!canPageBack}
            aria-label={t("ctx.prevPeriod")}
            className={stepButton}
          >
            ‹
          </button>
          <button
            onClick={() => pageDate(1)}
            disabled={!canPageForward}
            aria-label={t("ctx.nextPeriod")}
            className={stepButton}
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex min-w-0 items-center overflow-x-auto">
        {/* Segmented Today / Week / Month / All tabs */}
        <Tabs.Root value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <Tabs.List className="flex items-center border border-line-2 bg-faint p-0.5">
            {VIEWS.map((v) => (
              <Tabs.Trigger
                key={v}
                value={v}
                // "Today" tab also resets to the current day (even on re-click).
                onClick={v === "Day" ? goToToday : undefined}
                className="flex h-8 items-center justify-center px-4 text-md-minus font-medium text-tertiary data-[state=active]:bg-ink data-[state=active]:text-card"
              >
                {t(VIEW_KEYS[v])}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
      </div>
    </div>
  );
}
