import { formatMoney, formatDate } from "../lib/utils";

const SERVICE_BRAND = "LOGR";
const SERVICE_DOMAIN = "logr.app";

export function openInvoicePrintWindow(invoice, profileName) {
  const currency = invoice.currency || "USD";

  const rows = (invoice.items || [])
    .map((item) => `
      <tr>
        <td>${item.date ? formatDate(item.date) : ""}</td>
        <td>${item.description || ""}${item.notes ? `<br><span style="color:#999;font-size:11px">${item.notes}</span>` : ""}</td>
        <td>${item.hours != null ? `${parseFloat(item.hours).toFixed(2)}h` : ""}</td>
        <td>${item.rate ? `${currency} ${item.rate}${item.billing_type === "hourly" ? "/hr" : " fixed"}` : ""}</td>
        <td><strong>${formatMoney(item.amount || 0, currency)}</strong></td>
      </tr>`)
    .join("");

  const issueDate = invoice.issue_date
    ? new Date(invoice.issue_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice — ${invoice.client_name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter Tight', Arial, sans-serif; padding: 60px; color: #111; }
    h1 { font-size: 48px; letter-spacing: -.02em; margin-bottom: 4px; font-weight: 400; }
    .brand-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .brand-mark { font-size: 12px; color: #999; letter-spacing: .22em; text-transform: uppercase; margin-bottom: 4px; }
    .brand-name { font-size: 22px; letter-spacing: .04em; font-weight: 600; }
    .brand-site { font-size: 11px; color: #999; }
    .sub { font-size: 11px; color: #999; letter-spacing: .2em; text-transform: uppercase; margin-bottom: 40px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 13px; }
    .lbl { font-size: 9px; color: #999; letter-spacing: .15em; text-transform: uppercase; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { font-size: 9px; color: #999; letter-spacing: .15em; text-transform: uppercase; text-align: left; padding: 8px 0; border-bottom: 2px solid #111; }
    td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; }
    .totals { text-align: right; }
    .totals table { width: auto; margin-left: auto; margin-bottom: 0; }
    .totals td { border: none; padding: 4px 0 4px 40px; }
    .total-row td { font-size: 20px; border-top: 2px solid #111; padding-top: 12px; }
    .notes-section { margin-top: 32px; font-size: 12px; color: #666; }
    ${invoice.from_name ? `.from-section { margin-bottom: 40px; font-size: 13px; }` : ""}
  </style>
</head>
<body>
  <div class="brand-row">
    <div>
      <div class="brand-mark">Service</div>
      <div class="brand-name">${SERVICE_BRAND}</div>
      <div class="brand-site">${SERVICE_DOMAIN}</div>
    </div>
  </div>

  <h1>INVOICE</h1>
  <div class="sub">${SERVICE_BRAND}${profileName ? ` — ${profileName}` : ""}</div>

  <div class="meta">
    <div>
      <div class="lbl">Bill To</div>
      <div style="font-size: 16px; font-weight: bold;">${invoice.client_name}</div>
    </div>
    <div style="text-align: right;">
      <div class="lbl">Invoice #</div>
      <div>${invoice.invoice_number}</div>
      <div class="lbl" style="margin-top: 8px;">Issue Date</div>
      <div>${issueDate}</div>
      ${invoice.due_date ? `<div class="lbl" style="margin-top: 8px;">Due Date</div><div>${new Date(invoice.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Hours</th>
        <th>Rate</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>Subtotal</td><td><strong>${formatMoney(invoice.subtotal || 0, currency)}</strong></td></tr>
      ${invoice.tax_rate > 0 ? `<tr><td>Tax (${invoice.tax_rate}%)</td><td><strong>${formatMoney(invoice.tax_amount || 0, currency)}</strong></td></tr>` : ""}
      <tr class="total-row"><td>Total Due</td><td><strong>${formatMoney(invoice.total || 0, currency)}</strong></td></tr>
    </table>
  </div>

  ${invoice.notes ? `<div class="notes-section"><div class="lbl" style="margin-bottom: 4px;">Notes</div>${invoice.notes}</div>` : ""}

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const popup = window.open("", "_blank");
  if (!popup) return;
  popup.document.write(html);
  popup.document.close();
}

export default function InvoicePreview({ invoice, theme }) {
  if (!invoice) return null;

  const currency = invoice.currency || "USD";
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue =
    invoice.due_date &&
    invoice.due_date < today &&
    invoice.status === "sent";

  const statusColors = {
    draft: theme.muted,
    sent: "#2563eb",
    paid: "#059669",
    overdue: "#dc2626",
    cancelled: "#6b7280",
  };

  return (
    <div
      style={{
        background: theme.statBg,
        border: `1px solid ${theme.border}`,
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", marginBottom: 4 }}>
          {SERVICE_BRAND}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 13, color: theme.text }}>{invoice.invoice_number}</span>
          <span
            style={{
              fontSize: 9,
              padding: "2px 6px",
              border: `1px solid ${statusColors[invoice.status] || theme.muted}`,
              color: statusColors[invoice.status] || theme.muted,
              letterSpacing: "0.1em",
            }}
          >
            {(isOverdue ? "OVERDUE" : invoice.status).toUpperCase()}
          </span>
        </div>
        <div style={{ fontSize: 12, color: theme.muted }}>{invoice.client_name}</div>
        {invoice.issue_date && (
          <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>
            {new Date(invoice.issue_date).toLocaleDateString("en-GB")}
            {invoice.due_date && ` → due ${new Date(invoice.due_date).toLocaleDateString("en-GB")}`}
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 16, color: theme.text }}>{formatMoney(invoice.total || 0, currency)}</div>
      </div>
    </div>
  );
}
