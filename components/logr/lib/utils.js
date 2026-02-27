export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export const SUPPORTED_CURRENCIES = ["UAH", "USD", "PLN", "EUR"];

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

export function normalizeCurrency(currency) {
  return SUPPORTED_CURRENCIES.includes(currency) ? currency : "USD";
}

export function formatMoney(amount, currency = "USD") {
  const value = Number.isFinite(amount) ? amount : parseFloat(amount || 0);
  return `${normalizeCurrency(currency)} ${value.toFixed(2)}`;
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function durationFromHoursMinutes(hours, minutes) {
  return parseInt(hours || 0, 10) * 3600 + parseInt(minutes || 0, 10) * 60;
}

export function earnedFromDuration(duration, rate) {
  return parseFloat(((duration / 3600) * parseFloat(rate || 0)).toFixed(2));
}

export function formatInvoiceNumber(year, count) {
  return `INV-${year}-${String(count).padStart(3, "0")}`;
}
