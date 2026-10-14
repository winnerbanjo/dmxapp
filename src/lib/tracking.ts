/**
 * Generate unique tracking ID in format DMX-XXXX-XXXX
 * X = alphanumeric uppercase
 */

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomSegment(length: number): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

/**
 * Generate a tracking ID: DMX-XXXX-XXXX
 */
export function generateTrackingId(): string {
  return `DMX-${randomSegment(4)}-${randomSegment(4)}`;
}

/**
 * Validate format: accepts standard DMX format (DMX-XXXX-XXXX), numeric tracking numbers (e.g. 132721),
 * DHL AWBs (10 digits), or alphanumeric reference codes (3 to 40 chars).
 */
export function isValidTrackingFormat(trackingId: string): boolean {
  if (!trackingId || typeof trackingId !== "string") return false;
  const clean = trackingId.trim();
  return /^[A-Za-z0-9\-_]{3,40}$/.test(clean);
}
