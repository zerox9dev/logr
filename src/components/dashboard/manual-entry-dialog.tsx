import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { ProjectPicker } from "@/components/shared/project-picker";
import { useT } from "@/i18n";
import { localDateStr, nowTimeStr, timeStr } from "@/lib/date";
import type { Project } from "@/types/database";

/** Manual time-entry dialog — log a past session without the live timer.
 *  `defaultStart` / `defaultSeconds` prefill it (a range dragged on the
 *  calendar); state is read once, so callers key the dialog to reset it. */
export function ManualDialog({
  open, onClose, projects, defaultProjectId, defaultStart, defaultSeconds, onSave,
}: {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  defaultProjectId: string | null;
  defaultStart?: Date;
  defaultSeconds?: number;
  onSave: (projectId: string | null, name: string, dateISO: string, seconds: number) => void;
}) {
  const t = useT();
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId);
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => localDateStr(defaultStart ?? new Date()));
  const [startTime, setStartTime] = useState(() => (defaultStart ? timeStr(defaultStart) : nowTimeStr()));
  const [hours, setHours] = useState(() => (defaultSeconds ? String(Math.floor(defaultSeconds / 3600)) : ""));
  const [minutes, setMinutes] = useState(() => (defaultSeconds ? String(Math.floor((defaultSeconds % 3600) / 60)) : ""));

  const projectName = projects.find((p) => p.id === projectId)?.name ?? t("track.noProject");
  const seconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60;
  // A cleared date or time input would build an Invalid Date that only fails
  // after the dialog has closed, so the form refuses it up front.
  const valid = seconds > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(startTime);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSave(projectId, name, `${date}T${startTime}:00`, seconds);
    setName(""); setHours(""); setMinutes(""); setStartTime(nowTimeStr());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("manual.title")}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormField label={t("manual.project")}>
          <ProjectPicker
            onChange={setProjectId}
            projects={projects}
            trigger={
              <Button type="button" variant="outline" size="default" className="w-full justify-between">
                <span className="line-clamp-1 min-w-0">{projectName}</span>
                <span aria-hidden="true" className="shrink-0 text-muted-foreground">▾</span>
              </Button>
            }
          />
        </FormField>

        <FormField label={t("manual.task")}>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t("manual.taskPlaceholder")} />
        </FormField>

        <div className="flex gap-3">
          <FormField label={t("manual.date")} className="flex-1">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>
          <FormField label={t("manual.startTime")} className="w-28">
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </FormField>
        </div>
        <div className="flex gap-3">
          <FormField label={t("manual.hours")} className="w-20">
            <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
          </FormField>
          <FormField label={t("manual.min")} className="w-20">
            <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" />
          </FormField>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>{t("manual.cancel")}</Button>
          <Button type="submit" disabled={!valid}>{t("manual.save")}</Button>
        </div>
      </form>
    </Dialog>
  );
}
