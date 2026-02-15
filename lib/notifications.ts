/**
 * Luxury Notification Engine — Email (Nodemailer) + WhatsApp nudge.
 * Templates: Shipment Booked, Status Updated. Left-aligned, elegant, clear CTA.
 */

import nodemailer from "nodemailer";
import { getTrackUrl } from "./whatsapp-url";

const APP_NAME = "DMX Logistics";

/** Email transporter (Nodemailer). Set SMTP in env. */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    return null;
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const baseEmailStyles = `
  font-family: 'Georgia', serif;
  color: #1a1a1a;
  line-height: 1.6;
  max-width: 560px;
  text-align: left;
`;
const ctaStyle =
  "display: inline-block; margin-top: 24px; padding: 14px 28px; background: #1e3a5f; color: #fff; text-decoration: none; font-weight: 600; letter-spacing: 0.02em;";

/** Send 'Shipment Booked' email — luxury style, left-aligned, clear CTA */
export async function sendShipmentBookedEmail(params: {
  to: string;
  recipientName: string;
  trackingId: string;
  merchantName?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP not configured; skipping shipment booked email.");
    return { ok: false, error: "SMTP not configured" };
  }
  const trackUrl = getTrackUrl(params.trackingId);
  const html = `
    <div style="${baseEmailStyles}">
      <p>Dear ${params.recipientName},</p>
      <p>Your shipment has been booked with ${APP_NAME}.</p>
      <p><strong>Tracking ID:</strong> ${params.trackingId}</p>
      <p>You can follow the delivery journey at the link below.</p>
      <a href="${trackUrl}" style="${ctaStyle}">Track your shipment</a>
      <p style="margin-top: 32px; color: #666; font-size: 14px;">— ${APP_NAME}</p>
    </div>
  `;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"${APP_NAME}" <noreply@dmx-logistics.com>`,
      to: params.to,
      subject: "Your DMX package is on the way",
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error("sendShipmentBookedEmail error:", err);
    return { ok: false, error: String(err) };
  }
}

/** Send 'Status Updated' email — subject: "Your DMX Package is moving" */
export async function sendStatusUpdatedEmail(params: {
  to: string;
  recipientName: string;
  trackingId: string;
  status: string;
}): Promise<{ ok: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { ok: false, error: "SMTP not configured" };
  }
  const trackUrl = getTrackUrl(params.trackingId);
  const html = `
    <div style="${baseEmailStyles}">
      <p>Dear ${params.recipientName},</p>
      <p>Your DMX package is moving.</p>
      <p><strong>Tracking ID:</strong> ${params.trackingId}</p>
      <p><strong>Status:</strong> ${params.status}</p>
      <a href="${trackUrl}" style="${ctaStyle}">View delivery journey</a>
      <p style="margin-top: 32px; color: #666; font-size: 14px;">— ${APP_NAME}</p>
    </div>
  `;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"${APP_NAME}" <noreply@dmx-logistics.com>`,
      to: params.to,
      subject: "Your DMX Package is moving",
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error("sendStatusUpdatedEmail error:", err);
    return { ok: false, error: String(err) };
  }
}
