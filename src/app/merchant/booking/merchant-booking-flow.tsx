"use client";

import { useState } from "react";
import type { ServiceType } from "@/data/booking-constants";
import { ServiceTypeSelector } from "@/components/service-type-selector";
import { BookingPowerForm } from "./booking-power-form";
import { MoversBookingForm } from "./movers-booking-form";

type Sender = { businessName: string; email: string; address: string };

export function MerchantBookingFlow({ sender, merchantId }: { sender: Sender; merchantId?: string }) {
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);

  if (serviceType === null) {
    return (
      <div className="mt-12">
        <h2 className="font-sans text-sm font-medium uppercase tracking-wider text-zinc-500">
          Select service type
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Choose the type of shipment. We’ll show only the fields you need.
        </p>
        <ServiceTypeSelector
          value={null}
          onSelect={setServiceType}
          className="mt-8"
        />
      </div>
    );
  }

  if (serviceType === "movers") {
    return (
      <MoversBookingForm
        sender={sender}
        merchantId={merchantId}
        onBack={() => setServiceType(null)}
      />
    );
  }

  return (
    <BookingPowerForm
      sender={sender}
      serviceType={serviceType}
      merchantId={merchantId}
      onBack={() => setServiceType(null)}
    />
  );
}
