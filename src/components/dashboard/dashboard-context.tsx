import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";
import { useAppData } from "@/lib/data-context";
import { useT, useLang } from "@/lib/i18n";
import {
  computeMetrics, shiftDate, isAtCurrentPeriod, rangeFor,
  type DashboardMetrics, type Period,
} from "@/lib/dashboard-metrics";

interface DashboardContextType {
  period: Period;
  setPeriod: (p: Period) => void;
  metrics: DashboardMetrics;
  pageDate: (dir: -1 | 1) => void;
  goToToday: () => void;
  refDate: Date;
  goToDate: (d: Date) => void;
  canPageBack: boolean;
  canPageForward: boolean;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { sessions, projects, clients, invoices, activities, settings } = useAppData();
  const t = useT();
  const { lang } = useLang();
  const [period, setPeriod] = useState<Period>("Day");
  // `today` is the real current date (pinned); `refDate` is the movable anchor.
  const [today] = useState(() => new Date());
  const [refDate, setRefDate] = useState(() => new Date());

  const pageDate = useCallback((dir: -1 | 1) => {
    setRefDate((d) => shiftDate(d, period, dir));
  }, [period]);

  const goToToday = useCallback(() => setRefDate(new Date()), []);
  const goToDate = useCallback((d: Date) => setRefDate(d), []);

  const metrics = useMemo(
    () => computeMetrics({ sessions, projects, clients, invoices, activities, settings, now: refDate, today, period, t, lang }),
    [sessions, projects, clients, invoices, activities, settings, refDate, today, period, t, lang],
  );

  const canPageForward = period !== "All" && !isAtCurrentPeriod(period, refDate, today);

  // Lower bound: the period that contains the earliest session (or no sessions → can't go back).
  const canPageBack = useMemo(() => {
    if (period === "All") return false;
    if (sessions.length === 0) return false;
    const earliestMs = Math.min(...sessions.map((s) => new Date(s.started_at).getTime()));
    const earliest = new Date(earliestMs);
    const currentStart = rangeFor(period, refDate).start.getTime();
    const earliestStart = rangeFor(period, earliest).start.getTime();
    // Can go back if the current period's start is strictly after the earliest period's start.
    return currentStart > earliestStart;
  }, [period, refDate, sessions]);

  const value = useMemo(
    () => ({ period, setPeriod, metrics, pageDate, goToToday, refDate, goToDate, canPageBack, canPageForward }),
    [period, metrics, pageDate, goToToday, refDate, goToDate, canPageBack, canPageForward],
  );
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider by design
export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be inside DashboardProvider");
  return ctx;
}
