"use client";

import type { ReactNode } from "react";
import { LangProvider } from "@/i18n";
import { AuthProvider } from "@/contexts/auth-context";

// Client provider tree. Data/Toast/Confirm providers join here in Phase 5.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <AuthProvider>{children}</AuthProvider>
    </LangProvider>
  );
}
