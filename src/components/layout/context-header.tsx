import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
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

/** Calendar date picker rendered inside a Radix Popover. */
function DatePicker({ disabled = false }: { disabled?: boolean }) {
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
          // Match the segmented tabs' height: tabs = p-1 (4px) + py-2 (8px) ≈ 12px
          // vertical around 15px text; py-3 here mirrors that.
          className="flex items-center justify-center border border-line bg-card px-3 py-3 hover:bg-wash disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Calendar className="size-4 text-heading" />
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
              <div key={i} className="flex h-7 items-center justify-center text-xs font-medium text-muted">
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
                        : "text-muted hover:bg-wash",
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

/** Contextual header below the top bar. Figma node 1:6.
 *  Left: current date + ‹ date-picker › date nav. Right: Today/Week/Month/All
 *  tabs (Today also jumps to the current day). */
export function ContextHeader() {
  const { period, setPeriod, metrics, pageDate, goToToday, canPageBack, canPageForward } = useDashboard();
  const t = useT();

  return (
    <div className="mx-2 mb-2 mt-2 flex flex-wrap items-center justify-between gap-3 bg-card px-3 py-4 sm:gap-4 sm:px-6 sm:py-6">
      <div className="flex items-center gap-[18px]">
        <h1 className="text-2xl font-semibold text-heading tnum sm:text-3xl lg:text-4xl">
          {metrics.header.dateLabel}
        </h1>
        <div className="flex items-center gap-3.5">
          <Button
            variant="unstyled"
            size="unstyled"
            onClick={() => pageDate(-1)}
            disabled={!canPageBack}
            aria-label={t("ctx.prevPeriod")}
            className="text-3xl font-medium leading-none text-heading disabled:text-gray-300"
          >
            ‹
          </Button>

          <DatePicker disabled={period === "All"} />

          <Button
            variant="unstyled"
            size="unstyled"
            onClick={() => pageDate(1)}
            disabled={!canPageForward}
            aria-label={t("ctx.nextPeriod")}
            className="text-3xl font-medium leading-none text-heading disabled:text-gray-300"
          >
            ›
          </Button>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3.5 overflow-x-auto">
        {/* Segmented Today / Week / Month / All tabs */}
        <Tabs.Root value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <Tabs.List className="flex items-start bg-wash p-1">
            {VIEWS.map((v) => (
              <Tabs.Trigger
                key={v}
                value={v}
                // "Today" tab also resets to the current day (even on re-click).
                onClick={v === "Day" ? goToToday : undefined}
                className="px-4 py-2 text-base font-medium text-dark-3 data-[state=active]:bg-card data-[state=active]:font-semibold data-[state=active]:text-heading data-[state=active]:shadow-[0px_1px_4px_0px_rgba(0,0,0,0.08)]"
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
