import { useState } from "react";
import { Plus, Trash2, FileText, Send, CheckCircle, AlertCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import type { Invoice, InvoiceItem, InvoiceStatus, Client, Project, TimeEntry, Settings } from "@/types";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "outline" },
  paid: { label: "Paid", variant: "default" },
  overdue: { label: "Overdue", variant: "destructive" },
};

function getInvoiceSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.hours * item.rate, 0);
}

function getInvoiceTotal(invoice: { items: InvoiceItem[]; taxRate?: number; discount?: number }): number {
  const subtotal = getInvoiceSubtotal(invoice.items);
  const afterDiscount = subtotal - (invoice.discount || 0);
  const tax = afterDiscount * ((invoice.taxRate || 0) / 100);
  return afterDiscount + tax;
}

type FilterStatus = "all" | InvoiceStatus;

interface InvoicesPageProps {
  invoices: Invoice[];
  clients: Client[];
  projects: Project[];
  entries: TimeEntry[];
  onAdd: (data: Omit<Invoice, "id" | "number" | "createdAt" | "paidAt"> & { taxRate?: number; discount?: number }) => void;
  onUpdate: (id: string, data: Partial<Invoice>) => void;
  onDelete: (id: string) => void;
  getClientById: (id: string | null) => Client | undefined;
  settings: Settings;
}

function InvoiceForm({
  initial,
  clients,
  projects,
  entries,
  settings,
  invoiceNumber,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: { clientId: string; projectId: string; notes: string; dueDate: string; items: InvoiceItem[]; taxRate: number; discount: number };
  clients: Client[];
  projects: Project[];
  entries: TimeEntry[];
  settings: Settings;
  invoiceNumber: string;
  onSubmit: (data: { clientId: string; projectId: string; notes: string; dueDate: string; items: InvoiceItem[]; taxRate: number; discount: number }) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [clientId, setClientId] = useState(initial?.clientId || "");
  const [projectId, setProjectId] = useState(initial?.projectId || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [dueDate, setDueDate] = useState(initial?.dueDate || "");
  const [items, setItems] = useState<InvoiceItem[]>(
    initial?.items || [{ id: crypto.randomUUID(), description: "", hours: 0, rate: 0 }]
  );
  const [taxRate, setTaxRate] = useState(initial?.taxRate || 0);
  const [discount, setDiscount] = useState(initial?.discount || 0);

  const addItem = () => {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), description: "", hours: 0, rate: 0 }]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Auto-fill from unbilled time entries for selected project
  const autoFill = () => {
    const pid = projectId || null;
    const unbilled = entries.filter((e) => e.billable && e.projectId === pid);
    if (unbilled.length === 0) return;

    // Group by description
    const grouped = new Map<string, { hours: number }>();
    unbilled.forEach((e) => {
      const key = e.description;
      const curr = grouped.get(key) || { hours: 0 };
      curr.hours += e.duration / 3600;
      grouped.set(key, curr);
    });

    const proj = projects.find((p) => p.id === projectId);
    const rate = proj?.hourlyRate || 50;

    const newItems: InvoiceItem[] = Array.from(grouped.entries()).map(([desc, data]) => ({
      id: crypto.randomUUID(),
      description: desc,
      hours: Math.round(data.hours * 100) / 100,
      rate,
    }));

    setItems(newItems.length > 0 ? newItems : items);
  };

  const subtotal = getInvoiceSubtotal(items);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * (taxRate / 100);
  const total = afterDiscount + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.description && i.hours > 0 && i.rate > 0);
    if (validItems.length === 0) return;
    onSubmit({ clientId, projectId, notes, dueDate, items: validItems, taxRate, discount });
  };

  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <div className="flex gap-6 max-h-[80vh]">
      <form onSubmit={handleSubmit} className="space-y-4 overflow-auto flex-1 min-w-0">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Client</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="">Select client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date</label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Project</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="">Select project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <Button type="button" variant="outline" size="sm" onClick={autoFill} className="mb-0.5">
            Auto-fill from entries
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Items</label>
          <Button type="button" variant="ghost" size="sm" onClick={addItem}>
            <Plus className="h-3 w-3" /> Add item
          </Button>
        </div>
        {items.map((item) => (
          <div key={item.id} className="flex gap-2 items-start">
            <Input placeholder="Description" value={item.description}
              onChange={(e) => updateItem(item.id, "description", e.target.value)} className="flex-1" />
            <Input type="number" placeholder="Hrs" value={item.hours || ""}
              onChange={(e) => updateItem(item.id, "hours", Number(e.target.value))} className="w-20" />
            <Input type="number" placeholder="Rate" value={item.rate || ""}
              onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))} className="w-20" />
            <span className="text-sm font-medium min-w-[60px] text-right pt-2">
              ${(item.hours * item.rate).toFixed(0)}
            </span>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {/* Totals */}
        <div className="space-y-1 pt-2 border-t text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-muted-foreground">Discount</span>
            <div className="flex items-center gap-1">
              <span>$</span>
              <Input type="number" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-20 h-7 text-xs" placeholder="0" />
            </div>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-muted-foreground">Tax</span>
            <div className="flex items-center gap-1">
              <Input type="number" value={taxRate || ""} onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-16 h-7 text-xs" placeholder="0" />
              <span>%</span>
              <span className="min-w-[60px] text-right">${tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold pt-1 border-t">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea placeholder="Payment terms, thank you note..." value={notes}
          onChange={(e) => setNotes(e.target.value)} rows={2}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>

      {/* Live preview */}
      <div className="hidden lg:block overflow-auto flex-1 min-w-0">
        <InvoicePreview
          number={invoiceNumber}
          client={selectedClient}
          settings={settings}
          items={items}
          taxRate={taxRate}
          discount={discount}
          dueDate={dueDate}
          notes={notes}
        />
      </div>
    </div>
  );
}

