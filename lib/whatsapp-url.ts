/**
 * Client-safe: build WhatsApp share URL. No Node/nodemailer deps.
 */

const APP_URL = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : (typeof window !== "undefined" ? window.location?.origin : "https://dmx-logistics.com");

export function getTrackUrl(trackingId: string): string {
  return `${APP_URL}/track/${encodeURIComponent(trackingId)}`;
}

export function getWhatsAppUpdateUrl(params: {
  receiverPhone: string;
  trackingId: string;
  status: string;
  receiverName: string;
}): string {
  const { receiverPhone, trackingId, status, receiverName } = params;
  const trackLink = getTrackUrl(trackingId);
  const text = encodeURIComponent(
    `Hello ${receiverName}, your DMX shipment ${trackingId} has been ${status}. Track it here: ${trackLink}`
  );
  const phone = receiverPhone.replace(/\D/g, "");
  const waNumber = phone.startsWith("0") ? "234" + phone.slice(1) : phone.length === 10 ? "234" + phone : phone;
  return `https://wa.me/${waNumber}?text=${text}`;
}
