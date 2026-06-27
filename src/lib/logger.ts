/**
 * Simple logging utility for backend debugging.
 * Use console.log prefixed with [Component] for Render logs.
 */
const PREFIX = "[DMX]";

export function logShipmentCreated(data: { trackingId: string; userId?: string; merchantId?: string; cost?: number }) {
  console.log(`${PREFIX} Shipment created`, JSON.stringify(data));
}

export function logPaymentSuccess(data: { reference: string; amount: number; userId: string; walletId: string }) {
  console.log(`${PREFIX} Payment success`, JSON.stringify(data));
}

export function logError(component: string, err: unknown) {
  console.error(`${PREFIX} ${component}`, err instanceof Error ? err.message : err);
}