export function InvoicesPage({ invoices, clients, projects, entries, onAdd, onUpdate, onDelete, getClientById, settings }: InvoicesPageProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");

  // Auto-detect overdue
  const now = new Date();
  const processedInvoices = invoices.map((inv) => {
    if (inv.status === "sent" && inv.dueDate < now) {
      return { ...inv, status: "overdue" as InvoiceStatus };
    }
    return inv;
  });

  const filtered = filter === "all" ? processedInvoices : processedInvoices.filter((i) => i.status === filter);
  const counts = { all: processedInvoices.length, draft: 0, sent: 0, paid: 0, overdue: 0 };
  processedInvoices.forEach((i) => counts[i.status]++);

  const totalDraft = processedInvoices.filter((i) => i.status === "draft").reduce((s, i) => s + getInvoiceTotal(i), 0);
  const totalPaid = processedInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + getInvoiceTotal(i), 0);
  const totalOutstanding = processedInvoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + getInvoiceTotal(i), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Draft</p>
          <p className="text-xl font-bold mt-1">${totalDraft.toFixed(2)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className="text-xl font-bold mt-1">${totalOutstanding.toFixed(2)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="text-xl font-bold mt-1 text-emerald-600">${totalPaid.toFixed(2)}</p>
        </CardContent></Card>
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {(["all", "draft", "sent", "paid", "overdue"] as FilterStatus[]).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "ghost"} size="sm"
            onClick={() => setFilter(f)}>
            {f === "all" ? "All" : STATUS_CONFIG[f].label} ({counts[f]})
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {processedInvoices.length === 0 ? "No invoices yet. Create your first one." : "No invoices match this filter."}
          </p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((invoice) => {
            const client = getClientById(invoice.clientId);
            const total = getInvoiceTotal(invoice);
            const config = STATUS_CONFIG[invoice.status];
            return (
              <Card key={invoice.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium font-mono">{invoice.number}</span>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {client ? client.name : "No client"} · Due {invoice.dueDate.toLocaleDateString()}
                      {invoice.paidAt && ` · Paid ${invoice.paidAt.toLocaleDateString()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">${total.toFixed(2)}</span>
                    <div className="flex gap-1">
                      {invoice.status === "draft" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => setEditingInvoice(invoice)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onUpdate(invoice.id, { status: "sent" })}>
                            <Send className="h-3 w-3" /> Send
                          </Button>
                        </>
                      )}
                      {(invoice.status === "sent" || invoice.status === "overdue") && (
                        <Button variant="outline" size="sm" onClick={() => onUpdate(invoice.id, { status: "paid", paidAt: new Date() })}>
                          <CheckCircle className="h-3 w-3" /> Paid
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => onDelete(invoice.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="New Invoice" wide>
        <InvoiceForm
          clients={clients} projects={projects} entries={entries}
          settings={settings} invoiceNumber={`${settings.invoicePrefix}-${String(invoices.length + 1).padStart(4, "0")}`}
          onCancel={() => setShowCreate(false)} submitLabel="Create Draft"
          onSubmit={(data) => {
            onAdd({
              clientId: data.clientId || null, projectId: data.projectId || null,
              status: "draft", items: data.items, notes: data.notes,
              taxRate: data.taxRate, discount: data.discount,
              dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 86400000),
            });
            setShowCreate(false);
          }}
        />
      </Dialog>

      <Dialog open={!!editingInvoice} onClose={() => setEditingInvoice(null)}
        title={`Edit ${editingInvoice?.number || ""}`} wide>
        {editingInvoice && (
          <InvoiceForm
            settings={settings} invoiceNumber={editingInvoice.number}
            initial={{
              clientId: editingInvoice.clientId || "",
              projectId: editingInvoice.projectId || "",
              notes: editingInvoice.notes,
              dueDate: editingInvoice.dueDate.toISOString().slice(0, 10),
              items: editingInvoice.items,
              taxRate: editingInvoice.taxRate,
              discount: editingInvoice.discount,
            }}
            clients={clients} projects={projects} entries={entries}
            onCancel={() => setEditingInvoice(null)} submitLabel="Save Changes"
            onSubmit={(data) => {
              onUpdate(editingInvoice.id, {
                clientId: data.clientId || null, projectId: data.projectId || null,
                items: data.items, notes: data.notes,
                taxRate: data.taxRate, discount: data.discount,
                dueDate: data.dueDate ? new Date(data.dueDate) : editingInvoice.dueDate,
              });
              setEditingInvoice(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
