import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { useAppData } from "@/lib/data-context";
import { fmtDuration, fmtMoney } from "@/lib/dashboard-metrics";
import type { Session } from "@/types/database";

interface EntryValues { name: string; date: string; hours: string; minutes: string }

function valuesOf(s: Session): EntryValues {
  return {
    name: s.name,
    date: s.started_at.slice(0, 10),
    hours: String(Math.floor(s.duration_seconds / 3600)),
    minutes: String(Math.floor((s.duration_seconds % 3600) / 60)),
  };
}

/** Add/edit form for a single time entry. Keyed by target so it resets. */
function EntryForm({
  initial, onSave, onCancel, saveLabel = "Save",
}: {
  initial: EntryValues;
  onSave: (name: string, dateDay: string, seconds: number) => void;
  onCancel: () => void;
  saveLabel?: string;
}) {
  const [name, setName] = useState(initial.name);
  const [date, setDate] = useState(initial.date);
  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const seconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60;

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-md-minus text-muted">Task</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Task name" autoFocus />
      </label>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-md-minus text-muted">Date</span>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="flex w-24 flex-col gap-1.5">
          <span className="text-md-minus text-muted">Hours</span>
          <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
        </label>
        <label className="flex w-24 flex-col gap-1.5">
          <span className="text-md-minus text-muted">Min</span>
          <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" />
        </label>
      </div>
      <div className="flex justify-end gap-2.5">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button disabled={seconds <= 0} onClick={() => onSave(name, date, seconds)}>{saveLabel}</Button>
      </div>
    </div>
  );
}

/** Sessions manager. Two modes:
 *   • task row → opens straight into the pre-filled edit form for that entry.
 *   • ••• menu → full list with add / edit / delete / paid toggle.
 *  All live via `addSession` / `updateSession` / `deleteSession`. */
