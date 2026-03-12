"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

const REPORT_ROWS = [
  { customer: "Mubarak Ventures", branch: "Lagos HQ", shipments: 48, revenue: 420000, profit: 98000 },
  { customer: "GreenLife Pharma", branch: "Abuja Central", shipments: 31, revenue: 315000, profit: 76000 },
  { customer: "The Lagos Paparazzi", branch: "Lagos HQ", shipments: 16, revenue: 108000, profit: 22000 },
  { customer: "Port Harcourt Goods", branch: "PH Transit", shipments: 11, revenue: 82000, profit: 16000 },
  { customer: "Ibadan Market Co.", branch: "Ibadan Annex", shipments: 8, revenue: 56000, profit: 9000 },
];

function downloadCsv() {
  const header = ["Customer", "Branch", "Shipments", "Revenue", "Profit"];
  const rows = REPORT_ROWS.map((row) => [row.customer, row.branch, row.shipments, row.revenue, row.profit]);
  const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "merchant-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function MerchantReportsPage() {
  const [viewBy, setViewBy] = useState("customer");
  const [period, setPeriod] = useState("monthly");
  const [dateRange, setDateRange] = useState("2026-03-01");

  const summary = useMemo(() => {
    const revenue = REPORT_ROWS.reduce((sum, row) => sum + row.revenue, 0);
    const profit = REPORT_ROWS.reduce((sum, row) => sum + row.profit, 0);
    const volume = REPORT_ROWS.reduce((sum, row) => sum + row.shipments, 0);
    const topCustomer = [...REPORT_ROWS].sort((a, b) => b.profit - a.profit)[0];
    const lowCustomer = [...REPORT_ROWS].sort((a, b) => a.profit - b.profit)[0];
    return { revenue, profit, volume, topCustomer, lowCustomer };
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Merchant Reports</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Analyze performance by customer, branch, or entire account across flexible time periods.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={downloadCsv} className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button type="button" className="border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">Excel</button>
          <button type="button" className="border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">PDF</button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 border border-zinc-100 bg-white p-6 sm:grid-cols-3">
        <div>
          <label className="text-sm text-zinc-700">View by</label>
          <select value={viewBy} onChange={(e) => setViewBy(e.target.value)} className="mt-2 h-11 w-full rounded-none border border-zinc-100 px-3 text-sm text-zinc-900">
            <option value="customer">Customer</option>
            <option value="branch">Branch</option>
            <option value="account">Entire account</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-zinc-700">Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-2 h-11 w-full rounded-none border border-zinc-100 px-3 text-sm text-zinc-900">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom date range</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-zinc-700">From</label>
          <input type="date" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="mt-2 h-11 w-full rounded-none border border-zinc-100 px-3 text-sm text-zinc-900" />
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-zinc-100 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Revenue</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">₦{summary.revenue.toLocaleString("en-NG")}</p>
        </div>
        <div className="border border-zinc-100 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Profit</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#5e1914]">₦{summary.profit.toLocaleString("en-NG")}</p>
        </div>
        <div className="border border-zinc-100 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Volume</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{summary.volume}</p>
        </div>
        <div className="border border-zinc-100 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Top / Low</p>
          <p className="mt-2 text-sm font-medium text-zinc-900">{summary.topCustomer.customer}</p>
          <p className="mt-1 text-sm text-zinc-500">Low: {summary.lowCustomer.customer}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="border border-zinc-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Profit and volume analysis</h2>
            <p className="text-xs uppercase tracking-wider text-zinc-400">{viewBy} · {period}</p>
          </div>
          <div className="mt-6 grid grid-cols-5 gap-3">
            {REPORT_ROWS.map((row) => (
              <div key={row.customer} className="flex flex-col items-center gap-3">
                <div className="flex h-40 w-full items-end gap-1">
                  <div className="w-1/2 bg-[#5e1914]" style={{ height: `${Math.max(18, row.profit / 800)}px` }} title={`Profit ₦${row.profit.toLocaleString("en-NG")}`} />
                  <div className="w-1/2 bg-zinc-300" style={{ height: `${Math.max(18, row.shipments * 3)}px` }} title={`Volume ${row.shipments}`} />
                </div>
                <p className="text-center text-xs text-zinc-500">{row.customer.split(" ")[0]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Performance snapshot</h2>
          <ul className="mt-5 space-y-4 text-sm">
            {REPORT_ROWS.map((row) => (
              <li key={row.customer} className="border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-zinc-900">{viewBy === "branch" ? row.branch : row.customer}</span>
                  <span className="text-[#5e1914]">₦{row.profit.toLocaleString("en-NG")}</span>
                </div>
                <p className="mt-1 text-zinc-500">{row.shipments} shipments · Revenue ₦{row.revenue.toLocaleString("en-NG")}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
