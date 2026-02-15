"use client";

import { useState } from "react";
import Link from "next/link";
import { getWhatsAppUpdateUrl } from "@dmx/lib/whatsapp-url";
import { formatDemoDateOnly } from "@/lib/demo-date";
import { FileDown, MessageCircle, MapPin, Eye, Pencil } from "lucide-react";
import { TrackModal, type ShipmentForModal } from "./shipments/track-modal";

type ShipmentRow = {
  id: string;
  trackingId: string;
  receiverName: string;
  receiverPhone: string;
  status: string;
  packageWeight: number;
  cost: number;
  createdAt: string;
};

export function ShipmentList({ shipments }: { shipments: ShipmentRow[] }) {
  const [trackingModalShipment, setTrackingModalShipment] = useState<ShipmentForModal | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  function handleView(s: ShipmentRow) {
    setTrackingModalShipment({ trackingId: s.trackingId, receiverName: s.receiverName, status: s.status, cost: s.cost, createdAt: s.createdAt });
  }

  function handleEdit(s: ShipmentRow) {
    setEditId(s.id);
    setTimeout(() => setEditId(null), 1500);
  }

  function handleDownloadWaybill(id: string) {
    const base = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    window.open(`${base}/api/merchant/shipments/${id}/waybill`, "_blank");
  }

  function formatDateCell(createdAt: string): string {
    if (!createdAt?.trim()) return "—";
    if (createdAt.includes("T")) {
      return formatDemoDateOnly(createdAt);
    }
    return createdAt;
  }

  function handleSendUpdate(s: ShipmentRow) {
    const url = getWhatsAppUpdateUrl({
      receiverPhone: s.receiverPhone,
      trackingId: s.trackingId,
      status: s.status,
      receiverName: s.receiverName,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const statusBadgeClass = (status: string) => {
    const s = status.toUpperCase();
    if (s === "DELIVERED") return "border-green-600 bg-green-50 text-green-700";
    if (s === "IN-TRANSIT" || s === "IN_TRANSIT") return "border-[#5e1914] bg-[#5e1914]/5 text-[#5e1914]";
    return "border-zinc-200 bg-zinc-50 text-zinc-700";
  };

  return (
    <>
      <div className="overflow-hidden rounded-none border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Tracking ID</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Destination</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Date</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Amount</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Status</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center text-sm text-zinc-500">
                  No matches found
                </td>
              </tr>
            ) : (
              shipments.map((s) => (
              <tr key={s.id} className="border-b border-zinc-100 last:border-b-0">
                <td className="px-8 py-5">
                  <Link
                    href={`/track/${encodeURIComponent(s.trackingId)}`}
                    className="font-mono text-sm font-medium text-[#5e1914] hover:underline"
                  >
                    {s.trackingId}
                  </Link>
                </td>
                <td className="px-8 py-5 text-zinc-900">{s.receiverName}</td>
                <td className="px-8 py-5 text-zinc-600">{formatDateCell(s.createdAt)}</td>
                <td className="px-8 py-5 text-zinc-900">
                  {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(s.cost)}
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-block border px-2 py-1 text-xs font-medium ${statusBadgeClass(s.status)}`}>
                    {s.status.toUpperCase()}
                  </span>
                </td>
                <td className="flex flex-wrap gap-2 px-8 py-5">
                  <button
                    type="button"
                    onClick={() => handleView(s)}
                    className="inline-flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                  >
                    <Eye strokeWidth={1} className="h-4 w-4" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(s)}
                    className="inline-flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                  >
                    <Pencil strokeWidth={1} className="h-4 w-4" />
                    {editId === s.id ? "…" : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackingModalShipment({ trackingId: s.trackingId, receiverName: s.receiverName, status: s.status, cost: s.cost, createdAt: s.createdAt })}
                    className="inline-flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                  >
                    <MapPin strokeWidth={1} className="h-4 w-4" />
                    Track
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadWaybill(s.id)}
                    className="inline-flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                  >
                    <FileDown strokeWidth={1} className="h-4 w-4" />
                    Waybill
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendUpdate(s)}
                    className="inline-flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                  >
                    <MessageCircle strokeWidth={1} className="h-4 w-4" />
                    Notify
                  </button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
      <TrackModal shipment={trackingModalShipment} onClose={() => setTrackingModalShipment(null)} />
    </>
  );
}
