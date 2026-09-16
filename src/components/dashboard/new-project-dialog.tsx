import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ClientPicker } from "@/components/shared/client-picker";
import { FormField } from "@/components/ui/form-field";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import type { BillingType } from "@/types/database";

/** New project — client + billing + rate. With no clients on record it becomes
 *  a prompt that hands control back to the caller's "new client" flow. */
export function NewProjectDialog({ open, onClose, onNeedClient }: { open: boolean; onClose: () => void; onNeedClient: () => void }) {
  const { addProject, clients } = useAppData();
  const { toast } = useToast();
  const t = useT();
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingType>("hourly");
  const [rate, setRate] = useState("");
  const [saving, setSaving] = useState(false);

  const clientName = clients.find((c) => c.id === clientId)?.name ?? t("new.selectClient");
  const valid = name.trim() && clientId && !saving;

  const reset = () => { setName(""); setClientId(null); setBilling("hourly"); setRate(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !clientId) return;
    setSaving(true);
    try {
      await addProject({
        client_id: clientId,
        name: name.trim(),
        billing_type: billing,
        rate: billing === "hourly" ? Number(rate) || 0 : null,
        fixed_budget: billing === "fixed" ? Number(rate) || 0 : null,
        status: "active",
      });
      toast(`${t("new.project")} “${name.trim()}” ${t("new.created")}`, "success");
      reset();
      onClose();
    } catch {
      toast(t("new.projectFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (clients.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} title={t("new.newProject")}>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="text-md text-tertiary">{t("new.needClientMessage")}</p>
          <div className="flex justify-center gap-2.5">
            <Button type="button" variant="outline" onClick={onClose}>{t("new.cancel")}</Button>
            <Button type="button" onClick={onNeedClient}>{t("new.createClient")}</Button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title={t("new.newProject")}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormField label={t("new.name")}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Finwall app" autoFocus />
        </FormField>
        <FormField label={t("new.client")} required>
          <ClientPicker
            clients={clients}
            onChange={setClientId}
            trigger={
              <Button type="button" variant="outline" size="default" className="w-full justify-between">
                <span className={`line-clamp-1 min-w-0 ${clientId ? "text-ink" : "text-muted-foreground"}`}>{clientName}</span>
                <span aria-hidden="true" className="shrink-0 text-muted-foreground">▾</span>
              </Button>
            }
          />
        </FormField>
        <div className="flex items-end gap-3">
          <FormField label={t("new.billing")}>
            <div className="flex items-start gap-0.5 rounded-sm bg-wash p-1">
              <Button type="button" variant={billing === "hourly" ? "surface" : "ghost-muted"} size="sm" onClick={() => setBilling("hourly")}>{t("new.hourly")}</Button>
              <Button type="button" variant={billing === "fixed" ? "surface" : "ghost-muted"} size="sm" onClick={() => setBilling("fixed")}>{t("new.fixed")}</Button>
            </div>
          </FormField>
          <FormField label={billing === "hourly" ? t("new.rateHr") : t("new.budget")}>
            <Input type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0" />
          </FormField>
        </div>
        <div className="flex justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>{t("new.cancel")}</Button>
          <Button type="submit" disabled={!valid}>{t("new.create")}</Button>
        </div>
      </form>
    </Dialog>
  );
}
