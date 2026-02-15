"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export interface RateCardRow {
  origin: string;
  destination: string;
  basePrice: number;
  weightRate: number;
  /** Carrier cost (base). When set, selling = costBasePrice * (1 + markupPercent/100). */
  costBasePrice?: number;
  /** Carrier cost per kg. When set with costBasePrice, selling per kg = costWeightRate * (1 + markupPercent/100). */
  costWeightRate?: number;
}

/** International rate row: zone-based. Weight (KG), UK (Zone 1), West Africa (Zone 2), Canada & USA (Zone 3), Australia (Zone 4). */
export interface InternationalRateRow {
  weightKg: number;
  zone1Amount: number;
  zone2Amount: number;
  zone3Amount: number;
  zone4Amount: number;
  /** Legacy: zone label if present */
  zone?: string;
}

/** Movers rate row: Van Size, Base Price, Per KM. */
export interface MoversRateRow {
  vanSize: string;
  basePrice: number;
  perKm: number;
}

/** Per-merchant custom rates (stored separately from global). */
export interface CustomMerchantRates {
  merchantName: string;
  economyRates: RateCardRow[];
  expressRates: RateCardRow[];
  internationalRates: InternationalRateRow[];
  moversRates: MoversRateRow[];
  /** e.g. 10 = 10% off movers total for "The Lagos Paparazzi" */
  moversDiscountPercent?: number;
}

interface RateCardState {
  economyRates: RateCardRow[];
  expressRates: RateCardRow[];
  internationalRates: InternationalRateRow[];
  moversRates: MoversRateRow[];
  /** Admin markup % (e.g. 20). sellingPrice = costPrice * (1 + markupPercent/100). */
  markupPercent: number;
  setMarkupPercent: (p: number) => void;
  customRatesByMerchant: Record<string, CustomMerchantRates>;
  setEconomyRates: (rows: RateCardRow[]) => void;
  setExpressRates: (rows: RateCardRow[]) => void;
  setInternationalRates: (rows: InternationalRateRow[]) => void;
  setMoversRates: (rows: MoversRateRow[]) => void;
  setCustomRatesForMerchant: (merchantId: string, data: CustomMerchantRates) => void;
  getQuote: (origin: string, destination: string, weightKg: number, express: boolean, merchantId?: string) => { baseFare: number; perKg: number; total: number };
  getMoversDiscountPercent: (merchantId?: string) => number;
  getMoversRatesForMerchant: (merchantId?: string) => MoversRateRow[];
  merchantsWithCustomPricing: { merchantId: string; merchantName: string }[];
}

const RateCardContext = createContext<RateCardState | null>(null);

const DEFAULT_BASE = 500;
const DEFAULT_PER_KG = 150;
const EXPRESS_MULTIPLIER = 1.5;

function findRate(rates: RateCardRow[], origin: string, destination: string): RateCardRow | undefined {
  const o = origin.trim().toLowerCase();
  const d = destination.trim().toLowerCase();
  return rates.find(
    (r) => r.origin.trim().toLowerCase() === o && r.destination.trim().toLowerCase() === d
  );
}

const DEFAULT_MARKUP_PERCENT = 20;

