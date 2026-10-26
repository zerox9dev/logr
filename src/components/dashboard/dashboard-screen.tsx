"use client";

import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import { Button } from "@/components/ui/button";
import { ContextHeader } from "@/components/layout/context-header";
import { Timeline } from "@/components/dashboard/widgets/timeline";
import { ProjectsTasks } from "@/components/dashboard/widgets/projects-tasks";
import { BillableHours } from "@/components/dashboard/widgets/billable-hours";
import { DailySummary } from "@/components/dashboard/widgets/daily-summary";
import { ActivityHeatmap } from "@/components/dashboard/widgets/activity-heatmap";
import { Goals } from "@/components/dashboard/widgets/goals";

/** Overview page content: the widget grid. The timer lives in the title bar
 *  (src/components/layout/app-header.tsx); the shell in src/app/app/app-shell.tsx.
 *
 *  Grid (Figma 296:1196 / 310:3, 1400px frame): 688px / 440px, hairline-split.
 *  Left  (688px): Timeline -> Projects&tasks -> Billable hours.
 *  Right (440px): Daily Summary -> Activity -> Goals.
 *
 *  Both the filled and the zero-data design render this same grid - each
 *  widget draws its own empty look, so there is no separate onboarding view. */
export function DashboardScreen() {
  const { loading, loadError, reload } = useAppData();
  const t = useT();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-page">
        <div role="status" className="size-6 animate-spin border-2 border-line border-t-ink">
          <span className="sr-only">{t("screen.loading")}</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-page px-4 text-center">
        <h1 className="text-xl font-semibold text-heading">{t("screen.loadError")}</h1>
        <p className="max-w-md text-md text-tertiary">{loadError}</p>
        <Button variant="outline" onClick={() => reload()}>
          {t("screen.tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-hidden bg-page">
      <div className="mx-auto">
        <ContextHeader />

        {/* DOM order is the mobile design (296:1805): timeline →
            summary/activity/goals → projects → billable. Explicit lg placement
            pulls the last group back under the left column. */}
        {/* Flat panels split by hairlines, no gutters: the right column is
            its own strip with a rule down its left edge. */}
        <div className="grid grid-cols-1 border-b border-line lg:grid-cols-[688fr_440fr]">
          <div className="flex flex-col divide-y divide-line border-b border-line lg:col-start-1 lg:row-start-1">
            <Timeline />
          </div>

          <div className="flex flex-col divide-y divide-line border-b border-line lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-b-0 lg:border-l">
            <DailySummary />
            <ActivityHeatmap />
            <Goals />
          </div>

          <div className="flex flex-col divide-y divide-line max-lg:border-b max-lg:border-line lg:col-start-1 lg:row-start-2">
            <ProjectsTasks />
            <BillableHours />
          </div>
        </div>
      </div>
    </div>
  );
}
