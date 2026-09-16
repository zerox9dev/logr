import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Field } from "@/components/shared/field";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";

/** New client — minimal contact fields. */
export function NewClientDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
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
