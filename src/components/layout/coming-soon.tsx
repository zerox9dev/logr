"use client";

import { useT } from "@/i18n";

/** Placeholder body for /app routes whose real screens land in later stages. */
export function ComingSoon({ titleKey }: { titleKey: string }) {
  const t = useT();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-page px-4 text-center">
      <h1 className="text-xl font-semibold text-heading">{t(titleKey)}</h1>
      <p className="text-md text-tertiary">{t("common.comingSoon")}</p>
    </div>
  );
}
