import type { InvoiceItem, Settings, Client } from "@/types";

interface InvoicePreviewProps {
  number: string;
  client: Client | undefined;
  settings: Settings;
  items: InvoiceItem[];
  taxRate: number;
  discount: number;
  dueDate: string;
  notes: string;
}

export function InvoicePreview({ number, client, settings, items, taxRate, discount, dueDate, notes }: InvoicePreviewProps) {
  const validItems = items.filter((i) => i.description && i.hours > 0 && i.rate > 0);
  const subtotal = validItems.reduce((s, i) => s + i.hours * i.rate, 0);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * (taxRate / 100);
  const total = afterDiscount + tax;

  const currencySymbol = { USD: "$", EUR: "€", GBP: "£", UAH: "₴", PLN: "zł" }[settings.currency] || "$";

  return (
    <div className="bg-white border border-border rounded-lg p-6 text-sm space-y-6 min-w-[400px]">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{settings.company || settings.name || "Your Company"}</h2>
          {settings.email && <p className="text-xs text-muted-foreground">{settings.email}</p>}
          {settings.address && <p className="text-xs text-muted-foreground whitespace-pre-line">{settings.address}</p>}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">INVOICE</p>
          <p className="text-xs text-muted-foreground">{number || "INV-0001"}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Date: {new Date().toLocaleDateString()}
          </p>
          {dueDate && (
            <p className="text-xs text-muted-foreground">
              Due: {new Date(dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Bill to */}
      <div>
        <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">Bill To</p>
        {client ? (
          <div className="mt-1">
            <p className="font-medium">{client.name}</p>
            {client.company && <p className="text-xs text-muted-foreground">{client.company}</p>}
            {client.email && <p className="text-xs text-muted-foreground">{client.email}</p>}
            {client.address && <p className="text-xs text-muted-foreground">{client.address}</p>}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">No client selected</p>
        )}
      </div>

      {/* Items table */}
      <div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase text-muted-foreground tracking-wider">
              <th className="text-left py-2 font-medium">Description</th>
              <th className="text-right py-2 font-medium w-16">Hours</th>
              <th className="text-right py-2 font-medium w-16">Rate</th>
              <th className="text-right py-2 font-medium w-20">Amount</th>
            </tr>
          </thead>
          <tbody>
            {validItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-xs text-muted-foreground">Add items to see preview</td>
              </tr>
            ) : (
              validItems.map((item) => (
                <tr key={item.id} className="border-b border-border/50">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{item.hours}</td>
                  <td className="py-2 text-right">{currencySymbol}{item.rate}</td>
                  <td className="py-2 text-right font-medium">{currencySymbol}{(item.hours * item.rate).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      {validItems.length > 0 && (
        <div className="flex justify-end">
          <div className="w-48 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-{currencySymbol}{discount.toFixed(2)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                <span>{currencySymbol}{tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-border">
              <span>Total</span>
              <span>{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div>
          <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">Notes</p>
          <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{notes}</p>
        </div>
      )}
    </div>
  );
}
