import { fmtCompactNumber } from "./format";

describe("fmtCompactNumber", () => {
  it("A1: 0 → '0'", () => {
    expect(fmtCompactNumber(0)).toBe("0");
  });

  it("A2: 999 → '999'", () => {
    expect(fmtCompactNumber(999)).toBe("999");
  });

  it("A3: 1000 → '1k'", () => {
    expect(fmtCompactNumber(1000)).toBe("1k");
  });

  it("A4: 1234 → '1.2k'", () => {
    expect(fmtCompactNumber(1234)).toBe("1.2k");
  });

  it("A5: 1500 → '1.5k'", () => {
    expect(fmtCompactNumber(1500)).toBe("1.5k");
  });

  it("A6: 1000000 → '1M'", () => {
    expect(fmtCompactNumber(1000000)).toBe("1M");
  });

  it("A7: 1500000 → '1.5M'", () => {
    expect(fmtCompactNumber(1500000)).toBe("1.5M");
  });

  it("A8: 12300000 → '12.3M'", () => {
    expect(fmtCompactNumber(12300000)).toBe("12.3M");
  });

  it("A9: 2000000 → '2M' (no trailing .0)", () => {
    expect(fmtCompactNumber(2000000)).toBe("2M");
  });

  it("A10: fmtCompactNumber is importable (no throw on import)", () => {
    expect(typeof fmtCompactNumber).toBe("function");
  });
});
