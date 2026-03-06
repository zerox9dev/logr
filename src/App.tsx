import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TimeEntries } from "@/components/timer/time-entries";

interface TimeEntry {
  id: string;
  description: string;
  project: string;
  duration: number;
  startedAt: Date;
}

function App() {
  const [currentPage, setCurrentPage] = useState("/");
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  const handleSave = (entry: TimeEntry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl p-6 space-y-6">
          {currentPage === "/" && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Timer</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Track your time, stay focused.
                </p>
              </div>
              <TimerDisplay onSave={handleSave} />
              <TimeEntries entries={entries} />
            </>
          )}

          {currentPage === "/projects" && (
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
              <p className="text-sm text-muted-foreground mt-4">Coming soon.</p>
            </div>
          )}

          {currentPage === "/clients" && (
            <div>
              <h1 className="text-2xl font-bold text-foreground">Clients</h1>
              <p className="text-sm text-muted-foreground mt-4">Coming soon.</p>
            </div>
          )}

          {currentPage === "/invoices" && (
            <div>
              <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
              <p className="text-sm text-muted-foreground mt-4">Coming soon.</p>
            </div>
          )}

          {currentPage === "/reports" && (
            <div>
              <h1 className="text-2xl font-bold text-foreground">Reports</h1>
              <p className="text-sm text-muted-foreground mt-4">Coming soon.</p>
            </div>
          )}

          {currentPage === "/settings" && (
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground mt-4">Coming soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
