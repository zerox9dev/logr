import type { CSSProperties } from "react";

/**
 * Projects carry no colour of their own, so each one gets a stable hue from
 * its id. The bar is the hue itself; fill and ink are mixed against the
 * calendar surface, so the same chip reads right in the light and dark theme.
 */
const HUES = ["#3b7be8", "#2e9b5f", "#7a5ae0", "#d98b1a", "#e8604c", "#0e9aa7", "#c2509b"] as const;
const NO_PROJECT = "#8a8a85";

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function projectHue(projectId: string | null | undefined): string {
  return projectId ? HUES[hash(projectId) % HUES.length] : NO_PROJECT;
}

/** CSS variables for a chip in this project's colour: `--bar`, `--fill`, `--ink`. */
export function projectToneStyle(projectId: string | null | undefined): CSSProperties {
  const hue = projectHue(projectId);
  return {
    "--bar": hue,
    "--fill": `color-mix(in srgb, ${hue} 16%, var(--cal-bg))`,
    "--ink": `color-mix(in srgb, ${hue} 62%, var(--cal-title))`,
  } as CSSProperties;
}
