import type { UserSettings, Client } from "@/types/database";
import s from "./invoices-page.module.css";

interface InvoicePreviewProps {
  number: string;
  client: Client | undefined;
  settings: UserSettings | null;
  items: { description: string; hours: number; rate: number }[];
  taxRate: number;
  discount: number;
  dueDate: string;
  notes: string;
}

export function InvoicePreview({ number, client, settings, items, taxRate, discount, dueDate, notes }: InvoicePreviewProps) {
  const validItems = items.filter((i) => i.description && i.hours > 0 && i.rate > 0);
  const subtotal = validItems.reduce((sum, i) => sum + i.hours * i.rate, 0);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * (taxRate / 100);
  const total = afterDiscount + tax;
  const sym = { USD: "$", EUR: "€", GBP: "£", UAH: "₴", PLN: "zł" }[settings?.default_currency || "USD"] || "$";

  return (
    <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.5rem", fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "1.5rem", minWidth: 400 }}>
      <div className={s.docHeader}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{settings?.company || settings?.full_name || "Your Company"}</h2>
          {settings?.email && <p className={s.docSmall}>{settings.email}</p>}
          {settings?.address && <p className={[s.docSmall, s.docSmallPre].join(" ")}>{settings.address}</p>}
        </div>
        <div className={s.docRight}>
          <p style={{ fontSize: "1.125rem", fontWeight: 700 }}>INVOICE</p>
          <p className={s.docSmall}>{number}</p>
          <p className={s.docSmall} style={{ marginTop: "0.25rem" }}>Date: {new Date().toLocaleDateString()}</p>
          {dueDate && <p className={s.docSmall}>Due: {new Date(dueDate).toLocaleDateString()}</p>}
        </div>
      </div>

      <div>
        <p className={s.docSectionLabel}>Bill To</p>
        {client ? (
          <div style={{ marginTop: "0.25rem" }}>
            <p style={{ fontWeight: 500 }}>{client.name}</p>
            {client.company && <p className={s.docSmall}>{client.company}</p>}
            {client.email && <p className={s.docSmall}>{client.email}</p>}
            {client.address && <p className={s.docSmall}>{client.address}</p>}
          </div>
        ) : <p className={s.docSmall} style={{ marginTop: "0.25rem" }}>No client selected</p>}
      </div>

      <table className={s.docTable}>
        <thead>
          <tr>
            <th className={s.docTh}>Description</th>
            <th className={[s.docTh, s.docThRight].join(" ")} style={{ width: 64 }}>Qty</th>
            <th className={[s.docTh, s.docThRight].join(" ")} style={{ width: 64 }}>Rate</th>
            <th className={[s.docTh, s.docThRight].join(" ")} style={{ width: 80 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {validItems.length === 0 ? (
            <tr><td colSpan={4} className={s.docEmpty}>Add items to see preview</td></tr>
          ) : validItems.map((item, i) => (
            <tr key={i}>
              <td className={s.docTd}>{item.description}</td>
              <td className={[s.docTd, s.docTdRight].join(" ")}>{item.hours}</td>
              <td className={[s.docTd, s.docTdRight].join(" ")}>{sym}{item.rate}</td>
              <td className={[s.docTd, s.docTdRight, s.docTdBold].join(" ")}>{sym}{(item.hours * item.rate).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {validItems.length > 0 && (
        <div className={s.docTotals}>
          <div style={{ width: "12rem", display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.75rem" }}>
            <div className={s.docTotalRow}><span className={s.docTotalLabel}>Subtotal</span><span>{sym}{subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className={s.docTotalRow}><span className={s.docTotalLabel}>Discount</span><span>-{sym}{discount.toFixed(2)}</span></div>}
            {taxRate > 0 && <div className={s.docTotalRow}><span className={s.docTotalLabel}>Tax ({taxRate}%)</span><span>{sym}{tax.toFixed(2)}</span></div>}
            <div className={s.docTotalFinal}><span>Total</span><span>{sym}{total.toFixed(2)}</span></div>
          </div>
        </div>
      )}

      {notes && (
        <div>
          <p className={s.docSectionLabel}>Notes</p>
          <p className={[s.docSmall, s.docSmallPre].join(" ")} style={{ marginTop: "0.25rem" }}>{notes}</p>
        </div>
      )}
    </div>
  );
}
