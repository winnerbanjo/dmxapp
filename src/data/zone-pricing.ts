/**
 * DMX Zone-Based Cost Engine — Pricing Structure.
 * Re-exports logic from @/lib/logic for backward compatibility.
 * Zone labels and extended country mapping for UI.
 */
import {
  getCarrierCostForZone as _getCarrierCostForZone,
  applyMarkup as _applyMarkup,
  DEFAULT_PROFIT_MARKUP_PERCENT as _DEFAULT_PROFIT_MARKUP_PERCENT,
  DEFAULT_ZONE_RATES,
  type ZoneId,
} from "@/lib/logic/pricing";

export type { ZoneId };

/** Zone column headers in the rate sheet. */
export const ZONE_LABELS: Record<ZoneId, string> = {
  "1": "UK (Zone 1)",
  "2": "West Africa (Zone 2)",
  "3": "Canada & USA (Zone 3)",
  "4": "Australia (Zone 4)",
};

/** Country → Zone mapping (extended for Smart Zone Search). */
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

/** Extended zone rates (includes more weight tiers for UI). */
const EXTENDED_RATES = [
  ...DEFAULT_ZONE_RATES,
  { weightKg: 1.5, zone1: 36500, zone2: 18900, zone3: 43200, zone4: 38900 },
  { weightKg: 2.5, zone1: 41000, zone2: 21200, zone3: 48500, zone4: 43800 },
  { weightKg: 3, zone1: 44800, zone2: 23200, zone3: 53100, zone4: 47800 },
  { weightKg: 4, zone1: 51200, zone2: 26500, zone3: 60700, zone4: 54700 },
  { weightKg: 7.5, zone1: 71200, zone2: 36800, zone3: 84400, zone4: 76100 },
  { weightKg: 15, zone1: 110200, zone2: 57000, zone3: 130600, zone4: 117800 },
].sort((a, b) => a.weightKg - b.weightKg);

export const DEFAULT_PROFIT_MARKUP_PERCENT = _DEFAULT_PROFIT_MARKUP_PERCENT;

/** Get zone ID from country name (uses extended COUNTRY_TO_ZONE). */
export function getZoneFromCountry(country: string): ZoneId | null {
  const key = country.trim().toLowerCase();
  if (!key) return null;
  return COUNTRY_TO_ZONE[key] ?? null;
}

export function getCarrierCostForZone(weightKg: number, zoneId: ZoneId): number {
  return _getCarrierCostForZone(weightKg, zoneId, EXTENDED_RATES as Parameters<typeof _getCarrierCostForZone>[2]);
}

export const applyMarkup = _applyMarkup;
