"use client";

import { useActionState } from "react";
import Link from "next/link";
import { confirmPasswordResetAction } from "@/actions/auth";
import { useT } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MIN_PASSWORD_LENGTH = 8;

interface FormState {
  error?: string;
  done?: boolean;
}

export function ResetPasswordForm({ token }: { token?: string }) {
  const t = useT();

  const [state, submit, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      if (!token) return { error: t("reset.missingToken") };
      const password = String(formData.get("password") ?? "");
      const confirm = String(formData.get("passwordConfirm") ?? "");
      if (password.length < MIN_PASSWORD_LENGTH) return { error: t("reset.tooShort") };
      if (password !== confirm) return { error: t("reset.mismatch") };

      const { error } = await confirmPasswordResetAction(token, password, confirm);
      if (error) return { error };
      return { done: true };
    },
    {},
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-card px-4">
      <div className="w-full max-w-[360px] text-center">
        <h1 className="text-lg font-semibold tracking-[-0.16px] text-ink">{t("reset.title")}</h1>

        {state.done ? (
          <>
            <p className="mt-6 border border-line bg-wash px-4 py-3 text-md text-ink">{t("reset.done")}</p>
            <Link href="/login" className="mt-4 inline-block text-md-minus text-tertiary underline underline-offset-4">
              {t("reset.toLogin")}
            </Link>
          </>
        ) : (
          <form action={submit} className="mt-6 flex flex-col gap-2.5">
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={t("reset.passwordPlaceholder")}
              disabled={pending}
            />
            <Input
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              placeholder={t("reset.confirmPlaceholder")}
              disabled={pending}
            />
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? t("reset.saving") : t("reset.submit")}
            </Button>
          </form>
        )}

        {state.error && <p className="mt-3 text-md-minus text-red-600">{state.error}</p>}
      </div>
    </div>
  );
}
