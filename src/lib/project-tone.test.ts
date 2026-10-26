import { describe, expect, it } from "vitest";
import { projectHue, projectToneStyle } from "./project-tone";

describe("projectHue", () => {
  it("gives a project the same colour every time", () => {
    expect(projectHue("hs2zvo4exzrv3ax")).toBe(projectHue("hs2zvo4exzrv3ax"));
  });

  it("spreads different projects across the palette", () => {
    const ids = ["a1", "b2", "c3", "d4", "e5", "f6", "g7", "h8", "i9", "j10"];
    expect(new Set(ids.map(projectHue)).size).toBeGreaterThan(3);
  });

  it("uses a neutral grey for no project", () => {
    expect(projectHue(null)).toBe(projectHue(undefined));
    expect(projectHue(null)).not.toBe(projectHue("a1"));
  });
});

describe("projectToneStyle", () => {
  it("mixes fill and ink against the theme surface", () => {
    const style = projectToneStyle("a1") as Record<string, string>;
    expect(style["--bar"]).toBe(projectHue("a1"));
    expect(style["--fill"]).toContain("var(--cal-bg)");
    expect(style["--ink"]).toContain("var(--cal-title)");
  });
});
