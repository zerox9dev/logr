"use client";

import { useEffect, useRef, useState } from "react";
import type Anthropic from "@anthropic-ai/sdk";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";

// Conversational assistant over the shared MCP tool registry. Talks to
// /api/chat, which runs the tool-use loop server-side. Destructive tools come
// back as a confirm prompt the user must approve before they run.

type PendingTool = { id: string; name: string; input: unknown };

type ChatResponse =
  | { type: "message"; messages: Anthropic.MessageParam[]; text: string }
  | { type: "confirm"; messages: Anthropic.MessageParam[]; pending: PendingTool[] }
  | { type: "disabled" };

/** A line to render in the transcript, derived from the wire messages. */
type Line =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string }
  | { kind: "tool"; name: string };

/** Tools that change data — only these warrant a dashboard reload. */
const MUTATING = /^(create_|update_|delete_|log_time)/;

/** Did any mutating tool run in the messages added after `baseLen`? */
function mutatedSince(messages: Anthropic.MessageParam[], baseLen: number): boolean {
  return messages.slice(baseLen).some(
    (m) =>
      Array.isArray(m.content) &&
      m.content.some((b) => b.type === "tool_use" && MUTATING.test(b.name)),
  );
}

function toLines(messages: Anthropic.MessageParam[]): Line[] {
  const lines: Line[] = [];
  for (const m of messages) {
    if (typeof m.content === "string") {
      if (m.role === "user" || m.role === "assistant") {
        lines.push({ kind: m.role, text: m.content });
      }
      continue;
    }
    for (const b of m.content) {
      if (b.type === "text" && b.text.trim()) {
        lines.push({ kind: m.role === "user" ? "user" : "assistant", text: b.text });
      } else if (b.type === "tool_use") {
        lines.push({ kind: "tool", name: b.name });
      }
      // tool_result blocks are internal plumbing — not shown.
    }
  }
  return lines;
}

export function ChatPanel() {
  const t = useT();
  const { reload } = useAppData();
  const [open, setOpen] = useState(false);
  const [wire, setWire] = useState<Anthropic.MessageParam[]>([]);
  const [pending, setPending] = useState<PendingTool[] | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Length of the wire we posted — new messages beyond this are the turn's result.
  const baseLenRef = useRef(0);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [wire, loading, pending]);

  function applyResponse(data: ChatResponse) {
    if (data.type === "disabled") {
      setNotice(t("chat.disabled"));
      return;
    }
    setWire(data.messages);
    if (data.type === "confirm") {
      setPending(data.pending);
    } else {
      setPending(null);
      // Only refresh the dashboard if this turn actually changed data — a
      // read-only answer ("show unbilled") shouldn't reload the whole screen.
      if (mutatedSince(data.messages, baseLenRef.current)) reload();
    }
  }

  async function post(body: unknown) {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setNotice(res.status === 401 ? t("chat.signIn") : t("chat.error"));
        return;
      }
      applyResponse((await res.json()) as ChatResponse);
    } catch {
      setNotice(t("chat.error"));
    } finally {
      setLoading(false);
    }
  }

  function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Anthropic.MessageParam[] = [...wire, { role: "user", content: text }];
    baseLenRef.current = next.length;
    setWire(next);
    setInput("");
    void post({ messages: next });
  }

  function resolveConfirm(approve: boolean) {
    if (!pending) return;
    const ids = pending.map((p) => p.id);
    baseLenRef.current = 0; // confirmed turn includes the (mutating) tool already in the wire
    setPending(null);
    void post({
      messages: wire,
      approvedToolIds: approve ? ids : [],
      declinedToolIds: approve ? [] : ids,
    });
  }

  const lines = toLines(wire);

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("chat.open")}
        className="fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full bg-money text-xl text-card shadow-lg transition-opacity hover:opacity-90"
      >
        {open ? "✕" : "✨"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col border border-line bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-md font-semibold text-heading">{t("chat.title")}</span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {lines.length === 0 && !notice && (
              <p className="text-md text-muted-foreground">{t("chat.empty")}</p>
            )}
            {lines.map((line, i) =>
              line.kind === "tool" ? (
                <p key={i} className="text-xs text-muted-foreground">
                  ⚙ {line.name}
                </p>
              ) : (
                <div
                  key={i}
                  className={
                    line.kind === "user"
                      ? "ml-auto w-fit max-w-[85%] bg-brand-soft px-3 py-2 text-md text-heading"
                      : "mr-auto w-fit max-w-[85%] whitespace-pre-wrap bg-purple-soft px-3 py-2 text-md text-heading"
                  }
                >
                  {line.text}
                </div>
              ),
            )}

            {pending && (
              <div className="border border-line bg-background p-3 text-md">
                <p className="mb-2 font-semibold text-heading">{t("chat.confirmTitle")}</p>
                <ul className="mb-3 space-y-1 text-muted-foreground">
                  {pending.map((p) => (
                    <li key={p.id}>• {p.name}({JSON.stringify(p.input)})</li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => resolveConfirm(true)}
                    className="bg-red-600 px-3 py-1.5 text-sm font-semibold text-card hover:bg-red-700"
                  >
                    {t("chat.confirm")}
                  </button>
                  <button
                    type="button"
                    onClick={() => resolveConfirm(false)}
                    className="border border-gray-300 px-3 py-1.5 text-sm font-medium text-ink"
                  >
                    {t("chat.cancel")}
                  </button>
                </div>
              </div>
            )}

            {loading && <p className="text-md text-muted-foreground">{t("chat.thinking")}</p>}
            {notice && <p className="text-md text-red-600">{notice}</p>}
          </div>

          <div className="flex items-center gap-2 border-t border-line p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("chat.placeholder")}
              disabled={loading || pending !== null}
              className="min-w-0 flex-1 bg-transparent text-md text-heading placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || pending !== null || !input.trim()}
              className="bg-money px-3 py-1.5 text-sm font-semibold text-card transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {t("chat.send")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
