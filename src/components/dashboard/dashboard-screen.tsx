import { useAppData } from "@/lib/data-context";
import { Button } from "@/components/ui/button";
import { DashboardProvider } from "@/components/dashboard/dashboard-context";
import { TopBar } from "@/components/layout/top-bar";
import { ContextHeader } from "@/components/layout/context-header";
import { TrackingCard } from "@/components/dashboard/widgets/tracking-card";
import { Timeline } from "@/components/dashboard/widgets/timeline";
import { ProjectsTasks } from "@/components/dashboard/widgets/projects-tasks";
import { BillableHours } from "@/components/dashboard/widgets/billable-hours";
import { DailySummary } from "@/components/dashboard/widgets/daily-summary";
import { ActivityHeatmap } from "@/components/dashboard/widgets/activity-heatmap";
import { Goals } from "@/components/dashboard/widgets/goals";

/** The single screen. Everything the product does lives here as panels,
 *  modals, dropdowns, and view-modes — no routing between features.
 *
 *  Grid (Figma 1:1, 1440px frame): two columns 920px / 496px, 8px gap.
 *  Left  (920px): Tracking → Timeline → [Projects&tasks | Billable hours].
 *  Right (496px): Daily Summary → Activity → Goals. Six widgets total. */
export function DashboardScreen() {
  const { loading, loadError, reload } = useAppData();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-page">
        <div className="size-6 animate-spin border-2 border-line border-t-ink" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-4 text-center">
        <h1 className="text-xl font-semibold text-heading">Couldn't load your data.</h1>
        <p className="max-w-md text-md text-tertiary">{loadError}</p>
        <Button variant="outline" onClick={() => reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <DashboardProvider>
    <div className="min-h-screen bg-page">
      <TopBar />

      {/* 1440 frame: white header подложка + widget grid share the same edges */}
      <div className="mx-auto max-w-[1440px] pb-10">
        <ContextHeader />

        <main className="grid grid-cols-1 gap-2 px-2 lg:grid-cols-[920fr_496fr]">
          {/* Left column */}
          <div className="flex flex-col gap-2">
            <TrackingCard />
            <Timeline />
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2">
              <ProjectsTasks />
              <BillableHours />
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-2">
            <DailySummary />
            <ActivityHeatmap />
            <Goals />
          </div>
        </main>
      </div>
    </div>
    </DashboardProvider>
  );
}
