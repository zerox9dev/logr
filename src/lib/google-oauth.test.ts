import { describe, expect, it } from "vitest";
import { safeNext } from "./google-oauth";

describe("safeNext", () => {
  it("keeps same-origin paths", () => {
    expect(safeNext("/app")).toBe("/app");
    expect(safeNext("/app/sessions?project=1")).toBe("/app/sessions?project=1");
    expect(safeNext("/loginx")).toBe("/loginx");
  });

  it("refuses anything that could leave the site", () => {
    expect(safeNext("https://evil.example")).toBeUndefined();
    expect(safeNext("//evil.example")).toBeUndefined();
    expect(safeNext("/\\evil.example")).toBeUndefined();
    expect(safeNext(null)).toBeUndefined();
  });

  it("refuses /login, which would loop a signed-in visitor", () => {
    expect(safeNext("/login")).toBeUndefined();
    expect(safeNext("/login?next=/app")).toBeUndefined();
    expect(safeNext("/login/")).toBeUndefined();
    expect(safeNext("/login#x")).toBeUndefined();
  });
});
