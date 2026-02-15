/** Enterprise booking pricing: base + fuel 10% + insurance 1.5% of declared value + fragile ₦500 + VAT 7.5%. */

const BASE_RATE = 500;
const PER_KG_RATE = 150;
const FUEL_SURCHARGE_RATE = 0.1;
const INSURANCE_RATE = 0.015;
const VAT_RATE = 0.075;
const FRAGILE_FEE = 500;

export interface BookingPriceBreakdown {
  baseShipping: number;
  fuelSurcharge: number;
  insurance: number;
  fragileFee: number;
  subtotalBeforeVat: number;
  vat: number;
  grandTotal: number;
}

export function calculateBookingPrice(
  weightKg: number,
  options: {
    declaredValue?: number;
    premiumInsurance?: boolean;
    fragile?: boolean;
  } = {}
): BookingPriceBreakdown {
  const { declaredValue = 0, premiumInsurance = false, fragile = false } = options;

  const baseShipping = Math.round(BASE_RATE + weightKg * PER_KG_RATE);
  const fuelSurcharge = Math.round(baseShipping * FUEL_SURCHARGE_RATE);
  const insurance = premiumInsurance && declaredValue > 0
    ? Math.round(declaredValue * INSURANCE_RATE)
    : 0;
  const fragileFee = fragile ? FRAGILE_FEE : 0;

  const subtotalBeforeVat = baseShipping + fuelSurcharge + insurance + fragileFee;
  const vat = Math.round(subtotalBeforeVat * VAT_RATE);
  const grandTotal = subtotalBeforeVat + vat;

  return {
    baseShipping,
    fuelSurcharge,
    insurance,
    fragileFee,
    subtotalBeforeVat,
    vat,
    grandTotal,
  };
}
