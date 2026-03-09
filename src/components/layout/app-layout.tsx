import { Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { TimerPage } from "@/components/timer/timer-page";
import { ProjectsPage } from "@/components/projects/projects-page";
import { ProjectDetailPage } from "@/components/projects/project-detail-page";
import { ClientsPage } from "@/components/clients/clients-page";
import { InvoicesPage } from "@/components/invoices/invoices-page";
import { InvoiceCreatePage } from "@/components/invoices/invoice-create-page";
import { InvoiceViewPage } from "@/components/invoices/invoice-view-page";
import { ReportsPage } from "@/components/reports/reports-page";
import { FunnelsPage } from "@/components/funnels/funnels-page";
import { SettingsPage } from "@/components/settings/settings-page";
import { NotFound } from "@/components/not-found";
import { CommandPalette } from "@/components/ui/command-palette";
import { useAppData } from "@/lib/data-context";
import { Timer } from "lucide-react";
import s from "./app-layout.module.css";

export function AppLayout() {
  const data = useAppData();

  if (data.loading) {
    return (
      <div className={s.loading}>
        <div className={s.loadingInner}>
          <Timer className={s.loadingIcon} />
          <span className={s.loadingText}>Loading your data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={s.layout}>
      <Sidebar />
      <main className={s.main}>
        <div className={s.contentWrap}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/timer" element={<TimerPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<InvoiceCreatePage />} />
            <Route path="/invoices/:id" element={<InvoiceViewPage />} />
            <Route path="/funnels" element={<FunnelsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}
