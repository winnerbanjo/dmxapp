"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getWhatsAppUpdateUrl } from "@dmx/lib/whatsapp-url";
import { formatDemoDateOnly } from "@/lib/demo-date";
import { FileDown, MessageCircle, MapPin, Eye, Pencil, BellRing } from "lucide-react";
import { TrackModal, type ShipmentForModal } from "./shipments/track-modal";

type ShipmentRow = {
  id: string;
  trackingId: string;
  customerName: string;
  receiverName: string;
  destination: string;
  receiverPhone: string;
  serviceOption: string;
  status: string;
  packageWeight: number;
  cost: number;
  paymentStatus: string;
  createdAt: string;
};

type CustomNotification = {
  id: string;
  shipmentId: string;
  trackingId: string;
  urgent: boolean;
  message: string;
  remindAt: string;
  createdAt: string;
};

export function ShipmentList({ shipments }: { shipments: ShipmentRow[] }) {
  const [trackingModalShipment, setTrackingModalShipment] = useState<ShipmentForModal | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [notifyForId, setNotifyForId] = useState<string | null>(null);
  const [urgent, setUrgent] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [customNotifications, setCustomNotifications] = useState<CustomNotification[]>([]);

  const notifyShipment = useMemo(
    () => shipments.find((s) => s.id === notifyForId) ?? null,
    [notifyForId, shipments]
  );

  function handleView(s: ShipmentRow) {
    setTrackingModalShipment({
      trackingId: s.trackingId,
      customerName: s.customerName,
      receiverName: s.receiverName,
      receiverPhone: s.receiverPhone,
      destination: s.destination,
      serviceOption: s.serviceOption,
      paymentStatus: s.paymentStatus,
      status: s.status,
      packageWeight: s.packageWeight,
      cost: s.cost,
      createdAt: s.createdAt,
    });
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
    if (createdAt.includes("T")) return formatDemoDateOnly(createdAt);
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

  function handleCreateCustomNotification() {
    if (!notifyShipment || !customMessage.trim()) return;
    const next: CustomNotification = {
      id: `note-${Date.now()}`,
      shipmentId: notifyShipment.id,
      trackingId: notifyShipment.trackingId,
      urgent,
      message: customMessage.trim(),
      remindAt,
      createdAt: formatDemoDateOnly(),
    };
    setCustomNotifications((prev) => [next, ...prev]);
    setNotifyForId(null);
    setUrgent(false);
    setCustomMessage("");
    setRemindAt("");
  }

  const statusBadgeClass = (status: string) => {
    const s = status.toUpperCase();
    if (s === "DELIVERED") return "border-green-600 bg-green-50 text-green-700";
    if (s === "IN-TRANSIT" || s === "IN_TRANSIT") return "border-[#5e1914] bg-[#5e1914]/5 text-[#5e1914]";
    return "border-zinc-200 bg-zinc-50 text-zinc-700";
  };

  const paymentBadgeClass = (paymentStatus: string) => {
    const p = paymentStatus.toLowerCase();
    if (p === "paid") return "border-green-600 bg-green-50 text-green-700";
    if (p === "pending") return "border-amber-500 bg-amber-50 text-amber-700";
    return "border-red-400 bg-red-50 text-red-700";
  };

  return (
    <>
      <div className="overflow-x-auto rounded-none border border-zinc-200 bg-white">
        <table className="w-full min-w-[1300px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-5 py-4 font-medium tracking-tight text-zinc-900">Shipment ID</th>
              <th className="px-5 py-4 font-medium tracking-tight text-zinc-900">Customer Name</th>
              <th className="px-5 py-4 font-medium tracking-tight text-zinc-900">Receiver Name</th>
              <th className="px-5 py-4 font-medium tracking-tight text-zinc-900">Destination</th>
              <th className="px-5 py-4 font-medium tracking-tight text-zinc-900">Service Option</th>
              <th className="px-5 py-4 font-medium tracking-tight text-zinc-900">Status</th>
              <th className="px-5 py-4 font-medium tracking-tight text-zinc-900">Amount</th>
              <th className="px-5 py-4 font-medium tracking-tight text-zinc-900">Payment Status</th>
              <th className="px-5 py-4 font-medium tracking-tight text-zinc-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-8 py-16 text-center text-sm text-zinc-500">
                  No matches found
                </td>
              </tr>
            ) : (
              shipments.map((s) => (
                <tr key={s.id} className="border-b border-zinc-100 last:border-b-0">
                  <td className="px-5 py-4">
                    <Link
                      href={`/track/${encodeURIComponent(s.trackingId)}`}
                      className="font-mono text-sm font-medium text-[#5e1914] hover:underline"
                    >
                      {s.trackingId}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-zinc-900">{s.customerName}</td>
                  <td className="px-5 py-4 text-zinc-900">{s.receiverName}</td>
                  <td className="px-5 py-4 text-zinc-600">{s.destination}</td>
                  <td className="px-5 py-4 text-zinc-900">{s.serviceOption}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block border px-2 py-1 text-xs font-medium ${statusBadgeClass(s.status)}`}>
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-900">
                    {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(s.cost)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block border px-2 py-1 text-xs font-medium ${paymentBadgeClass(s.paymentStatus)}`}>
                      {s.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(s)}
                        className="inline-flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                      >
                        <Eye strokeWidth={1} className="h-4 w-4" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(s)}
                        className="inline-flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                      >
                        <Pencil strokeWidth={1} className="h-4 w-4" />
                        {editId === s.id ? "…" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrackingModalShipment({
                          trackingId: s.trackingId,
                          customerName: s.customerName,
                          receiverName: s.receiverName,
                          receiverPhone: s.receiverPhone,
                          destination: s.destination,
                          serviceOption: s.serviceOption,
                          paymentStatus: s.paymentStatus,
                          status: s.status,
                          packageWeight: s.packageWeight,
                          cost: s.cost,
                          createdAt: s.createdAt,
                        })}
                        className="inline-flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                      >
                        <MapPin strokeWidth={1} className="h-4 w-4" />
                        Track
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadWaybill(s.id)}
                        className="inline-flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                      >
                        <FileDown strokeWidth={1} className="h-4 w-4" />
                        Waybill
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendUpdate(s)}
                        className="inline-flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                      >
                        <MessageCircle strokeWidth={1} className="h-4 w-4" />
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifyForId(s.id)}
                        className="inline-flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                      >
                        <BellRing strokeWidth={1} className="h-4 w-4" />
                        Custom Notify
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {notifyShipment && (
        <div className="mt-5 border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Custom Notification</p>
          <p className="mt-1 text-sm text-zinc-700">
            Shipment <span className="font-mono text-[#5e1914]">{notifyShipment.trackingId}</span>
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm text-zinc-700">Message</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                placeholder="Type custom update to customer"
                className="mt-2 w-full rounded-none border border-zinc-200 bg-white p-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none"
              />
            </div>
            <label className="inline-flex items-center gap-3 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914] focus:ring-[#5e1914]"
              />
              Mark as urgent
            </label>
            <div>
              <label className="text-sm text-zinc-700">Reminder (optional)</label>
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                className="mt-2 h-10 w-full rounded-none border border-zinc-200 px-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleCreateCustomNotification}
              className="rounded-none bg-[#5e1914] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a130f]"
            >
              Save Notification
            </button>
            <button
              type="button"
              onClick={() => {
                setNotifyForId(null);
                setUrgent(false);
                setCustomMessage("");
                setRemindAt("");
              }}
              className="rounded-none border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 border border-zinc-200 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Notification Center</p>
        {customNotifications.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No custom notifications yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100">
            {customNotifications.map((n) => (
              <li key={n.id} className="py-3 text-sm">
                <p className="text-zinc-900">
                  <span className="font-mono text-[#5e1914]">{n.trackingId}</span>
                  {" "}
                  {n.urgent && (
                    <span className="mr-2 inline-block border border-red-400 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                      Urgent
                    </span>
                  )}
                  {n.message}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Created {n.createdAt}
                  {n.remindAt ? ` · Reminder ${new Date(n.remindAt).toLocaleString()}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <TrackModal shipment={trackingModalShipment} onClose={() => setTrackingModalShipment(null)} />
    </>
  );
}
