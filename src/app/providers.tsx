"use client";

import type { ReactNode } from "react";
import { LangProvider } from "@/i18n";

// Client provider tree. Auth/Data/Toast/Confirm providers join here in later
// phases; for now LangProvider so server-rendered routes can use useT().
export function Providers({ children }: { children: ReactNode }) {
  return <LangProvider>{children}</LangProvider>;
}
