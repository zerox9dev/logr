import { describe, expect, it } from "vitest";
import { localDateStr, timeStr } from "./date";

describe("localDateStr", () => {
  it("formats the local calendar date, zero-padded", () => {
    expect(localDateStr(new Date(2026, 0, 5, 9, 0))).toBe("2026-01-05");
  });

  it("uses the local day even late at night", () => {
    // toISOString would roll this over to the next UTC day east of Greenwich.
    expect(localDateStr(new Date(2026, 9, 21, 23, 59))).toBe("2026-10-21");
  });
});

describe("timeStr", () => {
  it("formats local hours and minutes, zero-padded", () => {
    expect(timeStr(new Date(2026, 9, 21, 7, 5))).toBe("07:05");
    expect(timeStr(new Date(2026, 9, 21, 23, 45))).toBe("23:45");
  });
});
