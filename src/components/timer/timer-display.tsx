import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, StopCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project, TimeEntry } from "@/types";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface TimerDisplayProps {
  projects: Project[];
  onSave: (entry: Omit<TimeEntry, "id">) => void;
}

export function TimerDisplay({ projects, onSave }: TimerDisplayProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [billable, setBillable] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStart = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = new Date();
    }
    setIsRunning(true);
  }, [isRunning]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleStop = useCallback(() => {
    if (seconds > 0) {
      onSave({
        description: description || "Untitled",
        projectId: projectId || null,
        duration: seconds,
        startedAt: startTimeRef.current || new Date(),
        billable,
      });
    }
    setIsRunning(false);
    setSeconds(0);
    setDescription("");
    setProjectId("");
    setBillable(true);
    startTimeRef.current = null;
  }, [seconds, description, projectId, billable, onSave]);

  const handleDiscard = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
    setDescription("");
    startTimeRef.current = null;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (isRunning) handlePause();
        else handleStart();
      }
      if (e.code === "Escape" && (isRunning || seconds > 0)) {
        e.preventDefault();
        handleDiscard();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning, seconds, handleStart, handlePause, handleDiscard]);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isRunning) handleStart();
          }}
        />

        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-36 bg-transparent text-sm outline-none border-l border-border pl-4"
        >
          <option value="">No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <button
          onClick={() => setBillable(!billable)}
          className={`flex items-center justify-center h-8 w-8 rounded-md border transition-colors ${
            billable
              ? "border-emerald-500 text-emerald-600 bg-emerald-50"
              : "border-border text-muted-foreground"
          }`}
          title={billable ? "Billable" : "Non-billable"}
        >
          <DollarSign className="h-3.5 w-3.5" />
        </button>

        <div className="font-mono text-2xl font-bold tabular-nums min-w-[120px] text-center">
          {formatTime(seconds)}
        </div>

        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button size="icon" onClick={handleStart} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Play className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" variant="secondary" onClick={handlePause}>
              <Pause className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={handleStop} disabled={seconds === 0}>
            <StopCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground px-1">
        <kbd className="px-1 py-0.5 rounded border border-border text-[10px]">Space</kbd> start/pause · <kbd className="px-1 py-0.5 rounded border border-border text-[10px]">Esc</kbd> discard
      </p>
    </div>
  );
}
