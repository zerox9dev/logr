import { describe, it, expect } from "vitest";
import type { Client } from "@/types/database";
import { impliedHourlyRate } from "./employer";

function client(over: Partial<Client> = {}): Client {
  return {
    id: "c1", user_id: "u1", name: "Acme",
    email: null, phone: null, company: null, address: null, country: null,
    website: null, tags: [], notes: null,
    client_type: "client", salary_amount: null, salary_period: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

describe("impliedHourlyRate", () => {
  it("returns null for a regular client", () => {
    expect(impliedHourlyRate(client({ salary_amount: 6000, salary_period: "monthly" }), 40)).toBeNull();
  });

  it("returns null for an employer with no salary", () => {
    expect(impliedHourlyRate(client({ client_type: "employer" }), 40)).toBeNull();
  });

  it("returns null when no client is given", () => {
    expect(impliedHourlyRate(undefined, 40)).toBeNull();
  });

  it("converts a monthly salary", () => {
    const rate = impliedHourlyRate(
      client({ client_type: "employer", salary_amount: 6000, salary_period: "monthly" }),
      40,
    );
    expect(rate).toBeCloseTo(6000 / ((40 * 52) / 12), 10);
    expect(rate).toBeCloseTo(34.6153846, 6);
  });

  it("converts an annual salary", () => {
    expect(
      impliedHourlyRate(client({ client_type: "employer", salary_amount: 104000, salary_period: "annual" }), 40),
    ).toBeCloseTo(50, 10);
  });

  it("passes an hourly salary through", () => {
    expect(
      impliedHourlyRate(client({ client_type: "employer", salary_amount: 55, salary_period: "hourly" }), 40),
    ).toBe(55);
  });

  it("falls back to a 40-hour week when the weekly goal is unset", () => {
    expect(
      impliedHourlyRate(client({ client_type: "employer", salary_amount: 104000, salary_period: "annual" }), null),
    ).toBeCloseTo(50, 10);
  });

  it("scales with a non-default weekly goal", () => {
    expect(
      impliedHourlyRate(client({ client_type: "employer", salary_amount: 104000, salary_period: "annual" }), 20),
    ).toBeCloseTo(100, 10);
  });

  it("returns null for a zero-hour week rather than dividing by zero", () => {
    expect(
      impliedHourlyRate(client({ client_type: "employer", salary_amount: 6000, salary_period: "monthly" }), 0),
    ).toBeNull();
  });
});
