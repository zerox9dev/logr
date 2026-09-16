"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/contexts/data-context";
import { DashboardProvider } from "@/contexts/dashboard-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { ChatPanel } from "@/components/chat/chat-panel";

/** Client shell for every /app/* route: provider tree + sidebar navigation.
 *  LangProvider + AuthProvider are already in the root providers.tsx — not repeated here. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <ErrorBoundary>
          <DataProvider>
            <DashboardProvider>
              <TooltipProvider>
                <SidebarProvider>
                  <AppSidebar />
                  {/* min-w-0: without it the inset's automatic minimum size
                      lets a wide page (the sessions table) push the layout
                      past the viewport instead of scrolling inside itself. */}
                  <SidebarInset className="min-w-0 bg-page">
                    <AppHeader />
                    {children}
                  </SidebarInset>
                  <ChatPanel />
                </SidebarProvider>
              </TooltipProvider>
            </DashboardProvider>
          </DataProvider>
        </ErrorBoundary>
      </ConfirmProvider>
    </ToastProvider>
  );
}
