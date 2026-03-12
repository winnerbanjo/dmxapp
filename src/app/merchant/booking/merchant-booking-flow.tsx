"use client";

import { useMemo, useState } from "react";
import type { ServiceType } from "@/data/booking-constants";
import { BookingPowerForm } from "./booking-power-form";
import { MoversBookingForm } from "./movers-booking-form";

type Sender = { businessName: string; email: string; address: string };

type QuoteDraft = {
  receiverName: string;
  receiverPhone: string;
  destination: string;
  weight: string;
  declaredValue: string;
  receiverCountry: string;
};

const INITIAL_DRAFT: QuoteDraft = {
  receiverName: "",
  receiverPhone: "",
  destination: "",
  weight: "",
  declaredValue: "",
  receiverCountry: "",
};

const ETA_BY_SERVICE: Record<ServiceType, string> = {
  local: "Same day",
  nationwide: "1-3 business days",
  international: "3-7 business days",
  movers: "Scheduled within 24 hours",
};

const SERVICE_COPY: Record<ServiceType, string> = {
  local: "Best for same-city bike and van deliveries.",
  nationwide: "Inter-state routing with hub-based fulfillment.",
  international: "Cross-border shipping with customs-ready workflow.",
  movers: "Bulk movement with van size, laborers, and packaging support.",
};

export function MerchantBookingFlow({ sender, merchantId }: { sender: Sender; merchantId?: string }) {
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [draft, setDraft] = useState<QuoteDraft>(INITIAL_DRAFT);

  const destinationText = draft.destination.trim().toLowerCase();
  const receiverCountryText = draft.receiverCountry.trim().toLowerCase();
  const weightNum = Math.max(0, parseFloat(draft.weight) || 0);
  const declaredValueNum = Math.max(0, parseFloat(draft.declaredValue) || 0);

  const serviceOptions = useMemo(() => {
    const isInternational = receiverCountryText !== "" && receiverCountryText !== "nigeria";
    const base = Math.round(1800 + weightNum * 650 + declaredValueNum * 0.0025);
    const domesticFactor =
      destinationText.includes("lagos") || destinationText.includes("ikeja") || destinationText.includes("lekki")
        ? 1
        : destinationText
            ? 1.25
            : 1;

    if (isInternational) {
      return [
        {
          type: "international" as const,
          label: "International",
          price: Math.round(base * 2.6),
          eta: ETA_BY_SERVICE.international,
        },
      ];
    }

    return [
      {
        type: "local" as const,
        label: "Local Delivery",
        price: Math.round(base * 0.95),
        eta: ETA_BY_SERVICE.local,
      },
      {
        type: "nationwide" as const,
        label: "Nationwide",
        price: Math.round(base * domesticFactor),
        eta: ETA_BY_SERVICE.nationwide,
      },
      {
        type: "movers" as const,
        label: "DMX Movers / Heavy Van",
        price: Math.round(Math.max(15000, base * 2.2)),
        eta: ETA_BY_SERVICE.movers,
      },
    ];
  }, [declaredValueNum, destinationText, receiverCountryText, weightNum]);

  const canQuote =
    draft.receiverName.trim() !== "" &&
    draft.receiverPhone.trim() !== "" &&
    draft.destination.trim() !== "" &&
    weightNum > 0;

  if (serviceType === null) {
    return (
      <div className="mt-12">
        <div className="border border-zinc-100 bg-white p-8">
          <h2 className="font-sans text-sm font-medium uppercase tracking-wider text-zinc-500">
            Shipment details first
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Enter the core shipment details. DMX will calculate available service options, pricing, and estimated delivery time before final booking.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm text-zinc-700">Receiver name</label>
              <input
                value={draft.receiverName}
                onChange={(e) => setDraft((prev) => ({ ...prev, receiverName: e.target.value }))}
                className="mt-2 h-12 w-full rounded-none border border-zinc-100 px-4 text-sm text-zinc-900"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-700">Receiver phone</label>
              <input
                value={draft.receiverPhone}
                onChange={(e) => setDraft((prev) => ({ ...prev, receiverPhone: e.target.value }))}
                className="mt-2 h-12 w-full rounded-none border border-zinc-100 px-4 text-sm text-zinc-900"
                placeholder="+234 800 000 0000"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-700">Destination city / area</label>
              <input
                value={draft.destination}
                onChange={(e) => setDraft((prev) => ({ ...prev, destination: e.target.value }))}
                className="mt-2 h-12 w-full rounded-none border border-zinc-100 px-4 text-sm text-zinc-900"
                placeholder="Abuja, Ikeja, Kano"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-700">Weight (kg)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={draft.weight}
                onChange={(e) => setDraft((prev) => ({ ...prev, weight: e.target.value }))}
                className="mt-2 h-12 w-full rounded-none border border-zinc-100 px-4 text-sm text-zinc-900"
                placeholder="2.5"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-700">Declared value (optional)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={draft.declaredValue}
                onChange={(e) => setDraft((prev) => ({ ...prev, declaredValue: e.target.value }))}
                className="mt-2 h-12 w-full rounded-none border border-zinc-100 px-4 text-sm text-zinc-900"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-700">Destination country</label>
              <input
                value={draft.receiverCountry}
                onChange={(e) => setDraft((prev) => ({ ...prev, receiverCountry: e.target.value }))}
                className="mt-2 h-12 w-full rounded-none border border-zinc-100 px-4 text-sm text-zinc-900"
                placeholder="Nigeria"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-sans text-sm font-medium uppercase tracking-wider text-zinc-500">
            Available service options
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Select the option that fits the shipment after reviewing price and ETA.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceOptions.map((option) => (
              <button
                key={option.type}
                type="button"
                disabled={!canQuote}
                onClick={() => setServiceType(option.type)}
                className={`border p-6 text-left transition-colors ${
                  canQuote
                    ? "border-zinc-100 bg-white hover:border-[#5e1914]"
                    : "cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-60"
                }`}
              >
                <p className="text-base font-semibold tracking-tight text-zinc-900">{option.label}</p>
                <p className="mt-2 text-sm text-zinc-500">{SERVICE_COPY[option.type]}</p>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-400">Estimated price</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-[#5e1914]">
                      ₦{option.price.toLocaleString("en-NG")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-zinc-400">ETA</p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">{option.eta}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {!canQuote && (
            <p className="mt-4 text-sm text-zinc-500">
              Enter receiver name, phone, destination, and weight to unlock service options.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (serviceType === "movers") {
    return (
      <MoversBookingForm
        sender={sender}
        merchantId={merchantId}
        initialValues={{
          receiverName: draft.receiverName,
          receiverPhone: draft.receiverPhone,
          deliveryAddress: draft.destination,
        }}
        onBack={() => setServiceType(null)}
      />
    );
  }

  return (
    <BookingPowerForm
      sender={sender}
      serviceType={serviceType}
      merchantId={merchantId}
      initialValues={{
        receiverName: draft.receiverName,
        receiverPhone: draft.receiverPhone,
        destination: draft.destination,
        weight: draft.weight,
        declaredValue: draft.declaredValue,
        receiverCountry: draft.receiverCountry,
      }}
      onBack={() => setServiceType(null)}
    />
  );
}
