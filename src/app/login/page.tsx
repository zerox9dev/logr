import type { Metadata } from "next";
import { LoginGate } from "@/components/auth/login-gate";

export const metadata: Metadata = { robots: { index: false, follow: true } };

interface PageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  return <LoginGate next={next} />;
}
