"use client";

import { useState, useMemo } from "react";
import { DateFilter, type DateFilterState } from "@/components/date-filter";
import { getFinancialsForPeriod } from "@/data/admin-hub-demo";
import type { HubFinancialRow } from "@/data/admin-hub-demo";
import { ADMIN_DEMO_SHIPMENTS } from "@/data/demo-shipments";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATIC_ISO, formatDemoDateOnly } from "@/lib/demo-date";

/** Sum of (Selling Price - Cost Price) for all successful (Delivered) shipments. */
function getTotalNetProfit(): number {
  return ADMIN_DEMO_SHIPMENTS.filter((s) =>
    String(s.status).toLowerCase().includes("delivered")
  ).reduce((sum, s) => sum + (s.amount - (s.partnerCost ?? 0)), 0);
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1000) return `₦${(n / 1000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

function formatMoneyFull(n: number): string {
  return `₦${n.toLocaleString()}`;
}

function exportFinancialsCsv(hubs: HubFinancialRow[], periodLabel: string) {
  const headers = ["Hub", "Revenue", "Operational Cost", "Net Profit", "Margin %"];
  const rows = hubs.map((h) => [
    h.name,
    h.revenue,
    h.operationalCost,
    h.netProfit,
    `${h.marginPercent}%`,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `financials-${periodLabel}-${STATIC_ISO.slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminDashboardContent() {
  const [dateState, setDateState] = useState<DateFilterState>({ period: "today" });

  const { summary, hubs } = useMemo(
    () =>
      getFinancialsForPeriod(
        dateState.period,
        dateState.customFrom,
        dateState.customTo
      ),
    [dateState]
  );

  const periodLabel =
    dateState.period === "today"
      ? "today"
      : dateState.period === "yesterday"
        ? "yesterday"
        : dateState.period === "last7"
          ? "last7"
          : "custom";

  const revenueDateSubtext = useMemo(() => {
    const base = new Date(STATIC_ISO);
    if (dateState.period === "today") return `as of ${formatDemoDateOnly(STATIC_ISO)}`;
    if (dateState.period === "yesterday") {
      const y = new Date(base);
      y.setDate(y.getDate() - 1);
      return formatDemoDateOnly(y.toISOString());
    }
    if (dateState.period === "last7") {
      const from = new Date(base);
      from.setDate(from.getDate() - 6);
      return `${formatDemoDateOnly(from.toISOString())} - ${formatDemoDateOnly(STATIC_ISO)}`;
    }
    if (dateState.period === "custom" && dateState.customFrom && dateState.customTo) {
      return `${formatDemoDateOnly(dateState.customFrom)} - ${formatDemoDateOnly(dateState.customTo)}`;
    }
    return `as of ${formatDemoDateOnly(STATIC_ISO)}`;
  }, [dateState]);

  return (
    <>
      {/* Date Filter — updates all financial numbers instantly */}
      <section className="border-b border-zinc-100 bg-white pb-6">
        <DateFilter value={dateState} onChange={setDateState} />
      </section>

      {/* Global Master Grid: P&L + Total Net Profit */}
      <section className="mt-10">
        <div className="grid gap-6 sm:grid-cols-5">
          <div className="border border-zinc-100 bg-white p-6 font-sans">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Total Revenue
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tighter text-zinc-900">
              {formatMoneyFull(summary.totalRevenue)}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {revenueDateSubtext}
            </p>
          </div>
          <div className="border border-zinc-100 bg-white p-6 font-sans">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Direct Costs (COGS)
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tighter text-zinc-900">
              {formatMoneyFull(summary.cogs)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Fuel, last-mile payouts
            </p>
          </div>
          <div className="border border-zinc-100 bg-white p-6 font-sans">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Gross Profit
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tighter text-profit-green">
              {formatMoneyFull(summary.grossProfit)}
            </p>
          </div>
          <div className="border border-zinc-100 bg-white p-6 font-sans">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Profit Margin
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tighter text-[#5e1914]">
              {summary.profitMarginPercent}%
            </p>
          </div>
          <div className="border border-zinc-100 bg-white p-6 font-sans">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Total Net Profit
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tighter text-[#5e1914]">
              {formatMoneyFull(getTotalNetProfit())}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Sum (Selling − Cost) for delivered
            </p>
          </div>
        </div>
      </section>

      {/* Financial Hub comparison table */}
      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-sans text-lg font-semibold tracking-tight text-zinc-900">
              Financial Hub
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Revenue, operational cost, net profit and margin by hub.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => exportFinancialsCsv(hubs, periodLabel)}
            className="shrink-0 gap-2 border-zinc-200 font-sans"
          >
            <Download className="h-4 w-4" />
            Download CSV for Excel
          </Button>
        </div>
        <div className="mt-6 overflow-hidden border border-zinc-100 bg-white">
          <table className="w-full text-left text-sm font-sans">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-6 py-4 font-medium tracking-tighter text-zinc-900">
                  Hub
                </th>
                <th className="px-6 py-4 font-medium tracking-tighter text-zinc-900">
                  Revenue
                </th>
                <th className="px-6 py-4 font-medium tracking-tighter text-zinc-900">
                  Operational Cost
                </th>
                <th className="px-6 py-4 font-medium tracking-tighter text-zinc-900">
                  Net Profit
                </th>
                <th className="px-6 py-4 font-medium tracking-tighter text-zinc-900">
                  Margin %
                </th>
              </tr>
            </thead>
            <tbody>
              {hubs.map((hub) => (
                <tr
                  key={hub.name}
                  className="border-b border-zinc-100 last:border-b-0"
                >
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {hub.name}
                  </td>
                  <td className="px-6 py-4 tracking-tighter text-zinc-700">
                    {formatMoney(hub.revenue)}
                  </td>
                  <td className="px-6 py-4 tracking-tighter text-zinc-700">
                    {formatMoney(hub.operationalCost)}
                  </td>
                  <td className="px-6 py-4 font-medium tracking-tighter text-profit-green">
                    {formatMoney(hub.netProfit)}
                  </td>
                  <td className="px-6 py-4 font-medium tracking-tighter text-[#5e1914]">
                    {hub.marginPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
