/**
 * DMX Zone-Based Cost Engine — Pricing Structure.
 * Links Country → Zone and provides rate lookup by weight.
 * Static demo data for presentation.
 */

/** Zone identifiers matching CSV columns. */
export type ZoneId = "1" | "2" | "3" | "4";

/** Zone column headers in the rate sheet. */
export const ZONE_LABELS: Record<ZoneId, string> = {
  "1": "UK (Zone 1)",
  "2": "West Africa (Zone 2)",
  "3": "Canada & USA (Zone 3)",
  "4": "Australia (Zone 4)",
};

/** Country → Zone mapping (from Pricing Structure). Smart Zone Search. */
export const COUNTRY_TO_ZONE: Record<string, ZoneId> = {
  // Zone 1 — UK
  uk: "1",
  "united kingdom": "1",
  greatbritain: "1",
  "great britain": "1",
  england: "1",
  scotland: "1",
  wales: "1",
  "northern ireland": "1",
  ireland: "1",

  // Zone 2 — West Africa
  cameroon: "2",
  ghana: "2",
  senegal: "2",
  "côte d'ivoire": "2",
  "ivory coast": "2",
  benin: "2",
  togo: "2",
  nigeria: "2", // domestic origin; can receive from other zones
  burkinafaso: "2",
  "burkina faso": "2",
  mali: "2",
  niger: "2",
  gambia: "2",
  "sierra leone": "2",
  sierraleone: "2",
  liberia: "2",
  equatorialguinea: "2",
  "equatorial guinea": "2",
  gabon: "2",
  congo: "2",

  // Zone 3 — Canada & USA
  usa: "3",
  "united states": "3",
  "united states of america": "3",
  unitedstates: "3",
  america: "3",
  canada: "3",
  mexico: "3",

  // Zone 4 — Australia & Oceania
  australia: "4",
  "new zealand": "4",
  newzealand: "4",
  fiji: "4",
  "papua new guinea": "4",
  papuanewguinea: "4",
  samoa: "4",
  "solomon islands": "4",
  solomonislands: "4",
};

/** Rate sheet row: weight → cost per zone (carrier cost in NGN). */
export interface ZoneRateRow {
  weightKg: number;
  zone1: number; // UK
  zone2: number; // West Africa
  zone3: number; // Canada & USA
  zone4: number; // Australia
}

/** Default zone rate sheet — matches 0.5kg UK = 29372.63 and scales. */
export const DEMO_ZONE_RATES: ZoneRateRow[] = [
  { weightKg: 0.5, zone1: 29372.63, zone2: 15200, zone3: 34760.8, zone4: 31245.2 },
  { weightKg: 1, zone1: 32500, zone2: 16800, zone3: 38500, zone4: 34800 },
  { weightKg: 1.5, zone1: 36500, zone2: 18900, zone3: 43200, zone4: 38900 },
  { weightKg: 2, zone1: 39500, zone2: 20400, zone3: 46800, zone4: 42200 },
  { weightKg: 2.5, zone1: 41000, zone2: 21200, zone3: 48500, zone4: 43800 },
  { weightKg: 3, zone1: 44800, zone2: 23200, zone3: 53100, zone4: 47800 },
  { weightKg: 4, zone1: 51200, zone2: 26500, zone3: 60700, zone4: 54700 },
  { weightKg: 5, zone1: 57500, zone2: 29800, zone3: 68200, zone4: 61500 },
  { weightKg: 7.5, zone1: 71200, zone2: 36800, zone3: 84400, zone4: 76100 },
  { weightKg: 10, zone1: 84800, zone2: 43900, zone3: 100500, zone4: 90600 },
  { weightKg: 15, zone1: 110200, zone2: 57000, zone3: 130600, zone4: 117800 },
  { weightKg: 20, zone1: 135500, zone2: 70100, zone3: 160700, zone4: 144900 },
];

/** Profit markup (default 20%). Admin-configurable. */
export const DEFAULT_PROFIT_MARKUP_PERCENT = 20;

/** Get zone ID from country name (Smart Zone Search). */
export function getZoneFromCountry(country: string): ZoneId | null {
  const key = country.trim().toLowerCase();
  if (!key) return null;
  return COUNTRY_TO_ZONE[key] ?? null;
}

/** Find carrier cost for weight + zone. Uses nearest weight row. */
export function getCarrierCostForZone(weightKg: number, zoneId: ZoneId): number {
  const zoneKey = `zone${zoneId}` as keyof ZoneRateRow;
  if (weightKg <= 0) return 0;

  const sorted = [...DEMO_ZONE_RATES].sort((a, b) => a.weightKg - b.weightKg);
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

/** Selling price = Cost * (1 + markup/100). */
export function applyMarkup(cost: number, markupPercent: number): number {
  return Math.round(cost * (1 + markupPercent / 100));
}
