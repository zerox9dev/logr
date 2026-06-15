import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";
import { useAppData } from "@/lib/data-context";
import {
  computeMetrics, shiftDate, isAtCurrentPeriod,
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
    () => computeMetrics({ sessions, projects, clients, invoices, activities, settings, now: refDate, today, period }),
    [sessions, projects, clients, invoices, activities, settings, refDate, today, period],
  );

  const canPageForward = period !== "All" && !isAtCurrentPeriod(period, refDate, today);
  const canPageBack = period !== "All";

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
