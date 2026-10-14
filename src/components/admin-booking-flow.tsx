"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Edit3,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import allCountriesData from "@/data/countries.json";
import {
  COUNTRY_PHONE_PREFIXES,
  getPrefixForCountry,
  splitPhoneNumber,
  formatFullPhone,
} from "@/lib/phone-prefix";
import {
  POPULAR_HS_CATEGORIES,
  HS_DATABASE,
  detectHsCode,
  searchHsCodes,
} from "@/lib/hs-codes";

export interface CountryItem {
  _id: string;
  Name: string;
  Code: string;
  TelephoneCode?: string;
  DHLZone?: number;
  DHLProfitMargin?: number;
}

const sortedCountries: CountryItem[] = ([...allCountriesData] as CountryItem[]).sort((a, b) =>
  a.Name.localeCompare(b.Name)
);


type Step = "sender" | "receiver" | "items" | "addons" | "carrier" | "review";

type Address = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
};

type ParcelItem = {
  name: string;
  hsCode: string;
  weight: number;
  quantity: number;
  value: number;
  origin: string;
};

type Rate = {
  id: string;
  name: string;
  service: string;
  pickup: string;
  delivery: string;
  amount: number;
  carrierCode?: string;
  tags?: string[];
  recommended?: boolean;
  isLive?: boolean;
};

const steps: { id: Step; label: string }[] = [
  { id: "sender", label: "Sender" },
  { id: "receiver", label: "Receiver" },
  { id: "items", label: "Items" },
  { id: "addons", label: "Add-ons" },
  { id: "carrier", label: "Carrier" },
  { id: "review", label: "Review" },
];

const emptySender: Address = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  address1: "",
  address2: "",
  country: "Nigeria",
  state: "",
  city: "",
  postalCode: "",
};

const emptyReceiver: Address = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  address1: "",
  address2: "",
  country: "",
  state: "",
  city: "",
  postalCode: "",
};

const baseRates: Rate[] = [
  { id: "dhl", name: "DHL Express", service: "Express Worldwide", pickup: "Within 1 business day", delivery: "Within 2 business days", amount: 236874.94, tags: ["Pickup", "Dropoff"], recommended: true },
];

const branches = [
  { name: "32 Awolowo Road, Ikoyi Lagos", distance: "5.02km" },
  { name: "Sandilad Arcade, Plot 230 Muri Okunola str, Victoria Island", distance: "5.81km" },
  { name: "Plot 1302A, Akin Adesola str, Victoria Island, Lagos", distance: "5.81km" },
  { name: "6, Davies str, off Broad str, Lagos Island", distance: "6.12km" },
];

function money(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);
}

function compactAddress(address: Address) {
  const parts = [
    address.address1,
    address.address2,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ].filter(Boolean);
  return parts.join(", ");
}

