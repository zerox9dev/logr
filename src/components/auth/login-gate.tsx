import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

/** Sign-in gate shown at `/` when not authenticated. Monochrome, square. */
export function LoginGate() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) setError(error.message);
  };

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
            <p className="mt-1 text-md-minus text-tertiary">{t("login.title")}</p>
          </div>
        </div>

        <Button
          variant="unstyled"
          size="unstyled"
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 border border-line bg-card px-4 py-3 text-md font-medium text-ink hover:bg-wash disabled:opacity-60"
        >
          <svg className="size-[18px]" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {loading ? t("login.redirecting") : t("login.google")}
        </Button>
        {error && <p className="mt-3 text-md-minus text-red-600">{error}</p>}
        <p className="mt-6 text-sm text-muted">{t("login.free")}</p>
      </div>
    </div>
  );
}
