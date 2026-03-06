import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "@/components/landing/landing-page";
import { AppLayout } from "@/components/layout/app-layout";
import { LoginPage } from "@/components/auth/login-page";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DataProvider } from "@/lib/data-context";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Timer } from "lucide-react";

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Timer className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

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
                <Route path="/login" element={<ProtectedApp />} />
                <Route path="/app/*" element={<ProtectedApp />} />
              </Routes>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
