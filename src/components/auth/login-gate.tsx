"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInAction, signUpAction, requestPasswordResetAction } from "@/actions/auth";
import { useAuth } from "@/contexts/auth-context";
import { useT } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface FormState {
  error?: string;
  sent?: boolean;
  /** Set once auth succeeded; an effect does the redirect. Navigating from
   *  inside the `useActionState` action instead scopes the router update into
   *  that action's transition, which then never commits. */
  authed?: boolean;
}

interface LoginGateProps {
  /** After login, redirect here instead of /app. */
  next?: string;
}

/** Sign-in gate shown at `/login` when not authenticated. Monochrome, square. */
export function LoginGate({ next }: LoginGateProps = {}) {
  const router = useRouter();
  const { setUser } = useAuth();
  const t = useT();
  const [mode, setMode] = useState<"signIn" | "signUp" | "forgot">("signIn");

  const [signInState, signIn, signingIn] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      if (!EMAIL_RE.test(email)) return { error: t("login.emailInvalid") };
      if (!password) return { error: t("login.passwordRequired") };

      const { error, user } = await signInAction(email, password);
      if (error) return { error };
      if (user) setUser(user);
      return { authed: true };
    },
    {},
  );

  const [signUpState, signUp, signingUp] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
      if (!EMAIL_RE.test(email)) return { error: t("login.emailInvalid") };
      if (password.length < MIN_PASSWORD_LENGTH) return { error: t("signup.tooShort") };
      if (password !== passwordConfirm) return { error: t("signup.mismatch") };

      const { error, emailTaken, user } = await signUpAction(email, password, passwordConfirm);
      if (emailTaken) return { error: t("signup.emailTaken") };
      if (error) return { error };
      if (user) setUser(user);
      return { authed: true };
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

  const authed = Boolean(signInState.authed || signUpState.authed);

  useEffect(() => {
    if (authed) router.replace(next ?? "/app");
  }, [authed, next, router]);

  // Keep the forms locked while the post-auth redirect is in flight.
  const busySignIn = signingIn || authed;
  const busySignUp = signingUp || authed;

  const error =
    mode === "signIn" ? signInState.error : mode === "signUp" ? signUpState.error : resetState.error;

  const subtitle =
    mode === "signIn" ? t("login.title") : mode === "signUp" ? t("signup.title") : t("login.forgotTitle");

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
            <p className="mt-1 text-md-minus text-tertiary">{subtitle}</p>
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
        ) : mode === "signUp" ? (
          <form action={signUp} className="flex flex-col gap-2.5">
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("login.emailPlaceholder")}
              disabled={busySignUp}
            />
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={t("signup.passwordPlaceholder")}
              disabled={busySignUp}
            />
            <Input
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              placeholder={t("signup.confirmPlaceholder")}
              disabled={busySignUp}
            />
            <Button type="submit" disabled={busySignUp} className="w-full">
              {busySignUp ? t("signup.creating") : t("signup.submit")}
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
              disabled={busySignIn}
            />
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={t("login.passwordPlaceholder")}
              disabled={busySignIn}
            />
            <Button type="submit" disabled={busySignIn} className="w-full">
              {busySignIn ? t("login.signingIn") : t("login.signIn")}
            </Button>
            <div className="mt-1 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setMode("signUp")}
                className="text-md-minus text-tertiary underline underline-offset-4"
              >
                {t("signup.cta")}
              </button>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-md-minus text-tertiary underline underline-offset-4"
              >
                {t("login.forgot")}
              </button>
            </div>
          </form>
        )}

        {error && <p className="mt-3 text-md-minus text-red-600">{error}</p>}
        <p className="mt-6 text-sm text-muted-foreground">{t("login.free")}</p>
      </div>
    </div>
  );
}
