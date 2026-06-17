"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { getAppTranslations } from "./app";

export const LANGS = ["en", "uk", "ru"] as const;
export type Lang = (typeof LANGS)[number];

// eslint-disable-next-line react-refresh/only-export-components -- shared constant colocated with the provider
export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  uk: "Українська",
  ru: "Русский",
};

const STORAGE_KEY = "logr.lang";
const isLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v);

/** Saved choice → browser language → English. */
function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isLang(saved)) return saved;
  } catch {
    /* localStorage unavailable (private mode) */
  }
  const nav = navigator.language.toLowerCase();
  for (const l of LANGS) if (nav.startsWith(l)) return l;
  return "en";
}

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangState | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  // Start at "en" so the server and the first client render agree (no hydration
  // mismatch); switch to the saved/browser language right after mount.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useMemo(() => {
    const strings = getAppTranslations(lang);
    return (key: string) => strings[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider by design
export function useLang(): LangState {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be inside LangProvider");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider by design
export function useT(): (key: string) => string {
  return useLang().t;
}
