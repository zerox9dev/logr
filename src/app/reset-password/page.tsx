import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

/** Target of the password-reset link PocketBase emails (`?token=...`). */
export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token} />;
}
