import { useState } from "react";
import { Plus, Pencil, Trash2, Mail, Phone, Globe, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";

export function ClientsPage() {
  const { clients, sessions, invoices, projects, addClient, updateClient, deleteClient } = useAppData();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("clients.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} {t("clients.title").toLowerCase()}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> {t("clients.new")}</Button>
      </div>

      <div className="space-y-2">
        {clients.map((client) => {
          const clientProjects = projects.filter((p) => p.client_id === client.id);
          const totalSeconds = sessions.filter((s) => s.client_id === client.id).reduce((sum, s) => sum + s.duration_seconds, 0);
          const hours = Math.round(totalSeconds / 3600 * 10) / 10;
          const initials = client.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

          return (
            <Card key={client.id} className="group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-xs font-semibold">
                    {initials}
                  </div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.company && `${client.company} · `}
                      {clientProjects.length} project{clientProjects.length !== 1 ? "s" : ""} · {hours}h
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {client.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>}
                      {client.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                      {client.website && <span className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />{client.website}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(client.id)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteClient(client.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {clients.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t("clients.noClients")}</p>}
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" autoFocus /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Company</label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><label className="text-sm font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380..." /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><label className="text-sm font-medium">Website</label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Country</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Ukraine" /></div>
        </div>
        <div className="space-y-2"><label className="text-sm font-medium">Address</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" /></div>
        <div className="space-y-2"><label className="text-sm font-medium">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." rows={2}
            className="flex w-full rounded-lg border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground" /></div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? "Save" : "Create"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
