import type { DateFilterPeriod } from "@/components/date-filter";

export type HubOperationsMetrics = {
  currentInventory: number;
  pendingDispatches: number;
  inboundShipments: number;
  avgProcessingTimeMins: number;
  walkInsToday: number;
  tasksAssigned: number;
};

/** Static operational metrics per period. Date filter updates these. */
const BY_PERIOD: Record<DateFilterPeriod, HubOperationsMetrics> = {
  today: {
    currentInventory: 450,
    pendingDispatches: 128,
    inboundShipments: 85,
    avgProcessingTimeMins: 14,
    walkInsToday: 12,
    tasksAssigned: 23,
  },
  yesterday: {
    currentInventory: 418,
    pendingDispatches: 115,
    inboundShipments: 92,
    avgProcessingTimeMins: 16,
    walkInsToday: 8,
    tasksAssigned: 19,
  },
  last7: {
    currentInventory: 450,
    pendingDispatches: 896,
    inboundShipments: 595,
    avgProcessingTimeMins: 14,
    walkInsToday: 84,
    tasksAssigned: 161,
  },
  custom: {
    currentInventory: 450,
    pendingDispatches: 256,
    inboundShipments: 170,
    avgProcessingTimeMins: 15,
    walkInsToday: 24,
    tasksAssigned: 46,
  },
};

function getCustomDays(from?: string, to?: string): number {
  if (!from || !to) return 2;
  const a = new Date(from);
  const b = new Date(to);
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(diff + 1, 90));
}

/** Returns operational metrics for the selected period. */
export function getHubOperationsForPeriod(
  period: DateFilterPeriod,
  customFrom?: string,
  customTo?: string
): HubOperationsMetrics {
  if (period !== "custom") return BY_PERIOD[period];
  const base = BY_PERIOD.today;
  const days = getCustomDays(customFrom, customTo);
  return {
    currentInventory: base.currentInventory,
    pendingDispatches: Math.round(base.pendingDispatches * Math.min(days, 2)),
    inboundShipments: Math.round(base.inboundShipments * Math.min(days, 2)),
    avgProcessingTimeMins: base.avgProcessingTimeMins,
    walkInsToday: Math.round(base.walkInsToday * days),
    tasksAssigned: Math.round(base.tasksAssigned * days),
  };
}

/** Demo "time at hub" in minutes for inventory preview (deterministic per id). */
export function getTimeAtHubMinutes(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return 15 + (n % 780); // 15 min to ~13h
}

export function formatTimeAtHub(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}
