"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { decodeSharedInvoice } from "@/domain/invoice-share";
import { fmtMoney } from "@/lib/format";
import { useT } from "@/i18n";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

function InvoiceView() {
  const searchParams = useSearchParams();
  const inv = useMemo(() => decodeSharedInvoice(searchParams.get("data") || ""), [searchParams]);
  const t = useT();

  if (!inv) {
    return (
      <div className="min-h-screen bg-page px-5 pb-16 pt-8">
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6">
          <Card>
            <CardContent className="flex min-h-[60vh] flex-col items-center justify-center gap-3.5 p-8 text-center">
              <FileText className="h-[42px] w-[42px] text-tertiary" />
              <h1 className="text-5xl font-extrabold tracking-tight text-heading">{t("invoice.invalidLink")}</h1>
              <Link
                href="/"
                className="inline-flex h-9 items-center justify-center gap-2 bg-ink px-4 text-md font-medium text-white transition-opacity hover:opacity-85"
              >
                {t("reports.openLogr")}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusKey = `invoice.status${inv.status.charAt(0).toUpperCase()}${inv.status.slice(1)}`;

  return (
    <div className="min-h-screen bg-page px-5 pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col gap-7 p-8">
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-5xl font-extrabold leading-none tracking-tight text-heading">{t("invoice.invoiceLabel")}</h1>
                  <span className="border border-line px-2 py-0.5 text-sm font-medium uppercase tracking-wide text-muted-foreground">{t(statusKey)}</span>
                </div>
                <p className="mt-2 text-base text-muted-foreground tnum">{inv.invoiceNumber}</p>
              </div>
              <Link
                href="/"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 border border-line bg-card px-4 text-md font-medium text-ink transition-colors hover:bg-wash"
              >
                {t("reports.openLogr")}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-4 border-y border-line py-4 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("invoice.billedTo")}</span>
                <span className="text-md font-medium text-heading">{inv.clientName || "—"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("invoice.issued")}</span>
                <span className="text-md text-ink tnum">{formatDate(inv.issuedAt)}</span>
              </div>
              {inv.dueDate && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("invoice.dueDate")}</span>
                  <span className="text-md text-ink tnum">{formatDate(inv.dueDate)}</span>
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 border-b border-line pb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <span className="min-w-0 flex-1">{t("invoice.description")}</span>
                <span className="w-[88px] shrink-0 text-right">{t("invoice.qty")}</span>
                <span className="w-[88px] shrink-0 text-right">{t("invoice.rate")}</span>
                <span className="w-[96px] shrink-0 text-right">{t("invoice.amount")}</span>
              </div>
              {inv.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-line py-2.5 text-md last:border-0">
                  <span className="min-w-0 flex-1 truncate text-heading">{it.description}</span>
                  <span className="w-[88px] shrink-0 text-right text-tertiary tnum">{it.quantity}</span>
                  <span className="w-[88px] shrink-0 text-right text-tertiary tnum">{fmtMoney(it.rate, inv.currency)}</span>
                  <span className="w-[96px] shrink-0 text-right font-medium text-ink tnum">{fmtMoney(it.amount, inv.currency)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex w-full max-w-[280px] flex-col gap-1.5">
                <div className="flex justify-between text-md text-tertiary"><span>{t("invoice.subtotal")}</span><span className="tnum">{fmtMoney(inv.subtotal, inv.currency)}</span></div>
                {inv.taxAmount > 0 && (
                  <div className="flex justify-between text-md text-tertiary">
                    <span>{t("invoice.taxAmount")}{inv.taxRate ? ` (${inv.taxRate}%)` : ""}</span>
                    <span className="tnum">{fmtMoney(inv.taxAmount, inv.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-1.5 text-xl font-semibold text-heading"><span>{t("invoice.total")}</span><span className="tnum">{fmtMoney(inv.total, inv.currency)}</span></div>
              </div>
            </div>

            {inv.notes && (
              <div className="flex flex-col gap-1 border-t border-line pt-4">
                <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("invoice.notes")}</span>
                <p className="whitespace-pre-wrap text-md text-ink">{inv.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InvoiceView />
    </Suspense>
  );
}
