import type { ReactNode } from "react";
import LogrApp from "@/components/logr/LogrApp";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LogrApp />
      {children}
    </>
  );
}
