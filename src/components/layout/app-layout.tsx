import { Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { TimerPage } from "@/components/timer/timer-page";
import { ProjectsPage } from "@/components/projects/projects-page";
import { ClientsPage } from "@/components/clients/clients-page";
import { InvoicesPage } from "@/components/invoices/invoices-page";
import { InvoiceCreatePage } from "@/components/invoices/invoice-create-page";
import { ReportsPage } from "@/components/reports/reports-page";
import { FunnelsPage } from "@/components/funnels/funnels-page";
import { SettingsPage } from "@/components/settings/settings-page";
import { NotFound } from "@/components/not-found";
import { CommandPalette } from "@/components/ui/command-palette";
import { useAppData } from "@/lib/data-context";
import { Timer } from "lucide-react";

export function AppLayout() {
  const data = useAppData();

  if (data.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Timer className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading your data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-3 md:p-4">
        <div className="h-full rounded-2xl border border-border bg-white overflow-auto">
          <div className="mx-auto max-w-5xl p-5 md:p-8 pb-20 md:pb-8 space-y-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/timer" element={<TimerPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<InvoiceCreatePage />} />
            <Route path="/funnels" element={<FunnelsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}
