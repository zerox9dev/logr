/** Billable hours — Figma 1:160. Accent = MONEY (bold green $ amounts).
 *  Left-column card: border #ececec, px-26 pt-22 pb-26, gap-16. */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { SessionsDialog } from "@/components/dashboard/sessions-dialog";
import { useT } from "@/lib/i18n";

function ClientRow({
  name, rate, time, amount, dot, internal,
}: { name: string; rate?: string; time: string; amount: string; dot: string; internal?: boolean }) {
  return (
    <div className="flex w-full items-center gap-2.5">
      <span className="size-2 shrink-0 rounded-full" style={{ background: dot }} />
      <span className="line-clamp-1 min-w-0 flex-1 text-base font-medium text-heading">{name}</span>
      {rate && (
        <span className="shrink-0 bg-brand-soft px-2 py-0.5 text-sm-minus font-semibold text-money tnum">{rate}</span>
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
  const t = useT();
  const b = metrics.billable;
  const [manageOpen, setManageOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 border border-line bg-card px-[26px] pb-[26px] pt-[22px]">
      <div className="flex w-full items-center justify-between">
        <span className="text-widget font-semibold text-heading">{t("billable.title")}</span>
        <Button variant="unstyled" size="unstyled" onClick={() => setManageOpen(true)} aria-label={t("billable.manageSessions")} className="text-md-minus font-bold text-muted">•••</Button>
      </div>
      <SessionsDialog open={manageOpen} onClose={() => setManageOpen(false)} />

      {/* Billable / Non-billable totals */}
      <div className="flex w-full items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-[7px]">
            <span className="size-[9px] rounded-full bg-money" />
            <span className="text-md text-muted">{t("billable.billable")}</span>
          </div>
          <span className="text-4xl text-tertiary tnum">{b.billableTimeLabel}</span>
          <span className="text-md font-semibold text-money tnum">{b.billableEarnedLabel}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-[7px]">
            <span className="size-[9px] rounded-full bg-track" />
            <span className="text-md text-muted">{t("billable.nonBillable")}</span>
          </div>
          <span className="text-4xl text-tertiary tnum">{b.nonBillableTimeLabel}</span>
          <span className="text-md text-muted">{t("billable.internalWork")}</span>
        </div>
      </div>

      {/* Split bar */}
      <div className="flex w-full items-start gap-[3px]">
        <div className="h-2.5 bg-brand" style={{ flexGrow: b.billablePct || 1 }} />
        <div className="h-2.5 bg-track" style={{ flexGrow: b.nonBillablePct || 1 }} />
      </div>
      <div className="flex w-full items-start justify-between text-sm text-muted">
        <span className="tnum">{b.pctLabel}</span>
        <span className="tnum">{b.nonBillablePctLabel}</span>
      </div>

      <div className="h-px w-full bg-line" />

      <span className="text-md text-muted">{t("billable.byClient")}</span>
      {b.clients.length === 0 && <span className="text-base text-muted">{t("billable.empty")}</span>}
      {b.clients.map((c) => (
        <ClientRow
          key={c.name}
          dot={c.dot}
          name={c.name}
          rate={c.rateLabel}
          time={c.timeLabel}
          amount={c.amountLabel}
          internal={c.internal}
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
