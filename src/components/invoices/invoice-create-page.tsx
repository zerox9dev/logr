import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import type { Invoice, InvoiceItem, Client, Project, TimeEntry, Settings } from "@/types";

interface InvoiceCreatePageProps {
  clients: Client[];
  projects: Project[];
  entries: TimeEntry[];
  invoices: Invoice[];
  settings: Settings;
  getClientById: (id: string | null) => Client | undefined;
  onAdd: (data: Omit<Invoice, "id" | "number" | "createdAt" | "paidAt"> & { taxRate?: number; discount?: number }) => void;
}

export function InvoiceCreatePage({ clients, projects, entries, invoices, settings, getClientById, onAdd }: InvoiceCreatePageProps) {
  const navigate = useNavigate();

  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState(settings.invoiceNotes || "");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), description: "", hours: 0, rate: settings.defaultRate || 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);

  const invoiceNumber = `${settings.invoicePrefix}-${String(invoices.length + 1).padStart(4, "0")}`;
  const selectedClient = clients.find((c) => c.id === clientId);

  const addItem = () => {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), description: "", hours: 0, rate: settings.defaultRate || 0 }]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const autoFill = () => {
    const pid = projectId || null;
    const unbilled = entries.filter((e) => e.billable && e.projectId === pid);
    if (unbilled.length === 0) return;

    const grouped = new Map<string, { hours: number }>();
    unbilled.forEach((e) => {
      const key = e.description;
      const curr = grouped.get(key) || { hours: 0 };
      curr.hours += e.duration / 3600;
      grouped.set(key, curr);
    });

    const proj = projects.find((p) => p.id === projectId);
    const rate = proj?.hourlyRate || settings.defaultRate || 50;

    const newItems: InvoiceItem[] = Array.from(grouped.entries()).map(([desc, data]) => ({
      id: crypto.randomUUID(),
      description: desc,
      hours: Math.round(data.hours * 100) / 100,
      rate,
    }));

    if (newItems.length > 0) setItems(newItems);
  };

  const handleSubmit = () => {
    const validItems = items.filter((i) => i.description && i.hours > 0 && i.rate > 0);
    if (validItems.length === 0) return;

    onAdd({
      clientId: clientId || null,
      projectId: projectId || null,
      status: "draft",
      items: validItems,
      notes,
      taxRate,
      discount,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + settings.paymentTermsDays * 86400000),
    });
    navigate("/app/invoices");
  };

  const subtotal = items.reduce((s, i) => s + i.hours * i.rate, 0);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * (taxRate / 100);
  const total = afterDiscount + tax;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/app/invoices">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">New Invoice</h1>
            <p className="text-sm text-muted-foreground">{invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/app/invoices"><Button variant="outline">Cancel</Button></Link>
          <Button onClick={handleSubmit}>Create Draft</Button>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          {/* Client & Date */}
          <div className="space-y-4 rounded-xl border border-border p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
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
                  className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <Button type="button" variant="outline" size="sm" onClick={autoFill}>
                  Auto-fill from entries
                </Button>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Line Items</label>
              <Button variant="ghost" size="sm" onClick={addItem}>
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_70px_70px_70px_32px] gap-2 text-[10px] uppercase text-muted-foreground font-medium tracking-wider px-1">
                <span>Description</span>
                <span className="text-right">Hours</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Amount</span>
                <span></span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_70px_70px_70px_32px] gap-2 items-center">
                  <Input placeholder="Description" value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)} />
                  <Input type="number" placeholder="0" value={item.hours || ""}
                    onChange={(e) => updateItem(item.id, "hours", Number(e.target.value))} className="text-right" />
                  <Input type="number" placeholder="0" value={item.rate || ""}
                    onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))} className="text-right" />
                  <span className="text-sm font-medium text-right">${(item.hours * item.rate).toFixed(0)}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 pt-3 border-t text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Discount</span>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">$</span>
                  <Input type="number" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value))} className="w-20 h-7 text-xs text-right" placeholder="0" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tax</span>
                <div className="flex items-center gap-1">
                  <Input type="number" value={taxRate || ""} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-16 h-7 text-xs text-right" placeholder="0" />
                  <span className="text-muted-foreground">%</span>
                  <span className="min-w-[60px] text-right">${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 rounded-xl border border-border p-4">
            <label className="text-sm font-medium">Notes</label>
            <textarea placeholder="Payment terms, thank you note..." value={notes}
              onChange={(e) => setNotes(e.target.value)} rows={3}
              className="flex w-full rounded-lg border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
        </div>

        {/* Preview */}
        <div className="hidden lg:block sticky top-6">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Preview</p>
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
    </div>
  );
}
