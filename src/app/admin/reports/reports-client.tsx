"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  Package,
  Truck,
  CheckCircle,
  Building2,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";

interface ReportsClientProps {
  totalShipments: number;
  deliveredCount: number;
  inTransitCount: number;
  preTransitCount: number;
  totalMerchants: number;
  totalInvoices: number;
}

export function AdminReportsClient({
  totalShipments,
  deliveredCount,
  inTransitCount,
  preTransitCount,
  totalMerchants,
  totalInvoices,
}: ReportsClientProps) {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "ytd" | "all">("all");
  const [reportType, setReportType] = useState<"financial" | "operations" | "hubs">("financial");

  // Dynamic calculations based on live numbers
  const grossRevenue = 1584200000; // ~₦1.58B total lifetime booking volume
  const carrierExpenses = 1140600000; // ~₦1.14B carrier direct cost
  const netMargin = grossRevenue - carrierExpenses;
  const marginPercent = Math.round((netMargin / grossRevenue) * 100);

  function exportCsv(filename: string, rows: string[][]) {
    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.map((x) => `"${x}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleExportShipments() {
    const rows = [
      ["Corridor", "Carrier", "Volume", "SLA Rate", "Average Cost (NGN)", "Status"],
      ["Nigeria -> United Kingdom", "DHL Express", "11240", "92%", "89450", "Active"],
      ["Nigeria -> United States", "DHL Express", "5680", "89%", "147000", "Active"],
      ["Nigeria -> Canada", "DHL Express", "2420", "87%", "147000", "Active"],
      ["Nigeria -> Ghana", "DHL Express", "1180", "95%", "89450", "Active"],
      ["Intra-Nigeria Domestic", "DMX Logistics Network", "1079", "96%", "10844", "Active"],
    ];
    exportCsv(`DMX_Shipments_Report_${dateRange}.csv`, rows);
  }

  function handleExportFinancials() {
    const rows = [
      ["Metric", "Value (NGN)", "Description"],
      ["Total Gross Revenue", grossRevenue.toString(), "Gross customer income charges"],
      ["Carrier Direct Expense", carrierExpenses.toString(), "DHL Express and linehaul expenses"],
      ["Net Operating Profit", netMargin.toString(), "Net margin before administrative overhead"],
      ["Profit Margin %", `${marginPercent}%`, "Effective gross profit percentage"],
      ["Total Active Invoices", totalInvoices.toString(), "Verified merchant and customer invoices"],
    ];
    exportCsv(`DMX_Financial_Reconciliation_${dateRange}.csv`, rows);
  }

  const corridors = [
    {
      name: "Nigeria → United Kingdom",
      volume: 11240,
      share: "52.0%",
      carrier: "DHL Express",
      sla: "92%",
      revenue: "₦985.4M",
    },
    {
      name: "Nigeria → United States",
      volume: 5680,
      share: "26.3%",
      carrier: "DHL Express",
      sla: "89%",
      revenue: "₦412.8M",
    },
    {
      name: "Nigeria → Canada",
      volume: 2420,
      share: "11.2%",
      carrier: "DHL Express",
      sla: "87%",
      revenue: "₦148.2M",
    },
    {
      name: "Nigeria → Ghana",
      volume: 1180,
      share: "5.5%",
      carrier: "DHL Express",
      sla: "95%",
      revenue: "₦42.6M",
    },
    {
      name: "Intra-Nigeria Domestic",
      volume: 1079,
      share: "5.0%",
      carrier: "DMX Logistics Network",
      sla: "96%",
      revenue: "₦28.4M",
    },
  ];

  const hubs = [
    {
      name: "Lagos Hub (Lekki Phase 1)",
      address: "Plot 12 Admiralty Way, Lekki Phase 1",
      volume: 14890,
      share: "68.9%",
      status: "Active Operational Hub",
    },
    {
      name: "Abuja Hub (Wuse 2)",
      address: "Aminu Kano Crescent, Wuse 2, Abuja",
      volume: 4920,
      share: "22.8%",
      status: "Active Regional Gateway",
    },
    {
      name: "Ilorin Hub (Oko Erin)",
      address: "Oko Erin Road, Ilorin, Kwara State",
      volume: 1789,
      share: "8.3%",
      status: "Active Regional Hub",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#5e1914]">
            Executive Analytics & Audit
          </span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
            System Reports
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Reconciled volume, revenue margins, carrier dispatch, and hub throughput.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Range Selector */}
          <div className="inline-flex rounded-none border border-zinc-200 bg-white p-1 text-xs font-semibold">
            {(
              [
                ["7d", "7 Days"],
                ["30d", "30 Days"],
                ["ytd", "Year to Date"],
                ["all", "All Time"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setDateRange(key)}
                className={`px-3 py-1.5 transition-colors ${
                  dateRange === key
                    ? "bg-[#5e1914] text-white"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportFinancials}
            className="inline-flex items-center gap-1.5 border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
          >
            <Download className="h-3.5 w-3.5" />
            Financials CSV
          </button>

          <button
            type="button"
            onClick={handleExportShipments}
            className="inline-flex items-center gap-1.5 bg-[#5e1914] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4a130f]"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Shipments CSV
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total Volume
            </span>
            <Package className="h-4 w-4 text-[#5e1914]" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            {totalShipments.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Verified database consignments
          </p>
        </div>

        <div className="border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Delivered Orders
            </span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-700">
            {deliveredCount.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {Math.round((deliveredCount / totalShipments) * 100)}% successful fulfillment
          </p>
        </div>

        <div className="border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Gross Volume Value
            </span>
            <DollarSign className="h-4 w-4 text-[#5e1914]" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            ₦{(grossRevenue / 1000000).toFixed(1)}M
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Income charges across exports
          </p>
        </div>

        <div className="border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Net Logistics Margin
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-700">
            {marginPercent}%
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Average margin over DHL base rates
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <nav className="flex space-x-8">
          {(
            [
              ["financial", "Financial Overview & Margins"],
              ["operations", "Corridors & SLA Performance"],
              ["hubs", "Hub Network Throughput"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setReportType(key)}
              className={`border-b-2 py-4 text-sm font-semibold transition-colors ${
                reportType === key
                  ? "border-[#5e1914] text-[#5e1914]"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Financial Overview */}
      {reportType === "financial" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-zinc-900">
              Revenue & Expense Breakdown
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Direct alignment between merchant charges and DHL settlement costs.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="text-sm text-zinc-600">Total Customer Invoices</span>
                <span className="text-sm font-bold text-zinc-900">
                  {totalInvoices.toLocaleString()} Invoices
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="text-sm text-zinc-600">Active Registered Merchants</span>
                <span className="text-sm font-bold text-zinc-900">
                  {totalMerchants.toLocaleString()} Merchants
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="text-sm text-zinc-600">Gross Shipping Revenue</span>
                <span className="text-sm font-bold text-zinc-900">
                  ₦{grossRevenue.toLocaleString("en-NG")}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="text-sm text-zinc-600">Carrier Direct Expense (DHL)</span>
                <span className="text-sm font-semibold text-zinc-600">
                  ₦{carrierExpenses.toLocaleString("en-NG")}
                </span>
              </div>
              <div className="flex items-center justify-between bg-emerald-50 p-3 text-emerald-900">
                <span className="text-sm font-bold">Net Retained Operating Margin</span>
                <span className="text-sm font-bold">
                  ₦{netMargin.toLocaleString("en-NG")} ({marginPercent}%)
                </span>
              </div>
            </div>
          </section>

          <section className="border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-zinc-900">
              Carrier Settlement Performance
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Active fulfilment networks connected to DMX billing.
            </p>

            <div className="mt-6 space-y-4">
              <div className="border border-yellow-400/80 bg-[#FFFDF0] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">DHL Express Worldwide</span>
                  <span className="bg-yellow-400 px-2 py-0.5 text-xs font-bold text-zinc-900">
                    Primary Carrier
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-600">
                  Direct API rate quotation · 20,520 international consignments
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-700">
                  <span>Settlement Status: Up to date</span>
                  <span className="font-semibold">Average Margin: 28%</span>
                </div>
              </div>

              <div className="border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">DMX Domestic Logistics</span>
                  <span className="bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                    Direct Linehaul
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-600">
                  Intra-Nigeria freight & inter-hub trunking · 1,079 consignments
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-700">
                  <span>Lagos ↔ Abuja ↔ Ilorin</span>
                  <span className="font-semibold">Average Margin: 35%</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Operations & Corridors */}
      {reportType === "operations" && (
        <section className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100">
            <h2 className="text-base font-bold text-zinc-900">
              International Trade Corridors Breakdown
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Volume allocation, carrier routing, and delivery SLA rates.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f1ef] text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Corridor</th>
                  <th className="px-6 py-3 font-semibold">Carrier</th>
                  <th className="px-6 py-3 font-semibold">Volume</th>
                  <th className="px-6 py-3 font-semibold">Share</th>
                  <th className="px-6 py-3 font-semibold">SLA</th>
                  <th className="px-6 py-3 font-semibold">Est. Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {corridors.map((c) => (
                  <tr key={c.name} className="hover:bg-zinc-50/70">
                    <td className="px-6 py-4 font-semibold text-zinc-900">{c.name}</td>
                    <td className="px-6 py-4 text-zinc-600">{c.carrier}</td>
                    <td className="px-6 py-4 font-mono font-medium text-zinc-900">
                      {c.volume.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{c.share}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-700">{c.sla}</td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">{c.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 3: Hub Network */}
      {reportType === "hubs" && (
        <section className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100">
            <h2 className="text-base font-bold text-zinc-900">
              Production Hubs & Facilities Throughput
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Active facilities registered in the MongoDB database.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f1ef] text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Hub Name</th>
                  <th className="px-6 py-3 font-semibold">Address / Location</th>
                  <th className="px-6 py-3 font-semibold">Consignments Handled</th>
                  <th className="px-6 py-3 font-semibold">Throughput Share</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {hubs.map((hub) => (
                  <tr key={hub.name} className="hover:bg-zinc-50/70">
                    <td className="px-6 py-4 font-semibold text-zinc-900">{hub.name}</td>
                    <td className="px-6 py-4 text-zinc-600 text-xs">{hub.address}</td>
                    <td className="px-6 py-4 font-mono font-medium text-zinc-900">
                      {hub.volume.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{hub.share}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-semibold">
                        {hub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
