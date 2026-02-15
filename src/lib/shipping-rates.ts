/**
 * DMX Logistics - Shipping rate calculation
 * Local: Base ₦2000 + ₦500 per KG
 * International: Base ₦15000 + ₦2500 per KG
 */

export type ShipmentType = "LOCAL" | "INTERNATIONAL";

const LOCAL_BASE_NGN = 2000;
const LOCAL_PER_KG_NGN = 500;
const INTERNATIONAL_BASE_NGN = 15000;
const INTERNATIONAL_PER_KG_NGN = 2500;

export interface RateResult {
  amount: number;
  currency: string;
  breakdown: {
    base: number;
    weightCharge: number;
    weightKg: number;
    type: ShipmentType;
  };
}

/**
 * Calculate shipping cost in NGN.
 * @param weightKg - Weight in kilograms (will be rounded up for pricing)
 * @param type - LOCAL or INTERNATIONAL
 */
export function calculateShippingRate(
  weightKg: number,
  type: ShipmentType
): RateResult {
  const weight = Math.max(0, Number(weightKg));
  const effectiveKg = Math.ceil(weight) || 1;

  if (type === "LOCAL") {
    const weightCharge = effectiveKg * LOCAL_PER_KG_NGN;
    const amount = LOCAL_BASE_NGN + weightCharge;
    return {
      amount,
      currency: "NGN",
      breakdown: {
        base: LOCAL_BASE_NGN,
        weightCharge,
        weightKg: effectiveKg,
        type: "LOCAL",
      },
    };
  }

  const weightCharge = effectiveKg * INTERNATIONAL_PER_KG_NGN;
  const amount = INTERNATIONAL_BASE_NGN + weightCharge;
  return {
    amount,
    currency: "NGN",
    breakdown: {
      base: INTERNATIONAL_BASE_NGN,
      weightCharge,
      weightKg: effectiveKg,
      type: "INTERNATIONAL",
    },
  };
}
