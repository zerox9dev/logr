// Pure date helpers — single source of truth for day/week/month boundaries.
// Week starts on Monday throughout the app.

export interface Range {
  start: Date;
  end: Date;
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Start of the Monday-based week containing `d`. */
export function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  return x;
}

export function startOfMonth(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Current local time as an "HH:MM" string (for <input type="time"> defaults). */
export function nowTimeStr(): string {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** True when `iso` falls in [r.start, r.end). */
export function inRange(iso: string, r: Range): boolean {
  const t = new Date(iso).getTime();
  return t >= r.start.getTime() && t < r.end.getTime();
}
