import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n";
import type { Session } from "@/types/database";

export interface EntryValues { name: string; date: string; startTime: string; hours: string; minutes: string }

export function valuesOf(s: Session): EntryValues {
  const d = new Date(s.started_at);
  return {
    name: s.name,
    date: s.started_at.slice(0, 10),
    startTime: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    hours: String(Math.floor(s.duration_seconds / 3600)),
    minutes: String(Math.floor((s.duration_seconds % 3600) / 60)),
  };
}

/** Add/edit form for a single time entry. Keyed by target so it resets. */
export function EntryForm({
  initial, onSave, onCancel, saveLabel,
}: {
  initial: EntryValues;
  onSave: (name: string, dateDay: string, startTime: string, seconds: number) => void;
  onCancel: () => void;
  saveLabel?: string;
}) {
  const t = useT();
  const [name, setName] = useState(initial.name);
  const [date, setDate] = useState(initial.date);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const seconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (seconds <= 0) return;
    onSave(name, date, startTime, seconds);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-md-minus text-muted-foreground">{t("sessions.task")}</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("sessions.taskPlaceholder")} autoFocus />
      </label>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-md-minus text-muted-foreground">{t("sessions.date")}</span>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="flex w-28 flex-col gap-1.5">
          <span className="text-md-minus text-muted-foreground">{t("sessions.startTime")}</span>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>
      </div>
      <div className="flex gap-3">
        <label className="flex w-24 flex-col gap-1.5">
          <span className="text-md-minus text-muted-foreground">{t("sessions.hours")}</span>
          <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
        </label>
        <label className="flex w-24 flex-col gap-1.5">
          <span className="text-md-minus text-muted-foreground">{t("sessions.min")}</span>
          <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" />
        </label>
      </div>
      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel}>{t("sessions.cancel")}</Button>
        <Button type="submit" disabled={seconds <= 0}>{saveLabel ?? t("sessions.save")}</Button>
      </div>
    </form>
  );
}
