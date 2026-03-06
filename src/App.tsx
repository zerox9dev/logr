import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TimeEntries } from "@/components/timer/time-entries";
import { ProjectsPage } from "@/components/projects/projects-page";
import { ClientsPage } from "@/components/clients/clients-page";
import { InvoicesPage } from "@/components/invoices/invoices-page";
import { ReportsPage } from "@/components/reports/reports-page";
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
                    <TimeEntries entries={store.entries} getProjectById={store.getProjectById} />
                  </>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProjectsPage
                    projects={store.projects}
                    clients={store.clients}
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
              <Route path="/settings" element={<Placeholder title="Settings" />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground mt-4">Coming soon.</p>
    </div>
  );
}

export default App;
