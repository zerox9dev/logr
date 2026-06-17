/** Billable hours — Figma 1:160. Accent = MONEY (bold green $ amounts).
 *  Left-column card: border #ececec, px-26 pt-22 pb-26, gap-16. */
import { useState } from "react";
import { Share2 } from "lucide-react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useAppData } from "@/contexts/data-context";
import { SessionsDialog } from "@/components/shared/sessions-dialog";
import { useT } from "@/i18n";
import { useToast } from "@/components/ui/toast";
import { createReportSummary, encodeSharedReport, type ReportsRange } from "@/domain/report-share";
import { copyToClipboard } from "@/lib/clipboard";
import type { Period } from "@/domain/dashboard-metrics";

function periodToRange(period: Period): ReportsRange {
  if (period === "Month") return "month";
  if (period === "All") return "all";
  return "week"; // Day and Week both map to "week"
}

function ClientRow({
  id, name, rate, time, amount, dot, internal, onShare, shareLabel,
}: {
  id?: string;
  name: string;
  rate?: string;
  time: string;
  amount: string;
  dot: string;
  internal?: boolean;
  onShare?: () => void;
  shareLabel?: string;
}) {
  return (
    <div className="group flex w-full items-center gap-2.5">
      <span className="size-2 shrink-0 rounded-full" style={{ background: dot }} />
      <span className="line-clamp-1 min-w-0 flex-1 text-base font-medium text-heading">{name}</span>
      {rate && (
        <span className="shrink-0 bg-brand-soft px-2 py-0.5 text-sm-minus font-semibold text-money tnum">{rate}</span>
      )}
      {!internal && id && onShare && shareLabel && (
        <button
          type="button"
          onClick={onShare}
          title={shareLabel}
          aria-label={shareLabel}
          className="shrink-0 border border-line p-0.5 text-muted-foreground opacity-40 transition-opacity hover:border-ink hover:text-ink hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
        >
          <Share2 className="size-3" />
        </button>
      )}
      <div className="h-[5px] min-w-px flex-1" />
      <span className="line-clamp-1 w-[72px] shrink-0 text-right text-base text-tertiary tnum">{time}</span>
      <span className={`line-clamp-1 w-[64px] shrink-0 text-right text-base font-semibold tnum ${internal ? "text-heading" : "text-money"}`}>
        {amount}
      </span>
    </div>
  );
}

const INVOICED_LABEL_KEYS: Record<string, string> = {
  Day: "billable.invoicedToday",
  Week: "billable.invoicedThisWeek",
  Month: "billable.invoicedThisMonth",
  All: "billable.invoicedAllTime",
};

export function BillableHours() {
  const { metrics, period } = useDashboard();
  const { sessions, clients, settings, getProjectById } = useAppData();
  const t = useT();
  const { toast } = useToast();
  const b = metrics.billable;
  const [manageOpen, setManageOpen] = useState(false);

  async function handleShareClient(clientId: string, clientName: string) {
    try {
      const range = periodToRange(period);
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
      console.error("[share] failed to build/copy report link:", e);
      toast(t("reports.copyLinkFailed"), "error");
    }
  }

  return (
    <div className="flex flex-col gap-4 border border-line bg-card px-[26px] pb-[26px] pt-[22px]">
      <div className="flex w-full items-center justify-between">
        <span className="text-widget font-semibold text-heading">{t("billable.title")}</span>
        <button onClick={() => setManageOpen(true)} aria-label={t("billable.manageSessions")} className="text-md-minus font-bold text-muted-foreground transition-colors">•••</button>
      </div>
      <SessionsDialog open={manageOpen} onClose={() => setManageOpen(false)} />

      {/* Billable / Non-billable totals */}
      <div className="flex w-full items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-[7px]">
            <span className="size-[9px] rounded-full bg-money" />
            <span className="text-md text-muted-foreground">{t("billable.billable")}</span>
          </div>
          <span className="text-4xl text-tertiary tnum">{b.billableTimeLabel}</span>
          <span className="text-md font-semibold text-money tnum">{b.billableEarnedLabel}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-[7px]">
            <span className="size-[9px] rounded-full bg-track" />
            <span className="text-md text-muted-foreground">{t("billable.nonBillable")}</span>
          </div>
          <span className="text-4xl text-tertiary tnum">{b.nonBillableTimeLabel}</span>
          <span className="text-md text-muted-foreground">{t("billable.internalWork")}</span>
        </div>
      </div>

      {/* Split bar — show neutral empty bar when there is no data at all */}
      <div className="flex w-full items-start gap-[3px]">
        {b.billablePct === 0 && b.nonBillablePct === 0 ? (
          <div className="h-2.5 w-full bg-track" />
        ) : (
          <>
            <div className="h-2.5 bg-brand" style={{ flexGrow: b.billablePct || 1 }} />
            <div className="h-2.5 bg-track" style={{ flexGrow: b.nonBillablePct || 1 }} />
          </>
        )}
      </div>
      <div className="flex w-full items-start justify-between text-sm text-muted-foreground">
        <span className="tnum">{b.pctLabel}</span>
        <span className="tnum">{b.nonBillablePctLabel}</span>
      </div>

      <div className="h-px w-full bg-line" />

      <span className="text-md text-muted-foreground">{t("billable.byClient")}</span>
      {b.clients.length === 0 && <span className="text-base text-muted-foreground">{t("billable.empty")}</span>}
      {b.clients.map((c) => (
        <ClientRow
          key={c.name}
          id={c.id}
          dot={c.dot}
          name={c.name}
          rate={c.rateLabel}
          time={c.timeLabel}
          amount={c.amountLabel}
          internal={c.internal}
          onShare={c.id ? () => handleShareClient(c.id!, c.name) : undefined}
          shareLabel={c.id ? t("billable.shareReport").replace("{name}", c.name) : undefined}
        />
      ))}

      {/* Invoiced footer */}
      <div className="flex w-full items-center justify-between bg-brand-faint px-4 py-3">
        <span className="text-md font-medium text-heading">{t(INVOICED_LABEL_KEYS[period] ?? "billable.invoicedThisWeek")}</span>
        <span className="text-xl font-semibold text-money tnum">{b.invoicedLabel}</span>
      </div>
    </div>
  );
}
