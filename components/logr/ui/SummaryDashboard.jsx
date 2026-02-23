import { useMemo, useState } from "react";

function formatHours(seconds) {
  return (seconds / 3600).toFixed(1);
}

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
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

function getSessionMoney(session, countedProjectKeys) {
  const billingType = session.billingType || "hourly";
  if (billingType === "fixed_project") {
    const projectKey = `${session.clientId || "no-client"}:${session.projectId || "no-project"}`;
    if (!session.projectId || countedProjectKeys.has(projectKey)) return 0;
    countedProjectKeys.add(projectKey);
    return parseFloat(session.fixedAmount || 0);
  }
  return parseFloat(session.earned || 0);
}

function sumMoney(sessionsList) {
  const countedProjectKeys = new Set();
  return sessionsList.reduce((sum, session) => sum + getSessionMoney(session, countedProjectKeys), 0);
}

export default function SummaryDashboard({ theme, clients, sessions }) {
  const [range, setRange] = useState("week");

  const doneSessions = useMemo(() => sessions.filter((session) => session.status === "DONE"), [sessions]);
  const filteredDoneSessions = useMemo(
    () => doneSessions.filter((session) => isInRange(session.ts, range)),
    [doneSessions, range]
  );

  const totalSeconds = filteredDoneSessions.reduce((sum, session) => sum + session.duration, 0);
  const totalMoney = sumMoney(filteredDoneSessions);
  const avgRate = filteredDoneSessions.length > 0 ? totalMoney / (totalSeconds / 3600 || 1) : 0;

  const sessionsToday = doneSessions.filter((session) => isInRange(session.ts, "today"));
  const sessionsMonth = doneSessions.filter((session) => isInRange(session.ts, "month"));

  const topClients = useMemo(() => {
    const totalsByClient = new Map();
    const countedProjectKeys = new Set();

    filteredDoneSessions.forEach((session) => {
      const money = getSessionMoney(session, countedProjectKeys);
      const current = totalsByClient.get(session.clientId) || { earned: 0, duration: 0, count: 0 };
      totalsByClient.set(session.clientId, {
        earned: current.earned + money,
        duration: current.duration + session.duration,
        count: current.count + 1,
      });
    });

    return [...totalsByClient.entries()]
      .map(([clientId, stats]) => ({
        clientId,
        name: clients.find((client) => client.id === clientId)?.name || "Unknown client",
        ...stats,
      }))
      .sort((a, b) => b.earned - a.earned)
      .slice(0, 5);
  }, [filteredDoneSessions, clients]);

  const projectTotals = useMemo(() => {
    const allProjects = clients.flatMap((client) =>
      (client.projects || []).map((project) => ({ ...project, clientId: client.id, clientName: client.name }))
    );
    const byProject = new Map();

    filteredDoneSessions.forEach((session) => {
      if (!session.projectId) return;
      const current = byProject.get(session.projectId) || { earned: 0, duration: 0 };
      const billingType = session.billingType || "hourly";
      const money = billingType === "fixed_project" ? parseFloat(session.fixedAmount || 0) : parseFloat(session.earned || 0);
      byProject.set(session.projectId, {
        earned: billingType === "fixed_project" ? Math.max(current.earned, money) : current.earned + money,
        duration: current.duration + session.duration,
      });
    });

    return [...byProject.entries()]
      .map(([projectId, stats]) => {
        const project = allProjects.find((item) => item.id === projectId);
        return {
          projectId,
          name: project?.name || "Unknown project",
          clientName: project?.clientName || "Unknown client",
          ...stats,
        };
      })
      .sort((a, b) => b.earned - a.earned)
      .slice(0, 6);
  }, [clients, filteredDoneSessions]);

  const dailyTrend = useMemo(() => {
    const days = getLastDays(7);
    const countedProjectKeys = new Set();
    return days.map((day) => {
      const key = day.toDateString();
      const daySessions = filteredDoneSessions.filter((session) => new Date(session.ts).toDateString() === key);
      const duration = daySessions.reduce((sum, session) => sum + session.duration, 0);
      const earned = daySessions.reduce((sum, session) => sum + getSessionMoney(session, countedProjectKeys), 0);
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
          { label: "MONEY", value: formatMoney(totalMoney), note: "selected period" },
          { label: "AVG RATE", value: `${formatMoney(avgRate)}/h`, note: "based on DONE sessions" },
          { label: "DONE", value: filteredDoneSessions.length, note: "completed sessions" },
          {
            label: "TODAY",
            value: `${formatHours(sessionsToday.reduce((sum, s) => sum + s.duration, 0))} h`,
            note: formatMoney(sumMoney(sessionsToday)),
          },
          {
            label: "THIS MONTH",
            value: `${formatHours(sessionsMonth.reduce((sum, s) => sum + s.duration, 0))} h`,
            note: formatMoney(sumMoney(sessionsMonth)),
          },
        ].map((card) => (
          <div key={card.label} style={{ background: theme.statBg, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.16em", marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 24, fontFamily: "'Bebas Neue',sans-serif", color: theme.timerColor, lineHeight: 1.1 }}>{card.value}</div>
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
                <div style={{ fontSize: 10, color: theme.sessionText }}>{formatHours(day.duration)}h · {formatMoney(day.earned)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ border: `1px solid ${theme.border}`, padding: 14 }}>
          <div style={{ fontSize: 10, color: theme.muted, letterSpacing: "0.16em", marginBottom: 10 }}>TOP CLIENTS</div>
          {topClients.length === 0 ? (
            <div style={{ fontSize: 12, color: theme.muted }}>No data in the selected period.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {topClients.map((client) => (
                <div key={client.clientId} style={{ borderBottom: `1px solid ${theme.rowBorder}`, paddingBottom: 8 }}>
                  <div style={{ fontSize: 12, color: theme.sessionText, marginBottom: 2 }}>{client.name}</div>
                  <div style={{ fontSize: 10, color: theme.muted }}>
                    {formatHours(client.duration)}h · {client.count} tasks · {formatMoney(client.earned)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ border: `1px solid ${theme.border}`, padding: 14 }}>
        <div style={{ fontSize: 10, color: theme.muted, letterSpacing: "0.16em", marginBottom: 10 }}>TOP PROJECTS</div>
        {projectTotals.length === 0 ? (
          <div style={{ fontSize: 12, color: theme.muted }}>No project-linked completed sessions in this period.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {projectTotals.map((project) => (
              <div key={project.projectId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderBottom: `1px solid ${theme.rowBorder}`, paddingBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: theme.sessionText }}>{project.name}</div>
                  <div style={{ fontSize: 10, color: theme.muted }}>{project.clientName}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: theme.sessionText }}>{formatMoney(project.earned)}</div>
                  <div style={{ fontSize: 10, color: theme.muted }}>{formatHours(project.duration)}h</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
