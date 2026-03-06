import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "@/components/landing/landing-page";
import { AppLayout } from "@/components/layout/app-layout";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm";
import { ErrorBoundary } from "@/components/ui/error-boundary";

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app/*" element={<AppLayout />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
