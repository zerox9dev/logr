import { useState } from "react";
import { Plus, Pencil, Trash2, Mail, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import sh from "@/components/shared.module.css";
import s from "./clients-page.module.css";

export function ClientsPage() {
  const { clients, sessions, invoices, projects, addClient, updateClient, deleteClient } = useAppData();
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

      <div className={sh.listGap}>
        {clients.map((client) => {
          const clientProjects = projects.filter((p) => p.client_id === client.id);
          const totalSeconds = sessions.filter((se) => se.client_id === client.id).reduce((sum, se) => sum + se.duration_seconds, 0);
          const hours = Math.round(totalSeconds / 3600 * 10) / 10;
          const initials = client.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

          return (
            <Card key={client.id}>
              <CardContent className={sh.cardRow}>
                <div className={s.clientRow}>
                  <div className={s.avatar}>{initials}</div>
                  <div>
                    <p style={{ fontWeight: 500 }}>{client.name}</p>
                    <p className={sh.mutedText}>
                      {client.company && `${client.company} · `}
                      {clientProjects.length} project{clientProjects.length !== 1 ? "s" : ""} · {hours}h
                    </p>
                    <div className={s.contactInfo}>
                      {client.email && <span className={s.contactItem}><Mail className={s.contactIcon} />{client.email}</span>}
                      {client.phone && <span className={s.contactItem}><Phone className={s.contactIcon} />{client.phone}</span>}
                      {client.website && <span className={s.contactItem}><Globe className={s.contactIcon} />{client.website}</span>}
                    </div>
                  </div>
                </div>
                <div className={sh.hoverActions}>
                  <Button variant="ghost" size="icon" className={sh.hoverBtn} onClick={() => setEditingId(client.id)}><Pencil style={{ width: 12, height: 12 }} /></Button>
                  <Button variant="ghost" size="icon" className={sh.hoverBtn} onClick={() => deleteClient(client.id)}><Trash2 style={{ width: 12, height: 12 }} /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {clients.length === 0 && <p className={sh.emptyText}>{t("clients.noClients")}</p>}
      </div>

      <ClientDialog open={showCreate} onClose={() => setShowCreate(false)} title="New Client"
        onSubmit={async (data) => { await addClient(data); setShowCreate(false); }} />

      {editingId && (() => {
        const c = clients.find((cl) => cl.id === editingId);
        if (!c) return null;
        return (
          <ClientDialog open={true} onClose={() => setEditingId(null)} title="Edit Client"
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
          <div className={sh.formField}><label className={sh.formLabel}>Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" autoFocus /></div>
          <div className={sh.formField}><label className={sh.formLabel}>Company</label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" /></div>
        </div>
        <div className={sh.formRow2}>
          <div className={sh.formField}><label className={sh.formLabel}>Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" /></div>
          <div className={sh.formField}><label className={sh.formLabel}>Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380..." /></div>
        </div>
        <div className={sh.formRow2}>
          <div className={sh.formField}><label className={sh.formLabel}>Website</label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." /></div>
          <div className={sh.formField}><label className={sh.formLabel}>Country</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Ukraine" /></div>
        </div>
        <div className={sh.formField}><label className={sh.formLabel}>Address</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" /></div>
        <div className={sh.formField}><label className={sh.formLabel}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." rows={2} className={sh.formTextarea} /></div>
        <div className={sh.formActions}>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? "Save" : "Create"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
