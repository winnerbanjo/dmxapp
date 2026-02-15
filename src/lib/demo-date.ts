/**
 * Stable date/time for demo to avoid React hydration mismatch between server and client.
 * Use these instead of new Date().toLocaleString() so server and client render the same text.
 */

/** Fixed display string for "current" date/time in UI (Welcome, Last sync, etc.). */
export const STATIC_DISPLAY_DATE = "Feb 15, 2026 | 2:55 PM";

/** Fixed short date only (e.g. for "Last Updated: Feb 15"). */
export const STATIC_DATE_SHORT = "Feb 15, 2026";

/** ISO string used as initial "now" for upload/sync so formatting is consistent. */
export const STATIC_ISO = "2026-02-15T14:55:00.000Z";

const MONTHS: Record<number, string> = {
  0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun",
  6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
};

/**
 * Format for display: "Feb 15, 2026 | 2:55 PM". Deterministic (UTC) so server and client match.
 * Pass no arg or undefined to get STATIC_DISPLAY_DATE.
 */
export function formatDemoDateTime(iso?: string | null): string {
  if (!iso?.trim()) return STATIC_DISPLAY_DATE;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return STATIC_DISPLAY_DATE;
  const mon = MONTHS[d.getUTCMonth()] ?? "Jan";
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  let h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const min = m < 10 ? `0${m}` : String(m);
  return `${mon} ${day}, ${year} | ${h}:${min} ${ampm}`;
}

/**
 * Format date only: "Feb 15, 2026". Deterministic (UTC).
 * Pass no arg to get STATIC_DATE_SHORT.
 */
export function formatDemoDateOnly(iso?: string | null): string {
  if (!iso?.trim()) return STATIC_DATE_SHORT;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return STATIC_DATE_SHORT;
  const mon = MONTHS[d.getUTCMonth()] ?? "Jan";
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  return `${mon} ${day}, ${year}`;
}

/**
 * For track page / journey: "15 Feb 2026, 2:55 PM". Deterministic (UTC).
 */
export function formatDemoDateWithTime(iso: string | null | undefined): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const mon = MONTHS[d.getUTCMonth()] ?? "Jan";
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  let h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const min = m < 10 ? `0${m}` : String(m);
  return `${day} ${mon} ${year}, ${h}:${min} ${ampm}`;
}
