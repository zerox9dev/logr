import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import { Button } from "@/components/ui/button";
import { DashboardProvider } from "@/contexts/dashboard-context";
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
 *  Grid (Figma 296:1196 / 310:3, 1400px frame): 688px / 440px, 8px gap.
 *  Left  (688px): Tracking → Timeline → Projects&tasks → Billable hours.
 *  Right (440px): Daily Summary → Activity → Goals.
 *
 *  Both the filled and the zero-data design render this same grid — each
 *  widget draws its own empty look, so there is no separate onboarding view. */
export function DashboardScreen() {
  const { loading, loadError, reload } = useAppData();
  const t = useT();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-page">
        <div role="status" className="size-6 animate-spin border-2 border-line border-t-ink">
          <span className="sr-only">{t("screen.loading")}</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-4 text-center">
        <h1 className="text-xl font-semibold text-heading">{t("screen.loadError")}</h1>
        <p className="max-w-md text-md text-tertiary">{loadError}</p>
        <Button variant="outline" onClick={() => reload()}>
          {t("screen.tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <DashboardProvider>
    <div className="min-h-screen overflow-x-hidden bg-page pb-2">
      <TopBar />

      <div className="mx-auto">
        <ContextHeader />

        {/* DOM order is the mobile design (296:1805): tracker → timeline →
            summary/activity/goals → projects → billable. Explicit lg placement
            pulls the last group back under the left column. */}
        <main className="grid grid-cols-1 items-start gap-2 px-4 lg:grid-cols-[688fr_440fr] lg:px-2">
          <div className="flex flex-col gap-2 lg:col-start-1 lg:row-start-1">
            <TrackingCard />
            <Timeline />
          </div>

          <div className="flex flex-col gap-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <DailySummary />
            <ActivityHeatmap />
            <Goals />
          </div>

          <div className="flex flex-col gap-2 lg:col-start-1 lg:row-start-2">
            <ProjectsTasks />
            <BillableHours />
          </div>
        </main>
      </div>
    </div>
    </DashboardProvider>
  );
}
