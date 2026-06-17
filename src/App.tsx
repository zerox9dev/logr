import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginGate } from "@/components/auth/login-gate";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { DataProvider } from "@/contexts/data-context";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SharedReportPage } from "@/components/reports/shared-report-page";
import { SharedInvoicePage } from "@/components/reports/shared-invoice-page";
import { LangProvider } from "@/i18n";

function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-card">
      <div className="size-6 animate-spin border-2 border-line border-t-ink" />
    </div>
  );
}

/** Root `/` — single screen. Auth gate, then the one dashboard. */
function Root() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <LoginGate />;
  return (
    <DataProvider>
      <DashboardScreen />
    </DataProvider>
  );
}

function App() {
  return (
    <LangProvider>
      <ToastProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AuthProvider>
              <Routes>
                {/* Public shared links — kept (not app pages). */}
                <Route path="/share/report" element={<SharedReportPage />} />
                <Route path="/share/invoice" element={<SharedInvoicePage />} />
                {/* Everything else is the single dashboard screen. */}
                <Route path="/" element={<Root />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </ConfirmProvider>
      </ToastProvider>
    </LangProvider>
  );
}

export default App;
