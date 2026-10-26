"use client";

import { useEffect, useState } from "react";
import { Check, FileSpreadsheet, Search, Sparkles } from "lucide-react";
import { fmtClock } from "@/lib/format";
import { useReducedMotion } from "./feature-tabs";
import { EventChip, Keycap, tones, type Tone } from "./primitives";

/*
 * The little scenes inside the feature tabs. Each one plays once from mount —
 * the tab panel remounts it on every switch and on Replay — and shows its
 * final frame straight away under reduced motion.
 */

const card = "rounded-2xl bg-white p-4 shadow-[0_8px_24px_-12px_rgba(20,20,20,0.25)] ring-1 ring-heading/6";

/** Walks through `durations` once and returns the current step index. */
function useSteps(durations: number[]) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= durations.length) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), durations[step]);
    return () => window.clearTimeout(t);
  }, [step, durations]);
  return reduced ? durations.length : step;
}

/** Types `text` out once `start` is true. */
function useTyped(text: string, start = true, speed = 45) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t = window.setInterval(() => {
      setCount((c) => {
        if (c >= text.length) window.clearInterval(t);
        return Math.min(c + 1, text.length);
      });
    }, speed);
    return () => window.clearInterval(t);
  }, [text, start, speed]);
  return reduced ? text : text.slice(0, count);
}

/** Seconds elapsed while `running`, ticking once a second. */
function useTicker(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);
  return seconds;
}

function Caret() {
  return <span className="ml-px inline-block h-[1.05em] w-px animate-pulse bg-coral align-[-0.15em]" />;
}

function ProjectPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = tones[tone];
  return (
    <span
      style={{ backgroundColor: t.fill, color: t.ink }}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
    >
      <span style={{ backgroundColor: t.bar }} className="size-1.5 rounded-full" />
      {children}
    </span>
  );
}

/* ── Track ─────────────────────────────────────────────────────────────── */

const TIMER_STEPS = [900, 250];
const TIMER_BASE = 1 * 3600 + 24 * 60 + 7;

export function TimerDemo() {
  const step = useSteps(TIMER_STEPS);
  const running = step >= 2;
  const seconds = useTicker(running);
  const total = TIMER_BASE + seconds;
  return (
    <div className={`${card} flex flex-col gap-4 p-5`}>
      <div className="flex items-center justify-between">
        <ProjectPill tone="violet">Acme · Website</ProjectPill>
        <span className="text-[12px] text-heading/45">Homepage hero</span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className={`text-[40px] leading-none font-semibold tracking-[-0.03em] tabular-nums ${running ? "text-heading" : "text-heading/35"}`}>
            {fmtClock(running ? total : TIMER_BASE)}
          </p>
          <p className="mt-2 text-[13px] text-heading/55 tabular-nums">
            $80/hr · <span className="font-semibold text-[#1d5e3a]">${((total / 3600) * 80).toFixed(2)} earned</span>
          </p>
        </div>
        <button
          type="button"
          tabIndex={-1}
          className={`h-10 rounded-full px-5 text-[14px] font-semibold text-white transition-[background-color,scale] duration-150 ${
            step === 1 ? "scale-95" : ""
          } ${running ? "bg-coral" : "bg-heading"}`}
        >
          {running ? "Stop" : "Start"}
        </button>
      </div>
      <div className="flex items-center gap-2 border-t border-heading/8 pt-3 text-[12px] text-heading/45">
        <span className={`size-1.5 rounded-full ${running ? "animate-pulse bg-coral" : "bg-heading/25"}`} />
        {running ? "Tracking — every second lands on Acme" : "Ready"}
      </div>
    </div>
  );
}

const MANUAL_STEPS = [500, 900, 900, 700];

