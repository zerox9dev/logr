import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { FormField } from "@/components/ui/form-field";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import type { Client, ClientType, SalaryPeriod } from "@/types/database";

const SALARY_PERIODS: SalaryPeriod[] = ["hourly", "monthly", "annual"];

const SALARY_PERIOD_LABEL_KEYS: Record<SalaryPeriod, string> = {
  hourly: "client.salaryPeriod.hourly",
  monthly: "client.salaryPeriod.monthly",
  annual: "client.salaryPeriod.annual",
};

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
      <FormField label={t("new.name")}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." autoFocus />
      </FormField>
      <FormField label={t("new.email")}>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@acme.com" />
      </FormField>
      <FormField label={t("new.company")}>
        <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t("new.optional")} />
      </FormField>

      <FormField label={t("client.typeLabel")}>
        <div className="flex w-fit items-start gap-0.5 rounded-sm bg-wash p-1">
          <Button type="button" variant={!isEmployer ? "surface" : "ghost-muted"} size="sm" onClick={() => setClientType("client")}>
            {t("client.type.client")}
          </Button>
          <Button type="button" variant={isEmployer ? "surface" : "ghost-muted"} size="sm" onClick={() => setClientType("employer")}>
            {t("client.type.employer")}
          </Button>
        </div>
      </FormField>

      {isEmployer && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1">
            <FormField label={t("client.salaryAmount")}>
              <Input
                type="number"
                min="0"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                placeholder="0"
              />
            </FormField>
          </div>
          <div className="w-[160px] shrink-0">
            <FormField label={t("client.salaryPeriodLabel")}>
              <Select value={salaryPeriod} onValueChange={(v) => setSalaryPeriod(v as SalaryPeriod)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>{t(SALARY_PERIOD_LABEL_KEYS[p])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
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
