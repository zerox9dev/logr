import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TimeEntries } from "@/components/timer/time-entries";
import { ProjectsPage } from "@/components/projects/projects-page";
import { ClientsPage } from "@/components/clients/clients-page";
import { useStore } from "@/lib/store";

function TimerPage() {
  const { projects, entries, addEntry, getProjectById } = useStore();
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Timer</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your time, stay focused.</p>
      </div>
      <TimerDisplay projects={projects} onSave={addEntry} />
      <TimeEntries entries={entries} getProjectById={getProjectById} />
    </>
  );
}

function App() {
  const store = useStore();

  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-6 space-y-6">
            <Routes>
              <Route path="/" element={<TimerPage />} />
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
              <Route path="/invoices" element={<Placeholder title="Invoices" />} />
              <Route path="/reports" element={<Placeholder title="Reports" />} />
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