export function ManualDemo() {
  const step = useSteps(MANUAL_STEPS);
  const field = (label: string, value: string, active: boolean) => (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-heading/45">{label}</span>
      <span
        className={`flex h-9 items-center rounded-[10px] px-3 text-[13px] tabular-nums ring-1 transition-colors ${
          active ? "bg-white ring-coral/60" : "bg-heading/[0.03] ring-heading/10"
        }`}
      >
        {value}
      </span>
    </div>
  );
  return (
    <div className="flex flex-col gap-3">
      <div className={`${card} flex flex-col gap-3`}>
        <p className="text-[14px] font-semibold">Add time manually</p>
        <div className="grid grid-cols-3 gap-2">
          {field("Date", "Tue, Oct 20", step === 1)}
          {field("From", step >= 2 ? "14:00" : "", step === 2)}
          {field("To", step >= 3 ? "15:30" : "", step === 3)}
        </div>
        <div className="flex items-center justify-between">
          <ProjectPill tone="green">Northwind · Audit</ProjectPill>
          <span className="rounded-full bg-heading px-3.5 py-1.5 text-[12px] font-semibold text-white">Save</span>
        </div>
      </div>
      <div
        className={`${card} flex items-center gap-3 py-3 transition-[opacity,translate] duration-500 ${
          step >= 4 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <span className="text-[11px] text-heading/45 tabular-nums">Tue</span>
        <EventChip tone="green" title="Northwind · Audit" time="14:00 – 15:30 · 1h 30m" className="flex-1" />
      </div>
    </div>
  );
}

const DAY = [
  { start: 9, end: 11.2, tone: "violet" as Tone, label: "Acme" },
  { start: 11.4, end: 12, tone: "amber" as Tone, label: "Call" },
  { start: 13, end: 15.5, tone: "green" as Tone, label: "Northwind" },
  { start: 15.7, end: 16.2, tone: "amber" as Tone, label: "Call" },
  { start: 16.4, end: 18.5, tone: "violet" as Tone, label: "Acme" },
];

const DAY_STEPS = DAY.map(() => 420);

export function TimelineDemo() {
  const step = useSteps(DAY_STEPS);
  const pct = (h: number) => ((h - 9) / 10) * 100;
  return (
    <div className={`${card} flex flex-col gap-4 p-5`}>
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold">Today</p>
        <p className="text-[12px] text-heading/45 tabular-nums">
          {DAY.slice(0, step).reduce((sum, b) => sum + (b.end - b.start), 0).toFixed(1)}h tracked
        </p>
      </div>
      <div className="relative h-9 rounded-[8px] bg-heading/[0.04]">
        {DAY.map((b, i) => (
          <span
            key={i}
            style={{
              left: `${pct(b.start)}%`,
              width: `${pct(b.end) - pct(b.start)}%`,
              backgroundColor: tones[b.tone].fill,
              borderColor: tones[b.tone].bar,
            }}
            className={`absolute inset-y-1 origin-left rounded-[5px] border-l-[3px] transition-[scale,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              i < step ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-heading/40 tabular-nums">
        {["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-heading/8 pt-3">
        <ProjectPill tone="violet">Acme · 4h 20m</ProjectPill>
        <ProjectPill tone="green">Northwind · 2h 30m</ProjectPill>
        <ProjectPill tone="amber">Calls · 1h 05m</ProjectPill>
      </div>
    </div>
  );
}

const COMMANDS = ["New invoice", "Invoices", "Go to Reports", "New client", "Start timer"];

export function CommandDemo() {
  const query = useTyped("inv", true, 260);
  const shown = COMMANDS.filter((c) => c.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className={`${card} overflow-hidden p-0`}>
      <div className="flex items-center gap-2.5 border-b border-heading/8 px-4 py-3">
        <Search className="size-4 text-heading/40" />
        <span className="flex-1 text-[14px]">
          {query}
          <Caret />
        </span>
        <Keycap>⌘K</Keycap>
      </div>
      <ul className="p-1.5">
        {shown.map((c, i) => (
          <li
            key={c}
            className={`flex items-center justify-between rounded-[8px] px-3 py-2 text-[13px] ${
              i === 0 ? "bg-heading/[0.06] font-medium" : "text-heading/65"
            }`}
          >
            {c}
            {i === 0 ? <span className="text-[11px] text-heading/40">↵</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

const IMPORT_STEPS = [700, 1400];

export function ImportDemo() {
  const step = useSteps(IMPORT_STEPS);
  return (
    <div className="flex flex-col gap-3">
      <div className={`${card} flex items-center gap-3`}>
        <span className="flex size-10 items-center justify-center rounded-[10px] bg-[#dff2e6] text-[#2e9b5f]">
          <FileSpreadsheet className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">toggl_detailed_2026.csv</p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-heading/8">
            <span
              className={`block h-full rounded-full bg-[#2e9b5f] transition-[width] duration-[1300ms] ease-out ${
                step >= 1 ? "w-full" : "w-0"
              }`}
            />
          </div>
        </div>
      </div>
      <div
        className={`${card} flex flex-col gap-2.5 transition-[opacity,translate] duration-500 ${
          step >= 2 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {["312 time entries", "9 clients", "24 projects"].map((row) => (
          <p key={row} className="flex items-center gap-2 text-[13px]">
            <Check className="size-3.5 text-[#2e9b5f]" strokeWidth={2.4} />
            {row} <span className="text-heading/45">mapped</span>
          </p>
        ))}
      </div>
    </div>
  );
}

/* ── Bill ──────────────────────────────────────────────────────────────── */

const RATES_STEPS = [350, 350, 350];

export function RatesDemo() {
  const step = useSteps(RATES_STEPS);
  const rows: [string, string, Tone, string][] = [
    ["Acme", "Website", "violet", "$80/hr"],
    ["Acme", "Retainer", "violet", "$65/hr"],
    ["Northwind", "Audit", "green", "$120/hr"],
  ];
  return (
    <div className={`${card} flex flex-col p-0`}>
      <p className="border-b border-heading/8 px-4 py-3 text-[14px] font-semibold">Rates</p>
      {rows.map(([client, project, tone, rate], i) => (
        <div
          key={project}
          className={`flex items-center justify-between border-b border-heading/8 px-4 py-3 transition-[opacity,translate] duration-500 last:border-b-0 ${
            i < step ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
          }`}
        >
          <ProjectPill tone={tone}>
            {client} · {project}
          </ProjectPill>
          <span className="text-[13px] font-semibold tabular-nums">{rate}</span>
        </div>
      ))}
    </div>
  );
}

const LINES = [
  { label: "Homepage hero", hours: 6.5, rate: 80 },
  { label: "Pricing page", hours: 4, rate: 80 },
  { label: "Monthly retainer", hours: 12, rate: 65 },
];

const LINE_STEPS = LINES.map(() => 450);

export function InvoiceDemo() {
  const step = useSteps(LINE_STEPS);
  const total = LINES.slice(0, step).reduce((sum, l) => sum + l.hours * l.rate, 0);
  return (
    <div className={`${card} flex flex-col gap-3 p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.06em] text-heading/45 uppercase">Invoice · Draft</p>
          <p className="mt-1 text-[15px] font-semibold">Acme Inc.</p>
        </div>
        <span className="rounded-full bg-[#fbecd2] px-2.5 py-1 text-[11px] font-semibold text-[#7a4b08]">Unbilled → draft</span>
      </div>
      <div className="flex flex-col">
        {LINES.map((l, i) => (
          <div
            key={l.label}
            className={`flex items-center justify-between border-t border-heading/8 py-2 text-[13px] transition-opacity duration-300 ${
              i < step ? "opacity-100" : "opacity-0"
            }`}
          >
            <span>{l.label}</span>
            <span className="text-heading/55 tabular-nums">
              {l.hours}h × ${l.rate} · <span className="font-semibold text-heading">${(l.hours * l.rate).toFixed(2)}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-heading pt-3">
        <span className="text-[13px] font-semibold">Total</span>
        <span className="text-[20px] font-semibold tracking-[-0.02em] tabular-nums">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

const SHARE_STEPS = [900, 300];

export function ShareDemo() {
  const step = useSteps(SHARE_STEPS);
  return (
    <div className="relative pb-10">
      <div className={`${card} flex flex-col gap-3`}>
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-semibold">INV-0042 · Acme Inc.</p>
          <span className="text-[14px] font-semibold tabular-nums">$1,620.00</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate rounded-[10px] bg-heading/[0.04] px-3 py-2 font-mono text-[11.5px] text-heading/55">
            logr.work/share/invoice?data=…
          </span>
          <span
            className={`rounded-full bg-heading px-3.5 py-2 text-[12px] font-semibold text-white transition-transform duration-150 ${
              step === 1 ? "scale-95" : ""
            }`}
          >
            Copy link
          </span>
        </div>
      </div>
      <div
        className={`absolute right-2 bottom-0 rounded-[12px] bg-heading px-3.5 py-2.5 text-white shadow-[0_16px_32px_-12px_rgba(20,20,20,0.35)] transition-[opacity,translate] duration-300 ${
          step >= 2 ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
        }`}
      >
        <p className="text-[12.5px] font-semibold">Link copied</p>
        <p className="font-mono text-[11px] text-white/60">No account needed to open it</p>
      </div>
    </div>
  );
}

const WEEK = [6.5, 7.2, 4.8, 8.1, 5.4];

const REPORT_STEPS = [200];

export function ReportDemo() {
  const step = useSteps(REPORT_STEPS);
  return (
    <div className={`${card} flex flex-col gap-4 p-5`}>
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold">This week · Acme</p>
        <p className="text-[12px] text-heading/45 tabular-nums">32.0h · $2,560</p>
      </div>
      <div className="flex h-36 items-end gap-3">
        {WEEK.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span
              style={{ height: step >= 1 ? `${(h / 9) * 100}%` : "0%", transitionDelay: `${i * 90}ms` }}
              className="w-full rounded-t-[6px] bg-[#c9b8f0] transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
            <span className="text-[11px] text-heading/45">{["Mon", "Tue", "Wed", "Thu", "Fri"][i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const QUESTION = "How many billable hours for Acme this month?";

export function AssistantDemo() {
  const question = useTyped(QUESTION, true, 38);
  const done = question === QUESTION;
  return (
    <div className="flex flex-col gap-3">
      <div className={`${card} flex items-center gap-2.5 py-3`}>
        <Sparkles className="size-4 shrink-0 text-coral" />
        <span className="flex-1 text-[13px]">
          {question}
          {!done ? <Caret /> : null}
        </span>
      </div>
      <div
        className={`${card} text-[13px] leading-[1.55] text-heading/75 transition-[opacity,translate] duration-500 ${
          done ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <span className="font-semibold text-heading">41h 20m billable</span> across Website and Retainer —
        $3,107 unbilled. Want a draft invoice for it?
      </div>
    </div>
  );
}
