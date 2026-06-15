export type Lang = "en" | "uk" | "ru" | "de" | "fr" | "es" | "pt" | "pl" | "ja" | "ko" | "zh" | "tr";

const SUPPORTED: Lang[] = ["en", "uk", "ru", "de", "fr", "es", "pt", "pl", "ja", "ko", "zh", "tr"];

function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const nav = navigator.language.toLowerCase();
  for (const lang of SUPPORTED) {
    if (nav.startsWith(lang)) return lang;
  }
  // zh-CN, zh-TW → zh
  if (nav.startsWith("zh")) return "zh";
  return "en";
}

import { getAppTranslations } from "./i18n-app";

const currentLang: Lang = detectLang();
const appStrings = getAppTranslations(currentLang);

export function getLang(): Lang { return currentLang; }

export function t(key: string): string {
  return appStrings[key] || key;
}
