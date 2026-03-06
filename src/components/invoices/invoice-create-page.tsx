import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import { useAppData } from "@/lib/data-context";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export function InvoiceCreatePage() {
  const { clients, projects, sessions, invoices, settings, addInvoice, getClientById } = useAppData();
  const navigate = useNavigate();

  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 0, rate: Number(settings?.default_rate) || 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);

  const invoiceNumber = `INV-${String(invoices.length + 1).padStart(4, "0")}`;
  const selectedClient = clients.find((c) => c.id === clientId);
  const currency = settings?.default_currency || "USD";

  const addItem = () => setItems((prev) => [...prev, { id: crypto.randomUUID(), description: "", quantity: 0, rate: Number(settings?.default_rate) || 0 }]);
  const removeItem = (id: string) => { if (items.length > 1) setItems((prev) => prev.filter((i) => i.id !== id)); };
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async () => {
    const validItems = items.filter((i) => i.description && i.quantity > 0 && i.rate > 0);
    if (!clientId || validItems.length === 0) return;

    await addInvoice(
      {
        client_id: clientId,
        invoice_number: invoiceNumber,
        subtotal, tax_rate: taxRate, tax_amount: taxAmount, total,
        currency, status: "draft",
        due_date: dueDate || null, sent_at: null, paid_at: null,
        notes: notes || null,
      },
      validItems.map((i) => ({ description: i.description, quantity: i.quantity, rate: i.rate, amount: i.quantity * i.rate, session_id: null }))
    );
    navigate("/app/invoices");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/app/invoices"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-4 rounded-xl border border-border p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm">
                  <option value="">Select client</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Line Items</label>
              <Button variant="ghost" size="sm" onClick={addItem}><Plus className="h-3 w-3" /> Add</Button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_70px_70px_70px_32px] gap-2 text-[10px] uppercase text-muted-foreground font-medium tracking-wider px-1">
                <span>Description</span><span className="text-right">Qty</span><span className="text-right">Rate</span><span className="text-right">Amount</span><span></span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_70px_70px_70px_32px] gap-2 items-center">
                  <Input placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} />
                  <Input type="number" placeholder="0" value={item.quantity || ""} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} className="text-right" />
                  <Input type="number" placeholder="0" value={item.rate || ""} onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))} className="text-right" />
                  <span className="text-sm font-medium text-right">${(item.quantity * item.rate).toFixed(0)}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 pt-3 border-t text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tax</span>
                <div className="flex items-center gap-1">
                  <Input type="number" value={taxRate || ""} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-16 h-7 text-xs text-right" placeholder="0" />
                  <span>%</span><span className="min-w-[60px] text-right">${taxAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border p-4">
            <label className="text-sm font-medium">Notes</label>
            <textarea placeholder="Payment terms..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="flex w-full rounded-lg border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground" />
          </div>
        </div>

        <div className="hidden lg:block sticky top-6">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Preview</p>
          <InvoicePreview number={invoiceNumber} client={selectedClient} settings={settings}
            items={items.map((i) => ({ ...i, hours: i.quantity }))} taxRate={taxRate} discount={0} dueDate={dueDate} notes={notes} />
        </div>
      </div>
    </div>
  );
}
