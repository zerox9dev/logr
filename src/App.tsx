import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TimeEntries } from "@/components/timer/time-entries";
import { ProjectsPage } from "@/components/projects/projects-page";
import { ClientsPage } from "@/components/clients/clients-page";
import { InvoicesPage } from "@/components/invoices/invoices-page";
import { ReportsPage } from "@/components/reports/reports-page";
import { SettingsPage } from "@/components/settings/settings-page";
import { useStore } from "@/lib/store";

function App() {
  const store = useStore();

  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-6 space-y-6">
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    entries={store.entries}
                    projects={store.projects}
                    clients={store.clients}
                    invoices={store.invoices}
                    getProjectById={store.getProjectById}
                  />
                }
              />
              <Route
                path="/timer"
                element={
                  <>
                    <div>
                      <h1 className="text-2xl font-bold">Timer</h1>
                      <p className="text-sm text-muted-foreground mt-1">Track your time, stay focused.</p>
                    </div>
                    <TimerDisplay projects={store.projects} onSave={store.addEntry} />
                    <TimeEntries
                      entries={store.entries}
                      projects={store.projects}
                      getProjectById={store.getProjectById}
                      onUpdate={store.updateEntry}
                      onDelete={store.deleteEntry}
                      onAdd={store.addEntry}
                    />
                  </>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProjectsPage
                    projects={store.projects}
                    clients={store.clients}
                    entries={store.entries}
                    onAdd={store.addProject}
                    onUpdate={store.updateProject}
                    onDelete={store.deleteProject}
                    getClientById={store.getClientById}
                  />
                }
              />
              <Route
                path="/clients"
                element={
                  <ClientsPage
                    clients={store.clients}
                    entries={store.entries}
                    invoices={store.invoices}
                    projects={store.projects}
                    onAdd={store.addClient}
                    onUpdate={store.updateClient}
                    onDelete={store.deleteClient}
                  />
                }
              />
              <Route
                path="/invoices"
                element={
                  <InvoicesPage
                    invoices={store.invoices}
                    clients={store.clients}
                    projects={store.projects}
                    entries={store.entries}
                    onAdd={store.addInvoice}
                    onUpdate={store.updateInvoice}
                    onDelete={store.deleteInvoice}
                    getClientById={store.getClientById}
                  />
                }
              />
              <Route
                path="/reports"
                element={
                  <ReportsPage
                    entries={store.entries}
                    projects={store.projects}
                    clients={store.clients}
                    getProjectById={store.getProjectById}
                  />
                }
              />
              <Route
                path="/settings"
                element={
                  <SettingsPage
                    settings={store.settings}
                    onUpdate={store.updateSettings}
                    onExportData={() => {
                      const data = {
                        projects: store.projects,
                        clients: store.clients,
                        entries: store.entries,
                        invoices: store.invoices,
                        settings: store.settings,
                        exportedAt: new Date().toISOString(),
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `logr-export-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    onClearData={() => {
                      if (window.confirm("Clear all data? This cannot be undone.")) {
                        window.location.reload();
                      }
                    }}
                  />
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}


export default App;
