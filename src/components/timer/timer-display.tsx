import { useState, useEffect, useRef } from "react";
import { Play, Pause, StopCircle } from "lucide-react";
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<Date | null>(null);

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

  const handleStart = () => {
    if (!isRunning) {
      startTimeRef.current = new Date();
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    if (seconds > 0) {
      onSave({
        description: description || "Untitled",
        projectId: projectId || null,
        duration: seconds,
        startedAt: startTimeRef.current || new Date(),
      });
    }
    setIsRunning(false);
    setSeconds(0);
    setDescription("");
    setProjectId("");
    startTimeRef.current = null;
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <input
        type="text"
        placeholder="What are you working on?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none"
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
  );
}
