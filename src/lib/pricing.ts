import type { ShipmentType } from "@/types";

/**
 * Default rates per kg in NGN. In production, load from PricingRates table.
 */
const DEFAULT_RATES: Record<ShipmentType, number> = {
  LOCAL: 500,
  INTERNATIONAL: 2000,
};

export function getRatePerKg(type: ShipmentType): number {
  return DEFAULT_RATES[type];
}

export function calculateShipmentPrice(
  weightKg: number,
  type: ShipmentType
): { amount: number; currency: string; ratePerKg: number } {
  if (weightKg <= 0) {
    return { amount: 0, currency: "NGN", ratePerKg: getRatePerKg(type) };
  }
  const ratePerKg = getRatePerKg(type);
  const amount = Math.round(weightKg * ratePerKg * 100) / 100;
  return { amount, currency: "NGN", ratePerKg };
}
