/**
 * DMX Pricing Logic — reusable for Quick Quote, Booking, and API.
 * Backend-engineer friendly: pure functions, easy to unit test.
 */

export type ZoneId = "1" | "2" | "3" | "4";

export interface ZoneRateRow {
  weightKg: number;
  zone1: number;
  zone2: number;
  zone3: number;
  zone4: number;
}

/** Default zone rate sheet — carrier cost in NGN. */
export const DEFAULT_ZONE_RATES: ZoneRateRow[] = [
  { weightKg: 0.5, zone1: 29372.63, zone2: 15200, zone3: 34760.8, zone4: 31245.2 },
  { weightKg: 1, zone1: 32500, zone2: 16800, zone3: 38500, zone4: 34800 },
  { weightKg: 2, zone1: 39500, zone2: 20400, zone3: 46800, zone4: 42200 },
  { weightKg: 5, zone1: 57500, zone2: 29800, zone3: 68200, zone4: 61500 },
  { weightKg: 10, zone1: 84800, zone2: 43900, zone3: 100500, zone4: 90600 },
  { weightKg: 20, zone1: 135500, zone2: 70100, zone3: 160700, zone4: 144900 },
];

export const DEFAULT_PROFIT_MARKUP_PERCENT = 20;

/** Country → Zone mapping (normalized lowercase keys). */
const COUNTRY_TO_ZONE: Record<string, ZoneId> = {
  uk: "1", "united kingdom": "1", ireland: "1",
  ghana: "2", cameroon: "2", senegal: "2", nigeria: "2",
  usa: "3", canada: "3", mexico: "3", "united states": "3",
  australia: "4", "new zealand": "4",
};

/** Get zone ID from country name. */
export function getZoneFromCountry(country: string): ZoneId | null {
  const key = String(country).trim().toLowerCase();
  if (!key) return null;
  return COUNTRY_TO_ZONE[key] ?? null;
}

/** Find carrier cost for weight + zone. Uses nearest weight row. */
export function getCarrierCostForZone(weightKg: number, zoneId: ZoneId, rates = DEFAULT_ZONE_RATES): number {
  const zoneKey = `zone${zoneId}` as keyof ZoneRateRow;
  if (!Number.isFinite(weightKg) || weightKg <= 0) return 0;

  const sorted = [...rates].sort((a, b) => a.weightKg - b.weightKg);
  let best = sorted[0];
  for (const row of sorted) {
    if (row.weightKg >= weightKg) {
      best = row;
      break;
    }
    best = row;
  }
  return Math.round((best[zoneKey] as number) ?? 0);
}

/** Selling price = Cost × (1 + markup/100). */
export function applyMarkup(cost: number, markupPercent: number): number {
  if (!Number.isFinite(cost) || !Number.isFinite(markupPercent)) return 0;
  return Math.round(cost * (1 + markupPercent / 100));
}

/** Quick Quote: compute international price from origin, destination, weight. */
export function computeQuickQuote(
  origin: string,
  destination: string,
  weightKg: number,
  markupPercent = DEFAULT_PROFIT_MARKUP_PERCENT
): { amount: number; zoneId: ZoneId | null } {
  const zone = getZoneFromCountry(destination) ?? getZoneFromCountry(origin);
  if (!zone) return { amount: 0, zoneId: null };
  const cost = getCarrierCostForZone(weightKg, zone);
  const amount = applyMarkup(cost, markupPercent);
  return { amount, zoneId: zone };
}
