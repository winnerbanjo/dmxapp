"use client";

import { useState, useMemo } from "react";
import { ADMIN_DEMO_SHIPMENTS } from "@/data/demo-shipments";

const BRANCH_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Lagos", label: "Lagos" },
  { value: "Abuja", label: "Abuja" },
  { value: "Kano", label: "Kano" },
];

function originMatchesBranch(origin: string, branch: string): boolean {
  if (branch === "All") return true;
  return origin.toLowerCase().includes(branch.toLowerCase());
}

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("delivered")) return "border-green-600 bg-green-50 text-green-700";
  if (s.includes("transit") || s.includes("delivery") || s.includes("picked")) return "border-[#5e1914] bg-[#5e1914]/10 text-[#5e1914]";
  if (s.includes("sitting") || s.includes("hub")) return "border-[#5e1914] bg-[#5e1914]/10 text-[#5e1914]";
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

export function GlobalShipmentsTable() {
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("All");

  const filtered = useMemo(() => {
    let list = ADMIN_DEMO_SHIPMENTS;
    if (branch !== "All") {
      list = list.filter((s) => originMatchesBranch(s.origin, branch));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.trackingId.toLowerCase().includes(q) ||
          s.merchant.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, branch]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-none border border-zinc-100 bg-white p-4">
        <input
          type="search"
          placeholder="Search by ID or Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 flex-1 min-w-[200px] rounded-none border border-zinc-100 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-0"
        />
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="h-10 rounded-none border border-zinc-100 bg-white px-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-0"
        >
          {BRANCH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {(search.trim() !== "" || branch !== "All") && (
          <button
            type="button"
            onClick={() => { setSearch(""); setBranch("All"); }}
            className="rounded-none border border-zinc-100 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
          >
            Clear Filters
          </button>
        )}
      </div>
      <div className="mt-4 overflow-hidden rounded-none border border-zinc-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Tracking ID</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Merchant</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Origin</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Destination</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Amount</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Partner Cost</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Profit</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-8 py-16 text-center text-sm text-zinc-500">
                  No matches found
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const profit = s.amount - (s.partnerCost ?? 0);
                return (
                  <tr key={s.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="px-8 py-5 font-mono text-[#5e1914]">{s.trackingId}</td>
                    <td className="px-8 py-5 text-zinc-900">{s.merchant}</td>
                    <td className="px-8 py-5 text-zinc-600">{s.origin}</td>
                    <td className="px-8 py-5 text-zinc-900">{s.destination}</td>
                    <td className="px-8 py-5 text-zinc-900">₦{s.amount.toLocaleString("en-NG")}</td>
                    <td className="px-8 py-5 text-zinc-600">₦{(s.partnerCost ?? 0).toLocaleString("en-NG")}</td>
                    <td className="px-8 py-5 font-medium text-[#5e1914]">₦{profit.toLocaleString("en-NG")}</td>
                    <td className="px-8 py-5">
                      <span className={`inline-block border px-2 py-1 text-xs font-medium ${statusClass(s.status)}`}>
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
