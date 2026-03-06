import { useState } from "react";
import { Plus, Pencil, Trash2, Mail, Phone, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Client, ClientStatus, TimeEntry, Invoice, InvoiceItem } from "@/types";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getInvoiceTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.hours * item.rate, 0);
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

interface ClientsPageProps {
  clients: Client[];
  entries: TimeEntry[];
  invoices: Invoice[];
  projects: { id: string; clientId: string | null }[];
  onAdd: (data: { name: string; email: string; company: string; phone?: string; address?: string; notes?: string; status?: ClientStatus }) => void;
  onUpdate: (id: string, data: Partial<Client>) => void;
  onDelete: (id: string) => void;
}

export function ClientsPage({ clients, entries, invoices, projects, onAdd, onUpdate, onDelete }: ClientsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ClientStatus>("active");

  const resetForm = () => {
    setName(""); setEmail(""); setPhone(""); setCompany("");
    setAddress(""); setNotes(""); setStatus("active");
    setEditId(null); setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const data = { name: name.trim(), email, phone, company, address, notes, status };
    if (editId) onUpdate(editId, data);
    else onAdd(data);
    resetForm();
  };

  const handleEdit = (client: Client) => {
    setName(client.name); setEmail(client.email); setPhone(client.phone);
    setCompany(client.company); setAddress(client.address);
    setNotes(client.notes); setStatus(client.status);
    setEditId(client.id); setShowForm(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Compute per-client stats
  const clientProjects = new Map<string, string[]>();
  projects.forEach((p) => {
    if (p.clientId) {
      if (!clientProjects.has(p.clientId)) clientProjects.set(p.clientId, []);
      clientProjects.get(p.clientId)!.push(p.id);
    }
  });

  const clientHours = new Map<string, number>();
  entries.forEach((e) => {
    if (e.projectId) {
      const proj = projects.find((p) => p.id === e.projectId);
      if (proj?.clientId) {
        clientHours.set(proj.clientId, (clientHours.get(proj.clientId) || 0) + e.duration);
      }
    }
  });

  const clientInvoiced = new Map<string, { total: number; paid: number }>();
  invoices.forEach((inv) => {
    if (inv.clientId) {
      const curr = clientInvoiced.get(inv.clientId) || { total: 0, paid: 0 };
      const amount = getInvoiceTotal(inv.items);
      curr.total += amount;
      if (inv.status === "paid") curr.paid += amount;
      clientInvoiced.set(inv.clientId, curr);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> New Client
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No clients yet. Add your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => {
            const hours = clientHours.get(client.id) || 0;
            const inv = clientInvoiced.get(client.id) || { total: 0, paid: 0 };
            const projCount = clientProjects.get(client.id)?.length || 0;

            return (
              <Card key={client.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {getInitials(client.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{client.name}</span>
                          {client.status === "inactive" && (
                            <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                          )}
                        </div>
                        {client.company && (
                          <span className="text-xs text-muted-foreground">{client.company}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {client.email && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(client.email)} title="Copy email">
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {client.phone && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(client.phone)} title="Copy phone">
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(client)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(client.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pl-12">
                    <span>{projCount} project{projCount !== 1 ? "s" : ""}</span>
                    <span>{formatDuration(hours)} tracked</span>
                    {inv.total > 0 && <span>${inv.total.toFixed(0)} invoiced</span>}
                    {inv.paid > 0 && <span className="text-emerald-600">${inv.paid.toFixed(0)} paid</span>}
                  </div>

                  {client.notes && (
                    <p className="text-xs text-muted-foreground pl-12">{client.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onClose={resetForm} title={editId ? "Edit Client" : "New Client"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" autoFocus />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, Country" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes about this client..."
              rows={2}
              className="flex w-full rounded-lg border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={resetForm}>Cancel</Button>
            <Button type="submit">{editId ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
