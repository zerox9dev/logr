import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/components/landing/landing-page";
import { AppLayout } from "@/components/layout/app-layout";
import { LoginPage } from "@/components/auth/login-page";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DataProvider } from "@/lib/data-context";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SharedReportPage } from "@/components/reports/shared-report-page";
import { Timer } from "lucide-react";
import s from "./App.module.css";

function Loading() {
  return (
    <div className={s.loading}>
      <div className={s.loadingInner}>
        <Timer className={s.loadingIcon} />
        <span className={s.loadingText}>Loading...</span>
      </div>
    </div>
  );
}

/** /login — shows login form, redirects to /app if already logged in */
function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (user) return <Navigate to="/app" replace />;
  return <LoginPage />;
}

/** /app/* — protected, redirects to /login if not authenticated */
function ProtectedApp() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <DataProvider>
      <AppLayout />
    </DataProvider>
  );
}

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/share/report" element={<SharedReportPage />} />
                <Route path="/login" element={<LoginRoute />} />
                <Route path="/app/*" element={<ProtectedApp />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
