import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { EntryForm, valuesOf } from "@/components/shared/session-entry-form";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import { nowTimeStr } from "@/lib/date";
import { impliedHourlyRate } from "@/domain/employer";

/** Quick edit for one task's time entry, opened from a task row or ⌘K hit.
 *  Edits the most recent entry matching `match`, or adds the first one. */
export function SessionEditDialog({
  open, onClose, match,
}: {
  open: boolean;
  onClose: () => void;
  match: { projectId?: string; name: string };
}) {
  const { sessions, settings, getProjectById, getClientById, addSession, updateSession, deleteSession } = useAppData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const t = useT();

  const rows = sessions.filter((s) => {
    if (match.projectId !== undefined && (s.project_id ?? "none") !== match.projectId) return false;
    return s.name === match.name;
  });
  const target = rows[0]; // representative entry (most recent)
  const paid = target?.payment_status === "paid";

  const save = async (name: string, dateDay: string, startTime: string, seconds: number) => {
    const started_at = new Date(`${dateDay}T${startTime}:00`).toISOString();
    const trimmed = name.trim() || "Untitled";
    if (target) {
      await updateSession(target.id, { name: trimmed, started_at, duration_seconds: seconds });
      return;
    }
    const project = getProjectById(match.projectId ?? null);
    await addSession({
      client_id: project?.client_id ?? null,
      project_id: project?.id ?? null,
      name: trimmed,
      notes: null,
      tags: [],
      started_at,
      duration_seconds: seconds,
      rate: impliedHourlyRate(getClientById(project?.client_id ?? null), settings?.weekly_goal_hours ?? null)
        ?? project?.rate ?? settings?.default_rate ?? 0,
      billing_type: project?.billing_type ?? "hourly",
      payment_status: "unpaid",
    });
  };

  const togglePaid = async () => {
    if (!target) return;
    try {
      await updateSession(target.id, { payment_status: paid ? "unpaid" : "paid" });
      toast(paid ? t("sessions.markedUnpaid") : t("sessions.markedPaid"), "success");
    } catch {
      toast(t("sessions.updateFailed"), "error");
    }
  };

  const remove = async () => {
    if (!target) return;
    const ok = await confirm({
      title: t("sessions.deleteTitle"),
      message: `${t("sessions.deletePrefix")}“${target.name}”${t("sessions.deleteSuffix")}`,
      confirmLabel: t("sessions.delete"),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteSession(target.id);
      toast(t("sessions.entryDeleted"), "success");
      onClose();
    } catch {
      toast(t("sessions.deleteFailed"), "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={match.name || t("sessions.task")}>
      <EntryForm
        key={target?.id ?? "new"}
        initial={target ? valuesOf(target) : { name: match.name, date: new Date().toISOString().slice(0, 10), startTime: nowTimeStr(), hours: "", minutes: "" }}
        saveLabel={target ? t("sessions.saveChanges") : t("sessions.addEntry")}
        onSave={async (n, d, st, sec) => {
          try {
            await save(n, d, st, sec);
            toast(t("sessions.saved"), "success");
            onClose();
          } catch {
            toast(t("sessions.saveFailed"), "error");
          }
        }}
        onCancel={onClose}
      />
      {target && (
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <button
            onClick={togglePaid}
            className={`border px-3 py-1.5 text-sm font-medium transition-colors ${paid ? "border-money/30 bg-brand-faint text-money" : "border-line text-tertiary hover:bg-wash"}`}
          >
            {paid ? t("sessions.paid") : t("sessions.markPaid")}
          </button>
          <button onClick={remove} className="px-2 py-1 text-md font-medium text-muted-foreground hover:text-red-600 transition-colors">
            {t("sessions.delete")}
          </button>
        </div>
      )}
      {rows.length > 1 && (
        <p className="mt-3 text-md-minus text-muted-foreground">{t("sessions.editingNotePrefix")}{rows.length}{t("sessions.editingNoteSuffix")}</p>
      )}
    </Dialog>
  );
}
