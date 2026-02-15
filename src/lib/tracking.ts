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
 * Validate format DMX-XXXX or DMX-XXXX-XXXX (case insensitive)
 */
export function isValidTrackingFormat(trackingId: string): boolean {
  return /^DMX-[A-Z0-9]{4}(-[A-Z0-9]{4})?$/i.test(trackingId.trim());
}
