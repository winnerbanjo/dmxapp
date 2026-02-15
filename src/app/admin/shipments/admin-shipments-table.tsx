"use client";

import { useState, useMemo } from "react";
import { ADMIN_DEMO_SHIPMENTS } from "@/data/demo-shipments";

const STATUS_OPTIONS = [
  "All statuses",
  "Pending",
  "Picked up",
  "In transit",
  "Sitting at Hub",
  "Out for delivery",
  "Delivered",
];

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("delivered")) return "border-green-600 bg-green-50 text-green-700";
  if (s.includes("transit") || s.includes("delivery") || s.includes("picked")) return "border-[#5e1914] bg-[#5e1914]/10 text-[#5e1914]";
  if (s.includes("sitting") || s.includes("hub")) return "border-[#5e1914] bg-[#5e1914]/10 text-[#5e1914]";
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

export function AdminShipmentsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");

  const filtered = useMemo(() => {
    let list = ADMIN_DEMO_SHIPMENTS;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.trackingId.toLowerCase().includes(q) ||
          s.merchant.toLowerCase().includes(q)
      );
    }
    if (status !== "All statuses") {
      list = list.filter((s) => s.status === status);
    }
    return list;
  }, [search, status]);

  function clearFilters() {
    setSearch("");
    setStatus("All statuses");
  }

  const hasActiveFilters = search.trim() !== "" || status !== "All statuses";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border border-zinc-200 bg-white p-4">
        <input
          type="search"
          placeholder="Search by ID or Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 flex-1 min-w-[200px] rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-none border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-8 py-5 font-medium font-sans tracking-tight text-zinc-900">Tracking ID</th>
              <th className="px-8 py-5 font-medium font-sans tracking-tight text-zinc-900">Merchant</th>
              <th className="px-8 py-5 font-medium font-sans tracking-tight text-zinc-900">Origin</th>
              <th className="px-8 py-5 font-medium font-sans tracking-tight text-zinc-900">Destination</th>
              <th className="px-8 py-5 font-medium font-sans tracking-tight text-zinc-900">Weight</th>
              <th className="px-8 py-5 font-medium font-sans tracking-tight text-zinc-900">Selling Price</th>
              <th className="px-8 py-5 font-medium font-sans tracking-tight text-zinc-900">Carrier Cost</th>
              <th className="px-8 py-5 font-medium font-sans tracking-tight text-zinc-900">Net Profit</th>
              <th className="px-8 py-5 font-medium font-sans tracking-tight text-zinc-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-8 py-16 text-center text-sm text-zinc-500">
                  No matches found
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const netProfit = s.amount - s.partnerCost;
                const marginPercent = s.amount > 0 ? (netProfit / s.amount) * 100 : 0;
                const meetsTarget = marginPercent >= 20;
                return (
                  <tr key={s.id} className="border-b border-zinc-200 last:border-b-0">
                    <td className="px-8 py-5 font-mono font-sans text-[#5e1914]">{s.trackingId}</td>
                    <td className="px-8 py-5 font-sans text-zinc-900">{s.merchant}</td>
                    <td className="px-8 py-5 font-sans text-zinc-600">{s.origin}</td>
                    <td className="px-8 py-5 font-sans text-zinc-900">{s.destination}</td>
                    <td className="px-8 py-5 font-sans text-zinc-600">{s.weightKg} kg</td>
                    <td className="px-8 py-5 font-sans text-zinc-900">₦{s.amount.toLocaleString("en-NG")}</td>
                    <td className="px-8 py-5 font-sans text-zinc-600">₦{s.partnerCost.toLocaleString("en-NG")}</td>
                    <td className="px-8 py-5">
                      <span className={`font-sans font-medium ${meetsTarget ? "text-[#5e1914]" : "text-zinc-700"}`}>
                        ₦{netProfit.toLocaleString("en-NG")}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-block border px-2 py-1 text-xs font-medium font-sans ${statusClass(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
