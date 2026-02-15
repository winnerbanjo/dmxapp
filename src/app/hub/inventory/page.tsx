"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { HUB_INVENTORY_DEMO_SHIPMENTS } from "@/data/demo-shipments";

const STATUS_OPTIONS = ["All statuses", "Sitting at Hub"];

export default function HubInventoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const filtered = useMemo(() => {
    let list = HUB_INVENTORY_DEMO_SHIPMENTS;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.trackingId.toLowerCase().includes(q) ||
          s.merchant.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All statuses") {
      list = list.filter((s) => s.status === statusFilter);
    }
    return list;
  }, [search, statusFilter]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("All statuses");
  }

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "All statuses";

  return (
    <div className="mx-auto max-w-4xl bg-white">
      <header className="flex items-center gap-4 border-b border-zinc-100 pb-6">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-white">
          <Image
            src="/dmxlogo.svg"
            alt="DMX"
            fill
            className="object-contain"
            sizes="40px"
            unoptimized
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Branch Inventory
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Packages sitting at hub. Use search and filters above the table.
          </p>
        </div>
        <Link
          href="/hub/dashboard"
          className="rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-none border border-zinc-200 bg-white p-4">
        <input
          type="search"
          placeholder="Search by ID or Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 min-w-[200px] flex-1 rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Tracking ID</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Merchant</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Origin</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Destination</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Weight</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Amount</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-16 text-center text-sm text-zinc-500">
                  No matches found
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b border-zinc-200 last:border-b-0">
                  <td className="px-8 py-5 font-mono text-[#5e1914]">{s.trackingId}</td>
                  <td className="px-8 py-5 text-zinc-900">{s.merchant}</td>
                  <td className="px-8 py-5 text-zinc-600">{s.origin}</td>
                  <td className="px-8 py-5 text-zinc-900">{s.destination}</td>
                  <td className="px-8 py-5 text-zinc-600">{s.weightKg} kg</td>
                  <td className="px-8 py-5 text-zinc-900">₦{s.amount.toLocaleString("en-NG")}</td>
                  <td className="px-8 py-5">
                    <span className="inline-block border border-[#5e1914] bg-[#5e1914]/10 px-2 py-1 text-xs font-medium text-[#5e1914]">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
