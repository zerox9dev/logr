import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/data-context";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import type { Period } from "@/lib/dashboard-metrics";

const VIEWS: Period[] = ["Day", "Week", "Month", "All"];

/** Contextual header below the top bar. Figma node 1:6.
 *  Left: current date + Tracking ● Active. Right: Day/Week/Month tabs,
 *  Today button, ‹ › date nav. */
export function ContextHeader() {
  const { period, setPeriod, metrics, pageDate, goToToday, canPageBack, canPageForward } = useDashboard();
  const { timerRunning } = useAppData();

  return (
    <div className="mx-2 mb-2 mt-2 flex items-center justify-between bg-card px-6 py-6">
      <div className="flex items-center gap-[18px]">
        <h1 className="whitespace-nowrap text-5xl font-semibold text-heading tnum">
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
