import { useState } from "react";
import { Plus, Trash2, FileText, Send, CheckCircle, AlertCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Invoice, InvoiceItem, InvoiceStatus, Client, Project, TimeEntry } from "@/types";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof FileText }> = {
  draft: { label: "Draft", variant: "secondary", icon: FileText },
  sent: { label: "Sent", variant: "outline", icon: Send },
  paid: { label: "Paid", variant: "default", icon: CheckCircle },
  overdue: { label: "Overdue", variant: "destructive", icon: AlertCircle },
};

function getInvoiceTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.hours * item.rate, 0);
}

interface InvoicesPageProps {
  invoices: Invoice[];
  clients: Client[];
  projects: Project[];
  entries: TimeEntry[];
  onAdd: (data: Omit<Invoice, "id" | "number" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Invoice>) => void;
  onDelete: (id: string) => void;
  getClientById: (id: string | null) => Client | undefined;
}

function InvoiceForm({
  initial,
  clients,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: { clientId: string; notes: string; dueDate: string; items: InvoiceItem[] };
  clients: Client[];
  onSubmit: (data: { clientId: string; notes: string; dueDate: string; items: InvoiceItem[] }) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [clientId, setClientId] = useState(initial?.clientId || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [dueDate, setDueDate] = useState(initial?.dueDate || "");
  const [items, setItems] = useState<InvoiceItem[]>(
    initial?.items || [{ id: crypto.randomUUID(), description: "", hours: 0, rate: 0 }]
  );

  const addItem = () => {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), description: "", hours: 0, rate: 0 }]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.description && i.hours > 0 && i.rate > 0);
    if (validItems.length === 0) return;
    onSubmit({ clientId, notes, dueDate, items: validItems });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-auto">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date</label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
            <Input
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateItem(item.id, "description", e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Hours"
              value={item.hours || ""}
              onChange={(e) => updateItem(item.id, "hours", Number(e.target.value))}
              className="w-20"
            />
            <Input
              type="number"
              placeholder="Rate"
              value={item.rate || ""}
              onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm font-medium min-w-[60px] text-right pt-2">
              ${(item.hours * item.rate).toFixed(0)}
            </span>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <div className="text-right text-sm font-bold pt-2 border-t">
          Total: ${items.reduce((s, i) => s + i.hours * i.rate, 0).toFixed(2)}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          placeholder="Payment terms, thank you note..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

export function InvoicesPage({ invoices, clients, projects, entries, onAdd, onUpdate, onDelete, getClientById }: InvoicesPageProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const totalDraft = invoices.filter((i) => i.status === "draft").reduce((s, i) => s + getInvoiceTotal(i.items), 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + getInvoiceTotal(i.items), 0);
  const totalOutstanding = invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + getInvoiceTotal(i.items), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-xl font-bold mt-1">${totalDraft.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-xl font-bold mt-1">${totalOutstanding.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-xl font-bold mt-1 text-emerald-600">${totalPaid.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No invoices yet. Create your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {invoices.map((invoice) => {
            const client = getClientById(invoice.clientId);
            const total = getInvoiceTotal(invoice.items);
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
                      {invoice.status === "sent" && (
                        <Button variant="outline" size="sm" onClick={() => onUpdate(invoice.id, { status: "paid" })}>
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

      {/* Create dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="New Invoice">
        <InvoiceForm
          clients={clients}
          onCancel={() => setShowCreate(false)}
          submitLabel="Create Draft"
          onSubmit={(data) => {
            onAdd({
              clientId: data.clientId || null,
              projectId: null,
              status: "draft",
              items: data.items,
              notes: data.notes,
              dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 86400000),
            });
            setShowCreate(false);
          }}
        />
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editingInvoice}
        onClose={() => setEditingInvoice(null)}
        title={`Edit ${editingInvoice?.number || ""}`}
      >
        {editingInvoice && (
          <InvoiceForm
            initial={{
              clientId: editingInvoice.clientId || "",
              notes: editingInvoice.notes,
              dueDate: editingInvoice.dueDate.toISOString().slice(0, 10),
              items: editingInvoice.items,
            }}
            clients={clients}
            onCancel={() => setEditingInvoice(null)}
            submitLabel="Save Changes"
            onSubmit={(data) => {
              onUpdate(editingInvoice.id, {
                clientId: data.clientId || null,
                items: data.items,
                notes: data.notes,
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
