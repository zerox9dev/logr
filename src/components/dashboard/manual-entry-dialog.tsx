import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { ProjectPicker } from "@/components/shared/project-picker";
import { useT } from "@/i18n";
import { nowTimeStr } from "@/lib/date";
import type { Project } from "@/types/database";

/** Manual time-entry dialog — log a past session without the live timer. */
export function ManualDialog({
  open, onClose, projects, defaultProjectId, onSave,
}: {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  defaultProjectId: string | null;
  onSave: (projectId: string | null, name: string, dateISO: string, seconds: number) => void;
}) {
  const t = useT();
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId);
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(() => nowTimeStr());
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const projectName = projects.find((p) => p.id === projectId)?.name ?? t("track.noProject");
  const seconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (seconds <= 0) return;
    onSave(projectId, name, `${date}T${startTime}:00`, seconds);
    setName(""); setHours(""); setMinutes(""); setStartTime(nowTimeStr());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("manual.title")}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-md-minus text-muted">{t("manual.project")}</span>
          <ProjectPicker
            onChange={setProjectId}
            projects={projects}
            trigger={
              <Button type="button" variant="outline" size="default" className="w-full justify-between">
                <span className="line-clamp-1 min-w-0">{projectName}</span>
                <span aria-hidden="true" className="shrink-0 text-muted">▾</span>
              </Button>
            }
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-md-minus text-muted">{t("manual.task")}</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("manual.taskPlaceholder")} />
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-md-minus text-muted">{t("manual.date")}</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="flex w-28 flex-col gap-1.5">
            <span className="text-md-minus text-muted">{t("manual.startTime")}</span>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </label>
        </div>
        <div className="flex gap-3">
          <label className="flex w-20 flex-col gap-1.5">
            <span className="text-md-minus text-muted">{t("manual.hours")}</span>
            <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
          </label>
          <label className="flex w-20 flex-col gap-1.5">
            <span className="text-md-minus text-muted">{t("manual.min")}</span>
            <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" />
          </label>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>{t("manual.cancel")}</Button>
          <Button type="submit" disabled={seconds <= 0}>{t("manual.save")}</Button>
        </div>
      </form>
    </Dialog>
  );
}
