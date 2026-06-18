import type { Metadata } from "next";
import { LoginGate } from "@/components/auth/login-gate";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function LoginPage() {
  return <LoginGate />;
}
