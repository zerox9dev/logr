"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { signInAction, requestPasswordResetAction } from "@/actions/auth";
import { useT } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  error?: string;
  sent?: boolean;
}

interface LoginGateProps {
  /** After login, redirect here instead of /app. */
  next?: string;
}

/** Sign-in gate shown at `/login` when not authenticated. Monochrome, square. */
export function LoginGate({ next }: LoginGateProps = {}) {
  const router = useRouter();
  const t = useT();
  const [mode, setMode] = useState<"signIn" | "forgot">("signIn");

  const [signInState, signIn, signingIn] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      if (!EMAIL_RE.test(email)) return { error: t("login.emailInvalid") };
      if (!password) return { error: t("login.passwordRequired") };

      const { error } = await signInAction(email, password);
      if (error) return { error };

      router.replace(next ?? "/app");
      router.refresh();
      return {};
    },
    {},
  );

  const [resetState, requestReset, requestingReset] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get("email") ?? "").trim();
      if (!EMAIL_RE.test(email)) return { error: t("login.emailInvalid") };

      const { error } = await requestPasswordResetAction(email);
      if (error) return { error };
      return { sent: true };
    },
    {},
  );

  const error = mode === "signIn" ? signInState.error : resetState.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-card px-4">
      <div className="w-full max-w-[360px] text-center">
        <div className="mb-8 flex flex-col items-center gap-4">
          {/* Solid black square logo with two thin white bars */}
          <div className="relative size-12 bg-black">
            <span className="absolute left-[19px] top-[14px] h-5 w-[3px] bg-card" />
            <span className="absolute left-[26px] top-[14px] h-5 w-[3px] bg-card" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-[-0.16px] text-ink">logr.work</h1>
            <p className="mt-1 text-md-minus text-tertiary">
              {mode === "signIn" ? t("login.title") : t("login.forgotTitle")}
            </p>
          </div>
        </div>

        {mode === "forgot" && resetState.sent ? (
          <>
            <p className="border border-line bg-wash px-4 py-3 text-md text-ink">{t("login.forgotSent")}</p>
            <button
              type="button"
              onClick={() => setMode("signIn")}
              className="mt-4 text-md-minus text-tertiary underline underline-offset-4"
            >
              {t("login.back")}
            </button>
          </>
        ) : mode === "forgot" ? (
          <form action={requestReset} className="flex flex-col gap-2.5">
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("login.emailPlaceholder")}
              disabled={requestingReset}
            />
            <Button type="submit" disabled={requestingReset} className="w-full">
              {requestingReset ? t("login.forgotSending") : t("login.forgotSubmit")}
            </Button>
            <button
              type="button"
              onClick={() => setMode("signIn")}
              className="mt-1 text-md-minus text-tertiary underline underline-offset-4"
            >
              {t("login.back")}
            </button>
          </form>
        ) : (
          <form action={signIn} className="flex flex-col gap-2.5">
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("login.emailPlaceholder")}
              disabled={signingIn}
            />
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={t("login.passwordPlaceholder")}
              disabled={signingIn}
            />
            <Button type="submit" disabled={signingIn} className="w-full">
              {signingIn ? t("login.signingIn") : t("login.signIn")}
            </Button>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="mt-1 text-md-minus text-tertiary underline underline-offset-4"
            >
              {t("login.forgot")}
            </button>
          </form>
        )}

        {error && <p className="mt-3 text-md-minus text-red-600">{error}</p>}
        <p className="mt-6 text-sm text-muted-foreground">{t("login.free")}</p>
      </div>
    </div>
  );
}