export function AdminBookingFlow() {
  const [step, setStep] = useState<Step>("sender");
  const [sender, setSender] = useState<Address>(emptySender);
  const [receiver, setReceiver] = useState<Address>(emptyReceiver);
  const [addressMode, setAddressMode] = useState<"book" | "hub" | "new">("new");
  const [receiverMode, setReceiverMode] = useState<"book" | "hub" | "new">("new");
  const [purpose, setPurpose] = useState("Personal (Items are not for sale)");
  const [currency, setCurrency] = useState("Nigerian Naira (NGN)");
  const [packaging, setPackaging] = useState("Box");
  const [length, setLength] = useState(30);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(10);
  const [items, setItems] = useState<ParcelItem[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemDraft, setItemDraft] = useState<ParcelItem>({
    name: "",
    hsCode: "",
    weight: 1,
    quantity: 1,
    value: 50000,
    origin: "Nigeria",
  });
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [isLiveDhl, setIsLiveDhl] = useState(false);
  const [rates, setRates] = useState<Rate[]>(baseRates);
  const [selectedRateId, setSelectedRateId] = useState("dhl");
  const [dropoffOpen, setDropoffOpen] = useState(false);
  const [pickupMode, setPickupMode] = useState<"pickup" | "dropoff">("pickup");
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [insurance, setInsurance] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingPending, setBookingPending] = useState(false);
  const [confirmedShipment, setConfirmedShipment] = useState<{
    trackingNumber: string | number;
    shipmentId: string;
    status: string;
    carrier: string;
    date: string;
  } | null>(null);

  const volumetricWeight = useMemo(
    () => Number(((length * width * height) / 5000).toFixed(2)),
    [length, width, height]
  );
  const actualWeight = useMemo(
    () => items.reduce((sum, item) => sum + (item.weight || 0) * (item.quantity || 1), 0),
    [items]
  );
  const chargeableWeight = Math.max(actualWeight, volumetricWeight, 1);
  const parcelValue = items.reduce((sum, item) => sum + (item.value || 0) * (item.quantity || 1), 0);

  const selectedRate = rates.find((rate) => rate.id === selectedRateId) ?? rates[0] ?? {
    id: "dhl",
    name: "DHL Express",
    service: "Express Worldwide",
    pickup: "Within 1 business day",
    delivery: "Within 2 business days",
    amount: 150000,
  };

  const insuranceFee = insurance ? Math.round(parcelValue * 0.033) : 0;
  const customsCharge = receiver.country.toLowerCase() === "nigeria" ? 0 : Math.round(parcelValue * 0.025);
  const serviceCharge = 500;
  const total = selectedRate.amount + insuranceFee + customsCharge + serviceCharge;

  async function fetchLiveRates() {
    if (!receiver.country.trim()) {
      alert("Please select a receiver destination country first.");
      return;
    }
    setLoadingRates(true);
    try {
      const res = await fetch("/api/carriers/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originCountry: sender.country || "Nigeria",
          originState: sender.state,
          originCity: sender.city,
          originPostalCode: sender.postalCode,
          originAddress: sender.address1,
          destinationCountry: receiver.country,
          destinationState: receiver.state,
          destinationCity: receiver.city,
          destinationPostalCode: receiver.postalCode,
          destinationAddress: receiver.address1,
          weightKg: chargeableWeight,
          length,
          width,
          height,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.rates) && data.rates.length > 0) {
        setRates(data.rates);
        setIsLiveDhl(Boolean(data.isLiveDhl));
        setRatesLoaded(true);
        const dhl = data.rates.find((r: Rate) => r.id === "dhl") || data.rates[0];
        if (dhl) setSelectedRateId(dhl.id);
      } else {
        alert(data.message || "Unable to fetch live carrier rates. Check destination details.");
      }
    } catch (err) {
      console.error("[BookingFlow] Error fetching live rates:", err);
      alert("Error contacting carrier rate service. Please try again.");
    } finally {
      setLoadingRates(false);
    }
  }

  function go(next: Step) {
    if (step === "sender" && next === "receiver") {
      if (!sender.firstName.trim() || !sender.phone.trim() || !sender.address1.trim() || !sender.country.trim()) {
        alert("Please complete the sender's name, phone, address, and country to continue.");
        return;
      }
    }
    if (step === "receiver" && next === "items") {
      if (!receiver.firstName.trim() || !receiver.phone.trim() || !receiver.address1.trim() || !receiver.country.trim()) {
        alert("Please complete the receiver's name, phone, address, and destination country to continue.");
        return;
      }
    }
    if (step === "items" && (next === "addons" || next === "carrier" || next === "review")) {
      if (items.length === 0) {
        alert("Please add at least one item to your parcel before proceeding.");
        return;
      }
    }
    if (next === "carrier" && !ratesLoaded && !loadingRates) {
      fetchLiveRates();
    }
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleBookShipment() {
    setBookingPending(true);
    try {
      const res = await fetch("/api/shipments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender,
          receiver,
          items,
          packaging,
          length,
          width,
          height,
          chargeableWeight,
          selectedRate,
          pickupMode,
          total,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConfirmedShipment({
          trackingNumber: data.trackingNumber,
          shipmentId: data.shipmentId,
          status: data.status,
          carrier: data.carrier,
          date: data.date,
        });
        setConfirmed(true);
      } else {
        alert(data.message || "Failed to book shipment");
      }
    } catch (err) {
      console.error("[BookingFlow] Booking failed:", err);
      alert("Error booking shipment. Please try again.");
    } finally {
      setBookingPending(false);
    }
  }

  function saveItem() {
    if (!itemDraft.name.trim()) {
      alert("Please enter an item name or description.");
      return;
    }
    const detected = detectHsCode(itemDraft.name);
    const resolvedHsCode = itemDraft.hsCode.trim() || detected?.code || "6204.42";
    setItems((prev) => [...prev, { ...itemDraft, hsCode: resolvedHsCode }]);
    setItemDraft({
      name: "",
      hsCode: "",
      weight: 1,
      quantity: 1,
      value: 50000,
      origin: "Nigeria",
    });
    setShowItemModal(false);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  if (confirmed) {
    const trackingDisplay = confirmedShipment?.trackingNumber
      ? `DMX-${confirmedShipment.trackingNumber}`
      : "DMX-132718";

    return (
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{trackingDisplay}</h1>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(String(confirmedShipment?.trackingNumber ?? "132718"));
                  alert("Tracking number copied to clipboard!");
                }}
                className="hover:text-zinc-700"
              >
                <Copy className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              Live Verified Booking · Status: <span className="font-semibold text-emerald-600">PRE-TRANSIT</span> ·{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/track/${confirmedShipment?.trackingNumber ?? "132718"}`}
              className="rounded-none bg-[#5e1914] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4a130f]"
            >
              Track shipment
            </Link>
            <Link
              href="/admin/shipments"
              className="border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              View in Shipments
            </Link>
          </div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <SummaryCard title="Sender" address={sender} />
              <SummaryCard title="Receiver" address={receiver} />
            </div>
            <section className="border border-zinc-100 bg-zinc-50 p-6">
              <h2 className="font-semibold text-zinc-900">Courier Information</h2>
              <div className="mt-5 flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center bg-yellow-400 text-xs font-bold text-zinc-900">
                  {selectedRate.carrierCode || "DHL"}
                </span>
                <div>
                  <p className="font-semibold text-zinc-900">{selectedRate.name}</p>
                  <p className="text-sm text-zinc-500">{selectedRate.service}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="grid h-9 w-9 place-items-center bg-[#5e1914] text-white"><Phone className="h-4 w-4" /></button>
                  <button className="grid h-9 w-9 place-items-center bg-[#5e1914] text-white"><Mail className="h-4 w-4" /></button>
                </div>
              </div>
            </section>
            <section className="border border-zinc-100 bg-zinc-50 p-6">
              <h2 className="font-semibold text-zinc-900">Parcel Information</h2>
              <p className="mt-4 text-sm text-zinc-700">
                Purpose: {purpose}, Total Weight: {actualWeight}kg, Volumetric Weight: {volumetricWeight}kg, Total Value: {money(parcelValue)}
              </p>
              {items.map((item, index) => (
                <p key={index} className="mt-3 text-sm text-zinc-600">
                  <span className="font-semibold text-[#5e1914]">ITEM {index + 1}</span><br />
                  {item.name} {item.hsCode ? `· HS Code: ${item.hsCode}` : ""}, {item.quantity} piece(s), {item.weight}kg, {money(item.value)}, Origin: {item.origin}
                </p>
              ))}
            </section>
          </div>
          <PaymentPanel
            title="Payment Details"
            total={total}
            shipping={selectedRate.amount}
            addOns={insuranceFee}
            customs={customsCharge}
            service={serviceCharge}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      <div className={`grid min-h-full ${step === "review" ? "lg:grid-cols-[minmax(0,1fr)_380px]" : ""}`}>
        <main className="px-8 py-10 lg:px-14">
          <StepNav step={step} setStep={go} />
          {step === "sender" && (
            <AddressStep
              title="Add Sender"
              subtitle="Enter origin details or use the live address autocomplete."
              mode={addressMode}
              setMode={setAddressMode}
              address={sender}
              setAddress={setSender}
              onNext={() => go("receiver")}
              isSender
            />
          )}
          {step === "receiver" && (
            <AddressStep
              title="Add Receiver"
              subtitle="Enter recipient destination address or use the live autocomplete."
              mode={receiverMode}
              setMode={setReceiverMode}
              address={receiver}
              setAddress={setReceiver}
              onNext={() => go("items")}
              isSender={false}
            />
          )}
          {step === "items" && (
            <section>
              <PageTitle title="Add Items" subtitle="Declare items and packaging details for carrier rating." />
              <div className="mt-8 grid gap-4 rounded-none bg-[#f6f1ea] p-5 md:grid-cols-2">
                <SelectField
                  label="Purpose of shipping"
                  value={purpose}
                  onChange={setPurpose}
                  options={["Personal (Items are not for sale)", "Commercial", "Gift", "Documents"]}
                />
                <SelectField
                  label="Select Currency"
                  value={currency}
                  onChange={setCurrency}
                  options={["Nigerian Naira (NGN)", "United States Dollar (USD)", "British Pound (GBP)"]}
                />
              </div>
              <div className="mt-8 rounded-none bg-[#f6f1ea] p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                    <Package className="h-5 w-5 text-[#5e1914]" /> Parcel Package Dimensions
                  </h2>
                  <span className="border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    Volumetric weight = {volumetricWeight}kg
                  </span>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <SelectField label="Type" value={packaging} onChange={setPackaging} options={["Box", "Envelope", "Tube", "Crate"]} />
                  <NumberField label="Length (cm)" value={length} onChange={setLength} />
                  <NumberField label="Width (cm)" value={width} onChange={setWidth} />
                  <NumberField label="Height (cm)" value={height} onChange={setHeight} />
                </div>
                <div className="mt-6 rounded-none bg-white">
                  <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4">
                    <h3 className="font-semibold text-zinc-900">Declared Items ({items.length})</h3>
                    <button
                      type="button"
                      onClick={() => setShowItemModal(true)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5e1914] hover:underline"
                    >
                      <Plus className="h-4 w-4" /> Add Item
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <div className="p-8 text-center">
                      <Package className="mx-auto h-8 w-8 text-zinc-300" />
                      <p className="mt-2 text-sm font-medium text-zinc-700">No items added yet</p>
                      <p className="mt-1 text-xs text-zinc-500">Please click &quot;Add Item&quot; to declare what is inside the shipment.</p>
                      <button
                        type="button"
                        onClick={() => setShowItemModal(true)}
                        className="mt-4 rounded-none bg-[#5e1914] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4a130f]"
                      >
                        + Add First Item
                      </button>
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-zinc-50 px-4 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-zinc-900">{item.name}</p>
                            {item.hsCode ? (
                              <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-mono font-semibold text-[#5e1914]">
                                HS {item.hsCode}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-zinc-500">
                            {item.quantity} pcs · {item.weight} kg · {money(item.value)} · Origin: {item.origin}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="border border-zinc-200 p-2 text-zinc-500 hover:text-red-600"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="border-t border-zinc-100 px-4 py-4 text-sm font-semibold text-zinc-900">
                    Parcel Actual Weight: {actualWeight}kg · Declared Value: {money(parcelValue)}
                  </div>
                </div>
                <div className="mt-8 grid gap-8 md:grid-cols-3">
                  {["Parcel Items Invoice", "Proof of Purchase", "Proof of Weight"].map((label) => (
                    <div key={label}>
                      <p className="text-sm font-medium text-zinc-800">{label} <span className="text-xs text-zinc-400 underline">Sample</span></p>
                      <button className="mt-3 flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50">
                        <Upload className="h-4 w-4" /> Upload Document
                      </button>
                      <p className="mt-2 text-xs text-zinc-400">Optional documentation</p>
                    </div>
                  ))}
                </div>
              </div>
              <FooterActions onPrevious={() => go("receiver")} onNext={() => go("addons")} />
            </section>
          )}
          {step === "carrier" && (
            <section>
              <PageTitle title="Select Carrier" subtitle="Real-time live DHL Express rates." />
              <div className="mt-6 grid gap-3 border border-zinc-100 bg-[#f7f1ef] p-5 sm:grid-cols-4">
                <Metric label="Actual weight" value={`${actualWeight.toFixed(2)} kg`} />
                <Metric label="Volumetric weight" value={`${volumetricWeight.toFixed(2)} kg`} />
                <Metric label="Chargeable weight" value={`${chargeableWeight.toFixed(2)} kg`} />
                <Metric label="Declared value" value={money(parcelValue)} />
              </div>
              <div className="mt-6 flex items-center justify-between bg-[#f6f1ea] p-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Connected Carrier: DHL Express
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fetchLiveRates()}
                    disabled={loadingRates}
                    className="flex items-center gap-2 bg-white px-3 py-2 text-sm font-semibold text-[#5e1914] shadow-sm hover:bg-[#f6f1ea] disabled:opacity-50"
                  >
                    {loadingRates ? <Loader2 className="h-4 w-4 animate-spin text-[#5e1914]" /> : <RefreshCw className="h-4 w-4" />}
                    {loadingRates ? "Calculating..." : "Recalculate Rates"}
                  </button>
                </div>
              </div>

              {loadingRates ? (
                <div className="mt-6 border border-dashed border-zinc-200 p-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#5e1914]" />
                  <p className="mt-4 font-semibold text-zinc-800">Contacting Carrier Rates Engine...</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Querying live DHL rates for {receiver.country} ({chargeableWeight.toFixed(2)} kg).
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {rates.map((rate) => (
                    <button
                      key={rate.id}
                      type="button"
                      onClick={() => {
                        setSelectedRateId(rate.id);
                        setDropoffOpen(true);
                      }}
                      className={`w-full border bg-white p-4 text-left transition-colors ${selectedRateId === rate.id ? "border-[#5e1914] shadow-sm ring-1 ring-[#5e1914]" : "border-zinc-100 hover:border-zinc-300"}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="grid h-10 w-10 place-items-center bg-yellow-400 text-xs font-bold text-zinc-900">
                          {rate.id === "dhl" ? "DHL" : rate.name.slice(0, 3).toUpperCase()}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-zinc-900">{rate.name}</p>
                            {rate.recommended ? <span className="bg-emerald-500 px-2 py-0.5 text-xs text-white">Recommended</span> : null}
                            {(rate.isLive || (rate.id === "dhl" && isLiveDhl)) ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live DHL Quote
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-zinc-500">{rate.service}</p>
                          <p className="mt-1 text-xs text-zinc-600">Pickup: {rate.pickup} · Delivery: {rate.delivery}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-xl font-bold text-zinc-900">{money(rate.amount)}</p>
                          <span className={`mt-2 inline-block px-4 py-1.5 text-xs font-semibold ${selectedRateId === rate.id ? "bg-[#5e1914] text-white" : "border border-[#5e1914] text-[#5e1914]"}`}>
                            {selectedRateId === rate.id ? "Selected" : "Select"}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 border border-zinc-100 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-zinc-900">Total Breakdown</p>
                    <p className="mt-1 text-sm text-zinc-500">Destination: {receiver.country || "Not specified"}</p>
                  </div>
                  <p className="text-right text-sm font-semibold text-[#5e1914]">Payable estimate {money(total)}</p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <ChargePill label="Insurance fee" value={money(insuranceFee)} />
                  <ChargePill label="Customs estimate" value={money(customsCharge)} />
                  <ChargePill label="Service charge" value={money(serviceCharge)} />
                </div>
              </div>
              <FooterActions onPrevious={() => go("addons")} onNext={() => go("review")} disabled={loadingRates} />
            </section>
          )}
          {step === "addons" && (
            <section>
              <PageTitle title="Add-ons" subtitle="Choose optional protection and insurance for this shipment." />
              <div className="mt-8 border border-zinc-100">
                <div className="bg-[#f6f1ea] px-5 py-4 font-semibold text-zinc-900">Insurance Protection</div>
                <div className="flex items-center justify-between px-5 py-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#5e1914]" />
                    <div>
                      <span className="font-medium text-zinc-800">DMX Cargo Protection</span>
                      <p className="text-xs text-zinc-500">Covers 100% declared value against loss or transit damage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-bold text-zinc-900">{money(insuranceFee)}</span>
                    <button
                      onClick={() => setInsurance((value) => !value)}
                      className="rounded-none bg-[#5e1914] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4a130f]"
                    >
                      {insurance ? "Added" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-right text-sm font-semibold text-zinc-700">Total Add-ons {money(insuranceFee)}</p>
              <FooterActions onPrevious={() => go("items")} onNext={() => go("carrier")} />
            </section>
          )}
          {step === "review" && (
            <section>
              <PageTitle title="Review Shipment" subtitle="Confirm all details below before booking." />
              <div className="mt-6 space-y-5">
                <ReviewRow title="Sender" onEdit={() => go("sender")}>
                  <AddressPreview address={sender} />
                </ReviewRow>
                <ReviewRow title="Receiver" onEdit={() => go("receiver")}>
                  <AddressPreview address={receiver} />
                </ReviewRow>
                <ReviewRow title="Parcel Information" onEdit={() => go("items")}>
                  <p>Purpose: {purpose}, Total Weight: {actualWeight}kg, Chargeable Weight: {chargeableWeight}kg, Currency: {currency}</p>
                  <p className="mt-2 font-semibold">Packaging: {packaging} ({length}x{width}x{height} cm)</p>
                  {items.map((it, idx) => (
                    <p key={idx} className="mt-1 text-zinc-500">
                      • {it.name} - {it.quantity} pc(s), {it.weight}kg, {money(it.value)}, Origin: {it.origin}
                    </p>
                  ))}
                </ReviewRow>
                <ReviewRow title="Carrier Information" onEdit={() => go("carrier")}>
                  <p className="font-semibold">{selectedRate.name} <span className="ml-3">{money(selectedRate.amount)}</span></p>
                  <p className="mt-1 text-zinc-500">{pickupMode === "pickup" ? "Pickup from sender address" : `Drop off at ${branches[selectedBranch].name}`}</p>
                </ReviewRow>
              </div>
            </section>
          )}
        </main>
        {step === "review" ? (
          <RightRail
            step={step}
            total={total}
            shipping={selectedRate.amount}
            addOns={insuranceFee}
            customs={customsCharge}
            service={serviceCharge}
            bookingPending={bookingPending}
            onPay={handleBookShipment}
          />
        ) : null}
      </div>

      {showItemModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4">
          <div className="w-full max-w-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-100 p-6">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">Add Item to Package</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Harmonized Tariff (HS) codes are automatically generated as you type items.
                </p>
              </div>
              <button onClick={() => setShowItemModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto space-y-4 p-6">
              {/* Quick Category Suggestions */}
              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Quick Select Commodity (Auto-generates HS code):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_HS_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setItemDraft((draft) => ({
                          ...draft,
                          name: draft.name.trim() ? draft.name : cat.name,
                          hsCode: cat.code,
                        }));
                      }}
                      className={`inline-flex items-center gap-1 border px-2.5 py-1 text-xs font-medium transition-colors ${
                        itemDraft.hsCode === cat.code
                          ? "border-[#5e1914] bg-[#5e1914] text-white"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-[#5e1914] hover:bg-zinc-100"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <TextField
                label="Item name / Description *"
                value={itemDraft.name}
                onChange={(value) => {
                  const detected = detectHsCode(value);
                  setItemDraft((item) => ({
                    ...item,
                    name: value,
                    hsCode: detected ? detected.code : item.hsCode,
                  }));
                }}
              />

              {/* Detected Classification Banner */}
              {(() => {
                const detected = detectHsCode(itemDraft.name) || HS_DATABASE.find((h) => h.code === itemDraft.hsCode);
                if (!detected && !itemDraft.hsCode) return null;
                return (
                  <div className="border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-900">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-950">
                        ✨ Auto-Detected HS Code: <span className="font-mono text-base font-bold text-[#5e1914]">{itemDraft.hsCode || detected?.code}</span>
                      </span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                        {detected?.category || "Apparel & Textiles"}
                      </span>
                    </div>
                    <p className="mt-1 text-emerald-800">
                      {detected?.description || "Harmonized System classification for international customs declaration."}
                    </p>
                  </div>
                );
              })()}

              <div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-700">
                    HS Tariff Code (Auto-populated or select below) *
                  </span>
                  <div className="flex gap-2">
                    <input
                      value={itemDraft.hsCode}
                      onChange={(e) => setItemDraft((item) => ({ ...item, hsCode: e.target.value }))}
                      placeholder="e.g. 6204.42 (Clothes) or 6403.99 (Shoes)"
                      className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-sm font-mono outline-none focus:border-[#5e1914] focus:ring-1 focus:ring-[#5e1914]"
                    />
                    <select
                      value={itemDraft.hsCode}
                      onChange={(e) => {
                        const selectedCode = e.target.value;
                        const match = HS_DATABASE.find((h) => h.code === selectedCode);
                        setItemDraft((draft) => ({
                          ...draft,
                          hsCode: selectedCode,
                          name: draft.name.trim() ? draft.name : (match?.name || draft.name),
                        }));
                      }}
                      className="border border-zinc-200 bg-zinc-50 px-3 py-3 text-xs font-semibold text-zinc-800 outline-none hover:bg-zinc-100"
                    >
                      <option value="">-- Choose Standard HS Code --</option>
                      {HS_DATABASE.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} — {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Required for DHL air freight customs declaration and clearance.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  label="Weight (kg) *"
                  value={itemDraft.weight}
                  onChange={(value) => setItemDraft((item) => ({ ...item, weight: value }))}
                />
                <NumberField
                  label="Quantity *"
                  value={itemDraft.quantity}
                  onChange={(value) => setItemDraft((item) => ({ ...item, quantity: value }))}
                />
              </div>
              <NumberField
                label="Item Value (NGN) *"
                value={itemDraft.value}
                onChange={(value) => setItemDraft((item) => ({ ...item, value }))}
              />
              <CountrySelect
                label="Country of Origin"
                value={itemDraft.origin}
                onChange={(value) => setItemDraft((item) => ({ ...item, origin: value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 p-6">
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="border border-[#5e1914] px-4 py-3 font-semibold text-[#5e1914]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveItem}
                className="bg-[#5e1914] px-4 py-3 font-semibold text-white hover:bg-[#4a130f]"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {dropoffOpen && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 p-6">
              <h2 className="text-xl font-semibold text-zinc-900">Drop off your package</h2>
              <button onClick={() => setDropoffOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <p className="font-semibold text-zinc-900">Would you like pickup or hub drop-off?</p>
              <RadioLine
                checked={pickupMode === "pickup"}
                onClick={() => setPickupMode("pickup")}
                label="Pickup: Collect package from sender's address."
              />
              <RadioLine
                checked={pickupMode === "dropoff"}
                onClick={() => setPickupMode("dropoff")}
                label="Drop-off: I will drop off at a nearby DMX Hub branch."
              />
              {pickupMode === "dropoff" && (
                <div className="max-h-72 space-y-3 overflow-auto pt-2">
                  {branches.map((branch, index) => (
                    <button
                      key={branch.name}
                      onClick={() => setSelectedBranch(index)}
                      className="flex w-full items-center gap-4 border border-zinc-100 p-4 text-left"
                    >
                      <MapPin className="h-5 w-5 text-zinc-500" />
                      <span className="flex-1 text-sm text-zinc-700">
                        {branch.name}
                        <br />
                        <span className="text-xs text-[#5e1914]">{branch.distance}</span>
                      </span>
                      <span
                        className={`border px-4 py-2 text-sm font-semibold ${
                          selectedBranch === index
                            ? "border-[#5e1914] bg-[#5e1914] text-white"
                            : "border-[#5e1914] text-[#5e1914]"
                        }`}
                      >
                        {selectedBranch === index ? "Selected" : "Select"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 p-6">
              <button onClick={() => setDropoffOpen(false)} className="border border-zinc-200 px-4 py-3 font-semibold text-zinc-700">
                Cancel
              </button>
              <button onClick={() => setDropoffOpen(false)} className="bg-[#5e1914] px-4 py-3 font-semibold text-white hover:bg-[#4a130f]">
                Save and continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepNav({ step, setStep }: { step: Step; setStep: (step: Step) => void }) {
  return (
    <div className="mb-10 flex flex-wrap items-center gap-2 text-sm">
      {steps.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <button
            onClick={() => setStep(item.id)}
            className={item.id === step ? "font-semibold text-[#5e1914]" : "text-zinc-500 hover:text-zinc-800"}
          >
            {item.label}
          </button>
          {index < steps.length - 1 ? <span className="h-px w-6 bg-[#b98d87]" /> : null}
        </div>
      ))}
    </div>
  );
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{title}</h1>
      <p className="mt-3 text-sm text-zinc-600">{subtitle}</p>
    </header>
  );
}

function MapboxAddressSearch({
  onSelect,
  placeholder,
}: {
  onSelect: (parsed: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `/api/places/autocomplete?q=${encodeURIComponent(
          query.trim()
        )}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.features)) {
            setSuggestions(data.features);
            setOpen(true);
          }
        }
      } catch (err) {
        console.error("Mapbox geocoding error:", err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (feature: any) => {
    let streetNumber = feature.address || "";
    let streetName = feature.text || "";
    let address = "";
    if (streetNumber && streetName) {
      address = `${streetNumber}, ${streetName}`;
    } else if (streetName) {
      address = streetName;
    } else {
      address = feature.place_name.split(",")[0] || "";
    }

    let postalCode = "";
    let city = "";
    let state = "";
    let countryName = "";

    if (feature.context && Array.isArray(feature.context)) {
      for (const ctx of feature.context) {
        if (typeof ctx.id === "string") {
          if (ctx.id.startsWith("postcode")) {
            postalCode = ctx.text;
          } else if (ctx.id.startsWith("place") || ctx.id.startsWith("locality")) {
            if (!city) city = ctx.text;
          } else if (ctx.id.startsWith("region")) {
            state = ctx.text;
          } else if (ctx.id.startsWith("country")) {
            const short = ctx.short_code ? String(ctx.short_code).toUpperCase() : "";
            const matched = sortedCountries.find(
              (c) =>
                (short && c.Code.toUpperCase() === short) ||
                c.Name.toLowerCase() === ctx.text.toLowerCase()
            );
            countryName = matched ? matched.Name : ctx.text;
          }
        }
      }
    }

    onSelect({
      address: address || feature.place_name,
      city,
      state,
      postalCode,
      country: countryName,
    });

    setQuery(feature.place_name);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative md:col-span-2">
      <label className="block">
        <span className="mb-2 flex items-center justify-between text-sm font-medium text-zinc-800">
          <span className="flex items-center gap-1.5 font-semibold text-[#5e1914]">
            <MapPin className="h-4 w-4" /> Live Mapbox Places Autocomplete
          </span>
          <span className="text-xs text-zinc-400">Search any global street, city, or place</span>
        </span>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
            placeholder={placeholder || "Start typing street address (e.g. 10 Downing Street or 3 Oriwu Lekki)..."}
            className="w-full rounded-none border border-zinc-300 bg-white px-4 py-3 pl-10 text-sm outline-none focus:border-[#5e1914] focus:ring-1 focus:ring-[#5e1914]"
          />
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
          {loading && (
            <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-[#5e1914]" />
          )}
        </div>
      </label>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto border border-zinc-200 bg-white shadow-xl">
          <div className="border-b border-zinc-100 bg-[#f7f1ef] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#5e1914]">
            Select Address To Autofill
          </div>
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="flex w-full items-start gap-3 border-b border-zinc-50 px-3 py-2.5 text-left text-xs text-zinc-800 hover:bg-[#f7f1ef]"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#5e1914]" />
              <div className="flex-1">
                <p className="font-semibold text-zinc-900">{item.text}</p>
                <p className="text-zinc-500">{item.place_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressStep({
  title,
  subtitle,
  mode,
  setMode,
  address,
  setAddress,
  onNext,
  isSender = false,
}: {
  title: string;
  subtitle: string;
  mode: "book" | "hub" | "new";
  setMode: (mode: "book" | "hub" | "new") => void;
  address: Address;
  setAddress: (address: Address) => void;
  onNext: () => void;
  isSender?: boolean;
}) {
  const handleMapboxAutofill = (parsed: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => {
    setAddress({
      ...address,
      address1: parsed.address || address.address1,
      city: parsed.city || address.city,
      state: parsed.state || address.state,
      postalCode: parsed.postalCode || address.postalCode,
      country: parsed.country || address.country,
    });
  };

  return (
    <section>
      <PageTitle title={title} subtitle={subtitle} />
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {[
          ["new", "Enter Address / Live Search"],
          ["book", "Use Address Book"],
          ["hub", "Use Hub Address"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id as "book" | "hub" | "new")}
            className={`border p-5 text-left font-semibold ${
              mode === id ? "border-[#5e1914] bg-[#f7f1ef] text-zinc-900" : "border-zinc-100 text-zinc-700"
            }`}
          >
            <span
              className={`mb-5 block h-4 w-4 rounded-full border ${
                mode === id ? "border-[#5e1914] bg-[#5e1914]" : "border-zinc-200"
              }`}
            />
            {label}
          </button>
        ))}
      </div>

      {mode === "new" ? (
        <div className="mt-8 bg-[#f6f1ea]">
          <h2 className="border-b border-zinc-200 px-5 py-4 font-semibold text-zinc-900">
            {isSender ? "Sender Origin Address" : "Receiver Destination Address"}
          </h2>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <MapboxAddressSearch
              onSelect={handleMapboxAutofill}
              placeholder={isSender ? "Search sender address in Nigeria or globally..." : "Search destination address (UK, US, Canada, etc.)..."}
            />

            <TextField
              label="First Name *"
              value={address.firstName}
              onChange={(value) => setAddress({ ...address, firstName: value })}
            />
            <TextField
              label="Last Name *"
              value={address.lastName}
              onChange={(value) => setAddress({ ...address, lastName: value })}
            />
            <TextField
              className="md:col-span-2"
              label="Address line 1 *"
              value={address.address1}
              onChange={(value) => setAddress({ ...address, address1: value })}
            />
            <TextField
              className="md:col-span-2"
              label="Address line 2 (Optional)"
              value={address.address2}
              onChange={(value) => setAddress({ ...address, address2: value })}
            />
            <CountrySelect
              label="Country *"
              value={address.country}
              onChange={(value) => setAddress({ ...address, country: value })}
            />
            <TextField
              label="State / Province *"
              value={address.state}
              onChange={(value) => setAddress({ ...address, state: value })}
            />
            <TextField
              label="City *"
              value={address.city}
              onChange={(value) => setAddress({ ...address, city: value })}
            />
            <TextField
              label="Postal / ZIP Code *"
              value={address.postalCode}
              onChange={(value) => setAddress({ ...address, postalCode: value })}
            />
            <PhoneFieldWithPrefix
              label="Phone Number *"
              value={address.phone}
              onChange={(value) => setAddress({ ...address, phone: value })}
              country={address.country}
            />
            <TextField
              label="Email Address (Optional)"
              value={address.email}
              onChange={(value) => setAddress({ ...address, email: value })}
            />
            <PhoneFieldWithPrefix
              label="Alternate Phone Number (Optional)"
              value={address.alternatePhone}
              onChange={(value) => setAddress({ ...address, alternatePhone: value })}
              country={address.country}
            />
          </div>
        </div>
      ) : (
        <div className="mt-8 border border-zinc-100">
          <h2 className="bg-[#f6f1ea] px-5 py-4 font-semibold text-zinc-900">
            {mode === "hub" ? "Hub Location Address" : "Saved Contact"}
          </h2>
          <div className="p-5">
            {compactAddress(address) ? (
              <AddressPreview address={address} />
            ) : (
              <p className="text-sm text-zinc-500">No saved address selected yet. Switch to &quot;Enter Address&quot; to input details or use live search.</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setMode("new")}
                className="border border-[#5e1914] px-5 py-2.5 text-sm font-semibold text-[#5e1914]"
              >
                Enter Custom Address
              </button>
            </div>
          </div>
        </div>
      )}
      <FooterActions onNext={onNext} />
    </section>
  );
}

function CountrySelect({
  value,
  onChange,
  label = "Country",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5e1914] focus:ring-1 focus:ring-[#5e1914]"
      >
        <option value="">-- Select Country ({sortedCountries.length} countries) --</option>
        {sortedCountries.map((c) => (
          <option key={c._id} value={c.Name}>
            {c.Name} ({c.Code})
          </option>
        ))}
      </select>
    </label>
  );
}

function RightRail({
  step,
  total,
  shipping,
  addOns,
  customs,
  service,
  bookingPending,
  onPay,
}: {
  step: Step;
  total: number;
  shipping: number;
  addOns: number;
  customs: number;
  service: number;
  bookingPending?: boolean;
  onPay: () => void;
}) {
  if (step === "review") {
    return (
      <PaymentPanel
        title="Make Payment"
        total={total}
        shipping={shipping}
        addOns={addOns}
        customs={customs}
        service={service}
        bookingPending={bookingPending}
        onPay={onPay}
      />
    );
  }

  return null;
}

function PaymentPanel({
  title,
  total,
  shipping,
  addOns,
  customs,
  service,
  bookingPending,
  onPay,
}: {
  title: string;
  total: number;
  shipping: number;
  addOns: number;
  customs: number;
  service: number;
  bookingPending?: boolean;
  onPay?: () => void;
}) {
  return (
    <aside className="bg-[#f7f1ef] px-8 py-10">
      <div className="sticky top-8 rounded-none bg-white p-8 shadow-sm">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#efe1de] text-4xl text-[#5e1914]">☺</div>
        <h2 className="mt-5 text-center text-2xl font-semibold text-zinc-900">{title}</h2>
        <p className="mx-auto mt-4 w-fit bg-[#f7f1ef] px-6 py-3 text-3xl font-bold text-[#5e1914]">{money(total)}</p>
        <div className="mt-8 space-y-4 border-b border-zinc-100 pb-6 text-sm">
          <Line label="Shipping Charge" value={money(shipping)} />
          <Line label="Insurance" value={money(addOns)} />
          <Line label="Customs Estimate" value={money(customs)} />
          <Line label="Service Charge" value={money(service)} />
        </div>
        <Line label="Total" value={money(total)} className="mt-5 font-semibold" />
        <div className="mt-8 rounded-none border border-zinc-100 p-5">
          <p className="text-xs text-zinc-500">Wallet / Balance Status</p>
          <p className="mt-3 text-2xl font-bold text-zinc-900">
            ₦38,265.40 <span className="ml-2 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">Active</span>
          </p>
        </div>
        <button
          onClick={onPay}
          disabled={bookingPending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-none bg-[#5e1914] py-4 font-semibold text-white hover:bg-[#4a130f] disabled:bg-zinc-400"
        >
          {bookingPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Booking with DMX & DHL...
            </>
          ) : (
            "Make Payment & Book Shipment"
          )}
        </button>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function ChargePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-100 bg-zinc-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function FooterActions({ onPrevious, onNext, disabled }: { onPrevious?: () => void; onNext?: () => void; disabled?: boolean }) {
  return (
    <div className="mt-10 flex justify-between">
      {onPrevious ? <button onClick={onPrevious} className="border border-zinc-200 px-6 py-3 font-semibold text-zinc-700">Previous</button> : <span />}
      {onNext ? <button disabled={disabled} onClick={onNext} className="bg-[#5e1914] px-8 py-3 font-semibold text-white hover:bg-[#4a130f] disabled:bg-zinc-200">Save and Continue</button> : null}
    </div>
  );
}

function ReviewRow({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <section className="border border-zinc-100 p-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-sm font-medium text-zinc-500">{title}</h2>
          <div className="mt-3 text-sm leading-7 text-zinc-800">{children}</div>
        </div>
        <button onClick={onEdit} className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"><Edit3 className="h-4 w-4" /> Edit</button>
      </div>
    </section>
  );
}

function SummaryCard({ title, address }: { title: string; address: Address }) {
  return (
    <section className="bg-zinc-50 p-6">
      <h2 className="font-semibold text-zinc-900">{title}</h2>
      <AddressPreview address={address} />
    </section>
  );
}

function AddressPreview({ address }: { address: Address }) {
  return (
    <div className="text-sm leading-7 text-zinc-800">
      <p className="font-semibold">{address.firstName} {address.lastName}</p>
      {address.email ? <p>{address.email}</p> : null}
      {address.phone ? <p>{address.phone}{address.alternatePhone ? `, ${address.alternatePhone}` : ""}</p> : null}
      <p>{compactAddress(address)}</p>
    </div>
  );
}

function PhoneFieldWithPrefix({
  label,
  value,
  onChange,
  country,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  country?: string;
  className?: string;
}) {
  const parsed = splitPhoneNumber(value, country);
  const [selectedPrefix, setSelectedPrefix] = useState(parsed.prefix);
  const [localNumber, setLocalNumber] = useState(parsed.localNumber);

  useEffect(() => {
    if (country) {
      const p = getPrefixForCountry(country);
      setSelectedPrefix(p);
      if (localNumber) {
        onChange(formatFullPhone(p, localNumber));
      }
    }
  }, [country]);

  useEffect(() => {
    const p = splitPhoneNumber(value, country);
    if (p.prefix) setSelectedPrefix(p.prefix);
    setLocalNumber(p.localNumber);
  }, [value]);

  const handlePrefixChange = (p: string) => {
    setSelectedPrefix(p);
    onChange(formatFullPhone(p, localNumber));
  };

  const handleLocalChange = (text: string) => {
    if (text.trim().startsWith("+")) {
      const rep = splitPhoneNumber(text, country);
      setSelectedPrefix(rep.prefix);
      setLocalNumber(rep.localNumber);
      onChange(formatFullPhone(rep.prefix, rep.localNumber));
      return;
    }
    const clean = text.replace(/[^\d\s-]/g, "").replace(/^0+/, "");
    setLocalNumber(clean);
    onChange(formatFullPhone(selectedPrefix, clean));
  };

  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <div className="flex border border-zinc-200 bg-white focus-within:border-[#5e1914] focus-within:ring-1 focus-within:ring-[#5e1914]">
        <select
          value={selectedPrefix}
          onChange={(e) => handlePrefixChange(e.target.value)}
          className="max-w-[130px] border-r border-zinc-200 bg-zinc-50 px-2 py-3 text-xs font-semibold text-zinc-800 outline-none hover:bg-zinc-100"
        >
          {COUNTRY_PHONE_PREFIXES.map((item) => (
            <option key={`${item.country}-${item.prefix}-${item.code}`} value={item.prefix}>
              {item.code ? `${item.code} (${item.prefix})` : `${item.prefix} ${item.country}`}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={localNumber}
          onChange={(e) => handleLocalChange(e.target.value)}
          placeholder="e.g. 801 234 5678"
          className="w-full rounded-none bg-transparent px-3 py-3 text-sm outline-none"
        />
      </div>
      <span className="mt-1 block text-[11px] text-zinc-400">
        International: <span className="font-mono text-zinc-600">{formatFullPhone(selectedPrefix, localNumber) || `${selectedPrefix} ...`}</span>
      </span>
    </label>
  );
}

function TextField({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5e1914] focus:ring-1 focus:ring-[#5e1914]"
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5e1914] focus:ring-1 focus:ring-[#5e1914]"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5e1914] focus:ring-1 focus:ring-[#5e1914]"
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function RadioLine({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 text-left text-sm text-zinc-700">
      <span className={`grid h-4 w-4 place-items-center rounded-full border ${checked ? "border-[#5e1914]" : "border-zinc-300"}`}>
        {checked ? <span className="h-2 w-2 rounded-full bg-[#5e1914]" /> : null}
      </span>
      {label}
    </button>
  );
}

function Line({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex items-center justify-between text-sm text-zinc-600 ${className}`}>
      <span>{label}</span>
      <span className="font-bold text-zinc-900">{value}</span>
    </div>
  );
}
