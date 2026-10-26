"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useConfirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { EntryForm, valuesOf } from "@/components/shared/session-entry-form";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import type { Session } from "@/types/database";

/** Edit or delete one session, opened by clicking its block on the calendar. */
export function SessionDialog({ session, onClose }: { session: Session | null; onClose: () => void }) {
  const { updateSession, deleteSession, getProjectById } = useAppData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const t = useT();

  const save = async (name: string, dateDay: string, startTime: string, seconds: number) => {
    if (!session) return;
    try {
      await updateSession(session.id, {
        name: name.trim() || "Untitled",
        started_at: new Date(`${dateDay}T${startTime}:00`).toISOString(),
        duration_seconds: seconds,
      });
      onClose();
    } catch {
      toast(t("cal.moveFailed"), "error");
    }
  };

  const remove = async () => {
    if (!session) return;
    const ok = await confirm({
      title: t("sessions.deleteTitle"),
      message: `${t("sessions.deletePrefix")}“${session.name}”${t("sessions.deleteSuffix")}`,
      confirmLabel: t("sessions.delete"),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteSession(session.id);
      onClose();
    } catch {
      toast(t("cal.moveFailed"), "error");
    }
  };

  return (
    <Dialog open={session !== null} onClose={onClose} title={getProjectById(session?.project_id ?? null)?.name ?? t("track.noProject")}>
      {session ? (
        <div className="flex flex-col gap-4">
          <EntryForm key={session.id} initial={valuesOf(session)} onSave={save} onCancel={onClose} />
          <div className="border-t border-line pt-3">
            <Button type="button" variant="destructive" size="sm" onClick={remove}>
              <Trash2 aria-hidden="true" />
              {t("sessions.delete")}
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
