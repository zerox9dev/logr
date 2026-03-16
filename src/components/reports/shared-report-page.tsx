import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BarChart3, Clock3, DollarSign, ExternalLink, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  decodeSharedReport,
  formatDuration,
  getCurrencySymbol,
  type ReportBreakdownItem,
} from "@/lib/report-share";
import s from "./reports-page.module.css";

function formatReportDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

function BreakdownList({
  title,
  items,
  tone,
}: {
  title: string;
  items: ReportBreakdownItem[];
  tone: "green" | "blue";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: "1.125rem" }}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className={s.shareEmpty}>No tracked work in this report.</p>
        ) : (
          <div className={s.barList}>
            {items.map((item, index) => (
              <div key={`${item.name}-${index}`} className={s.barItem}>
                <div className={s.barHeader}>
                  <span className={s.barName}>{item.name}</span>
                  <span className={s.barDuration}>{formatDuration(item.durationSeconds)}</span>
                </div>
                <div className={s.barTrack}>
                  <div
                    className={[s.barFill, tone === "green" ? s.barFillGreen : s.barFillBlue].join(" ")}
                    style={{ width: `${(item.durationSeconds / (items[0]?.durationSeconds || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SharedReportPage() {
  const [searchParams] = useSearchParams();
  const payload = useMemo(() => decodeSharedReport(searchParams.get("data") || ""), [searchParams]);

  if (!payload) {
    return (
      <div className={s.sharePage}>
        <div className={s.shareShell}>
          <Card className={s.shareHeroCard}>
            <CardContent className={s.shareInvalid}>
              <BarChart3 className={s.shareInvalidIcon} />
              <h1 className={s.shareHeroTitle}>This report link is invalid</h1>
              <p className={s.shareHeroText}>
                Ask the freelancer to generate a new share link from the Reports page.
              </p>
              <Link to="/" className={s.sharePrimaryLink}>Open Logr</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(payload.currency);
  const generatedAt = new Date(payload.generatedAt);
  const reportTitle = payload.clientName ? `Hours and earnings for ${payload.clientName}` : "Hours and earnings at a glance";

  return (
    <div className={s.sharePage}>
      <div className={s.shareShell}>
        <Card className={s.shareHeroCard}>
          <CardContent className={s.shareHero}>
            <div className={s.shareBadge}>Shared work report</div>
            <div className={s.shareHeroHeader}>
              <div>
                <h1 className={s.shareHeroTitle}>{reportTitle}</h1>
                <p className={s.shareHeroText}>
                  Reporting period: <strong>{payload.range}</strong>.
                  {payload.clientName ? <> Client: <strong>{payload.clientName}</strong>.</> : null} Generated on{" "}
                  <strong>{generatedAt.toLocaleDateString()}</strong>.
                </p>
              </div>
              <Link to="/" className={s.shareSecondaryLink}>
                Open Logr
                <ExternalLink style={{ width: 14, height: 14 }} />
              </Link>
            </div>

            <div className={s.shareStatsGrid}>
              <div className={s.shareStatCard}>
                <span className={s.shareStatLabel}><Clock3 style={{ width: 14, height: 14 }} /> Total time</span>
                <strong className={s.shareStatValue}>{formatDuration(payload.totalSeconds)}</strong>
              </div>
              <div className={s.shareStatCard}>
                <span className={s.shareStatLabel}><BarChart3 style={{ width: 14, height: 14 }} /> Billable time</span>
                <strong className={s.shareStatValue}>{formatDuration(payload.billableSeconds)}</strong>
              </div>
              <div className={s.shareStatCard}>
                <span className={s.shareStatLabel}><DollarSign style={{ width: 14, height: 14 }} /> Earnings</span>
                <strong className={s.shareStatValue}>{currencySymbol}{payload.billableAmount.toFixed(2)}</strong>
              </div>
              <div className={s.shareStatCard}>
                <span className={s.shareStatLabel}><Wallet style={{ width: 14, height: 14 }} /> Paid</span>
                <strong className={s.shareStatValue}>{currencySymbol}{payload.paidAmount.toFixed(2)}</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={s.grid2}>
          <BreakdownList title="By project" items={payload.topProjects} tone="green" />
          <BreakdownList title="By client" items={payload.topClients} tone="blue" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: "1.125rem" }}>Work log</CardTitle>
          </CardHeader>
          <CardContent>
            {payload.sessions.length === 0 ? (
              <p className={s.shareEmpty}>No tracked work in this report.</p>
            ) : (
              <div className={s.shareSessionList}>
                {payload.sessions.map((session) => (
                  <article key={session.id} className={s.shareSessionCard}>
                    <div className={s.shareSessionTop}>
                      <div>
                        <h3 className={s.shareSessionTitle}>{session.name}</h3>
                        <p className={s.shareSessionMeta}>
                          {session.projectName} • {formatReportDate(session.startedAt)}
                        </p>
                      </div>
                      <Badge variant={session.paymentStatus === "paid" ? "default" : "secondary"}>
                        {session.paymentStatus}
                      </Badge>
                    </div>
                    <div className={s.shareSessionStats}>
                      <div className={s.shareSessionStat}>
                        <span className={s.shareSessionLabel}>Duration</span>
                        <strong>{formatDuration(session.durationSeconds)}</strong>
                      </div>
                      <div className={s.shareSessionStat}>
                        <span className={s.shareSessionLabel}>Rate</span>
                        <strong>
                          {session.billingType === "hourly" && session.rate > 0
                            ? `${currencySymbol}${session.rate.toFixed(2)}/hr`
                            : "—"}
                        </strong>
                      </div>
                      <div className={s.shareSessionStat}>
                        <span className={s.shareSessionLabel}>Amount</span>
                        <strong>{session.amount > 0 ? `${currencySymbol}${session.amount.toFixed(2)}` : "—"}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
