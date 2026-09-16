import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";

// Regression guard: the app was migrated off Supabase onto self-hosted
// PocketBase (see README "PocketBase Setup"). This test fails the build if
// any *application* source file re-introduces a Supabase import or client
// reference, so a future dependency add / copy-paste from old code doesn't
// silently resurrect the old backend.
//
// One historical reference is intentionally allowed: the comment in
// src/api/agent-tools.ts documenting the removed Supabase-Auth-backed MCP
// OAuth flow. Everything else under src/ — including marketing and blog copy —
// is scanned.

const SRC_ROOT = join(__dirname); // this file lives at src/, so __dirname === src

const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".mdx"]);

// Exact files that are allowed to mention Supabase in a comment because they
// document the (removed) legacy MCP OAuth design, not a live import.
const ALLOWED_COMMENT_FILES = new Set(["api/agent-tools.ts"]);

function walk(dir: string, relBase: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = relBase ? `${relBase}/${entry}` : entry;
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      walk(abs, rel, files);
    } else if (CODE_EXTENSIONS.has(extname(entry)) && entry !== "no-supabase-imports.test.ts") {
      files.push(rel);
    }
  }
  return files;
}

describe("no live Supabase code paths remain", () => {
  const files = walk(SRC_ROOT, "");

  it("found source files to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("contains no @supabase import or SupabaseClient reference", () => {
    const offenders: string[] = [];
    for (const rel of files) {
      const content = readFileSync(join(SRC_ROOT, rel), "utf8");
      if (/@supabase|SupabaseClient|createClient\(.*supabase/i.test(content)) {
        offenders.push(rel);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("contains no stray 'supabase' text outside documented legacy references", () => {
    const offenders: string[] = [];
    for (const rel of files) {
      if (ALLOWED_COMMENT_FILES.has(rel)) continue;
      const content = readFileSync(join(SRC_ROOT, rel), "utf8");
      if (/supabase/i.test(content)) {
        offenders.push(rel);
      }
    }
    expect(offenders).toEqual([]);
  });
});
