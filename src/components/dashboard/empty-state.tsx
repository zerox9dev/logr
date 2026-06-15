import { useAppData } from "@/lib/data-context";
import { Button } from "@/components/ui/button";

/** Onboarding panel for a brand-new user with zero data. Presentational
 *  except for one action: starting the live timer (mirrors TrackingCard's
 *  `start()`), which immediately puts a running session on the dashboard. */
export function EmptyState() {
  const { setTimerRunning, setTimerStartedAt, setTimerSeconds } = useAppData();

  const startTimer = () => {
    setTimerStartedAt(Date.now());
    setTimerSeconds(0);
    setTimerRunning(true);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-2">
      <div className="flex w-full max-w-[520px] flex-col items-center gap-6 border border-line bg-card px-8 py-12 text-center">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-summary font-semibold text-heading">Welcome to logr.work</h1>
          <p className="text-md text-tertiary">
            Track your first session to see your dashboard come to life.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 pt-2">
          <Button onClick={startTimer} className="w-full">
            Start your first timer
          </Button>
          <p className="text-md-minus text-muted">
            Want to organize work first? Use the{" "}
            <span className="font-semibold text-ink">+ New</span> button in the top
            bar to create a project or client.
          </p>
        </div>
      </div>
    </div>
  );
}
