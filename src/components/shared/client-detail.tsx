"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { Field } from "@/components/shared/field";
import { useAppData } from "@/contexts/data-context";
import { NewClientDialog } from "@/components/dashboard/new-client-dialog";
import { useT, useLang } from "@/i18n";
import { fmtMoney } from "@/lib/format";
import { impliedHourlyRate } from "@/domain/employer";
import type { ActivityType, SalaryPeriod } from "@/types/database";

const ACTIVITY_TYPES: ActivityType[] = ["call", "email", "meeting", "note", "payment"];

const SALARY_PERIOD_LABEL_KEYS: Record<SalaryPeriod, string> = {
  hourly: "client.salaryPeriod.hourly",
  monthly: "client.salaryPeriod.monthly",
  annual: "client.salaryPeriod.annual",
};

const ACTIVITY_TYPE_LABEL_KEYS: Record<ActivityType, string> = {
  call: "activityLog.type.call",
  email: "activityLog.type.email",
  meeting: "activityLog.type.meeting",
  note: "activityLog.type.note",
  payment: "activityLog.type.payment",
};

/** Client detail: contact header, the client's projects and invoices, and the
 *  activity log (add / delete — activities are a log, not editable records). */
export function ClientDetail({ id }: { id: string }) {
  const {
    loading, getClientById, getActivitiesByClient,
    projects, invoices, settings, addActivity, deleteActivity,
  } = useAppData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const t = useT();
  const { lang } = useLang();

  const [type, setType] = useState<ActivityType>("call");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const client = getClientById(id);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang, { month: "short", day: "numeric", year: "numeric" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || saving) return;
    setSaving(true);
    try {
      await addActivity({ client_id: id, type, description: description.trim() });
      setDescription("");
      toast(t("activityLog.added"), "success");
    } catch {
      toast(t("activityLog.addFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (activityId: string) => {
    const ok = await confirm({
      title: t("activityLog.deleteTitle"),
      message: t("activityLog.deleteMessage"),
      confirmLabel: t("activityLog.delete"),
      destructive: true,
    });
    if (!ok) return;
    setBusy(activityId);
    try {
      await deleteActivity(activityId);
      toast(t("activityLog.deleted"), "success");
    } catch {
      toast(t("activityLog.deleteFailed"), "error");
    } finally {
      setBusy(null);
    }
  };

  if (loading || !client) {
    return (
      <div className="min-w-0 flex-1 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
        <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
          <p className="py-8 text-center text-base text-muted-foreground">
            {loading ? t("common.loading") : t("clientDetail.notFound")}
          </p>
        </div>
      </div>
    );
  }

  const clientProjects = projects.filter((p) => p.client_id === id);
  const clientInvoices = invoices.filter((i) => i.client_id === id);
  const activities = [...getActivitiesByClient(id)].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const meta = [client.company, client.email, client.phone, client.address].filter(Boolean);
  const isEmployer = client.client_type === "employer";
  const impliedRate = impliedHourlyRate(client, settings?.weekly_goal_hours ?? null);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <Link href="/app/clients" className="text-md-minus text-muted-foreground transition-colors hover:text-ink">
          ← {t("sidebar.clients")}
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <h1 className="text-widget font-semibold text-heading">{client.name}</h1>
            {isEmployer && <Badge variant="secondary">{t("client.type.employer")}</Badge>}
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>{t("client.edit")}</Button>
        </div>
        {meta.length > 0 && (
          <p className="mt-1 text-md text-muted-foreground">{meta.join(" · ")}</p>
        )}
        {isEmployer && client.salary_amount != null && (
          <p className="mt-1 text-md text-heading">
            <span className="font-semibold tnum">{fmtMoney(client.salary_amount)}</span>
            {" "}
            <span className="text-muted-foreground">
              {t(SALARY_PERIOD_LABEL_KEYS[client.salary_period ?? "monthly"])}
            </span>
            {impliedRate != null && (
              <span className="text-muted-foreground">
                {" · "}
                {t("client.impliedRate").replace("{rate}", fmtMoney(Math.round(impliedRate * 100) / 100))}
              </span>
            )}
          </p>
        )}
        {client.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {client.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <h2 className="mb-4 text-base font-semibold text-heading">{t("sidebar.projects")}</h2>
        {clientProjects.length === 0 ? (
          <p className="py-4 text-md text-muted-foreground">{t("clientDetail.noProjects")}</p>
        ) : (
          <div className="flex flex-col gap-px">
            {clientProjects.map((p) => (
              <Link
                key={p.id}
                href={`/app/projects/${p.id}`}
                className="flex flex-wrap items-center gap-3 border-b border-line py-2.5 transition-colors last:border-0 hover:bg-wash"
              >
                <span className="min-w-0 flex-1 truncate text-md font-semibold text-heading">{p.name}</span>
                <span className="shrink-0 text-md-minus text-muted-foreground">
                  {p.billing_type === "fixed" ? t("projects.fixed") : t("projects.hourly")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Employers are paid a salary, not invoiced — the section would only
          ever be empty for them. */}
      {!isEmployer && (
      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <h2 className="mb-4 text-base font-semibold text-heading">{t("sidebar.invoices")}</h2>
        {clientInvoices.length === 0 ? (
          <p className="py-4 text-md text-muted-foreground">{t("clientDetail.noInvoices")}</p>
        ) : (
          <div className="flex flex-col gap-px">
            {clientInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/app/invoices/${inv.id}`}
                className="flex flex-wrap items-center gap-3 border-b border-line py-2.5 transition-colors last:border-0 hover:bg-wash"
              >
                <span className="min-w-0 flex-1 truncate text-md font-semibold text-heading tnum">{inv.invoice_number}</span>
                <span className="shrink-0 text-md-minus text-muted-foreground">{fmtDate(inv.created_at)}</span>
                <span className="w-[96px] shrink-0 text-right text-md font-semibold text-money tnum">
                  {fmtMoney(inv.total, inv.currency)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
      )}

      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <h2 className="mb-4 text-base font-semibold text-heading">{t("activityLog.title")}</h2>

        <form onSubmit={submit} className="mb-4 flex flex-wrap items-end gap-3">
          <div className="w-[160px] shrink-0">
            <Field label={t("activityLog.typeLabel")}>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                className="h-9 w-full border border-line bg-card px-3 text-md text-ink transition-colors focus-visible:border-ink focus-visible:outline-none"
              >
                {ACTIVITY_TYPES.map((v) => (
                  <option key={v} value={v}>{t(ACTIVITY_TYPE_LABEL_KEYS[v])}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="min-w-[200px] flex-1">
            <Field label={t("activityLog.descriptionLabel")}>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("activityLog.descriptionPlaceholder")}
              />
            </Field>
          </div>
          <Button type="submit" disabled={!description.trim() || saving}>{t("activityLog.add")}</Button>
        </form>

        {activities.length === 0 ? (
          <p className="py-4 text-md text-muted-foreground">{t("activityLog.empty")}</p>
        ) : (
          <div className="flex flex-col gap-px">
            {activities.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 border-b border-line py-2.5 last:border-0">
                <Badge variant="secondary" className="shrink-0">{t(ACTIVITY_TYPE_LABEL_KEYS[a.type] ?? a.type)}</Badge>
                <span className="min-w-0 flex-1 text-md text-heading">{a.description}</span>
                <span className="shrink-0 text-md-minus text-muted-foreground">{fmtDate(a.created_at)}</span>
                <button
                  type="button"
                  disabled={busy === a.id}
                  onClick={() => remove(a.id)}
                  className="shrink-0 px-2 py-1 text-md-minus font-medium text-muted-foreground transition-colors hover:text-red-600 disabled:opacity-50"
                >
                  {t("activityLog.delete")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <NewClientDialog open={editOpen} onClose={() => setEditOpen(false)} client={client} />
    </div>
  );
}
