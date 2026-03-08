import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import sh from "@/components/shared.module.css";
import s from "./clients-page.module.css";

export function ClientsPage() {
  const { clients, sessions, projects, addClient, updateClient, deleteClient } = useAppData();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className={sh.page}>
      <div className={sh.header}>
        <div>
          <h1 className={sh.title}>{t("clients.title")}</h1>
          <p className={sh.subtitle}>{clients.length} {t("clients.title").toLowerCase()}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus style={{ width: 16, height: 16 }} /> {t("clients.new")}</Button>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>{t("clients.name")}</th>
              <th>{t("clients.company")}</th>
              <th>{t("clients.email")}</th>
              <th>{t("projects.title")}</th>
              <th>{t("reports.totalTime")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const clientProjects = projects.filter((p) => p.client_id === client.id);
              const totalSeconds = sessions.filter((se) => se.client_id === client.id).reduce((sum, se) => sum + se.duration_seconds, 0);
              const hours = Math.round(totalSeconds / 3600 * 10) / 10;

              return (
                <tr key={client.id}>
                  <td className={s.nameCell}>
                    <div className={s.nameRow}>
                      <div className={s.avatar}>{client.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}</div>
                      {client.name}
                    </div>
                  </td>
                  <td className={s.mutedCell}>{client.company || "—"}</td>
                  <td className={s.mutedCell}>{client.email || "—"}</td>
                  <td className={s.mutedCell}>{clientProjects.length}</td>
                  <td className={s.mutedCell}>{hours}h</td>
                  <td className={s.actionsCell}>
                    <button className={s.actionBtn} onClick={() => setEditingId(client.id)}><Pencil style={{ width: 14, height: 14 }} /></button>
                    <button className={s.actionBtn} onClick={() => deleteClient(client.id)}><Trash2 style={{ width: 14, height: 14 }} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clients.length === 0 && <p className={sh.emptyText}>{t("clients.noClients")}</p>}
      </div>

      <ClientDialog open={showCreate} onClose={() => setShowCreate(false)} title={t("clients.new")}
        onSubmit={async (data) => { await addClient(data); setShowCreate(false); }} />

      {editingId && (() => {
        const c = clients.find((cl) => cl.id === editingId);
        if (!c) return null;
        return (
          <ClientDialog open={true} onClose={() => setEditingId(null)} title={t("clients.edit")}
            initial={c}
            onSubmit={async (data) => { await updateClient(editingId, data); setEditingId(null); }} />
        );
      })()}
    </div>
  );
}

function ClientDialog({ open, onClose, title, initial, onSubmit }: {
  open: boolean; onClose: () => void; title: string;
  initial?: { name: string; email: string | null; phone: string | null; company: string | null; address: string | null; country: string | null; website: string | null; notes: string | null };
  onSubmit: (data: any) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [company, setCompany] = useState(initial?.company || "");
  const [address, setAddress] = useState(initial?.address || "");
  const [country, setCountry] = useState(initial?.country || "");
  const [website, setWebsite] = useState(initial?.website || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({ name, email: email || null, phone: phone || null, company: company || null, address: address || null, country: country || null, website: website || null, notes: notes || null, tags: [] });
  };

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className={sh.formGrid}>
        <div className={sh.formRow2}>
          <div className={sh.formField}><label className={sh.formLabel}>{t("clients.name")}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" autoFocus /></div>
          <div className={sh.formField}><label className={sh.formLabel}>{t("clients.company")}</label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" /></div>
        </div>
        <div className={sh.formRow2}>
          <div className={sh.formField}><label className={sh.formLabel}>{t("clients.email")}</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" /></div>
          <div className={sh.formField}><label className={sh.formLabel}>{t("clients.phone")}</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380..." /></div>
        </div>
        <div className={sh.formRow2}>
          <div className={sh.formField}><label className={sh.formLabel}>{t("clients.website")}</label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." /></div>
          <div className={sh.formField}><label className={sh.formLabel}>{t("clients.country")}</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Ukraine" /></div>
        </div>
        <div className={sh.formField}><label className={sh.formLabel}>{t("clients.address")}</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" /></div>
        <div className={sh.formField}><label className={sh.formLabel}>{t("clients.notes")}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." rows={2} className={sh.formTextarea} /></div>
        <div className={sh.formActions}>
          <Button variant="outline" type="button" onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="submit">{initial ? t("common.save") : t("common.create")}</Button>
        </div>
      </form>
    </Dialog>
  );
}
