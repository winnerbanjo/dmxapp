"use client";

import { formatDemoDateWithTime } from "@/lib/demo-date";

const STAGES = [
  { key: "orderReceived", label: "Order Received", getDate: (d: JourneyData) => d.createdAt },
  { key: "pickedUp", label: "Picked Up", getDate: (d: JourneyData) => d.timeline?.pickedUpAt },
  { key: "inTransit", label: "In Transit", getDate: (d: JourneyData) => d.timeline?.atSortingCenterAt },
  { key: "outForDelivery", label: "Out for Delivery", getDate: (d: JourneyData) => d.timeline?.outForDeliveryAt },
  { key: "delivered", label: "Delivered", getDate: (d: JourneyData) => d.timeline?.deliveredAt },
] as const;

type JourneyData = {
  createdAt: string;
  timeline?: {
    pickedUpAt?: string | null;
    atSortingCenterAt?: string | null;
    outForDeliveryAt?: string | null;
    deliveredAt?: string | null;
  };
};

function formatDate(iso: string | null | undefined): string {
  return formatDemoDateWithTime(iso);
}

export function TrackPageClient({
  trackingId,
  receiverName,
  status,
  packageWeight,
  cost,
  timeline,
  createdAt,
  partnerName,
  partnerTrackingUrl,
}: {
  trackingId: string;
  receiverName?: string;
  status: string;
  packageWeight: number;
  cost: number;
  timeline: JourneyData["timeline"];
  createdAt: string;
  updatedAt: string;
  partnerName?: string;
  partnerTrackingUrl?: string;
}) {
  const data: JourneyData = { createdAt, timeline: timeline || {} };

  const stepIndex = (() => {
    if (status === "Delivered" || timeline?.deliveredAt) return 5;
    if (timeline?.outForDeliveryAt) return 4;
    if (timeline?.atSortingCenterAt) return 3;
    if (timeline?.pickedUpAt) return 2;
    return 1;
  })();

  return (
    <div className="text-left">
      <h1 className="text-2xl font-light tracking-tight text-zinc-900">
        Delivery journey
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Tracking ID: <span className="font-mono text-zinc-900">{trackingId}</span>
      </p>
      {receiverName && (
        <p className="mt-1 text-sm text-zinc-500">
          Recipient: <span className="text-zinc-900">{receiverName}</span>
        </p>
      )}
      {trackingId === "DMX-1001" && (
        <div className="mt-4 border border-zinc-100 bg-zinc-50 p-4">
          <p className="text-sm text-zinc-600">
            Origin: <span className="font-medium text-zinc-900">Lagos</span>
            {" · "}
            Destination: <span className="font-medium text-zinc-900">Abuja</span>
          </p>
          <p className="mt-2 text-sm font-medium text-[#5e1914]">
            {status}
          </p>
        </div>
      )}

      <div className="mt-12">
        <ul className="relative space-y-0">
          {STAGES.map((step, i) => {
            const date = step.getDate(data);
            const isCompleted = date != null;
            const isCurrent = i + 1 === stepIndex && !isCompleted;
            const isLast = i === STAGES.length - 1;

            return (
              <li key={step.key} className="relative flex gap-6 pb-12">
                {!isLast && (
                  <div
                    className="absolute left-[11px] top-6 h-[calc(100%+2rem)] w-px bg-zinc-200"
                    aria-hidden
                  />
                )}
                <div
                  className={`relative z-10 h-6 w-6 shrink-0 rounded-none border-2 ${
                    isCompleted
                      ? "border-[#5e1914] bg-[#5e1914]"
                      : isCurrent
                        ? "border-[#5e1914] bg-white"
                        : "border-zinc-200 bg-white"
                  }`}
                />
                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className={`font-medium tracking-wide ${
                      isCompleted ? "text-zinc-900" : isCurrent ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatDate(date ?? null)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-12 border-t border-zinc-200 pt-8">
        <p className="text-sm text-zinc-500">Weight</p>
        <p className="mt-1 font-medium text-zinc-900">{packageWeight} kg</p>
        <p className="mt-6 text-sm text-zinc-500">Cost</p>
        <p className="mt-1 font-medium text-zinc-900">
          {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(cost)}
        </p>
        {partnerName && partnerTrackingUrl && (
          <div className="mt-6">
            <p className="text-sm text-zinc-500">Fulfillment Partner</p>
            <a
              href={partnerTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-medium text-[#5e1914] hover:underline"
            >
              Track via {partnerName} →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
