"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Copy, FileText, MoreHorizontal, Save, Search } from "lucide-react";
import { ADMIN_DEMO_SHIPMENTS } from "@/data/demo-shipments";
import type { DemoShipment } from "@/data/demo-shipments";

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
  if (s.includes("draft")) return "border-amber-500 bg-amber-50 text-amber-700";
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

export function AdminShipmentsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [shipments, setShipments] = useState<DemoShipment[]>(ADMIN_DEMO_SHIPMENTS);
  const [feedback, setFeedback] = useState("");

  const filtered = useMemo(() => {
    let list = shipments;
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
  }, [search, shipments, status]);

  function clearFilters() {
    setSearch("");
    setStatus("All statuses");
  }

  const hasActiveFilters = search.trim() !== "" || status !== "All statuses";

  function duplicateShipment(shipment: DemoShipment) {
    const copy: DemoShipment = {
      ...shipment,
      id: `draft-${Date.now()}`,
      trackingId: `${shipment.trackingId}-COPY`,
      status: "Draft",
    };
    setShipments((current) => [copy, ...current]);
    setFeedback(`${shipment.trackingId} duplicated as draft.`);
  }

  function saveAsDraft(shipment: DemoShipment) {
    setShipments((current) =>
      current.map((item) =>
        item.id === shipment.id ? { ...item, status: "Draft" } : item,
      ),
    );
    setFeedback(`${shipment.trackingId} saved as draft.`);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border border-zinc-200 bg-white p-4">
        <div className="flex h-10 min-w-[220px] flex-1 items-center border border-zinc-200 bg-white focus-within:border-[#5e1914] focus-within:ring-1 focus-within:ring-[#5e1914]">
          <Search className="ml-3 h-4 w-4 text-zinc-400" />
          <input
            type="search"
            placeholder="Search by ID or Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-full flex-1 border-0 bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
          />
        </div>
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
      {feedback ? (
        <div className="mt-4 border border-[#5e1914]/20 bg-[#f7f1ef] px-4 py-3 text-sm font-medium text-[#5e1914]">
          {feedback}
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-none border border-zinc-200 bg-white">
        <table className="w-full min-w-[1320px] text-left text-sm">
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
              <th className="px-8 py-5 font-medium font-sans tracking-tight text-zinc-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-8 py-16 text-center text-sm text-zinc-500">
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
                    <td className="px-8 py-5">
                      <Link href={`/admin/shipments/${encodeURIComponent(s.trackingId)}`} className="font-mono font-sans text-[#5e1914] hover:underline">
                        {s.trackingId}
                      </Link>
                    </td>
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
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/shipments/${encodeURIComponent(s.trackingId)}`}
                          className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => duplicateShipment(s)}
                          className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                        >
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => saveAsDraft(s)}
                          className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                        >
                          <Save className="h-4 w-4" />
                          Save draft
                        </button>
                        <Link
                          href={`/admin/booking?duplicate=${encodeURIComponent(s.trackingId)}`}
                          className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                        >
                          <FileText className="h-4 w-4" />
                          Rebook
                        </Link>
                      </div>
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