export function RateCardProvider({ children }: { children: React.ReactNode }) {
  const [economyRates, setEconomyRates] = useState<RateCardRow[]>([]);
  const [expressRates, setExpressRates] = useState<RateCardRow[]>([]);
  const [internationalRates, setInternationalRates] = useState<InternationalRateRow[]>([]);
  const [moversRates, setMoversRates] = useState<MoversRateRow[]>([]);
  const [markupPercent, setMarkupPercent] = useState<number>(DEFAULT_MARKUP_PERCENT);
  const [customRatesByMerchant, setCustomRatesByMerchantState] = useState<Record<string, CustomMerchantRates>>({});

  const setCustomRatesForMerchant = useCallback((merchantId: string, data: CustomMerchantRates) => {
    setCustomRatesByMerchantState((prev) => ({ ...prev, [merchantId]: data }));
  }, []);

  const getQuote = useCallback(
    (origin: string, destination: string, weightKg: number, express: boolean, merchantId?: string): { baseFare: number; perKg: number; total: number } => {
      const custom = merchantId ? customRatesByMerchant[merchantId] : undefined;
      const rates = custom
        ? (express ? custom.expressRates : custom.economyRates)
        : (express ? expressRates : economyRates);
      const rate = rates.length > 0 ? findRate(rates, origin, destination) : undefined;
      const mul = 1 + markupPercent / 100;
      let base: number;
      let perKg: number;
      if (rate?.costBasePrice != null && rate.costBasePrice > 0) {
        base = rate.costBasePrice * mul;
        perKg = (rate.costWeightRate ?? rate.weightRate ?? DEFAULT_PER_KG) * mul;
      } else {
        base = rate?.basePrice ?? DEFAULT_BASE;
        perKg = rate?.weightRate ?? DEFAULT_PER_KG;
      }
      const raw = base + weightKg * perKg;
      const total = Math.round(express ? raw * EXPRESS_MULTIPLIER : raw);
      const baseFare = Math.round(base + weightKg * perKg);
      return { baseFare, perKg, total };
    },
    [economyRates, expressRates, customRatesByMerchant, markupPercent]
  );

  const getMoversDiscountPercent = useCallback(
    (merchantId?: string): number => {
      if (!merchantId) return 0;
      return customRatesByMerchant[merchantId]?.moversDiscountPercent ?? 0;
    },
    [customRatesByMerchant]
  );

  const getMoversRatesForMerchant = useCallback(
    (merchantId?: string): MoversRateRow[] => {
      if (merchantId && customRatesByMerchant[merchantId]?.moversRates?.length) {
        return customRatesByMerchant[merchantId].moversRates;
      }
      return moversRates;
    },
    [customRatesByMerchant, moversRates]
  );

  const merchantsWithCustomPricing = useMemo(
    () =>
      Object.entries(customRatesByMerchant).map(([merchantId, data]) => ({
        merchantId,
        merchantName: data.merchantName,
      })),
    [customRatesByMerchant]
  );

  const value = useMemo(
    () => ({
      economyRates,
      expressRates,
      internationalRates,
      moversRates,
      markupPercent,
      setMarkupPercent,
      customRatesByMerchant,
      setEconomyRates,
      setExpressRates,
      setInternationalRates,
      setMoversRates,
      setCustomRatesForMerchant,
      getQuote,
      getMoversDiscountPercent,
      getMoversRatesForMerchant,
      merchantsWithCustomPricing,
    }),
    [economyRates, expressRates, internationalRates, moversRates, markupPercent, customRatesByMerchant, setCustomRatesForMerchant, getQuote, getMoversDiscountPercent, getMoversRatesForMerchant, merchantsWithCustomPricing]
  );

  return <RateCardContext.Provider value={value}>{children}</RateCardContext.Provider>;
}

export function useRateCard(): RateCardState {
  const ctx = useContext(RateCardContext);
  if (!ctx) {
    return {
      economyRates: [],
      expressRates: [],
      internationalRates: [],
      moversRates: [],
      markupPercent: DEFAULT_MARKUP_PERCENT,
      setMarkupPercent: () => {},
      customRatesByMerchant: {},
      setEconomyRates: () => {},
      setExpressRates: () => {},
      setInternationalRates: () => {},
      setMoversRates: () => {},
      setCustomRatesForMerchant: () => {},
      getQuote: (origin: string, destination: string, weightKg: number, express: boolean, _merchantId?: string) => {
        const base = DEFAULT_BASE;
        const perKg = DEFAULT_PER_KG;
        const raw = base + weightKg * perKg;
        const total = Math.round(express ? raw * EXPRESS_MULTIPLIER : raw);
        return { baseFare: Math.round(base + weightKg * perKg), perKg, total };
      },
      getMoversDiscountPercent: () => 0,
      getMoversRatesForMerchant: () => [],
      merchantsWithCustomPricing: [],
    };
  }
  return ctx;
}
