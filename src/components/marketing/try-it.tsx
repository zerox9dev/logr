"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, Clock3, FileText, Users } from "lucide-react";
import { fmtClock } from "@/lib/format";
import { timeStr } from "@/lib/date";
import { EventChip, tones, type Tone } from "./primitives";

/**
 * A working miniature of the dashboard: pick a project, start and stop the
 * timer, and the session joins today's list. Nothing leaves the browser.
 */

interface Project {
  client: string;
  name: string;
  rate: number;
  tone: Tone;
}

const PROJECTS: Project[] = [
  { client: "Acme", name: "Website", rate: 80, tone: "violet" },
  { client: "Northwind", name: "Audit", rate: 120, tone: "green" },
  { client: "Globex", name: "Mobile app", rate: 95, tone: "blue" },
  { client: "Initech", name: "Support", rate: 60, tone: "amber" },
];

interface Session {
  project: number;
  start: string;
  seconds: number;
}

const SEED: Session[] = [
  { project: 1, start: "13:00", seconds: 2.5 * 3600 },
  { project: 3, start: "11:30", seconds: 0.5 * 3600 },
  { project: 0, start: "09:00", seconds: 2.2 * 3600 },
];

function duration(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.round((total % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : m ? `${m}m` : `${total}s`;
}

const NAV = [
  { icon: Clock3, label: "Sessions" },
  { icon: Users, label: "Clients" },
  { icon: FileText, label: "Invoices" },
  { icon: BarChart3, label: "Reports" },
];

export function TryIt() {
  const [selected, setSelected] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<Session[]>(SEED);
  // Wall-clock moment the current run began, for the session's time label.
  const startedAt = useRef<Date | null>(null);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  const project = PROJECTS[selected];

  function toggle() {
    if (running && elapsed > 0) {
      const start = startedAt.current ? timeStr(startedAt.current) : "";
      setSessions((list) => [{ project: selected, start, seconds: elapsed }, ...list]);
      setElapsed(0);
    }
    startedAt.current = running ? null : new Date();
    setRunning((r) => !r);
  }

  function pick(i: number) {
    // Switching project mid-run closes the current session and opens a new one.
    if (running && elapsed > 0) {
      toggle();
      startedAt.current = new Date();
      setRunning(true);
    }
    setSelected(i);
  }

  const totalSeconds = sessions.reduce((sum, s) => sum + s.seconds, 0) + elapsed;
  const earned =
    sessions.reduce((sum, s) => sum + (s.seconds / 3600) * PROJECTS[s.project].rate, 0) +
    (elapsed / 3600) * project.rate;

  return (
    <div className="overflow-hidden bg-white">
      <div className="relative flex h-10 items-center border-b border-heading/8 px-4">
        <span className="flex gap-2" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="absolute inset-x-0 text-center text-[12px] text-heading/45">logr.work</span>
      </div>
      <div className="grid grid-cols-[48px_220px_1fr]">
        <div className="flex flex-col items-center gap-1.5 border-r border-heading/8 py-3">
          {NAV.map(({ icon: Icon, label }, i) => (
            <span
              key={label}
              title={label}
              className={`flex size-8 items-center justify-center rounded-lg ${
                i === 0 ? "bg-heading/8 text-heading" : "text-heading/45"
              }`}
            >
              <Icon className="size-4" />
            </span>
          ))}
        </div>

        <div className="border-r border-heading/8 px-4 py-4">
          <p className="text-[13px] font-semibold">Projects</p>
          <ul className="mt-3 flex flex-col gap-0.5">
            {PROJECTS.map((p, i) => (
              <li key={p.name}>
                <button
                  type="button"
                  onClick={() => pick(i)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors ${
                    i === selected ? "bg-heading/[0.06] font-medium text-heading" : "text-heading/70 hover:bg-heading/[0.04]"
                  }`}
                >
                  <span style={{ backgroundColor: tones[p.tone].bar }} className="size-2 shrink-0 rounded-full" />
                  <span className="min-w-0 flex-1 truncate">
                    {p.client} · {p.name}
                  </span>
                  <span className="text-[11px] text-heading/40 tabular-nums">${p.rate}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-heading/8 pt-4">
            <p className="text-[11px] font-medium tracking-[0.06em] text-heading/45 uppercase">Today</p>
            <p className="mt-1.5 text-[22px] font-semibold tracking-[-0.02em] tabular-nums">{duration(totalSeconds)}</p>
            <p className="text-[12px] font-semibold text-[#1d5e3a] tabular-nums">${earned.toFixed(2)} earned</p>
          </div>
        </div>

        <div className="min-w-0 p-5">
          <div className="flex items-center justify-between gap-4 rounded-2xl p-4 ring-1 ring-heading/8">
            <div className="flex min-w-0 items-center gap-4">
              <span
                className={`size-2.5 shrink-0 rounded-full ${running ? "animate-pulse bg-coral" : "bg-heading/20"}`}
              />
              <span
                className={`text-[34px] leading-none font-semibold tracking-[-0.03em] tabular-nums ${
                  running ? "text-heading" : "text-heading/30"
                }`}
              >
                {fmtClock(elapsed)}
              </span>
              <span className="truncate text-[13px] text-heading/55">
                {project.client} · {project.name}
              </span>
            </div>
            <button
              type="button"
              onClick={toggle}
              data-testid="try-it-toggle"
              className={`h-10 shrink-0 cursor-pointer rounded-full px-6 text-[14px] font-semibold text-white transition-[background-color,scale] duration-150 active:scale-[0.97] ${
                running ? "bg-coral" : "bg-heading hover:opacity-85"
              }`}
            >
              {running ? "Stop" : "Start"}
            </button>
          </div>

          <p className="mt-6 text-[13px] font-semibold">Sessions</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {running ? (
              <li className="flex items-center gap-3">
                <span className="w-11 text-[11px] text-coral tabular-nums">now</span>
                <EventChip
                  tone={project.tone}
                  title={`${project.client} · ${project.name}`}
                  time={`Running · ${duration(elapsed)}`}
                  className="flex-1 ring-1 ring-coral/40"
                />
              </li>
            ) : null}
            {sessions.slice(0, running ? 4 : 5).map((s, i) => {
              const p = PROJECTS[s.project];
              return (
                <li key={`${s.start}-${i}`} className="flex items-center gap-3">
                  <span className="w-11 text-[11px] text-heading/40 tabular-nums">{s.start}</span>
                  <EventChip
                    tone={p.tone}
                    title={`${p.client} · ${p.name}`}
                    time={`${duration(s.seconds)} · $${((s.seconds / 3600) * p.rate).toFixed(2)}`}
                    className="flex-1"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
