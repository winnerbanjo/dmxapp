"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Copy, FileText, Loader2, Printer, RefreshCw, Search } from "lucide-react";

interface RealShipment {
  id: string;
  trackingNumber: string | number | null;
  dhlTrackingNumber: string | null;
  description: string | null;
  type: string | null;
  status: string | null;
  totalWeight: number | null;
  totalIncomeCharge: number | null;
  branchId: string | null;
  userId: string | null;
  dateAdded: string | null;
}

const STATUS_OPTIONS = [
  "All statuses",
  "PRE-TRANSIT",
  "TRANSIT",
  "DELIVERED",
  "CANCELED",
  "FAILED",
  "RETURNED",
  "CREATED",
];

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

function money(val?: number | null) {
  if (typeof val !== "number" || isNaN(val)) return "—";
  return `₦${val.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export function AdminShipmentsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [shipments, setShipments] = useState<RealShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) params.set("search", search.trim());
      if (status !== "All statuses") params.set("status", status);

      const res = await fetch(`/api/legacy/shipments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setShipments(data.shipments || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load real shipments:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  function copyTracking(tracking: string) {
    navigator.clipboard.writeText(tracking);
    setCopiedId(tracking);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border border-zinc-200 bg-white p-4">
        <div className="flex h-10 min-w-[240px] flex-1 items-center border border-zinc-200 bg-white focus-within:border-[#5e1914] focus-within:ring-1 focus-within:ring-[#5e1914]">
          <Search className="ml-3 h-4 w-4 text-zinc-400" />
          <input
            type="search"
            placeholder="Search by Tracking Number or Description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-full flex-1 border-0 bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => fetchShipments()}
          disabled={loading}
          className="flex h-10 items-center gap-2 border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <span>
          Showing {shipments.length} of {total.toLocaleString()} live shipments
        </span>
        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      <div className="mt-2 overflow-x-auto border border-zinc-200 bg-white">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-6 py-4 font-semibold text-zinc-900">Tracking Number</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Description</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Type</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Weight</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Revenue (Charge)</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Status</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Date Added</th>
              <th className="px-6 py-4 font-semibold text-zinc-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#5e1914]" />
                    <span className="text-sm text-zinc-500">Loading live shipments from database...</span>
                  </div>
                </td>
              </tr>
            ) : shipments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-sm text-zinc-500">
                  No shipments found matching criteria.
                </td>
              </tr>
            ) : (
              shipments.map((s) => {
                const trackingStr = s.trackingNumber ? String(s.trackingNumber) : s.id;
                const formattedDate = s.dateAdded
                  ? new Date(s.dateAdded).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr key={s.id} className="border-b border-zinc-100 hover:bg-zinc-50/80">
                    <td className="px-6 py-4 font-medium text-zinc-900">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/track/${trackingStr}`}
                          className="font-semibold text-[#5e1914] hover:underline"
                        >
                          {trackingStr}
                        </Link>
                        <button
                          type="button"
                          onClick={() => copyTracking(trackingStr)}
                          className="text-zinc-400 hover:text-zinc-700"
                          title="Copy tracking"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {copiedId === trackingStr ? (
                          <span className="text-[10px] text-emerald-600">Copied!</span>
                        ) : null}
                      </div>
                      {s.dhlTrackingNumber ? (
                        <p className="text-[11px] text-zinc-400">DHL: {s.dhlTrackingNumber}</p>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-zinc-700 max-w-[220px] truncate">
                      {s.description || "General Package"}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{s.type || "Export"}</td>
                    <td className="px-6 py-4 text-zinc-600">
                      {s.totalWeight ? `${s.totalWeight} kg` : "—"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">
                      {money(s.totalIncomeCharge)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-none border px-2.5 py-1 text-xs font-semibold ${statusClass(
                          s.status
                        )}`}
                      >
                        {s.status || "PRE-TRANSIT"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">{formattedDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/track/${trackingStr}`}
                          className="border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                          title="Track on DMX"
                        >
                          Track
                        </Link>
                        <a
                          href={`https://www.dhl.com/en/express/tracking.html?AWB=${s.dhlTrackingNumber || trackingStr}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-yellow-500 bg-[#FFCC00] px-2 py-1 text-xs font-bold text-zinc-950 hover:bg-yellow-400"
                          title="Track on DHL Express"
                        >
                          DHL
                        </a>
                        <a
                          href={`/shipments/${trackingStr}/label?print=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 border border-[#5e1914] bg-[#5e1914] px-2 py-1 text-xs font-semibold text-white hover:bg-[#4a130f]"
                          title="Print 4x6 Shipping Label"
                        >
                          <Printer className="h-3 w-3" />
                          <span>Label</span>
                        </a>
                        <a
                          href={`/shipments/${trackingStr}/waybill?print=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
                          title="View / Print Air Waybill"
                        >
                          <FileText className="h-3 w-3 text-[#5e1914]" />
                          <span>Waybill</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-zinc-600">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      ) : null}
    </>
  );
}
