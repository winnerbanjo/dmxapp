import type { DateFilterPeriod } from "@/components/date-filter";

export type HubRow = {
  name: string;
  dailyVolume: number;
  weeklyGrowth: number;
  revenue: number;
  efficiency: number;
};

/** P&L summary for the "Big Three" metrics row. */
export type PnLSummary = {
  totalRevenue: number;
  cogs: number;
  grossProfit: number;
  profitMarginPercent: number;
};

/** Per-hub financial row for the comparison table. */
export type HubFinancialRow = {
  name: string;
  revenue: number;
  operationalCost: number;
  netProfit: number;
  marginPercent: number;
};

/** Today's P&L (base). Other periods scale from this. */
const PNL_TODAY: PnLSummary = {
  totalRevenue: 14_250_000,
  cogs: 8_550_000,
  grossProfit: 5_700_000,
  profitMarginPercent: 40,
};

/** Today's hub financials (base). */
const HUB_FINANCIALS_TODAY: HubFinancialRow[] = [
  { name: "Lagos", revenue: 580_000, operationalCost: 320_000, netProfit: 260_000, marginPercent: 44.8 },
  { name: "Abuja", revenue: 195_000, operationalCost: 110_000, netProfit: 85_000, marginPercent: 43.5 },
  { name: "Kano", revenue: 67_000, operationalCost: 45_000, netProfit: 22_000, marginPercent: 32.8 },
];

/** Static demo data per period for Admin Hub Performance (Layer 1 cards + Layer 2 table). */
const BY_PERIOD: Record<DateFilterPeriod, HubRow[]> = {
  today: [
    { name: "Lagos Hub", dailyVolume: 450, weeklyGrowth: 12, revenue: 580_000, efficiency: 98 },
    { name: "Abuja Hub", dailyVolume: 120, weeklyGrowth: 8, revenue: 195_000, efficiency: 92 },
    { name: "Kano Hub", dailyVolume: 85, weeklyGrowth: 5, revenue: 67_000, efficiency: 89 },
  ],
  yesterday: [
    { name: "Lagos Hub", dailyVolume: 420, weeklyGrowth: 11, revenue: 542_000, efficiency: 97 },
    { name: "Abuja Hub", dailyVolume: 115, weeklyGrowth: 7, revenue: 188_000, efficiency: 91 },
    { name: "Kano Hub", dailyVolume: 80, weeklyGrowth: 5, revenue: 63_000, efficiency: 88 },
  ],
  last7: [
    { name: "Lagos Hub", dailyVolume: 3150, weeklyGrowth: 12, revenue: 4_060_000, efficiency: 98 },
    { name: "Abuja Hub", dailyVolume: 840, weeklyGrowth: 8, revenue: 1_365_000, efficiency: 92 },
    { name: "Kano Hub", dailyVolume: 595, weeklyGrowth: 5, revenue: 469_000, efficiency: 89 },
  ],
  custom: [
    { name: "Lagos Hub", dailyVolume: 1350, weeklyGrowth: 12, revenue: 1_740_000, efficiency: 98 },
    { name: "Abuja Hub", dailyVolume: 360, weeklyGrowth: 8, revenue: 585_000, efficiency: 92 },
    { name: "Kano Hub", dailyVolume: 255, weeklyGrowth: 5, revenue: 201_000, efficiency: 89 },
  ],
};

function getCustomDays(from?: string, to?: string): number {
  if (!from || !to) return 7;
  const a = new Date(from);
  const b = new Date(to);
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(diff + 1, 90));
}

/** Scale factor for period (today=1, yesterday≈0.95, last7=7, custom=days/7). */
function getScaleForPeriod(
  period: DateFilterPeriod,
  customFrom?: string,
  customTo?: string
): number {
  switch (period) {
    case "today":
      return 1;
    case "yesterday":
      return 0.95;
    case "last7":
      return 7;
    case "custom": {
      const days = getCustomDays(customFrom, customTo);
      return days / 7;
    }
  }
}

/** Returns hub rows for the given period. Custom uses customFrom/customTo to scale volume/revenue. */
export function getHubDataForPeriod(
  period: DateFilterPeriod,
  customFrom?: string,
  customTo?: string
): HubRow[] {
  if (period !== "custom") return BY_PERIOD[period];
  const base = BY_PERIOD.last7;
  const days = getCustomDays(customFrom, customTo);
  const scale = days / 7;
  return base.map((row) => ({
    ...row,
    dailyVolume: Math.round(row.dailyVolume * scale),
    revenue: Math.round(row.revenue * scale),
  }));
}

/** Returns P&L summary and hub financial table for the selected period. Date filter updates these instantly. */
export function getFinancialsForPeriod(
  period: DateFilterPeriod,
  customFrom?: string,
  customTo?: string
): { summary: PnLSummary; hubs: HubFinancialRow[] } {
  const scale = getScaleForPeriod(period, customFrom, customTo);
  const summary: PnLSummary = {
    totalRevenue: Math.round(PNL_TODAY.totalRevenue * scale),
    cogs: Math.round(PNL_TODAY.cogs * scale),
    grossProfit: Math.round(PNL_TODAY.grossProfit * scale),
    profitMarginPercent: PNL_TODAY.profitMarginPercent,
  };
  const hubs: HubFinancialRow[] = HUB_FINANCIALS_TODAY.map((h) => ({
    name: h.name,
    revenue: Math.round(h.revenue * scale),
    operationalCost: Math.round(h.operationalCost * scale),
    netProfit: Math.round(h.netProfit * scale),
    marginPercent: h.marginPercent,
  }));
  return { summary, hubs };
}
