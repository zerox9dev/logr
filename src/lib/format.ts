// Presentation formatters — single source of truth for money/time/date strings.

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** "3 hr 26 min", "2 hr 06 min", "55 min". Units default to English. */
export function fmtDuration(seconds: number, units: { hr: string; min: string } = { hr: "hr", min: "min" }): string {
  const total = Math.max(0, Math.round(seconds / 60));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h} ${units.hr} ${pad2(m)} ${units.min}` : `${m} ${units.min}`;
}

/** Compact duration "3h 26m" / "26m" — used in reports/CSV. */
export function fmtDurationCompact(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** "02:47:18" — live timer clock. */
export function fmtClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

/** "$222.50", "$1,890.00". Accepts an optional currency code (ISO 4217).
 *  Falls back to "USD" when omitted so existing call sites stay stable. */
export function fmtMoney(n: number, currency = "USD"): string {
  return n.toLocaleString(undefined, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDateLong(d: Date, locale = "en-US"): string {
  return d.toLocaleDateString(locale, {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

export function getCurrencySymbol(currency: string): string {
  return { USD: "$", EUR: "€", GBP: "£", UAH: "₴", PLN: "zł" }[currency] || "$";
}
