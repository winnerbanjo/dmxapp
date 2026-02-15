/** DMX Pricing Engine — demo/static data for API, CSV, and Manual rates. */
import { STATIC_ISO } from "@/lib/demo-date";

export type PricingSource = "api" | "csv" | "manual";

export interface ApiPricingConfig {
  connected: boolean;
  endpoint: string;
  lastSync: string | null;
}

export interface ManualRate {
  id: string;
  origin: string;
  destination: string;
  basePrice: number;
  perKgPrice: number;
  currency: "NGN" | "USD";
}

export interface PricingState {
  api: ApiPricingConfig;
  csvLastUploaded: string | null;
  manualRates: ManualRate[];
}

/** Demo API config — Connected to DML API */
export const INITIAL_API_CONFIG: ApiPricingConfig = {
  connected: true,
  endpoint: "https://api.dml-logistics.ng/v1/rates",
  lastSync: STATIC_ISO,
};

/** Demo manual rates for common routes (Lagos ↔ Abuja, etc.) */
export const DEMO_MANUAL_RATES: ManualRate[] = [
  { id: "1", origin: "Lagos", destination: "Abuja", basePrice: 2500, perKgPrice: 180, currency: "NGN" },
  { id: "2", origin: "Lagos", destination: "Port Harcourt", basePrice: 2200, perKgPrice: 150, currency: "NGN" },
  { id: "3", origin: "Abuja", destination: "Lagos", basePrice: 2500, perKgPrice: 180, currency: "NGN" },
  { id: "4", origin: "Abuja", destination: "Kano", basePrice: 1800, perKgPrice: 120, currency: "NGN" },
  { id: "5", origin: "Lagos", destination: "Ibadan", basePrice: 1200, perKgPrice: 80, currency: "NGN" },
  { id: "6", origin: "Lagos", destination: "Accra (GH)", basePrice: 15000, perKgPrice: 800, currency: "NGN" },
  { id: "7", origin: "Lagos", destination: "London (UK)", basePrice: 25000, perKgPrice: 1200, currency: "USD" },
];

/** Extract city from address string (e.g. "Lekki Phase 1, Lagos" → "Lagos"). */
export function extractCityFromAddress(address: string): string | null {
  if (!address?.trim()) return null;
  const parts = address.split(",").map((p) => p.trim());
  const last = parts[parts.length - 1];
  return last || null;
}

/**
 * Get pricing for Live Quote — static demo: prefer manual rates by route, else fallback to default.
 * origin/destination are city names (e.g. Lagos, Abuja). For structured addresses use
 * getPricingCityFromAddress(state, lga) from @/data/address-constants so CSV/Merchant Rate Cards key by LGA/State.
 */
export function getQuoteForRoute(
  origin: string,
  destination: string,
  weightKg: number,
  express = false
): { baseFare: number; perKg: number; total: number } {
  const rate = DEMO_MANUAL_RATES.find(
    (r) =>
      r.origin.toLowerCase() === origin.toLowerCase() &&
      r.destination.toLowerCase() === destination.toLowerCase()
  );
  const base = rate?.basePrice ?? 500;
  const perKg = rate?.perKgPrice ?? 150;
  const raw = base + weightKg * perKg;
  const total = Math.round(express ? raw * 1.5 : raw);
  return { baseFare: Math.round(base + weightKg * perKg), perKg, total };
}
