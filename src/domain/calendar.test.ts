import { describe, expect, it } from "vitest";
import {
  atMinutes,
  createRange,
  dayKey,
  layoutDay,
  MIN_SECONDS,
  movedStart,
  overlapSeconds,
  resizedSeconds,
  shiftAnchor,
  snap,
  spanOnDay,
  visibleDays,
} from "./calendar";

const day = new Date(2026, 9, 21); // Wed 21 Oct 2026, local

describe("visibleDays", () => {
  it("shows a Monday-based week for 7", () => {
    const days = visibleDays(day, 7);
    expect(days).toHaveLength(7);
    expect(dayKey(days[0])).toBe("2026-10-19");
    expect(dayKey(days[6])).toBe("2026-10-25");
  });

  it("starts at the anchor for shorter views", () => {
    expect(visibleDays(day, 3).map(dayKey)).toEqual(["2026-10-21", "2026-10-22", "2026-10-23"]);
  });

  it("steps by one screen", () => {
    expect(dayKey(shiftAnchor(day, 7, 1))).toBe("2026-10-28");
    expect(dayKey(shiftAnchor(day, 1, -1))).toBe("2026-10-20");
  });
});

describe("snap", () => {
  it("rounds to the nearest quarter hour", () => {
    expect(snap(7)).toBe(0);
    expect(snap(8)).toBe(15);
    expect(snap(52)).toBe(45);
    expect(snap(53)).toBe(60);
  });
});

describe("spanOnDay", () => {
  it("places a session in minutes past midnight", () => {
    const span = spanOnDay("a", atMinutes(day, 9 * 60), 90 * 60, day);
    expect(span).toEqual({ id: "a", start: 540, end: 630 });
  });

  it("clips a session that crosses midnight to each day", () => {
    const start = atMinutes(day, 23 * 60);
    const next = new Date(2026, 9, 22);
    expect(spanOnDay("a", start, 2 * 3600, day)).toEqual({ id: "a", start: 1380, end: 1440 });
    expect(spanOnDay("a", start, 2 * 3600, next)).toEqual({ id: "a", start: 0, end: 60 });
  });

  it("returns null for another day", () => {
    expect(spanOnDay("a", atMinutes(day, 600), 3600, new Date(2026, 9, 23))).toBeNull();
  });

  it("draws a zero-length session as a minute", () => {
    expect(spanOnDay("a", atMinutes(day, 600), 0, day)).toEqual({ id: "a", start: 600, end: 601 });
  });
});

describe("layoutDay", () => {
  const byId = (xs: ReturnType<typeof layoutDay>) => Object.fromEntries(xs.map((x) => [x.id, x]));

  it("gives a lone span the full width", () => {
    expect(layoutDay([{ id: "a", start: 60, end: 120 }])[0]).toMatchObject({ column: 0, columns: 1 });
  });

  it("splits overlapping spans and reuses freed columns", () => {
    const out = byId(
      layoutDay([
        { id: "a", start: 0, end: 120 },
        { id: "b", start: 30, end: 60 },
        { id: "c", start: 60, end: 90 },
      ]),
    );
    expect(out.a).toMatchObject({ column: 0, columns: 2 });
    expect(out.b).toMatchObject({ column: 1, columns: 2 });
    expect(out.c).toMatchObject({ column: 1, columns: 2 });
  });

  it("keeps back-to-back spans full width", () => {
    const out = byId(
      layoutDay([
        { id: "a", start: 0, end: 60 },
        { id: "b", start: 60, end: 120 },
      ]),
    );
    expect(out.a.columns).toBe(1);
    expect(out.b.columns).toBe(1);
  });

  it("sizes each cluster on its own", () => {
    const out = byId(
      layoutDay([
        { id: "a", start: 0, end: 60 },
        { id: "b", start: 0, end: 60 },
        { id: "c", start: 0, end: 60 },
        { id: "d", start: 120, end: 180 },
      ]),
    );
    expect(out.c).toMatchObject({ column: 2, columns: 3 });
    expect(out.d).toMatchObject({ column: 0, columns: 1 });
  });
});

describe("movedStart", () => {
  it("shifts by whole days and minutes", () => {
    const start = atMinutes(day, 9 * 60);
    const out = movedStart(start, 2, -30);
    expect(dayKey(out)).toBe("2026-10-23");
    expect(out.getHours() * 60 + out.getMinutes()).toBe(8 * 60 + 30);
  });

  it("keeps the wall-clock time across days", () => {
    const start = atMinutes(day, 14 * 60);
    const out = movedStart(start, -10, 0);
    expect(out.getHours()).toBe(14);
    expect(out.getMinutes()).toBe(0);
  });

  it("does not mutate its input", () => {
    const start = atMinutes(day, 600);
    movedStart(start, 1, 15);
    expect(start.getTime()).toBe(atMinutes(day, 600).getTime());
  });
});

describe("resizedSeconds", () => {
  it("adds the dragged minutes", () => {
    expect(resizedSeconds(3600, 30)).toBe(5400);
    expect(resizedSeconds(3600, -15)).toBe(2700);
  });

  it("never goes below the snap step", () => {
    expect(resizedSeconds(1800, -60)).toBe(MIN_SECONDS);
  });
});

describe("createRange", () => {
  it("orders a range dragged upwards", () => {
    expect(createRange(600, 540, true)).toEqual({ start: 540, end: 600 });
  });

  it("gives a click an hour", () => {
    expect(createRange(540, 540, false)).toEqual({ start: 540, end: 600 });
  });

  it("stops at midnight", () => {
    expect(createRange(1410, 1410, false)).toEqual({ start: 1410, end: 1440 });
  });

  it("ignores a drag shorter than the snap step", () => {
    expect(createRange(540, 540, true)).toBeNull();
  });
});

describe("spanOnDay across DST", () => {
  // Europe/Kyiv springs forward on 29 Mar 2026: 03:00 becomes 04:00.
  it("places a session at its wall-clock hour on a 23-hour day", () => {
    const prev = process.env.TZ;
    process.env.TZ = "Europe/Kyiv";
    try {
      const dstDay = new Date(2026, 2, 29);
      const noon = new Date(2026, 2, 29, 12, 0);
      expect(spanOnDay("a", noon, 3600, dstDay)).toEqual({ id: "a", start: 720, end: 780 });
    } finally {
      // Assigning undefined would set the string "undefined" and skew later tests.
      if (prev === undefined) delete process.env.TZ;
      else process.env.TZ = prev;
    }
  });
});

describe("overlapSeconds", () => {
  const from = new Date(2026, 9, 21);
  const to = new Date(2026, 9, 22);

  it("counts a session fully inside the range", () => {
    expect(overlapSeconds(atMinutes(day, 600), 3600, from, to)).toBe(3600);
  });

  it("counts only the part inside the range", () => {
    expect(overlapSeconds(atMinutes(day, 23 * 60), 2 * 3600, from, to)).toBe(3600);
    expect(overlapSeconds(new Date(2026, 9, 19, 22, 0), 30 * 3600, from, to)).toBe(4 * 3600);
  });

  it("keeps a short session at its real length", () => {
    expect(overlapSeconds(atMinutes(day, 600), 10, from, to)).toBe(10);
  });

  it("is zero outside the range", () => {
    expect(overlapSeconds(new Date(2026, 9, 23, 9, 0), 3600, from, to)).toBe(0);
  });
});
