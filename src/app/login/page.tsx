import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginGate } from "@/components/auth/login-gate";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { safeNext } from "@/lib/google-oauth";

export const metadata: Metadata = { robots: { index: false, follow: true } };

interface PageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { next, error } = await searchParams;
  // A live session reaching /login means the visitor came back to the marketing
  // page and followed "Sign in" — showing the form there reads as a dropped
  // session. Send them straight into the app instead.
  if (!error && (await getCurrentUser())) redirect(safeNext(next) ?? "/app");
  return <LoginGate next={next} error={error} />;
}
