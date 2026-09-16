import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Field } from "@/components/shared/field";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import type { Client, ClientType, SalaryPeriod } from "@/types/database";

const SALARY_PERIODS: SalaryPeriod[] = ["hourly", "monthly", "annual"];

const SALARY_PERIOD_LABEL_KEYS: Record<SalaryPeriod, string> = {
  hourly: "client.salaryPeriod.hourly",
  monthly: "client.salaryPeriod.monthly",
  annual: "client.salaryPeriod.annual",
};

const seg = (active: boolean) =>
  `px-3 py-1.5 text-md-minus font-medium ${active ? "bg-card text-heading shadow-[0px_1px_4px_0px_rgba(0,0,0,0.08)]" : "text-dark-3"}`;

/** Contact fields plus the engagement type: a "client" is invoiced per session
 *  rate, an "employer" pays a salary that sessions derive an implied rate from.
 *  Mounted fresh per open so the edit case pre-fills without a reset effect. */
function ClientForm({ client, onClose }: { client?: Client; onClose: () => void }) {
  const { addClient, updateClient } = useAppData();
  const { toast } = useToast();
  const t = useT();
  const [name, setName] = useState(client?.name ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [company, setCompany] = useState(client?.company ?? "");
  const [clientType, setClientType] = useState<ClientType>(client?.client_type ?? "client");
  const [salaryAmount, setSalaryAmount] = useState(String(client?.salary_amount ?? ""));
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>(client?.salary_period ?? "monthly");
  const [saving, setSaving] = useState(false);

  const isEmployer = clientType === "employer";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || null,
        company: company.trim() || null,
        client_type: clientType,
        salary_amount: isEmployer ? Number(salaryAmount) || null : null,
        salary_period: isEmployer ? salaryPeriod : null,
      };
      if (client) {
        await updateClient(client.id, payload);
        toast(t("client.updated"), "success");
      } else {
        await addClient({
          ...payload,
          phone: null,
          address: null,
          country: null,
          website: null,
          tags: [],
          notes: null,
        });
        toast(`${t("new.client")} “${name.trim()}” ${t("new.created")}`, "success");
      }
      onClose();
    } catch {
      toast(client ? t("client.updateFailed") : t("new.clientFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label={t("new.name")}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." autoFocus />
      </Field>
      <Field label={t("new.email")}>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@acme.com" />
      </Field>
      <Field label={t("new.company")}>
        <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t("new.optional")} />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-md-minus text-muted-foreground">{t("client.typeLabel")}</span>
        <div className="flex w-fit items-start bg-wash p-1">
          <button type="button" className={seg(!isEmployer)} onClick={() => setClientType("client")}>
            {t("client.type.client")}
          </button>
          <button type="button" className={seg(isEmployer)} onClick={() => setClientType("employer")}>
            {t("client.type.employer")}
          </button>
        </div>
      </div>

      {isEmployer && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1">
            <Field label={t("client.salaryAmount")}>
              <Input
                type="number"
                min="0"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>
          <div className="w-[160px] shrink-0">
            <Field label={t("client.salaryPeriodLabel")}>
              <select
                value={salaryPeriod}
                onChange={(e) => setSalaryPeriod(e.target.value as SalaryPeriod)}
                className="h-9 w-full border border-line bg-card px-3 text-md text-ink transition-colors focus-visible:border-ink focus-visible:outline-none"
              >
                {SALARY_PERIODS.map((p) => (
                  <option key={p} value={p}>{t(SALARY_PERIOD_LABEL_KEYS[p])}</option>
                ))}
              </select>
            </Field>
          </div>
          <p className="w-full text-sm text-muted-foreground">{t("client.salaryHint")}</p>
        </div>
      )}

      <div className="flex justify-end gap-2.5 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>{t("new.cancel")}</Button>
        <Button type="submit" disabled={!name.trim() || saving}>
          {client ? t("client.save") : t("new.create")}
        </Button>
      </div>
    </form>
  );
}

/** Create a client, or edit one when `client` is passed. */
export function NewClientDialog({
  open, onClose, client,
}: { open: boolean; onClose: () => void; client?: Client }) {
  const t = useT();
  return (
    <Dialog open={open} onClose={onClose} title={client ? t("client.editTitle") : t("new.newClient")}>
      {open && <ClientForm client={client} onClose={onClose} />}
    </Dialog>
  );
}
