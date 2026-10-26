// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Project, Session } from "@/types/database";

const toast = vi.fn();
const addSession = vi.fn();

const projects: Project[] = [
  {
    id: "p1", user_id: "u1", client_id: "c1", name: "Website", billing_type: "hourly",
    rate: 80, fixed_budget: null, status: "active", jira_avatar_url: null, created_at: "",
  },
  {
    id: "p2", user_id: "u1", client_id: "c1", name: "Audit", billing_type: "fixed",
    rate: 120, fixed_budget: null, status: "active", jira_avatar_url: null, created_at: "",
  },
];
let sessions: Pick<Session, "project_id">[] = [];

/** The slice of the data layer the tracker reads: real timer state, fake I/O. */
function useFakeAppData() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [timerDescription, setTimerDescription] = useState("");
  return {
    sessions,
    settings: { default_rate: 50, weekly_goal_hours: null },
    getProjectById: (id: string | null) => projects.find((p) => p.id === id),
    getClientById: () => undefined,
    addSession,
    timerRunning, setTimerRunning,
    timerSeconds, setTimerSeconds,
    timerStartedAt, setTimerStartedAt,
    timerDescription, setTimerDescription,
  };
}

vi.mock("@/contexts/data-context", () => ({ useAppData: () => useFakeAppData() }));
vi.mock("@/components/ui/toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/i18n", () => ({ useT: () => (key: string) => key }));

const { TrackerProvider, useTracker } = await import("./tracker-context");

const wrapper = ({ children }: { children: ReactNode }) => <TrackerProvider>{children}</TrackerProvider>;

describe("useTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 21, 9, 0));
    sessions = [{ project_id: "p2" }];
    addSession.mockReset().mockResolvedValue({});
    toast.mockReset();
  });

  afterEach(() => vi.useRealTimers());

  it("tracks against the latest session's project until one is picked", async () => {
    const { result } = renderHook(() => useTracker(), { wrapper });
    expect(result.current.projectId).toBe("p2");
    await act(() => result.current.setProjectId("p1"));
    expect(result.current.projectId).toBe("p1");
    await act(() => result.current.setProjectId(null));
    expect(result.current.projectId).toBeNull();
  });

  it("ticks from the wall clock while running", () => {
    const { result } = renderHook(() => useTracker(), { wrapper });
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5_000));
    expect(result.current.running).toBe(true);
    expect(result.current.seconds).toBe(5);
  });

  it("saves the stretch on stop, at the project's rate, and resets", async () => {
    const { result } = renderHook(() => useTracker(), { wrapper });
    await act(() => result.current.setProjectId("p1"));
    act(() => result.current.setDescription("Homepage"));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(90_000));
    await act(() => result.current.stop());

    expect(addSession).toHaveBeenCalledTimes(1);
    expect(addSession.mock.calls[0][0]).toMatchObject({
      project_id: "p1",
      client_id: "c1",
      name: "Homepage",
      duration_seconds: 90,
      rate: 80,
      billing_type: "hourly",
    });
    expect(new Date(addSession.mock.calls[0][0].started_at)).toEqual(new Date(2026, 9, 21, 9, 0));
    expect(result.current.running).toBe(false);
    expect(result.current.seconds).toBe(0);
    expect(result.current.description).toBe("");
    expect(toast).toHaveBeenCalledWith(expect.any(String), "success");
  });

  it("falls back to the default rate without a project", async () => {
    const { result } = renderHook(() => useTracker(), { wrapper });
    await act(() => result.current.setProjectId(null));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3_000));
    await act(() => result.current.stop());
    expect(addSession.mock.calls[0][0]).toMatchObject({ project_id: null, rate: 50 });
  });

  it("saves nothing when stopped before a second has passed", async () => {
    const { result } = renderHook(() => useTracker(), { wrapper });
    act(() => result.current.start());
    await act(() => result.current.stop());
    expect(addSession).not.toHaveBeenCalled();
  });

  it("keeps the description when the save fails", async () => {
    addSession.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useTracker(), { wrapper });
    act(() => result.current.setDescription("Homepage"));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10_000));
    await act(() => result.current.stop());
    expect(result.current.description).toBe("Homepage");
    expect(toast).toHaveBeenCalledWith("track.saveFailed", "error");
  });

  it("keeps the timer running from the same start when the save fails", async () => {
    addSession.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useTracker(), { wrapper });
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(25 * 60_000));
    await act(() => result.current.stop());

    expect(result.current.running).toBe(true);
    expect(result.current.startedAt).toBe(new Date(2026, 9, 21, 9, 0).getTime());
    act(() => vi.advanceTimersByTime(1_000));
    expect(result.current.seconds).toBe(25 * 60 + 1);

    // A retry then saves the whole stretch.
    await act(() => result.current.stop());
    expect(addSession.mock.calls[1][0]).toMatchObject({ duration_seconds: 25 * 60 + 1 });
  });

  it("logs a manual stretch at the chosen project's rate", async () => {
    const { result } = renderHook(() => useTracker(), { wrapper });
    const start = new Date(2026, 9, 20, 14, 0);
    await act(() => result.current.logSession("p2", "Review", start, 5400));
    expect(addSession.mock.calls[0][0]).toMatchObject({
      project_id: "p2",
      name: "Review",
      duration_seconds: 5400,
      rate: 120,
      billing_type: "fixed",
    });
    expect(new Date(addSession.mock.calls[0][0].started_at)).toEqual(start);
  });

  it("splits the run when the project changes mid-way, billing each part at its own rate", async () => {
    const { result } = renderHook(() => useTracker(), { wrapper });
    await act(() => result.current.setProjectId("p1"));
    act(() => result.current.setDescription("Homepage"));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(60 * 60_000));
    await act(() => result.current.setProjectId("p2"));

    // The hour so far stays on p1 at $80, not rebilled to p2 at $120.
    expect(addSession).toHaveBeenCalledTimes(1);
    expect(addSession.mock.calls[0][0]).toMatchObject({ project_id: "p1", rate: 80, duration_seconds: 3600 });
    expect(result.current.running).toBe(true);
    expect(result.current.projectId).toBe("p2");
    expect(result.current.seconds).toBe(0);

    act(() => vi.advanceTimersByTime(30 * 60_000));
    await act(() => result.current.stop());
    expect(addSession.mock.calls[1][0]).toMatchObject({ project_id: "p2", rate: 120, duration_seconds: 1800 });
    expect(new Date(addSession.mock.calls[1][0].started_at)).toEqual(new Date(2026, 9, 21, 10, 0));
  });

  it("undoes the switch when saving the first part fails", async () => {
    const { result } = renderHook(() => useTracker(), { wrapper });
    await act(() => result.current.setProjectId("p1"));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10 * 60_000));
    addSession.mockRejectedValueOnce(new Error("offline"));
    await act(() => result.current.setProjectId("p2"));

    expect(result.current.projectId).toBe("p1");
    expect(result.current.running).toBe(true);
    expect(result.current.startedAt).toBe(new Date(2026, 9, 21, 9, 0).getTime());
    expect(toast).toHaveBeenCalledWith("track.saveFailed", "error");
  });

  it("switches without saving when the timer is idle", async () => {
    const { result } = renderHook(() => useTracker(), { wrapper });
    await act(() => result.current.setProjectId("p1"));
    expect(addSession).not.toHaveBeenCalled();
    expect(result.current.projectId).toBe("p1");
  });
});
