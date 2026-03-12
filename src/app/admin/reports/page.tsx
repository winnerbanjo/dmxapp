"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

const ADMIN_REPORT_ROWS = [
  { name: "Lagos Hub", kind: "hub", shipments: 224, revenue: 1420000, margin: 26 },
  { name: "Abuja Hub", kind: "hub", shipments: 180, revenue: 1080000, margin: 23 },
  { name: "Mubarak Ventures", kind: "merchant", shipments: 92, revenue: 620000, margin: 21 },
  { name: "GreenLife Pharma", kind: "merchant", shipments: 74, revenue: 560000, margin: 24 },
];

function exportAdminCsv() {
  const header = ["Name", "Type", "Shipments", "Revenue", "Margin"];
  const rows = ADMIN_REPORT_ROWS.map((row) => [row.name, row.kind, row.shipments, row.revenue, `${row.margin}%`]);
  const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "admin-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const [scope, setScope] = useState("system");
  const [period, setPeriod] = useState("monthly");

  const summary = useMemo(() => {
    const revenue = ADMIN_REPORT_ROWS.reduce((sum, row) => sum + row.revenue, 0);
    const shipments = ADMIN_REPORT_ROWS.reduce((sum, row) => sum + row.shipments, 0);
    const avgMargin = Math.round(ADMIN_REPORT_ROWS.reduce((sum, row) => sum + row.margin, 0) / ADMIN_REPORT_ROWS.length);
    return { revenue, shipments, avgMargin };
  }, []);

  return (
    <div className="mx-auto max-w-5xl bg-white px-8 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Admin Reports</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Build hub, merchant, and system-wide financial reports with profit margin analysis and export actions.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportAdminCsv} className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button type="button" className="border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">Excel</button>
          <button type="button" className="border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">PDF</button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-zinc-100 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Scope</p>
          <select value={scope} onChange={(e) => setScope(e.target.value)} className="mt-2 h-11 w-full rounded-none border border-zinc-100 px-3 text-sm text-zinc-900">
            <option value="hub">By hub</option>
            <option value="merchant">By merchant</option>
            <option value="system">System-wide</option>
          </select>
        </div>
        <div className="border border-zinc-100 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Period</p>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-2 h-11 w-full rounded-none border border-zinc-100 px-3 text-sm text-zinc-900">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="border border-zinc-100 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Revenue</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">₦{summary.revenue.toLocaleString("en-NG")}</p>
        </div>
        <div className="border border-zinc-100 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Avg Margin</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#5e1914]">{summary.avgMargin}%</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Profit margin analysis</h2>
          <div className="mt-6 space-y-4">
            {ADMIN_REPORT_ROWS.map((row) => (
              <div key={row.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-900">{row.name}</span>
                  <span className="text-[#5e1914]">{row.margin}%</span>
                </div>
                <div className="h-3 bg-zinc-100">
                  <div className="h-3 bg-[#5e1914]" style={{ width: `${Math.min(100, row.margin * 3)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Volume summary</h2>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{summary.shipments}</p>
          <p className="text-sm text-zinc-500">Total shipments in current report view</p>
          <ul className="mt-5 space-y-3 text-sm">
            {ADMIN_REPORT_ROWS.map((row) => (
              <li key={row.name} className="flex items-center justify-between border-b border-zinc-100 pb-3 last:border-b-0 last:pb-0">
                <span className="text-zinc-700">{row.name}</span>
                <span className="font-medium text-zinc-900">{row.shipments}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 overflow-hidden border border-zinc-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-6 py-4 font-medium text-zinc-900">Name</th>
              <th className="px-6 py-4 font-medium text-zinc-900">Category</th>
              <th className="px-6 py-4 font-medium text-zinc-900">Shipments</th>
              <th className="px-6 py-4 font-medium text-zinc-900">Revenue</th>
              <th className="px-6 py-4 font-medium text-zinc-900">Margin</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_REPORT_ROWS.map((row) => (
              <tr key={row.name} className="border-b border-zinc-100 last:border-b-0">
                <td className="px-6 py-4 text-zinc-900">{row.name}</td>
                <td className="px-6 py-4 capitalize text-zinc-600">{row.kind}</td>
                <td className="px-6 py-4 text-zinc-900">{row.shipments}</td>
                <td className="px-6 py-4 text-zinc-900">₦{row.revenue.toLocaleString("en-NG")}</td>
                <td className="px-6 py-4 text-[#5e1914]">{row.margin}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
