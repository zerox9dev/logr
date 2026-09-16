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

/** `google_*` codes the OAuth routes put on `/login?error=`. */
const OAUTH_ERROR_KEYS: Record<string, string> = {
  google_unavailable: "login.googleUnavailable",
  google_failed: "login.googleFailed",
  google_denied: "login.googleDenied",
};

/** Brand mark, so an inline SVG rather than a lucide glyph: lucide ships no
 *  Google logo and a generic icon would misrepresent the provider. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

function GoogleButton({ label, next, busy }: { label: string; next?: string; busy: boolean }) {
  const href = next ? `/auth/google?next=${encodeURIComponent(next)}` : "/auth/google";
  return (
    <Button
      asChild
      variant="outline"
      className={`w-full ${busy ? "pointer-events-none opacity-50" : ""}`}
    >
      {/* An anchor, not a button: the start route is a plain GET navigation, so
          this keeps working with JS disabled or hydration still in flight. */}
      <a href={href} aria-disabled={busy || undefined}>
        <GoogleIcon />
        {label}
      </a>
    </Button>
  );
}

function OrDivider({ label }: { label: string }) {
  return (
    <div className="my-1 flex items-center gap-3">
      <span className="h-px flex-1 bg-line" />
      <span className="text-md-minus text-tertiary">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

interface LoginGateProps {
  /** After login, redirect here instead of /app. */
  next?: string;
  /** `google_*` code from a failed OAuth round-trip. */
  error?: string;
}

/** Sign-in gate shown at `/login` when not authenticated. Monochrome, square. */
export function LoginGate({ next, error: oauthError }: LoginGateProps = {}) {
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

  const formError =
    mode === "signIn" ? signInState.error : mode === "signUp" ? signUpState.error : resetState.error;

  // A failed OAuth round-trip lands here via `/login?error=…`; the moment the
  // visitor submits a form, that form's own result takes over the slot.
  const oauthKey = oauthError ? OAUTH_ERROR_KEYS[oauthError] : undefined;
  const error = formError ?? (oauthKey && !busySignIn && !busySignUp ? t(oauthKey) : undefined);

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
            <OrDivider label={t("login.or")} />
            <GoogleButton label={t("login.google")} next={next} busy={busySignUp} />
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
            <OrDivider label={t("login.or")} />
            <GoogleButton label={t("login.google")} next={next} busy={busySignIn} />
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
