"use client";

import { useEffect, type ReactNode } from "react";
import { applyTheme } from "@/lib/theme";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/contexts/data-context";
import { DashboardProvider } from "@/contexts/dashboard-context";
import { TrackerProvider } from "@/contexts/tracker-context";
import { AppRail } from "@/components/layout/app-rail";
import { AppHeader } from "@/components/layout/app-header";
import { ProjectsPanel } from "@/components/layout/projects-panel";
import { ShellProvider, useShell } from "@/components/layout/shell-context";
import { ChatPanel } from "@/components/chat/chat-panel";

/** Rail · projects panel · main pane, after the calendar canon. Below `md`
 *  the rail folds into the title bar's menu; below `lg` the panel hides. */
function Frame({ children }: { children: ReactNode }) {
  const { panelOpen } = useShell();
  return (
    // `app-shell` opts this subtree out of the global square reset in
    // globals.css and re-points every token at the app palette.
    <div className="app-shell flex h-dvh overflow-hidden bg-page text-ink">
      <AppRail />
      {panelOpen ? <ProjectsPanel /> : null}
      {/* min-w-0: without it a wide page (the sessions table) pushes the
          layout past the viewport instead of scrolling inside itself. */}
      <main className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <div className="cal-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </main>
      <ChatPanel />
    </div>
  );
}

/** Client shell for every /app/* route: provider tree + frame.
 *  LangProvider + AuthProvider are already in the root providers.tsx — not repeated here. */
export function AppShell({ children }: { children: ReactNode }) {
  // The <head> script covers a full load of /app; this covers arriving by
  // client navigation, and drops the theme again on the way out.
  useEffect(() => {
    applyTheme();
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, []);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <ErrorBoundary>
          <DataProvider>
            <DashboardProvider>
              <TrackerProvider>
                <ShellProvider>
                  <TooltipProvider>
                    <Frame>{children}</Frame>
                  </TooltipProvider>
                </ShellProvider>
              </TrackerProvider>
            </DashboardProvider>
          </DataProvider>
        </ErrorBoundary>
      </ConfirmProvider>
    </ToastProvider>
  );
}
