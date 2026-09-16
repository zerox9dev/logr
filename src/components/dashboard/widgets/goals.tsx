/** Goals — Figma 310:1849. Weekly goal progress + a Mon–Sun bar chart of the
 *  current week + current/longest streak.
 *  Right-column card: border #ececec, p-24, gap-8. */
import { useState, type FormEvent } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";

const GOAL_LABEL_KEYS: Record<string, string> = {
  Day: "goals.goalToday",
  Week: "goals.weeklyGoal",
  Month: "goals.goalMonth",
  All: "goals.goalAll",
};

/** Goal editor form — mounted fresh per open to reset state. */
function GoalForm({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useAppData();
  const { toast } = useToast();
  const t = useT();
  const [value, setValue] = useState(
    settings?.weekly_goal_hours != null ? String(settings.weekly_goal_hours) : "",
  );
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const num = Number(value);
    if (value !== "" && (isNaN(num) || num <= 0)) return;
    setSaving(true);
    try {
      await updateSettings({ weekly_goal_hours: value === "" ? null : num });
      toast(t("goals.goalUpdated"), "success");
      onClose();
    } catch {
      toast(t("goals.goalUpdateFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-md-minus text-muted-foreground">{t("goals.weeklyGoalHours")}</span>
        <Input
          type="number"
          min="1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="40"
          autoFocus
        />
      </label>
      <div className="flex justify-end gap-2.5 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>{t("rates.cancel")}</Button>
        <Button type="submit" disabled={saving}>{t("rates.save")}</Button>
      </div>
    </form>
  );
}

function GoalDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  return (
    <Dialog open={open} onClose={onClose} title={t("goals.editGoal")}>
      {open && <GoalForm onClose={onClose} />}
    </Dialog>
  );
}

export function Goals() {
  const { metrics, period } = useDashboard();
  const t = useT();
  const g = metrics.goals;
  const [goalOpen, setGoalOpen] = useState(false);

  return (
    <div className="card-radius flex flex-col gap-2 border border-line bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-summary font-semibold tracking-[-0.2px] text-ink">{t("goals.title")}</span>
        <button
          type="button"
          onClick={() => setGoalOpen(true)}
          aria-label={t("goals.editGoal")}
          title={t("goals.editGoal")}
          className="text-sm text-tertiary transition-colors hover:text-ink"
        >
          ✎
        </button>
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-tertiary">{t(GOAL_LABEL_KEYS[period] ?? "goals.weeklyGoal")}</span>
          <span className="text-md-minus font-semibold text-ink tnum">{g.weeklyPct}%</span>
        </div>
        <div className="h-2 w-full bg-line-2">
          <div className="h-2 bg-ink" style={{ width: `${g.weeklyPct}%` }} />
        </div>
        <span className="text-sm text-tertiary tnum">{g.weeklyLabel}</span>
      </div>

      {/* This week — one column per day, scaled to the busiest day. Days with
          no tracked time keep a 4px stub so the row stays readable. */}
      <div className="flex w-full flex-col gap-2">
        <span className="text-sm text-tertiary">{t("goals.thisWeek")}</span>
        <div className="flex w-full items-end justify-between">
          {g.week.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="flex h-[30px] w-[22px] flex-col justify-end">
                <div
                  className={day.empty ? "bg-line-2" : "bg-ink"}
                  style={{ height: day.empty ? 4 : Math.max(4, Math.round(day.heightPct * 30)) }}
                />
              </div>
              <span className="text-xs text-tertiary">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-line-2" />

      <div className="flex w-full items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-tertiary">{t("goals.currentStreak")}</span>
          <span className="text-widget font-semibold tracking-[-0.18px] text-ink tnum">{g.currentStreak} {t("goals.days")}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-tertiary">{t("goals.longestStreak")}</span>
          <span className="text-widget font-semibold tracking-[-0.18px] text-ink tnum">{g.longestStreak} {t("goals.days")}</span>
        </div>
      </div>

      <GoalDialog open={goalOpen} onClose={() => setGoalOpen(false)} />
    </div>
  );
}
