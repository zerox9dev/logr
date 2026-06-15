import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/lib/data-context";
import { useT } from "@/lib/i18n";
import type { BillingType, Client } from "@/types/database";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-md-minus text-muted">{label}</span>
      {children}
    </label>
  );
}

/** New client — minimal contact fields. */
function NewClientDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addClient } = useAppData();
  const { toast } = useToast();
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => { setName(""); setEmail(""); setCompany(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await addClient({
        name: name.trim(),
        email: email.trim() || null,
        phone: null,
        company: company.trim() || null,
        address: null,
        country: null,
        website: null,
        tags: [],
        notes: null,
      });
      toast(`${t("new.client")} “${name.trim()}” ${t("new.created")}`, "success");
      reset();
      onClose();
    } catch {
      toast(t("new.clientFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("new.newClient")}>
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
        <div className="flex justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>{t("new.cancel")}</Button>
          <Button type="submit" disabled={!name.trim() || saving}>{t("new.create")}</Button>
        </div>
      </form>
    </Dialog>
  );
}

/** Client picker — Radix DropdownMenu over existing clients. */
function ClientPicker({
  clients, onChange, trigger,
}: {
  clients: Client[];
  onChange: (id: string) => void;
  trigger: React.ReactNode;
}) {
  const t = useT();
  const item = "cursor-pointer truncate px-3 py-2 text-md text-ink outline-none data-[highlighted]:bg-wash";
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-[60] max-h-[240px] min-w-[220px] max-w-[320px] overflow-auto border border-line bg-card py-1 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)]"
        >
          {clients.map((c) => (
            <DropdownMenu.Item key={c.id} className={item} onSelect={() => onChange(c.id)}>
              {c.name}
            </DropdownMenu.Item>
          ))}
          {clients.length === 0 && (
            <span className="block px-3 py-2 text-md text-muted">{t("new.noClientsYet")}</span>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** New project — client + billing + rate. */
function NewProjectDialog({ open, onClose, onNeedClient }: { open: boolean; onClose: () => void; onNeedClient: () => void }) {
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

  const seg = (active: boolean) =>
    `px-4 py-2 text-md font-medium ${active ? "bg-card text-heading shadow-[0px_1px_4px_0px_rgba(0,0,0,0.08)]" : "text-dark-3"}`;

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
        <Field label={t("new.name")}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Finwall app" autoFocus />
        </Field>
        <Field label={t("new.client")}>
          <ClientPicker
            clients={clients}
            onChange={setClientId}
            trigger={
              <Button type="button" variant="outline" size="default" className="w-full justify-between">
                <span className={`line-clamp-1 min-w-0 ${clientId ? "text-ink" : "text-muted"}`}>{clientName}</span>
                <span aria-hidden="true" className="shrink-0 text-muted">▾</span>
              </Button>
            }
          />
        </Field>
        <div className="flex items-end gap-3">
          <Field label={t("new.billing")}>
            <div className="flex items-start bg-wash p-1">
              <button type="button" className={seg(billing === "hourly")} onClick={() => setBilling("hourly")}>{t("new.hourly")}</button>
              <button type="button" className={seg(billing === "fixed")} onClick={() => setBilling("fixed")}>{t("new.fixed")}</button>
            </div>
          </Field>
          <Field label={billing === "hourly" ? t("new.rateHr") : t("new.budget")}>
            <Input type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0" />
          </Field>
        </div>
        <div className="flex justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>{t("new.cancel")}</Button>
          <Button type="submit" disabled={!valid}>{t("new.create")}</Button>
        </div>
      </form>
    </Dialog>
  );
}

/** `+ New` button (TopBar) — dropdown to create a project or client. */
export function NewMenu() {
  const [dialog, setDialog] = useState<null | "project" | "client">(null);
  const t = useT();
  const item = "cursor-pointer px-3 py-2 text-md text-ink outline-none data-[highlighted]:bg-wash";

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="unstyled" size="unstyled" className="flex items-center gap-1.5 bg-black px-4 py-[9px] font-medium text-card">
            <span aria-hidden="true" className="text-base leading-none">+</span>
            <span className="text-md">{t("new.new")}</span>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[180px] border border-line bg-card py-1 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)]"
          >
            <DropdownMenu.Item className={item} onSelect={() => setDialog("project")}>{t("new.newProject")}</DropdownMenu.Item>
            <DropdownMenu.Item className={item} onSelect={() => setDialog("client")}>{t("new.newClient")}</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <NewProjectDialog open={dialog === "project"} onClose={() => setDialog(null)} onNeedClient={() => setDialog("client")} />
      <NewClientDialog open={dialog === "client"} onClose={() => setDialog(null)} />
    </>
  );
}
