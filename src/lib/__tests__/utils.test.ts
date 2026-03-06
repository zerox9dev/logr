import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn (className merge)", () => {
  it("merges simple classes", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("handles undefined/null/false", () => {
    expect(cn("text-sm", undefined, null, false, "font-bold")).toBe("text-sm font-bold");
  });

  it("deduplicates tailwind conflicts", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe("base active");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
  });

  it("handles array-like input", () => {
    expect(cn(["text-sm", "font-bold"])).toBe("text-sm font-bold");
  });
});
