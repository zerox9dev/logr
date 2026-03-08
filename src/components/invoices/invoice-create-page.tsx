import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import { useAppData } from "@/lib/data-context";
import { t } from "@/lib/i18n";
import sh from "@/components/shared.module.css";
import s from "./invoices-page.module.css";

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

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
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
    <div className={sh.page}>
      <div className={sh.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link to="/app/invoices"><Button variant="ghost" size="icon"><ArrowLeft style={{ width: 16, height: 16 }} /></Button></Link>
          <div>
            <h1 className={sh.title}>{t("invoices.new")}</h1>
            <p className={sh.subtitle}>{invoiceNumber}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link to="/app/invoices"><Button variant="outline">{t("common.cancel")}</Button></Link>
          <Button onClick={handleSubmit}>{t("common.create")}</Button>
        </div>
      </div>

      <div className={sh.grid2col}>
        <div className={sh.page}>
          <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className={sh.formRow2}>
              <div className={sh.formField}>
                <label className={sh.formLabel}>{t("projects.client")}</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={sh.formSelect}>
                  <option value="">{t("projects.selectClient")}</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className={sh.formField}>
                <label className={sh.formLabel}>{t("invoices.dueDate")}</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label className={sh.formLabel}>{t("invoices.lineItems")}</label>
              <Button variant="ghost" size="sm" onClick={addItem}><Plus style={{ width: 12, height: 12 }} /> Add</Button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 70px 32px", gap: "0.5rem", fontSize: 10, textTransform: "uppercase", color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.05em", padding: "0 0.25rem" }}>
                <span>{t("timer.description")}</span><span style={{ textAlign: "right" }}>{t("invoices.qty")}</span><span style={{ textAlign: "right" }}>{t("projects.rate")}</span><span style={{ textAlign: "right" }}>{t("invoices.amount")}</span><span></span>
              </div>
              {items.map((item) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 70px 32px", gap: "0.5rem", alignItems: "center" }}>
                  <Input placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} />
                  <Input type="number" placeholder="0" value={item.quantity || ""} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} style={{ textAlign: "right" }} />
                  <Input type="number" placeholder="0" value={item.rate || ""} onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))} style={{ textAlign: "right" }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, textAlign: "right" }}>${(item.quantity * item.rate).toFixed(0)}</span>
                  <Button variant="ghost" size="icon" style={{ width: 32, height: 32 }} onClick={() => removeItem(item.id)}><Trash2 style={{ width: 12, height: 12 }} /></Button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)", fontSize: "0.875rem" }}>
              <div className={s.docTotalRow}><span className={s.docTotalLabel}>{t("invoices.subtotal")}</span><span>${subtotal.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={s.docTotalLabel}>{t("invoices.tax")}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Input type="number" value={taxRate || ""} onChange={(e) => setTaxRate(Number(e.target.value))} style={{ width: 64, height: 28, fontSize: "0.75rem", textAlign: "right" }} placeholder="0" />
                  <span>%</span><span style={{ minWidth: 60, textAlign: "right" }}>${taxAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className={s.docTotalFinal}><span>{t("invoices.total")}</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>

          <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label className={sh.formLabel}>{t("invoices.notesLabel")}</label>
            <textarea placeholder="Payment terms..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={sh.formTextarea} />
          </div>
        </div>

        <div style={{ position: "sticky", top: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>{t("invoices.preview")}</p>
          <InvoicePreview number={invoiceNumber} client={selectedClient} settings={settings}
            items={items.map((i) => ({ ...i, hours: i.quantity }))} taxRate={taxRate} discount={0} dueDate={dueDate} notes={notes} />
        </div>
      </div>
    </div>
  );
}
