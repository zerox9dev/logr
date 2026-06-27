import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase-server";
import { agentTools, agentToolByName, type ToolContext } from "@/api/agent-tools";

// In-app conversational layer over the shared tool registry.
//
// Runs an Anthropic tool-use loop server-side, dispatching tool calls to the
// SAME handlers the MCP server exposes (src/api/agent-tools.ts), scoped to the
// signed-in user's RLS Supabase client. Destructive tools (deletes) pause the
// loop: the route returns `type: "confirm"` and the client must re-POST with
// the tool-use id in `approvedToolIds` (or `declinedToolIds` to cancel).

export const runtime = "nodejs";

const MAX_STEPS = 8;

const Body = z.object({
  messages: z.array(z.any()).min(1).max(100),
  approvedToolIds: z.array(z.string()).optional(),
  declinedToolIds: z.array(z.string()).optional(),
});

const SYSTEM = [
  "You are Logr's in-app assistant. Logr is a time-tracking and invoicing app for freelancers.",
  "Help the user inspect and manage their clients, projects, time sessions, and invoices using the provided tools.",
  "Be concise. Prefer doing the work over describing it. When a tool returns ids, you don't need to repeat raw UUIDs back to the user unless asked.",
  "To act on a named client/project, first look it up (list_clients / list_projects) to get its id.",
  "Deletions require the user's explicit confirmation, which the app handles — just call the tool when asked.",
].join(" ");

/** Zod raw shape → Anthropic tool input schema. */
function toInputSchema(shape: z.ZodRawShape): Anthropic.Tool.InputSchema {
  const js = z.toJSONSchema(z.object(shape)) as Record<string, unknown>;
  delete js.$schema;
  return js as Anthropic.Tool.InputSchema;
}

const anthropicTools: Anthropic.Tool[] = agentTools.map((t) => ({
  name: t.name,
  description: t.description,
  input_schema: toInputSchema(t.schema),
}));

function errorResult(id: string, text: string): Anthropic.ToolResultBlockParam {
  return { type: "tool_result", tool_use_id: id, content: text, is_error: true };
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ type: "disabled" });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const messages = parsed.data.messages as Anthropic.MessageParam[];
  const approved = new Set(parsed.data.approvedToolIds ?? []);
  const declined = new Set(parsed.data.declinedToolIds ?? []);
  const ctx: ToolContext = { supabase, userId: user.id };
  const client = new Anthropic({ apiKey });

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const last = messages[messages.length - 1];
      const pending =
        last?.role === "assistant" && Array.isArray(last.content)
          ? last.content.filter(
              (b): b is Anthropic.ToolUseBlockParam => b.type === "tool_use",
            )
          : [];

      // Resolve a pending assistant tool-use turn (first call after Claude asks,
      // or a confirm/cancel re-entry from the client).
      if (pending.length > 0) {
        const needsConfirm = pending.filter((b) => {
          const tool = agentToolByName.get(b.name);
          return tool?.destructive && !approved.has(b.id) && !declined.has(b.id);
        });
        if (needsConfirm.length > 0) {
          return NextResponse.json({
            type: "confirm",
            messages,
            pending: needsConfirm.map((b) => ({ id: b.id, name: b.name, input: b.input })),
          });
        }

        const results = await Promise.all(
          pending.map(async (b): Promise<Anthropic.ToolResultBlockParam> => {
            const tool = agentToolByName.get(b.name);
            if (!tool) return errorResult(b.id, `Unknown tool: ${b.name}`);
            if (tool.destructive && declined.has(b.id)) {
              return errorResult(b.id, "User declined this action.");
            }
            try {
              const args = z.object(tool.schema).parse(b.input ?? {});
              const text = await tool.handler(args, ctx);
              return { type: "tool_result", tool_use_id: b.id, content: text };
            } catch (e) {
              return errorResult(b.id, e instanceof Error ? e.message : "Tool failed");
            }
          }),
        );
        messages.push({ role: "user", content: results });
        continue;
      }

      // Otherwise ask Claude for the next step.
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: SYSTEM,
        tools: anthropicTools,
        messages,
      });
      messages.push({ role: "assistant", content: response.content });

      if (!response.content.some((b) => b.type === "tool_use")) {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        return NextResponse.json({ type: "message", messages, text });
      }
    }

    return NextResponse.json({
      type: "message",
      messages,
      text: "I stopped after several steps without finishing — could you narrow the request?",
    });
  } catch (err) {
    console.error("[chat] failed:", err);
    return NextResponse.json({ error: "chat_failed" }, { status: 500 });
  }
}
