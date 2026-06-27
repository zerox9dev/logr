"use client";

import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { DataProvider } from "@/contexts/data-context";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { ChatPanel } from "@/components/chat/chat-panel";

/** Client-side provider tree for the dashboard route.
 *  LangProvider + AuthProvider are already in the root providers.tsx — not repeated here. */
export function DashboardApp() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <ErrorBoundary>
          <DataProvider>
            <DashboardScreen />
            <ChatPanel />
          </DataProvider>
        </ErrorBoundary>
      </ConfirmProvider>
    </ToastProvider>
  );
}
