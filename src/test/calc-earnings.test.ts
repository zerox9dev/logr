import { describe, it, expect } from "vitest";

interface Session {
  duration_seconds: number;
  rate: number;
  billing_type: string;
  payment_status: string;
}

function calcEarnings(sessions: Session[], onlyPaid: boolean): number {
  return sessions.reduce((sum, e) => {
    if (e.billing_type !== "hourly") return sum;
    if (onlyPaid && e.payment_status !== "paid") return sum;
    if (e.rate <= 0) return sum;
    return sum + (e.duration_seconds / 3600) * e.rate;
  }, 0);
}

const sessions: Session[] = [
  { duration_seconds: 3600, rate: 20, billing_type: "hourly", payment_status: "unpaid" },
  { duration_seconds: 7200, rate: 20, billing_type: "hourly", payment_status: "paid" },
  { duration_seconds: 1800, rate: 20, billing_type: "hourly", payment_status: "paid" },
  { duration_seconds: 3600, rate: 0, billing_type: "hourly", payment_status: "paid" },
  { duration_seconds: 3600, rate: 20, billing_type: "fixed", payment_status: "paid" },
  { duration_seconds: 3600, rate: 20, billing_type: "non-billable", payment_status: "unpaid" },
];

describe("calcEarnings", () => {
  it("Earnings = only hourly sessions with rate > 0", () => {
    const result = calcEarnings(sessions, false);
    // Session 1: 1h × $20 = $20
    // Session 2: 2h × $20 = $40
    // Session 3: 0.5h × $20 = $10
    // Session 4: rate=0, skip
    // Session 5: fixed, skip
    // Session 6: non-billable, skip
    expect(result).toBe(70);
  });

  it("Paid = only hourly + paid sessions", () => {
    const result = calcEarnings(sessions, true);
    // Session 2: 2h × $20 = $40
    // Session 3: 0.5h × $20 = $10
    expect(result).toBe(50);
  });

  it("empty sessions = 0", () => {
    expect(calcEarnings([], false)).toBe(0);
    expect(calcEarnings([], true)).toBe(0);
  });

  it("all non-billable = 0", () => {
    const nonBillable: Session[] = [
      { duration_seconds: 3600, rate: 50, billing_type: "fixed", payment_status: "paid" },
      { duration_seconds: 7200, rate: 30, billing_type: "non-billable", payment_status: "paid" },
    ];
    expect(calcEarnings(nonBillable, false)).toBe(0);
  });

  it("unpaid sessions excluded from paid calc", () => {
    const allUnpaid: Session[] = [
      { duration_seconds: 3600, rate: 20, billing_type: "hourly", payment_status: "unpaid" },
      { duration_seconds: 3600, rate: 20, billing_type: "hourly", payment_status: "unpaid" },
    ];
    expect(calcEarnings(allUnpaid, false)).toBe(40);
    expect(calcEarnings(allUnpaid, true)).toBe(0);
  });
});
