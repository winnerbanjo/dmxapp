"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ShipmentList } from "../shipment-list";

type Row = {
  id: string;
  trackingId: string;
  receiverName: string;
  receiverPhone: string;
  status: string;
  packageWeight: number;
  cost: number;
  createdAt: string;
};

const STATUS_OPTIONS = ["All statuses", "Pending", "In-Transit", "Delivered"];

export function ShipmentsWithSearch({ shipments }: { shipments: Row[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");

  const filtered = useMemo(() => {
    let list = shipments;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.trackingId.toLowerCase().includes(q) ||
          s.receiverName.toLowerCase().includes(q)
      );
    }
    if (status !== "All statuses") {
      list = list.filter((s) => s.status === status);
    }
    return list;
  }, [shipments, query, status]);

  function clearFilters() {
    setQuery("");
    setStatus("All statuses");
  }

  const hasActiveFilters = query.trim() !== "" || status !== "All statuses";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-none border border-zinc-200 bg-white p-4">
        <div className="flex flex-1 min-w-[200px] items-center rounded-none border border-zinc-200 bg-white focus-within:border-[#5e1914]">
          <Search strokeWidth={1} className="ml-3 h-4 w-4 shrink-0 text-zinc-400" />
          <input
            type="search"
            placeholder="Search by ID or Name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 flex-1 border-0 bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0 focus:border-[#5e1914]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-0"
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
      <ShipmentList shipments={filtered} />
    </div>
  );
}
