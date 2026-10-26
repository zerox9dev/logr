"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_KEY as KEY } from "./theme-script";

/**
 * App theme: light, dark, or follow the system. The choice lives in
 * localStorage and lands on <html data-theme>, where globals.css swaps the
 * `--cal-*` palette. THEME_SCRIPT (theme-script.ts) applies it before first paint.
 */

export type ThemePref = "light" | "dark" | "system";

const EVENT = "logr-theme-change";

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function resolve(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(pref: ThemePref = readPref()) {
  document.documentElement.dataset.theme = resolve(pref);
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => {
    if (readPref() === "system") applyTheme("system");
    onChange();
  };
  // Another tab changed the theme: apply it here too, not just re-read it.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== KEY) return;
    applyTheme();
    onChange();
  };
  mq.addEventListener("change", onSystem);
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    mq.removeEventListener("change", onSystem);
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useTheme() {
  const pref = useSyncExternalStore(subscribe, readPref, () => "system" as ThemePref);
  const setPref = useCallback((next: ThemePref) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Private mode: the theme still applies for this page view.
    }
    applyTheme(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { pref, setPref };
}
