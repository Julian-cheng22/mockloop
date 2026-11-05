// Local-time date helpers. Never use `new Date().toISOString().slice(0, 10)` for "today":
// that is the UTC date, which is already tomorrow on a US evening (AGENTS.md §4).

const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a Date as a local YYYY-MM-DD string. */
export function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today's local date as YYYY-MM-DD. */
export function todayLocal(now: Date = new Date()): string {
  return toLocalDateString(now);
}

/** Parses YYYY-MM-DD as a local date at midnight. Returns null if invalid. */
export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(y, m - 1, d);
  // Reject overflow such as 2026-02-30 → Mar 2
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

/** True if a YYYY-MM-DD date is after today's local date. */
export function isFutureDate(value: string, now: Date = new Date()): boolean {
  return value > todayLocal(now);
}

const displayFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

/** "2026-10-18" → "Sun, Oct 18". Returns the input unchanged if it isn't a valid date. */
export function formatDisplayDate(value: string): string {
  const date = parseLocalDate(value);
  return date ? displayFormat.format(date) : value;
}
