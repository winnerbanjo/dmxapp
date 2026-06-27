"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BOOKING_FROM_TASK_KEY, type HubBookingFromTask } from "@/data/demo-tasks";
import type { ServiceType } from "@/data/booking-constants";
import { ServiceTypeSelector } from "@/components/service-type-selector";
import { DEMO_PARTNERS } from "@/data/partners-demo";
import { StructuredAddressField } from "@/components/structured-address-field";
import { emptyStructuredAddress, formatStructuredAddress, type StructuredAddressValue } from "@/types/address";

const PACKAGE_CATEGORY_OPTIONS = [
  { value: "personal", label: "Personal" },
  { value: "commercial", label: "Commercial" },
];

type CourierRate = {
  id: string;
  name: string;
  service: string;
  eta: string;
  pickup: string;
  amount: number;
  recommended?: boolean;
};

export default function HubBookingPage() {
  const taskHref = "/hub/tasks";
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [fromTask, setFromTask] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupStructured, setPickupStructured] = useState<StructuredAddressValue>(emptyStructuredAddress());
  const [deliveryStructured, setDeliveryStructured] = useState<StructuredAddressValue>(emptyStructuredAddress());
  const [notes, setNotes] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [itemValueCustoms, setItemValueCustoms] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [idPassportNumber, setIdPassportNumber] = useState("");
  const [packageCategory, setPackageCategory] = useState("");
  const [fulfillmentPartnerId, setFulfillmentPartnerId] = useState<string>("dmx-internal");
  const [selectedCourierId, setSelectedCourierId] = useState("dmx");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_FROM_TASK_KEY);
      if (raw) {
        const data = JSON.parse(raw) as HubBookingFromTask;
        if (data.customerName) setName(data.customerName);
        if (data.phone) setPhone(data.phone);
        if (data.pickupAddress) setPickupStructured((prev) => ({ ...prev, streetAddress: data.pickupAddress ?? "" }));
        if (data.deliveryAddress) setDeliveryStructured((prev) => ({ ...prev, streetAddress: data.deliveryAddress ?? "" }));
        if (data.specialInstructions) setNotes(data.specialInstructions);
        if (data.serviceType) {
          setServiceType(data.serviceType);
          setFromTask(true);
        }
      }
    } catch (_) {}
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    try {
      sessionStorage.removeItem(BOOKING_FROM_TASK_KEY);
    } catch (_) {}
  }

  const isInternational = serviceType === "international";
  const showForm = serviceType !== null;
  const courierRates: CourierRate[] = useMemo(() => {
    const serviceFactor = serviceType === "international" ? 2.4 : serviceType === "nationwide" ? 1.35 : serviceType === "movers" ? 4.2 : 1;
    const customsFactor = Number(itemValueCustoms || 0) > 0 ? 1.08 : 1;
    const base = Math.round(6800 * serviceFactor * customsFactor);

    return [
      {
        id: "dmx",
        name: "DMX Express",
        service: "Managed Network",
        eta: serviceType === "international" ? "3-7 business days" : "1-3 business days",
        pickup: "Hub intake or pickup",
        amount: base,
        recommended: true,
      },
      {
        id: "dhl",
        name: "DHL Express",
        service: "Express Worldwide",
        eta: serviceType === "international" ? "2-5 business days" : "1-3 business days",
        pickup: "Pickup available",
        amount: Math.round(base * 1.22 + 1500),
      },
      {
        id: "fedex",
        name: "FedEx",
        service: "Priority",
        eta: serviceType === "international" ? "3-6 business days" : "2-4 business days",
        pickup: "Pickup available",
        amount: Math.round(base * 1.12 + 1800),
      },
      {
        id: "ups",
        name: "UPS",
        service: "Saver",
        eta: serviceType === "international" ? "4-7 business days" : "2-5 business days",
        pickup: "Drop-off preferred",
        amount: Math.round(base * 1.02 + 900),
      },
    ];
  }, [itemValueCustoms, serviceType]);
  const selectedCourier = courierRates.find((rate) => rate.id === selectedCourierId) ?? courierRates[0];

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl bg-white">
        <header className="flex items-center gap-4 border-b border-zinc-100 pb-6">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-white">
            <Image src="/dmxlogo.png" alt="DMX" fill className="object-contain" sizes="40px" />
          </div>
          <div className="flex-1">
            <h1 className="font-sans text-2xl font-semibold tracking-tighter text-zinc-900">Booking</h1>
            <p className="mt-1 text-sm text-zinc-500">Waybill created. Shipment will appear in Branch Inventory.</p>
          </div>
        </header>
        <div className="mt-10 rounded-none border border-zinc-100 bg-zinc-50 p-8">
          <p className="text-sm font-medium text-[#5e1914]">Booking saved. You can return to Tasks or create another.</p>
          <div className="mt-6 flex gap-3">
            <Link
              href={taskHref}
              className="rounded-none border border-[#5e1914] bg-[#5e1914] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a130f]"
            >
              Back to Tasks
            </Link>
            <button
              type="button"
              onClick={() => { setSubmitted(false); setServiceType(null); }}
              className="rounded-none border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
            >
              New booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="mx-auto max-w-2xl bg-white">
        <header className="flex items-center gap-4 border-b border-zinc-100 pb-6">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-white">
            <Image src="/dmxlogo.png" alt="DMX" fill className="object-contain" sizes="40px" />
          </div>
          <div className="flex-1">
            <h1 className="font-sans text-2xl font-semibold tracking-tighter text-zinc-900">Booking</h1>
            <p className="mt-1 text-sm text-zinc-500">Select service type. From a task? Accept the task to open the form pre-filled.</p>
          </div>
          <Link href={taskHref} className="rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">
            ← Tasks
          </Link>
        </header>
        <div className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Service type</h2>
          <ServiceTypeSelector value={null} onSelect={setServiceType} className="mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl bg-white">
      <header className="flex items-center gap-4 border-b border-zinc-100 pb-6">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-white">
          <Image src="/dmxlogo.png" alt="DMX" fill className="object-contain" sizes="40px" />
        </div>
        <div className="flex-1">
          <h1 className="font-sans text-2xl font-semibold tracking-tighter text-zinc-900">Booking</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {fromTask ? "Task data pre-filled. Complete and add internal note." : "Create waybill. Add internal note on receipt."}
          </p>
        </div>
        <Link href={taskHref} className="rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">
          ← Tasks
        </Link>
      </header>

      <div className="mt-6 mb-8">
        <button
          type="button"
          onClick={() => setServiceType(null)}
          className="text-sm font-medium text-zinc-500 hover:text-[#5e1914]"
        >
          ← Change service type
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Customer / Receiver</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Phone</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 ..."
                className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                required
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans">Addresses</h2>
          <div className="mt-6 space-y-10">
            <StructuredAddressField
              label="Pickup address"
              value={pickupStructured}
              onChange={setPickupStructured}
              namePrefix="pickup"
              showMapPreview={true}
              required={true}
            />
            <StructuredAddressField
              label="Delivery address (optional)"
              value={deliveryStructured}
              onChange={setDeliveryStructured}
              namePrefix="delivery"
              showMapPreview={true}
              required={false}
            />
          </div>
        </section>

        {isInternational && (
          <section>
            <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">International (Customs)</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="itemValueCustoms" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Item Value for Customs (₦)</label>
                <input
                  id="itemValueCustoms"
                  type="number"
                  min="0"
                  value={itemValueCustoms}
                  onChange={(e) => setItemValueCustoms(e.target.value)}
                  className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                />
              </div>
              <div>
                <label htmlFor="hsCode" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">HS Code (optional)</label>
                <input
                  id="hsCode"
                  type="text"
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                  placeholder="e.g. 8471.30"
                  className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                />
              </div>
              <div>
                <label htmlFor="idPassportNumber" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">ID / Passport Number</label>
                <input
                  id="idPassportNumber"
                  type="text"
                  value={idPassportNumber}
                  onChange={(e) => setIdPassportNumber(e.target.value)}
                  className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                />
              </div>
              <div>
                <label htmlFor="packageCategory" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Package Category</label>
                <select
                  id="packageCategory"
                  value={packageCategory}
                  onChange={(e) => setPackageCategory(e.target.value)}
                  className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                >
                  <option value="">Select</option>
                  {PACKAGE_CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        <section>
          <label htmlFor="fulfillmentPartner" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Fulfillment Partner</label>
          <select
            id="fulfillmentPartner"
            value={fulfillmentPartnerId}
            onChange={(e) => setFulfillmentPartnerId(e.target.value)}
            className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
          >
            {DEMO_PARTNERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.isInternal ? "(Internal)" : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Select who will handle this shipment. External partners (DHL, GIG, FedEx) will show a &quot;Track via Partner&quot; link on the waybill.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Select courier and rate</h2>
          <p className="mt-1 text-xs text-zinc-500">Final courier selection happens here before the waybill is created.</p>
          <input type="hidden" name="courierId" value={selectedCourier.id} />
          <input type="hidden" name="courierName" value={selectedCourier.name} />
          <input type="hidden" name="courierPrice" value={selectedCourier.amount} />
          <div className="mt-5 space-y-3">
            {courierRates.map((rate) => (
              <button
                key={rate.id}
                type="button"
                onClick={() => setSelectedCourierId(rate.id)}
                className={`w-full border bg-white p-4 text-left transition-colors ${
                  selectedCourier.id === rate.id ? "border-[#5e1914] bg-[#f7f1ef]" : "border-zinc-100 hover:border-[#5e1914]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-zinc-900">{rate.name}</p>
                      {rate.recommended ? <span className="bg-[#5e1914] px-2 py-1 text-xs font-semibold text-white">Recommended</span> : null}
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">{rate.service}</p>
                    <p className="mt-2 text-xs text-zinc-500">ETA: {rate.eta} · {rate.pickup}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-zinc-400">Price</p>
                    <p className="mt-1 text-xl font-semibold tracking-tight text-[#5e1914]">₦{rate.amount.toLocaleString("en-NG")}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label htmlFor="notes" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Notes (Special Instructions)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Call before arriving. Fragile—handle with care."
            rows={3}
            className="mt-2 w-full resize-y rounded-none border border-zinc-200 bg-white px-4 py-4 font-sans text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
          />
        </section>

        <section>
          <label htmlFor="internalNote" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Internal Note (package condition on receipt)
          </label>
          <textarea
            id="internalNote"
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="e.g. Box slightly dented. Sealed. Verified weight 2.1 kg."
            rows={3}
            className="mt-2 w-full resize-y rounded-none border border-zinc-200 bg-white px-4 py-4 font-sans text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
          />
          <p className="mt-1 text-xs text-zinc-500">For staff only. Log condition when package arrives at hub.</p>
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-none border border-[#5e1914] bg-[#5e1914] px-6 py-3 text-sm font-medium text-white hover:bg-[#4a130f]"
          >
            Create waybill
          </button>
          <Link
            href={taskHref}
            className="rounded-none border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
