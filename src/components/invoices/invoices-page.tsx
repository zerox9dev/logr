import { useState } from "react";
import { Plus, Trash2, Send, CheckCircle, AlertCircle, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/data-context";
import type { InvoiceStatus } from "@/types/database";
import { t } from "@/lib/i18n";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "outline" },
  paid: { label: "Paid", variant: "default" },
  overdue: { label: "Overdue", variant: "destructive" },
};

export function InvoicesPage() {
  const { invoices, updateInvoice, deleteInvoice, getClientById } = useAppData();
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");

  const filtered = filter === "all" ? invoices : invoices.filter((i) => i.status === filter);
  const unpaidTotal = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + Number(i.total), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("invoices.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {invoices.length} {t("invoices.title").toLowerCase()}
            {unpaidTotal > 0 && <> · ${unpaidTotal.toFixed(0)} {t("invoices.unpaid")}</>}
          </p>
        </div>
        <Link to="/app/invoices/new">
          <Button><Plus className="h-4 w-4" /> {t("invoices.new")}</Button>
        </Link>
      </div>

      <div className="flex gap-1">
        {(["all", "draft", "sent", "paid", "overdue"] as const).map((s) => (
          <Button key={s} variant={filter === s ? "default" : "ghost"} size="sm"
            onClick={() => setFilter(s)} className="capitalize">{s}</Button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((invoice) => {
          const client = getClientById(invoice.client_id);
          const config = STATUS_CONFIG[invoice.status];
          return (
            <Link key={invoice.id} to={`/app/invoices/${invoice.id}`}>
              <Card className="group hover:bg-accent/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {client?.name || "No client"} · {invoice.currency} {Number(invoice.total).toFixed(2)}
                      {invoice.due_date && ` · Due ${new Date(invoice.due_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
                    {invoice.status === "draft" && (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); updateInvoice(invoice.id, { status: "sent", sent_at: new Date().toISOString() }); }}>
                        <Send className="h-3 w-3" /> {t("invoices.send")}
                      </Button>
                    )}
                    {(invoice.status === "sent" || invoice.status === "overdue") && (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); updateInvoice(invoice.id, { status: "paid", paid_at: new Date().toISOString() }); }}>
                        <CheckCircle className="h-3 w-3" /> {t("invoices.markPaid")}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); deleteInvoice(invoice.id); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t("invoices.noInvoices")}</p>}
      </div>
    </div>
  );
}
