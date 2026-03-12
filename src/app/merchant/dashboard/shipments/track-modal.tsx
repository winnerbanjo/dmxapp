"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export type ShipmentForModal = {
  trackingId: string;
  customerName: string;
  receiverName: string;
  receiverPhone: string;
  destination: string;
  serviceOption: string;
  paymentStatus: string;
  status: string;
  packageWeight: number;
  cost: number;
  createdAt: string;
};

function getTimeline(s: ShipmentForModal): {
  origin: string;
  destination: string;
  statusDetail: string;
  assignedHub: string;
  assignedRider: string;
  paymentRef: string;
  steps: { label: string; done: boolean; current?: boolean; at: string }[];
} {
  const status = s.status.toUpperCase();
  const delivered = status === "DELIVERED";
  const inTransit = status === "IN-TRANSIT" || status === "IN_TRANSIT";
  const pending = status === "PENDING";

  return {
    origin: "Lagos",
    destination: s.destination,
    statusDetail: delivered ? "Delivered successfully" : inTransit ? "In transit to destination hub" : pending ? "Pending pickup" : s.status,
    assignedHub: `${s.destination} Hub`,
    assignedRider: delivered ? "Rider Musa (Completed)" : "Rider Tunde",
    paymentRef: `PAY-${s.trackingId.replace("DMX-", "")}`,
    steps: [
      { label: "Order received", done: true, at: s.createdAt },
      { label: "Picked up", done: !pending, at: s.createdAt },
      { label: "Arrived at destination hub", done: delivered, current: inTransit, at: s.createdAt },
      { label: "Out for delivery", done: delivered, at: s.createdAt },
      { label: "Delivered", done: delivered, at: delivered ? s.createdAt : "Pending" },
    ],
  };
}

export function TrackModal({
  shipment,
  onClose,
}: {
  shipment: ShipmentForModal | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!shipment) return null;

  const { origin, destination, statusDetail, assignedHub, assignedRider, paymentRef, steps } = getTimeline(shipment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" aria-hidden onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-zinc-100 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            Shipment {shipment.trackingId}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-none p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <section className="border border-zinc-100 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Booking Data</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Customer</dt><dd className="font-medium text-zinc-900">{shipment.customerName}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Receiver</dt><dd className="font-medium text-zinc-900">{shipment.receiverName}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Phone</dt><dd className="font-medium text-zinc-900">{shipment.receiverPhone}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Weight</dt><dd className="font-medium text-zinc-900">{shipment.packageWeight}kg</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Service</dt><dd className="font-medium text-zinc-900">{shipment.serviceOption}</dd></div>
            </dl>
          </section>

          <section className="border border-zinc-100 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Payment Information</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Amount</dt><dd className="font-medium text-zinc-900">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(shipment.cost)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Payment Status</dt><dd className="font-medium text-zinc-900">{shipment.paymentStatus}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Payment Ref</dt><dd className="font-mono text-zinc-900">{paymentRef}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Booked At</dt><dd className="font-medium text-zinc-900">{shipment.createdAt}</dd></div>
            </dl>
          </section>

          <section className="border border-zinc-100 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Operations</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Origin</dt><dd className="font-medium text-zinc-900">{origin}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Destination</dt><dd className="font-medium text-zinc-900">{destination}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Assigned Hub</dt><dd className="font-medium text-zinc-900">{assignedHub}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Assigned Rider</dt><dd className="font-medium text-zinc-900">{assignedRider}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Current Status</dt><dd className="font-medium text-[#5e1914]">{statusDetail}</dd></div>
            </dl>
          </section>

          <section className="border border-zinc-100 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Status Timeline</p>
            <ul className="mt-4 space-y-0">
              {steps.map((step, i) => (
                <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < steps.length - 1 && (
                    <div className="absolute left-[7px] top-5 h-[calc(100%+0.5rem)] w-px bg-zinc-200" aria-hidden />
                  )}
                  <div
                    className={`relative z-10 h-4 w-4 shrink-0 border-2 ${
                      step.done
                        ? "border-[#5e1914] bg-[#5e1914]"
                        : step.current
                          ? "border-[#5e1914] bg-white"
                          : "border-zinc-200 bg-white"
                    }`}
                  />
                  <div>
                    <p
                      className={`pt-0.5 text-sm font-medium ${
                        step.done ? "text-zinc-900" : step.current ? "text-[#5e1914]" : "text-zinc-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-zinc-500">{step.at}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
