"use client";

import { useEffect, useState } from "react";
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

export default function HubBookingPage() {
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
              href="/hub/tasks"
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
          <Link href="/hub/tasks" className="rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">
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
        <Link href="/hub/tasks" className="rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">
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
            href="/hub/tasks"
            className="rounded-none border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
