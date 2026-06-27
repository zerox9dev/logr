import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase-server";
import type { ProjectSuggestion } from "@/domain/suggest-session";

// LLM fallback for project suggestion. The client tries a local history match
// first (src/domain/suggest-session.ts) and only calls this when that's
// inconclusive. Self-hosters without ANTHROPIC_API_KEY get null here and keep
// the history-only experience — the feature degrades gracefully.

export const runtime = "nodejs";

const Body = z.object({
  text: z.string().min(1).max(500),
  projects: z.array(z.object({ id: z.string(), name: z.string() })).max(200),
  recentNames: z.array(z.string()).max(50).optional(),
});

// What we ask Claude to return. `projectId` is validated against the supplied
// list before we trust it.
const Suggestion = z.object({
  projectId: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

export async function POST(request: NextRequest) {
  // Gate on an authenticated session so this isn't an open LLM proxy.
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ suggestion: null });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const { text, projects, recentNames = [] } = parsed.data;
  if (projects.length === 0) return NextResponse.json({ suggestion: null });

  const client = new Anthropic({ apiKey });

  const projectList = projects.map((p) => `- ${p.id}: ${p.name}`).join("\n");
  const recent = recentNames.length
    ? `\nRecent time-entry descriptions (most recent first), for context on the user's style:\n${recentNames.map((n) => `- ${n}`).join("\n")}`
    : "";

  try {
    const response = await client.messages.parse({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      system:
        "You map a freelancer's short time-entry description to one of their existing projects. " +
        "Choose the single best-matching projectId from the list, or null if none clearly fits. " +
        "Be conservative: only pick a project when the description plausibly belongs to it. " +
        "confidence is your certainty from 0 to 1.",
      messages: [
        {
          role: "user",
          content: `Projects:\n${projectList}${recent}\n\nNew time-entry description:\n"${text}"\n\nWhich project does this belong to?`,
        },
      ],
      output_config: { format: zodOutputFormat(Suggestion) },
    });

    const out = response.parsed_output;
    const projectId = out?.projectId && projects.some((p) => p.id === out.projectId)
      ? out.projectId
      : null;

    const suggestion: ProjectSuggestion | null = projectId
      ? { projectId, confidence: out!.confidence, source: "llm" }
      : null;

    return NextResponse.json({ suggestion });
  } catch (err) {
    // Never block entry creation on a suggestion failure.
    console.error("[suggest] LLM call failed:", err);
    return NextResponse.json({ suggestion: null });
  }
}
