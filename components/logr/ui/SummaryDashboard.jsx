import { useMemo, useState } from "react";
import { formatMoney as formatCurrency } from "../lib/utils";

function formatHours(seconds) {
  return (seconds / 3600).toFixed(1);
}

function isInRange(timestamp, range) {
  const date = new Date(timestamp);
  const now = new Date();

  if (range === "today") {
    return date.toDateString() === now.toDateString();
  }

  if (range === "week") {
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    return timestamp >= weekAgo;
  }

  if (range === "month") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }

  return true;
}

function getLastDays(days) {
  const list = [];
  const now = new Date();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const current = new Date(now);
    current.setDate(now.getDate() - offset);
    list.push(current);
  }
  return list;
}

function getSessionMoney(session) {
  const billingType = session.billingType || "hourly";
  if (billingType === "fixed_project") return parseFloat(session.fixedAmount || 0);
  return parseFloat(session.earned || 0);
}

function getSessionDuration(session) {
  const directDuration = parseFloat(session.duration || 0);
  if (Number.isFinite(directDuration) && directDuration > 0) return directDuration;

  const days = parseFloat(session.days ?? session.workDays ?? 0);
  const hours = parseFloat(session.hours ?? 0);
  const minutes = parseFloat(session.minutes ?? 0);
  const workdayHours = parseFloat(session.workdayHours ?? 8);
  const normalizedWorkdayHours = Number.isFinite(workdayHours) && workdayHours > 0 ? workdayHours : 8;

  return (
    (Number.isFinite(days) ? days : 0) * normalizedWorkdayHours * 3600 +
    (Number.isFinite(hours) ? hours : 0) * 3600 +
    (Number.isFinite(minutes) ? minutes : 0) * 60
  );
}

function sumMoney(sessionsList) {
  return sessionsList.reduce((sum, session) => sum + getSessionMoney(session), 0);
}

