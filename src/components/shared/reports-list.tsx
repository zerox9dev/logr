"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import { createReportSummary, encodeSharedReport, type ReportsRange } from "@/domain/report-share";
import { copyToClipboard } from "@/lib/clipboard";

const RANGES: ReportsRange[] = ["week", "month", "all"];
const RANGE_LABEL_KEYS: Record<ReportsRange, string> = {
  week: "tabs.week",
  month: "tabs.month",
  all: "common.all",
};

/** Reports page body: pick a range, copy a public /share/report link per
 *  client. Same payload builder the Billable Hours widget uses. */
export function ReportsList() {
  const { clients, sessions, settings, loading, getProjectById } = useAppData();
  const { toast } = useToast();
  const t = useT();
  const [range, setRange] = useState<ReportsRange>("week");
  const [busy, setBusy] = useState<string | null>(null);

  const share = async (clientId: string, clientName: string) => {
    setBusy(clientId);
    try {
      const payload = createReportSummary({
        sessions,
        clients,
        range,
        defaultCurrency: settings?.default_currency ?? null,
        defaultRate: settings?.default_rate ?? null,
        clientId,
        clientName,
        getProjectById,
        noProjectLabel: t("sessions.noProject"),
        noClientLabel: t("metric.noClient"),
      });
      const url = `${window.location.origin}/share/report?data=${encodeSharedReport(payload)}`;
      await copyToClipboard(url);
      toast(t("reports.shareLinkCopied"), "success");
    } catch (e) {
      console.error("[reports] share failed:", e);
      toast(t("reports.copyLinkFailed"), "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-w-0 flex-1 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-widget font-semibold text-heading">{t("sidebar.reports")}</h1>
          <Tabs.Root value={range} onValueChange={(v) => setRange(v as ReportsRange)}>
            <Tabs.List className="flex items-center border border-line-2 bg-faint p-0.5">
              {RANGES.map((r) => (
                <Tabs.Trigger
                  key={r}
                  value={r}
                  className="flex h-8 items-center justify-center px-4 text-md-minus font-medium text-tertiary data-[state=active]:bg-ink data-[state=active]:text-card"
                >
                  {t(RANGE_LABEL_KEYS[r])}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
        </div>
        <p className="mb-4 text-md-minus text-muted-foreground">{t("reports.shareHintClient")}</p>

        {loading ? (
          <p className="py-8 text-center text-base text-muted-foreground">{t("common.loading")}</p>
        ) : clients.length === 0 ? (
          <p className="py-8 text-center text-base text-muted-foreground">{t("clients.noClients")}</p>
        ) : (
          <div className="flex flex-col gap-px">
            {clients.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 border-b border-line py-2.5 last:border-0">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-md font-semibold text-heading">{c.name}</span>
                  <span className="truncate text-md-minus text-muted-foreground">
                    {[c.company, c.email].filter(Boolean).join(" · ") || "—"}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === c.id}
                  aria-label={t("billable.shareReport").replace("{name}", c.name)}
                  onClick={() => share(c.id, c.name)}
                >
                  {t("reports.copyLink")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
