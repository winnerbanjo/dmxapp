"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export type ShipmentForModal = {
  trackingId: string;
  receiverName: string;
  status: string;
  cost: number;
  createdAt: string;
};

/** DMX-1001 master demo: Origin Lagos, Dest Abuja, status "In Transit - Arrived at Gwagwalada Hub" */
const DEMO_1001 = {
  origin: "Lagos",
  destination: "Abuja",
  statusDetail: "In Transit – Arrived at Gwagwalada Hub",
  steps: [
    { label: "Order received", done: true },
    { label: "Picked up", done: true },
    { label: "Arrived at Gwagwalada Hub", done: true, current: true },
    { label: "Out for delivery", done: false },
    { label: "Delivered", done: false },
  ],
};

function getTimeline(s: ShipmentForModal): { origin: string; destination: string; statusDetail: string; steps: { label: string; done: boolean; current?: boolean }[] } {
  if (s.trackingId === "DMX-1001") {
    return DEMO_1001;
  }
  const status = s.status.toUpperCase();
  const delivered = status === "DELIVERED";
  const inTransit = status === "IN-TRANSIT" || status === "IN_TRANSIT";
  const pending = status === "PENDING";
  return {
    origin: "Lagos",
    destination: s.receiverName,
    statusDetail: delivered ? "Delivered" : inTransit ? "In transit" : pending ? "Pending pickup" : s.status,
    steps: [
      { label: "Order received", done: true },
      { label: "Picked up", done: !pending },
      { label: "In transit", done: delivered, current: inTransit },
      { label: "Out for delivery", done: false },
      { label: "Delivered", done: delivered },
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

  const { origin, destination, statusDetail, steps } = getTimeline(shipment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" aria-hidden onClick={onClose} />
      <div className="relative w-full max-w-md border border-zinc-100 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            Track {shipment.trackingId}
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
        <div className="border-b border-zinc-100 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Route</p>
          <p className="mt-1 text-sm font-medium text-zinc-900">{origin} → {destination}</p>
          <p className="mt-2 text-sm text-[#5e1914]">{statusDetail}</p>
        </div>
        <div className="px-6 py-6">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Journey</p>
          <ul className="mt-4 space-y-0">
            {steps.map((step, i) => (
              <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
                {i < steps.length - 1 && (
                  <div
                    className="absolute left-[7px] top-5 h-[calc(100%+0.5rem)] w-px bg-zinc-200"
                    aria-hidden
                  />
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
                <p
                  className={`pt-0.5 text-sm font-medium ${
                    step.done ? "text-zinc-900" : step.current ? "text-[#5e1914]" : "text-zinc-400"
                  }`}
                >
                  {step.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-zinc-100 px-6 py-4">
          <p className="text-xs text-zinc-500">Amount</p>
          <p className="mt-1 font-medium text-zinc-900">
            {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(shipment.cost)}
          </p>
        </div>
      </div>
    </div>
  );
}