export default function SummaryDashboard({ theme, currency, clients, sessions, targetHourlyRate = 25 }) {
  const [range, setRange] = useState("all");

  const doneSessions = useMemo(() => sessions.filter((session) => session.status === "DONE"), [sessions]);
  const filteredDoneSessions = useMemo(
    () => doneSessions.filter((session) => isInRange(session.ts, range)),
    [doneSessions, range]
  );

  const totalSeconds = filteredDoneSessions.reduce((sum, session) => sum + getSessionDuration(session), 0);
  const totalMoney = sumMoney(filteredDoneSessions);
  const avgRate = filteredDoneSessions.length > 0 ? totalMoney / (totalSeconds / 3600 || 1) : 0;
  const paidMoney = useMemo(
    () => filteredDoneSessions
      .filter((session) => (session.paymentStatus || "UNPAID") === "PAID")
      .reduce((sum, session) => sum + getSessionMoney(session), 0),
    [filteredDoneSessions]
  );
  const unpaidMoney = useMemo(
    () => filteredDoneSessions
      .filter((session) => (session.paymentStatus || "UNPAID") !== "PAID")
      .reduce((sum, session) => sum + getSessionMoney(session), 0),
    [filteredDoneSessions]
  );
  const collectionRate = paidMoney + unpaidMoney > 0 ? (paidMoney / (paidMoney + unpaidMoney)) * 100 : 0;

  const pendingSessions = useMemo(
    () => sessions.filter((session) => session.status === "PENDING" && isInRange(session.ts, range)),
    [sessions, range]
  );
  const pendingValue = useMemo(
    () => pendingSessions.reduce((sum, session) => sum + getSessionMoney(session), 0),
    [pendingSessions]
  );

  const underEarnedIndicator = useMemo(() => {
    const byProject = new Map();

    filteredDoneSessions.forEach((session) => {
      if ((session.billingType || "hourly") !== "fixed_project") return;
      const projectKey = `${session.clientId || "no-client"}:${session.projectId || "no-project"}`;
      const current = byProject.get(projectKey) || { earned: 0, duration: 0, clientId: session.clientId, projectId: session.projectId || null };
      byProject.set(projectKey, {
        ...current,
        earned: current.earned + getSessionMoney(session),
        duration: current.duration + getSessionDuration(session),
      });
    });

    const items = [...byProject.values()]
      .map((item) => {
        const client = clients.find((entry) => entry.id === item.clientId);
        const project = (client?.projects || []).find((entry) => entry.id === item.projectId);
        const hours = item.duration / 3600;
        const effectiveRate = hours > 0 ? item.earned / hours : 0;
        const missing = Math.max(0, (targetHourlyRate - effectiveRate) * hours);
        return {
          key: `${item.clientId}:${item.projectId}`,
          clientName: client?.name || "Unknown client",
          projectName: project?.name || "Unknown project",
          hours,
          earned: item.earned,
          effectiveRate,
          missing,
          atRisk: hours > 0 && effectiveRate < targetHourlyRate,
        };
      });

    const atRiskProjects = items.filter((item) => item.atRisk);
    const missingTotal = atRiskProjects.reduce((sum, item) => sum + item.missing, 0);
    const severity = missingTotal === 0 ? "healthy" : missingTotal <= targetHourlyRate * 4 ? "watch" : "risk";
    return { atRiskCount: atRiskProjects.length, missingTotal, severity };
  }, [filteredDoneSessions, clients, targetHourlyRate]);

  const revenueBreakdown = useMemo(() => {
    const hourly = filteredDoneSessions
      .filter((session) => (session.billingType || "hourly") === "hourly")
      .reduce((sum, session) => sum + parseFloat(session.earned || 0), 0);
    const fixed = filteredDoneSessions
      .filter((session) => (session.billingType || "hourly") === "fixed_project")
      .reduce((sum, session) => sum + parseFloat(session.fixedAmount || 0), 0);
    const total = hourly + fixed;
    return {
      hourly,
      fixed,
      hourlyPct: total > 0 ? (hourly / total) * 100 : 0,
      fixedPct: total > 0 ? (fixed / total) * 100 : 0,
    };
  }, [filteredDoneSessions]);

  const dailyTrend = useMemo(() => {
    const days = getLastDays(7);
    return days.map((day) => {
      const key = day.toDateString();
      const daySessions = filteredDoneSessions.filter((session) => new Date(session.ts).toDateString() === key);
      const duration = daySessions.reduce((sum, session) => sum + getSessionDuration(session), 0);
      const earned = daySessions.reduce((sum, session) => sum + getSessionMoney(session), 0);
      return {
        label: day.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
        duration,
        earned,
      };
    });
  }, [filteredDoneSessions]);

  const maxDaySeconds = dailyTrend.reduce((max, day) => Math.max(max, day.duration), 0) || 1;

  if (doneSessions.length === 0) {
    return (
      <div style={{ border: `1px solid ${theme.border}`, padding: 18, color: theme.muted }}>
        No completed (`DONE`) sessions yet. Add and finish a few sessions in the tracker to see summary data.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {[["today", "TODAY"], ["week", "7D"], ["month", "MONTH"], ["all", "ALL"]].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setRange(value)}
            style={{
              padding: "6px 11px",
              background: range === value ? theme.tabActiveBg : "transparent",
              border: `1px solid ${theme.border}`,
              color: range === value ? theme.tabActive : theme.tabInactive,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 10,
              letterSpacing: "0.12em",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 1, marginBottom: 20 }}>
        {[
          { label: "TIME", value: `${formatHours(totalSeconds)} h`, note: "selected period" },
          { label: "MONEY", value: formatCurrency(totalMoney, currency), note: "selected period" },
          { label: "AVG RATE", value: `${formatCurrency(avgRate, currency)}/h`, note: "based on DONE sessions" },
          { label: "DONE", value: filteredDoneSessions.length, note: "completed sessions" },
          { label: `${currency} UNPAID`, value: formatCurrency(unpaidMoney, currency), note: "done but unpaid" },
          { label: `${currency} PAID`, value: formatCurrency(paidMoney, currency), note: "collected revenue" },
          { label: "COLLECTION %", value: `${collectionRate.toFixed(1)}%`, note: "paid / done total" },
          { label: "PENDING", value: pendingSessions.length, note: "tasks in pipeline" },
          { label: "PENDING VALUE", value: formatCurrency(pendingValue, currency), note: "potential revenue" },
        ].map((card) => (
          <div key={card.label} style={{ background: theme.statBg, padding: "12px 14px", border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.16em", marginBottom: 4 }}>{card.label}</div>
            <div
              style={{
                fontSize: 24,
                fontFamily: "'Instrument Serif',serif",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: card.label === "MONEY" ? "#2d7a2d" : card.label.includes("PENDING") ? "#c47d00" : theme.timerColor,
                lineHeight: 1.1,
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: 10, color: theme.muted, marginTop: 6 }}>{card.note}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ border: `1px solid ${theme.border}`, padding: 14 }}>
          <div style={{ fontSize: 10, color: theme.muted, letterSpacing: "0.16em", marginBottom: 10 }}>DAILY TREND (LAST 7 DAYS)</div>
          <div style={{ display: "grid", gap: 8 }}>
            {dailyTrend.map((day) => (
              <div key={day.label} style={{ display: "grid", gridTemplateColumns: "70px 1fr auto", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize: 10, color: theme.muted }}>{day.label}</div>
                <div style={{ height: 8, background: theme.faint, position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${Math.max(2, (day.duration / maxDaySeconds) * 100)}%`,
                      background: theme.tabActive,
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: theme.sessionText }}>{formatHours(day.duration)}h · {formatCurrency(day.earned, currency)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ border: `1px solid ${theme.border}`, padding: 14 }}>
          <div style={{ fontSize: 10, color: theme.muted, letterSpacing: "0.16em", marginBottom: 10 }}>PRICING HEALTH</div>
          <div
            style={{
              fontSize: 30,
              fontFamily: "'Instrument Serif',serif",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginBottom: 8,
              color: underEarnedIndicator.severity === "healthy" ? "#2d7a2d" : underEarnedIndicator.severity === "watch" ? "#c47d00" : "#cc2222",
            }}
          >
            {formatCurrency(underEarnedIndicator.missingTotal, currency)}
          </div>
          <div style={{ fontSize: 11, color: theme.sessionText, marginBottom: 4 }}>UNDER-EARNED {currency} (vs target {formatCurrency(targetHourlyRate, currency)}/h)</div>
          <div style={{ fontSize: 10, color: theme.muted, marginBottom: 2 }}>At-risk projects: {underEarnedIndicator.atRiskCount}</div>
          <div style={{ fontSize: 10, color: theme.muted }}>
            Status: {underEarnedIndicator.severity === "healthy" ? "HEALTHY" : underEarnedIndicator.severity === "watch" ? "WATCH" : "RISK"}
          </div>
        </div>
      </div>

      <div style={{ border: `1px solid ${theme.border}`, padding: 14 }}>
        <div style={{ fontSize: 10, color: theme.muted, letterSpacing: "0.16em", marginBottom: 10 }}>REVENUE BREAKDOWN</div>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ borderBottom: `1px solid ${theme.rowBorder}`, paddingBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 12, color: theme.sessionText }}>HOURLY</div>
              <div style={{ fontSize: 12, color: theme.sessionText }}>{formatCurrency(revenueBreakdown.hourly, currency)} · {revenueBreakdown.hourlyPct.toFixed(1)}%</div>
            </div>
            <div style={{ height: 8, background: theme.faint }}>
              <div style={{ width: `${Math.max(2, revenueBreakdown.hourlyPct)}%`, height: "100%", background: theme.tabActive }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 12, color: theme.sessionText }}>FIXED</div>
              <div style={{ fontSize: 12, color: theme.sessionText }}>{formatCurrency(revenueBreakdown.fixed, currency)} · {revenueBreakdown.fixedPct.toFixed(1)}%</div>
            </div>
            <div style={{ height: 8, background: theme.faint }}>
              <div style={{ width: `${Math.max(2, revenueBreakdown.fixedPct)}%`, height: "100%", background: theme.tabActive }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
