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

  const segmentedMetrics = useMemo(() => {
    const hubShipments = ADMIN_DEMO_SHIPMENTS.filter((s) => s.origin.toLowerCase().includes("hub"));
    const merchantSet = new Set(ADMIN_DEMO_SHIPMENTS.map((s) => s.merchant));
    const deliveredByHub = hubShipments.filter((s) => s.status.toLowerCase().includes("delivered")).length;
    const deliveredByMerchant = ADMIN_DEMO_SHIPMENTS.filter((s) => s.status.toLowerCase().includes("delivered")).length;
    return {
      hub: {
        shipments: hubShipments.length,
        delivered: deliveredByHub,
        revenue: hubShipments.reduce((sum, s) => sum + s.amount, 0),
      },
      merchant: {
        partners: merchantSet.size,
        shipments: ADMIN_DEMO_SHIPMENTS.length,
        delivered: deliveredByMerchant,
      },
    };
  }, []);
  const adminTrendSeries = [
    { day: "Mon", shipments: 64, delivered: 48, customers: 14, profit: 184000 },
    { day: "Tue", shipments: 71, delivered: 53, customers: 16, profit: 213000 },
    { day: "Wed", shipments: 68, delivered: 51, customers: 15, profit: 201000 },
    { day: "Thu", shipments: 76, delivered: 58, customers: 17, profit: 228000 },
    { day: "Fri", shipments: 84, delivered: 64, customers: 19, profit: 256000 },
  ];
  const adminTrendPeak = Math.max(...adminTrendSeries.map((row) => Math.max(row.shipments, row.delivered, row.customers)), 1);

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

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="border border-zinc-100 bg-white p-6 font-sans">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Hub Metrics (Internal)</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-zinc-500">Shipments</dt><dd className="font-medium text-zinc-900">{segmentedMetrics.hub.shipments.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Delivered</dt><dd className="font-medium text-zinc-900">{segmentedMetrics.hub.delivered.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Revenue</dt><dd className="font-medium text-zinc-900">{formatMoneyFull(segmentedMetrics.hub.revenue)}</dd></div>
          </dl>
        </div>
        <div className="border border-zinc-100 bg-white p-6 font-sans">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Merchant Metrics (External)</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-zinc-500">Active Merchants</dt><dd className="font-medium text-zinc-900">{segmentedMetrics.merchant.partners.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Shipments</dt><dd className="font-medium text-zinc-900">{segmentedMetrics.merchant.shipments.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Delivered</dt><dd className="font-medium text-zinc-900">{segmentedMetrics.merchant.delivered.toLocaleString()}</dd></div>
          </dl>
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

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="border border-zinc-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-sans text-lg font-semibold tracking-tight text-zinc-900">Admin dashboard trends</h2>
              <p className="mt-1 text-sm text-zinc-500">Profit trends, shipments/day, delivered/day, and customer growth.</p>
            </div>
            <a href="/admin/reports" className="text-sm font-medium text-[#5e1914] hover:underline">
              Open reports
            </a>
          </div>
          <div className="mt-6 flex items-end gap-4" style={{ minHeight: 220 }}>
            {adminTrendSeries.map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-44 w-full items-end justify-center gap-1">
                  <div className="w-1/3 bg-[#5e1914]" style={{ height: `${Math.max(10, (item.shipments / adminTrendPeak) * 170)}px` }} title={`Shipments ${item.shipments}`} />
                  <div className="w-1/3 bg-green-600" style={{ height: `${Math.max(10, (item.delivered / adminTrendPeak) * 170)}px` }} title={`Delivered ${item.delivered}`} />
                  <div className="w-1/3 bg-zinc-300" style={{ height: `${Math.max(10, (item.customers / adminTrendPeak) * 170)}px` }} title={`Growth ${item.customers}`} />
                </div>
                <span className="text-xs text-zinc-500">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-zinc-100 bg-white p-6">
          <h2 className="font-sans text-lg font-semibold tracking-tight text-zinc-900">Profit pulse</h2>
          <ul className="mt-5 space-y-4 text-sm">
            {adminTrendSeries.map((item) => (
              <li key={item.day} className="flex items-center justify-between border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0">
                <span className="text-zinc-700">{item.day}</span>
                <span className="font-medium text-[#5e1914]">₦{item.profit.toLocaleString("en-NG")}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
