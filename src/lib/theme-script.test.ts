// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { THEME_KEY, THEME_SCRIPT } from "./theme-script";

function run(path: string, stored: string | null, systemDark = false) {
  window.history.replaceState(null, "", path);
  // The test document has an opaque origin, so jsdom gives it no storage.
  vi.stubGlobal("localStorage", { getItem: (k: string) => (k === THEME_KEY ? stored : null) });
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: systemDark && q.includes("dark") }));
  delete document.documentElement.dataset.theme;
  new Function(THEME_SCRIPT)();
  return document.documentElement.dataset.theme;
}

describe("THEME_SCRIPT", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("applies a stored theme on /app", () => {
    expect(run("/app", "dark")).toBe("dark");
    expect(run("/app/sessions", "light", true)).toBe("light");
  });

  it("follows the system when nothing is stored", () => {
    expect(run("/app", null, true)).toBe("dark");
    expect(run("/app", "system", false)).toBe("light");
  });

  it("leaves every other page alone", () => {
    expect(run("/", "dark")).toBeUndefined();
    expect(run("/blog", "dark")).toBeUndefined();
    expect(run("/application", "dark")).toBeUndefined();
  });
});
