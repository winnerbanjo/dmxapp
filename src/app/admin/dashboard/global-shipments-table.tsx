"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export interface DashboardShipmentItem {
  id: string;
  trackingNumber: string | number | null;
  description: string | null;
  type: string | null;
  status: string | null;
  totalIncomeCharge: number | null;
  dateAdded: string | null;
}

function statusClass(status?: string | null): string {
  const s = (status || "").toLowerCase();
  if (s.includes("delivered")) return "border-green-600 bg-green-50 text-green-700";
  if (s.includes("transit") || s.includes("delivery") || s.includes("picked"))
    return "border-[#5e1914] bg-[#5e1914]/10 text-[#5e1914]";
  if (s.includes("pre-transit") || s.includes("created"))
    return "border-amber-500 bg-amber-50 text-amber-700";
  if (s.includes("cancel") || s.includes("fail"))
    return "border-red-500 bg-red-50 text-red-700";
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

export function GlobalShipmentsTable({
  initialShipments = [],
}: {
  initialShipments?: DashboardShipmentItem[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = initialShipments;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => {
        const tracking = String(s.trackingNumber || s.id).toLowerCase();
        const desc = (s.description || "").toLowerCase();
        return tracking.includes(q) || desc.includes(q);
      });
    }
    return list;
  }, [search, initialShipments]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-none border border-zinc-100 bg-white p-4">
        <input
          type="search"
          placeholder="Filter live shipments by Tracking ID or Description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 flex-1 min-w-[200px] rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-0"
        />
        {search.trim() !== "" && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
          >
            Clear
          </button>
        )}
      </div>
      <div className="mt-4 overflow-x-auto rounded-none border border-zinc-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-6 py-4 font-semibold text-zinc-900">Tracking ID</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Description</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Type</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Revenue (Charge)</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Status</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500">
                  No shipments available in view.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const trackingStr = s.trackingNumber ? String(s.trackingNumber) : s.id;
                return (
                  <tr key={s.id} className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/60">
                    <td className="px-6 py-4 font-mono font-medium text-[#5e1914]">
                      <Link href={`/track/${trackingStr}`} className="hover:underline">
                        DMX-{trackingStr}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-zinc-900 max-w-[200px] truncate">
                      {s.description || "General Cargo"}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{s.type || "Export"}</td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">
                      {s.totalIncomeCharge ? `₦${s.totalIncomeCharge.toLocaleString("en-NG")}` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block border px-2 py-0.5 text-xs font-semibold ${statusClass(s.status)}`}>
                        {s.status || "PRE-TRANSIT"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/track/${trackingStr}`}
                        className="border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                      >
                        Track
                      </Link>
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
