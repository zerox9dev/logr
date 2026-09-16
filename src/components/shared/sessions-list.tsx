"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { EntryForm, valuesOf } from "@/components/shared/session-entry-form";
import { ImportDialog } from "@/components/dashboard/import-dialog";
import { useAppData } from "@/contexts/data-context";
import { useT, useLang } from "@/i18n";
import { fmtDuration, fmtMoney } from "@/lib/format";
import { nowTimeStr } from "@/lib/date";
import { impliedHourlyRate } from "@/domain/employer";
import type { Session } from "@/types/database";

/** Full sessions CRUD: search, add, inline edit, paid toggle, delete.
 *  `?project=<id|none>` and `?task=<name>` narrow the list — both are shown
 *  as removable chips so a deep link never looks like an empty database. */
export function SessionsList() {
  const { sessions, settings, loading, getProjectById, getClientById, addSession, updateSession, deleteSession } = useAppData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const [editing, setEditing] = useState<null | "new" | Session>(null);
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const projectFilter = params.get("project");
  const taskFilter = params.get("task");
  const filterProjectName = projectFilter
    ? (getProjectById(projectFilter === "none" ? null : projectFilter)?.name ?? t("sessions.noProject"))
    : null;

  const dropFilter = (key: "project" | "task") => {
    const next = new URLSearchParams(params.toString());
    next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `/app/sessions?${qs}` : "/app/sessions");
  };

  const rows = sessions.filter((s) => {
    if (projectFilter !== null && (s.project_id ?? "none") !== projectFilter) return false;
    if (taskFilter !== null && s.name !== taskFilter) return false;
    return true;
  });

  const saveNew = async (name: string, dateDay: string, startTime: string, seconds: number) => {
    const project = getProjectById(projectFilter === "none" ? null : projectFilter);
    await addSession({
      client_id: project?.client_id ?? null,
      project_id: project?.id ?? null,
      name: name.trim() || "Untitled",
      notes: null,
      tags: [],
      started_at: new Date(`${dateDay}T${startTime}:00`).toISOString(),
      duration_seconds: seconds,
      rate: impliedHourlyRate(getClientById(project?.client_id ?? null), settings?.weekly_goal_hours ?? null)
        ?? project?.rate ?? settings?.default_rate ?? 0,
      billing_type: project?.billing_type ?? "hourly",
      payment_status: "unpaid",
    });
  };

  const saveEdit = async (s: Session, name: string, dateDay: string, startTime: string, seconds: number) => {
    const started_at = new Date(`${dateDay}T${startTime}:00`).toISOString();
    await updateSession(s.id, { name: name.trim() || "Untitled", started_at, duration_seconds: seconds });
  };

  const togglePaid = async (id: string, paid: boolean) => {
    try {
      await updateSession(id, { payment_status: paid ? "unpaid" : "paid" });
      toast(paid ? t("sessions.markedUnpaid") : t("sessions.markedPaid"), "success");
    } catch {
      toast(t("sessions.updateFailed"), "error");
    }
  };

  const remove = async (id: string, name: string) => {
    const ok = await confirm({ title: t("sessions.deleteTitle"), message: `${t("sessions.deletePrefix")}“${name}”${t("sessions.deleteSuffix")}`, confirmLabel: t("sessions.delete"), destructive: true });
    if (!ok) return;
    try {
      await deleteSession(id);
      toast(t("sessions.entryDeleted"), "success");
    } catch {
      toast(t("sessions.deleteFailed"), "error");
    }
  };

  const q = search.trim().toLowerCase();
  const filteredRows = q
    ? rows.filter((s) => {
        const project = getProjectById(s.project_id);
        return s.name.toLowerCase().includes(q) || (project?.name ?? "").toLowerCase().includes(q);
      })
    : rows;

  const chip = "flex items-center gap-1.5 border border-line bg-card px-2 py-1 text-md-minus text-tertiary";

  return (
    <div className="min-w-0 flex-1 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-widget font-semibold text-heading">{t("sidebar.sessions")}</h1>
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("sessions.searchPlaceholder")}
              className="min-w-0 border border-line bg-card px-3 py-1.5 text-md text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-line"
            />
            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>{t("import.menuItem")}</Button>
            <Button size="sm" onClick={() => setEditing("new")} disabled={editing !== null}>{t("sessions.addEntryButton")}</Button>
          </div>
        </div>

        <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />

        {(filterProjectName || taskFilter) && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {filterProjectName && (
              <span className={chip}>
                {filterProjectName}
                <button type="button" aria-label={t("sessions.clearFilter")} onClick={() => dropFilter("project")} className="text-muted-foreground hover:text-ink">
                  <X className="size-3" />
                </button>
              </span>
            )}
            {taskFilter && (
              <span className={chip}>
                {taskFilter}
                <button type="button" aria-label={t("sessions.clearFilter")} onClick={() => dropFilter("task")} className="text-muted-foreground hover:text-ink">
                  <X className="size-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="mb-3">
          <span className="text-md-minus text-muted-foreground">{filteredRows.length} {filteredRows.length === 1 ? t("sessions.entryOne") : t("sessions.entryMany")}</span>
        </div>

        {editing !== null && (
          <div className="mb-3 border border-line bg-wash p-3">
            <EntryForm
              key={editing === "new" ? "new" : editing.id}
              initial={editing === "new" ? { name: "", date: new Date().toISOString().slice(0, 10), startTime: nowTimeStr(), hours: "", minutes: "" } : valuesOf(editing)}
              saveLabel={editing === "new" ? t("sessions.add") : t("sessions.save")}
              onSave={async (n, d, st, sec) => {
                try {
                  if (editing === "new") await saveNew(n, d, st, sec);
                  else await saveEdit(editing, n, d, st, sec);
                  toast(editing === "new" ? t("sessions.entryAdded") : t("sessions.entryUpdated"), "success");
                  setEditing(null);
                } catch {
                  toast(t("sessions.saveEntryFailed"), "error");
                }
              }}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-md-minus text-muted-foreground">{t("sessions.date")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("sessions.task")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("table.project")}</TableHead>
              <TableHead className="text-right text-md-minus text-muted-foreground">{t("reports.sessionDuration")}</TableHead>
              <TableHead className="text-right text-md-minus text-muted-foreground">{t("reports.sessionAmount")}</TableHead>
              <TableHead className="text-md-minus text-muted-foreground">{t("table.status")}</TableHead>
              <TableHead className="text-right text-md-minus text-muted-foreground">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || filteredRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-6 text-center text-base text-muted-foreground">
                  {loading ? t("common.loading") : t("sessions.noEntries")}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.slice(0, 50).map((s) => {
                const project = getProjectById(s.project_id);
                const paid = s.payment_status === "paid";
                const amount = (s.duration_seconds / 3600) * (s.rate || 0);
                return (
                  <TableRow key={s.id} className="border-line hover:bg-transparent">
                    <TableCell className="py-2.5 text-md-minus text-muted-foreground tnum">
                      {new Date(s.started_at).toLocaleDateString(lang, { month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-md font-medium text-heading">{s.name}</span>
                        {(s.tags ?? []).map((tag) => (
                          <span key={tag} className="border border-line px-1.5 py-px text-xs text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-md-minus text-muted-foreground">{project?.name ?? t("sessions.noProject")}</TableCell>
                    <TableCell className="py-2.5 text-right text-md text-tertiary tnum">
                      {fmtDuration(s.duration_seconds, { hr: t("unit.hr"), min: t("unit.min") })}
                    </TableCell>
                    <TableCell className={`py-2.5 text-right text-md font-semibold tnum ${amount > 0 ? "text-money" : "text-muted-foreground"}`}>
                      {amount > 0 ? fmtMoney(amount) : "—"}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <button
                        onClick={() => togglePaid(s.id, paid)}
                        className={`border px-2 py-1 text-sm font-medium transition-colors ${paid ? "border-money/30 bg-brand-faint text-money" : "border-line text-tertiary hover:bg-wash"}`}
                      >
                        {paid ? t("sessions.paid") : t("sessions.markPaid")}
                      </button>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditing(s)} className="px-2 py-1 text-md font-medium text-tertiary hover:text-ink transition-colors">{t("sessions.edit")}</button>
                        <button onClick={() => remove(s.id, s.name)} className="px-2 py-1 text-md font-medium text-muted-foreground hover:text-red-600 transition-colors">{t("sessions.delete")}</button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {filteredRows.length > 50 && (
          <span className="py-6 text-center text-md text-muted-foreground">
            {t("sessions.showingFirst").replace("{n}", "50").replace("{total}", String(filteredRows.length))}
          </span>
        )}
      </div>
    </div>
  );
}
