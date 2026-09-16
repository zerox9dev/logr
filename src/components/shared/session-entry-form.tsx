import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
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
      <FormField label={t("sessions.task")}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("sessions.taskPlaceholder")} autoFocus />
      </FormField>
      <div className="flex gap-3">
        <FormField label={t("sessions.date")} className="flex-1">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormField>
        <FormField label={t("sessions.startTime")} className="w-28">
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </FormField>
      </div>
      <div className="flex gap-3">
        <FormField label={t("sessions.hours")} className="w-24">
          <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
        </FormField>
        <FormField label={t("sessions.min")} className="w-24">
          <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" />
        </FormField>
      </div>
      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel}>{t("sessions.cancel")}</Button>
        <Button type="submit" disabled={seconds <= 0}>{saveLabel ?? t("sessions.save")}</Button>
      </div>
    </form>
  );
}