export function SessionsDialog({
  open, onClose, match,
}: {
  open: boolean;
  onClose: () => void;
  match?: { projectId?: string; name?: string };
}) {
  const { sessions, settings, getProjectById, addSession, updateSession, deleteSession } = useAppData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [editing, setEditing] = useState<null | "new" | Session>(null);

  const rows = sessions.filter((s) => {
    if (match?.projectId !== undefined && (s.project_id ?? "none") !== match.projectId) return false;
    if (match?.name !== undefined && s.name !== match.name) return false;
    return true;
  });
  const taskMode = match?.name !== undefined;

  // ── live ops ──
  const saveNew = async (name: string, dateDay: string, seconds: number) => {
    const project = getProjectById(match?.projectId ?? null);
    await addSession({
      client_id: project?.client_id ?? null,
      project_id: project?.id ?? null,
      name: name.trim() || "Untitled",
      notes: null,
      started_at: new Date(`${dateDay}T09:00:00`).toISOString(),
      duration_seconds: seconds,
      rate: project?.rate ?? settings?.default_rate ?? 0,
      billing_type: project?.billing_type ?? "hourly",
      payment_status: "unpaid",
    });
  };

  const saveEdit = async (s: Session, name: string, dateDay: string, seconds: number) => {
    // Keep original time-of-day; only the calendar day can change.
    const orig = new Date(s.started_at);
    const d = new Date(`${dateDay}T00:00:00`);
    d.setHours(orig.getHours(), orig.getMinutes(), orig.getSeconds());
    await updateSession(s.id, { name: name.trim() || "Untitled", started_at: d.toISOString(), duration_seconds: seconds });
  };

  const togglePaid = (id: string, paid: boolean) =>
    updateSession(id, { payment_status: paid ? "unpaid" : "paid" }).catch(() => toast("Failed to update", "error"));

  const remove = async (id: string, name: string, closeAfter = false) => {
    const ok = await confirm({ title: "Delete entry", message: `Delete “${name}”? This can't be undone.`, confirmLabel: "Delete", destructive: true });
    if (!ok) return;
    try {
      await deleteSession(id);
      toast("Entry deleted", "success");
      if (closeAfter) onClose();
    } catch {
      toast("Failed to delete entry", "error");
    }
  };

  // ── Task mode: open directly into the pre-filled editor ──
  if (taskMode) {
    const target = rows[0]; // representative entry (most recent)
    const paid = target?.payment_status === "paid";
    return (
      <Dialog open={open} onClose={onClose} title={match?.name || "Task"}>
        <EntryForm
          key={target?.id ?? "new"}
          initial={target ? valuesOf(target) : { name: match?.name ?? "", date: new Date().toISOString().slice(0, 10), hours: "", minutes: "" }}
          saveLabel={target ? "Save changes" : "Add entry"}
          onSave={async (n, d, sec) => {
            try {
              if (target) await saveEdit(target, n, d, sec);
              else await saveNew(n, d, sec);
              toast("Saved", "success");
              onClose();
            } catch {
              toast("Failed to save", "error");
            }
          }}
          onCancel={onClose}
        />
        {target && (
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <Button
              variant="unstyled"
              size="unstyled"
              onClick={() => togglePaid(target.id, paid)}
              className={`border px-3 py-1.5 text-sm font-medium ${paid ? "border-money/30 bg-brand-faint text-money" : "border-line text-tertiary hover:bg-wash"}`}
            >
              {paid ? "Paid ✓" : "Mark paid"}
            </Button>
            <Button variant="unstyled" size="unstyled" onClick={() => remove(target.id, target.name, true)} className="px-2 py-1 text-md font-medium text-muted hover:text-red-600">
              Delete
            </Button>
          </div>
        )}
        {rows.length > 1 && (
          <p className="mt-3 text-md-minus text-muted">Editing the most recent of {rows.length} entries for this task. Use ••• to manage all.</p>
        )}
      </Dialog>
    );
  }

  // ── List mode (••• menu): full CRUD ──
  return (
    <Dialog open={open} onClose={onClose} title="Recent sessions" wide>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-md-minus text-muted">{rows.length} {rows.length === 1 ? "entry" : "entries"}</span>
        <Button size="sm" onClick={() => setEditing("new")} disabled={editing !== null}>+ Add entry</Button>
      </div>

      {editing !== null && (
        <div className="mb-3 border border-line bg-wash p-3">
          <EntryForm
            key={editing === "new" ? "new" : editing.id}
            initial={editing === "new" ? { name: "", date: new Date().toISOString().slice(0, 10), hours: "", minutes: "" } : valuesOf(editing)}
            saveLabel={editing === "new" ? "Add" : "Save"}
            onSave={async (n, d, sec) => {
              try {
                if (editing === "new") await saveNew(n, d, sec);
                else await saveEdit(editing, n, d, sec);
                toast(editing === "new" ? "Entry added" : "Entry updated", "success");
                setEditing(null);
              } catch {
                toast("Failed to save entry", "error");
              }
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="flex max-h-[50vh] flex-col gap-px overflow-auto">
        {rows.length === 0 && <span className="py-6 text-center text-base text-muted">No entries yet.</span>}
        {rows.slice(0, 50).map((s) => {
          const project = getProjectById(s.project_id);
          const paid = s.payment_status === "paid";
          const amount = (s.duration_seconds / 3600) * (s.rate || 0);
          return (
            <div key={s.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
              <span className="w-[88px] shrink-0 text-md-minus text-muted tnum">
                {new Date(s.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-md font-medium text-heading">{s.name}</span>
                <span className="truncate text-md-minus text-muted">{project?.name ?? "No project"}</span>
              </div>
              <span className="w-[88px] shrink-0 text-right text-md text-tertiary tnum">{fmtDuration(s.duration_seconds)}</span>
              <span className={`w-[72px] shrink-0 text-right text-md font-semibold tnum ${amount > 0 ? "text-money" : "text-muted"}`}>
                {amount > 0 ? fmtMoney(amount) : "—"}
              </span>
              <Button
                variant="unstyled"
                size="unstyled"
                onClick={() => togglePaid(s.id, paid)}
                className={`w-[84px] shrink-0 border px-2 py-1 text-sm font-medium ${paid ? "border-money/30 bg-brand-faint text-money" : "border-line text-tertiary hover:bg-wash"}`}
              >
                {paid ? "Paid ✓" : "Mark paid"}
              </Button>
              <Button variant="unstyled" size="unstyled" onClick={() => setEditing(s)} className="shrink-0 px-2 py-1 text-md font-medium text-tertiary hover:text-ink">Edit</Button>
              <Button variant="unstyled" size="unstyled" onClick={() => remove(s.id, s.name)} className="shrink-0 px-2 py-1 text-md font-medium text-muted hover:text-red-600">Delete</Button>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}
