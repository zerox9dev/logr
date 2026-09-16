"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { CommandPalette } from "@/components/layout/command-palette";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useT } from "@/i18n";

/** Slim app header inside SidebarInset: sidebar toggle + ⌘K search. */
export function AppHeader() {
  const t = useT();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Resolved after mount: `navigator` is server-unknown, and branching on it
  // during render makes the SSR markup disagree with hydration.
  const [isMac, setIsMac] = useState(false);
  const shortcutHint = isMac ? "⌘K" : "Ctrl K";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: the platform is unknown during SSR, so the sync happens after mount
    setIsMac(/Mac/i.test(navigator.platform || navigator.userAgent));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line-2 bg-card px-4 py-3">
      <SidebarTrigger />
      <button
        aria-label={t("nav.search")}
        onClick={() => setPaletteOpen(true)}
        className="ml-auto flex items-center gap-5 bg-page px-2.5 py-2 text-tertiary transition-opacity hover:opacity-80"
      >
        <Search className="size-4 sm:hidden" aria-hidden="true" />
        <span className="hidden text-md-minus sm:inline">{t("nav.search")}</span>
        <span className="hidden text-sm font-medium sm:inline tnum">{shortcutHint}</span>
      </button>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
}
