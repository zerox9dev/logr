import { afterEach, describe, expect, it, vi } from "vitest";
import { isSecureRequest, SESSION_MAX_AGE, setSessionCookie } from "./session-cookie";

const headers = (h: Record<string, string>) => ({ get: (name: string) => h[name.toLowerCase()] ?? null });

describe("isSecureRequest", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("trusts a terminating proxy's x-forwarded-proto first", () => {
    expect(isSecureRequest(headers({ "x-forwarded-proto": "https", origin: "http://x" }))).toBe(true);
    expect(isSecureRequest(headers({ "x-forwarded-proto": "http, https" }))).toBe(false);
  });

  it("reads the scheme off the browser's Origin", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isSecureRequest(headers({ origin: "http://192.168.1.20:3000" }))).toBe(false);
    expect(isSecureRequest(headers({ origin: "https://logr.example" }))).toBe(true);
  });

  it("serves a production build over plain HTTP without Secure (no proxy, APP_URL unset)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_URL", "");
    expect(isSecureRequest(headers({ origin: "http://192.168.1.20:3000" }))).toBe(false);
  });

  it("lets the browser's Origin win over APP_URL, since a Secure cookie on an http:// page is dropped", () => {
    vi.stubEnv("APP_URL", "https://logr.example");
    expect(isSecureRequest(headers({ origin: "http://logr.example" }))).toBe(false);
    expect(isSecureRequest(headers({}))).toBe(true);
  });

  it("falls back to APP_URL, then to the production default", () => {
    vi.stubEnv("APP_URL", "http://intranet");
    expect(isSecureRequest(headers({}))).toBe(false);
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(isSecureRequest(headers({ origin: "null" }))).toBe(true);
  });
});

describe("setSessionCookie", () => {
  const token = (exp?: number) => {
    const payload = Buffer.from(JSON.stringify(exp === undefined ? {} : { exp })).toString("base64");
    return encodeURIComponent(JSON.stringify({ token: `h.${payload}.s` }));
  };
  const write = (value: string) => {
    const set = vi.fn();
    setSessionCookie({ set }, value, true);
    return set.mock.calls[0][2] as { maxAge: number; secure: boolean };
  };

  it("lives exactly as long as its token", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(write(token(now + 3600)).maxAge).toBeGreaterThan(3590);
    expect(write(token(now + 3600)).maxAge).toBeLessThanOrEqual(3600);
  });

  it("is cleared, not kept for a week, when the token has already expired", () => {
    expect(write(token(Math.floor(Date.now() / 1000) - 60)).maxAge).toBe(0);
  });

  it("falls back to a week only when the expiry cannot be read", () => {
    expect(write(token()).maxAge).toBe(SESSION_MAX_AGE);
    expect(write("not-a-cookie").maxAge).toBe(SESSION_MAX_AGE);
  });
});
