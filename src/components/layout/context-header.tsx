import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/data-context";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import type { Period } from "@/lib/dashboard-metrics";

const VIEWS: Period[] = ["Day", "Week", "Month", "All"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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
function DatePicker() {
  const { refDate, goToDate } = useDashboard();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(refDate));
  const [today] = useState(() => new Date());

  const days = buildGrid(viewMonth);

  const handleSelect = (d: Date) => {
    goToDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
    setOpen(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setViewMonth(startOfMonth(refDate));
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Pick a date"
          className="flex size-9 items-center justify-center border border-line bg-card hover:bg-wash"
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
              aria-label="Previous month"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="flex size-7 items-center justify-center text-xl leading-none text-heading hover:bg-wash"
            >
              ‹
            </button>
            <span className="text-base font-semibold text-heading">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="flex size-7 items-center justify-center text-xl leading-none text-heading hover:bg-wash"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((w) => (
              <div key={w} className="flex h-7 items-center justify-center text-xs font-medium text-muted">
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
                  aria-label={d.toLocaleDateString(undefined, {
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
 *  Left: current date + Tracking ● Active. Right: Day/Week/Month tabs,
 *  Today button, ‹ date-picker › date nav. */
export function ContextHeader() {
  const { period, setPeriod, metrics, pageDate, goToToday, canPageBack, canPageForward } = useDashboard();
  const { timerRunning } = useAppData();

  return (
    <div className="mx-2 mb-2 mt-2 flex flex-wrap items-center justify-between gap-4 bg-card px-6 py-6">
      <div className="flex items-center gap-[18px]">
        <h1 className="whitespace-nowrap text-3xl font-semibold text-heading tnum lg:text-5xl">
          {metrics.header.dateLabel}
        </h1>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-base text-muted">Tracking:</span>
          <span className={`size-[9px] ${timerRunning ? "bg-brand" : "bg-track"}`} />
          <span className="text-base font-medium text-heading">{timerRunning ? "Active" : "Idle"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {/* Segmented Day / Week / Month tabs */}
        <Tabs.Root value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <Tabs.List className="flex items-start bg-wash p-1">
            {VIEWS.map((v) => (
              <Tabs.Trigger
                key={v}
                value={v}
                className="px-4 py-2 text-base font-medium text-dark-3 data-[state=active]:bg-card data-[state=active]:font-semibold data-[state=active]:text-heading data-[state=active]:shadow-[0px_1px_4px_0px_rgba(0,0,0,0.08)]"
              >
                {v}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        <Button variant="unstyled" size="unstyled" onClick={goToToday} className="border border-line bg-card px-[22px] py-2.5 text-base font-semibold text-heading hover:bg-wash">
          Today
        </Button>

        <Button
          variant="unstyled"
          size="unstyled"
          onClick={() => pageDate(-1)}
          disabled={!canPageBack}
          aria-label="Previous period"
          className="text-3xl font-medium leading-none text-heading disabled:text-gray-300"
        >
          ‹
        </Button>

        <DatePicker />

        <Button
          variant="unstyled"
          size="unstyled"
          onClick={() => pageDate(1)}
          disabled={!canPageForward}
          aria-label="Next period"
          className="text-3xl font-medium leading-none text-heading disabled:text-gray-300"
        >
          ›
        </Button>
      </div>
    </div>
  );
}
