"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Edit3, Mail, MapPin, Package, Phone, RefreshCw, ShieldCheck, Trash2, Upload, X } from "lucide-react";

type Step = "sender" | "receiver" | "items" | "carrier" | "addons" | "review";

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
  tags?: string[];
  recommended?: boolean;
};

const steps: { id: Step; label: string }[] = [
  { id: "sender", label: "Sender" },
  { id: "receiver", label: "Receiver" },
  { id: "items", label: "Items" },
  { id: "carrier", label: "Carrier" },
  { id: "addons", label: "Add-ons" },
  { id: "review", label: "Review" },
];

const starterSender: Address = {
  firstName: "Abdulqudus",
  lastName: "Folarin DMX",
  email: "csdmxng@gmail.com",
  phone: "+2349095305021",
  alternatePhone: "+2349091384828",
  address1: "3 Oriwu Street, Lekki, Nigeria",
  address2: "3 Oriwu St, Lekki",
  country: "Nigeria",
  state: "Lagos",
  city: "Lekki",
  postalCode: "106104",
};

const starterReceiver: Address = {
  firstName: "DMX",
  lastName: "Service",
  email: "jumpus2003@yahoo.com",
  phone: "+447867458320",
  alternatePhone: "+447847951470",
  address1: "Manchester, UK",
  address2: "Manchester",
  country: "United Kingdom",
  state: "Aberdeen",
  city: "Aberdeen",
  postalCode: "M1 1AQ",
};

const baseRates: Rate[] = [
  { id: "ups", name: "United Parcel Services", service: "Express Saver", pickup: "Within 3 business days", delivery: "Within 5 business days", amount: 181666.33, tags: ["Pickup"] },
  { id: "ship-naija", name: "Ship to Naija", service: "Express Shipping", pickup: "Drop-off only", delivery: "Within 2 business days", amount: 184778.12, tags: ["Dropoff"] },
  { id: "dhl", name: "DHL Express", service: "Express Worldwide", pickup: "Within 1 business day", delivery: "Within 2 business days", amount: 236874.94, tags: ["Pickup", "Dropoff"], recommended: true },
  { id: "fedex-priority", name: "FedEx", service: "International Priority", pickup: "Within 3 business days", delivery: "Within 4 business days", amount: 197863.7, tags: ["Pickup", "Dropoff"] },
  { id: "fedex-economy", name: "FedEx", service: "International Economy", pickup: "Within 3 business days", delivery: "Within 4 business days", amount: 186022.61, tags: ["Pickup"] },
  { id: "dmx-express", name: "DMX Express", service: "Express Shipping", pickup: "Within 1 business day", delivery: "Within 2 business days", amount: 187320.94, tags: ["Pickup"] },
  { id: "aramax", name: "Aramex", service: "Standard", pickup: "Within 2 business days", delivery: "Within 2 business days", amount: 169285.53, tags: ["Dropoff"] },
  { id: "parcel", name: "Parcels Express", service: "Express Delivery via DPD", pickup: "Drop-off only", delivery: "Within 5 business days", amount: 150000, tags: ["Dropoff"] },
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
  return `${address.address1}, ${address.address2}, ${address.city}, ${address.state}, ${address.country}. ${address.postalCode}`;
}

export function AdminBookingFlow() {
  const [step, setStep] = useState<Step>("sender");
  const [sender, setSender] = useState(starterSender);
  const [receiver, setReceiver] = useState(starterReceiver);
  const [addressMode, setAddressMode] = useState<"book" | "hub" | "new">("book");
  const [receiverMode, setReceiverMode] = useState<"book" | "hub" | "new">("new");
  const [purpose, setPurpose] = useState("Personal (Items are not for sale)");
  const [currency, setCurrency] = useState("Nigerian Naira (NGN)");
  const [packaging, setPackaging] = useState("Box");
  const [length, setLength] = useState(200);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(10);
  const [items, setItems] = useState<ParcelItem[]>([
    { name: "Knitted cotton trousers", hsCode: "6113009038", weight: 10.5, quantity: 1, value: 200000, origin: "Nigeria" },
  ]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemDraft, setItemDraft] = useState<ParcelItem>({ name: "Men's cotton trousers", hsCode: "6113009038", weight: 10, quantity: 1, value: 200000, origin: "Nigeria" });
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState("dhl");
  const [dropoffOpen, setDropoffOpen] = useState(false);
  const [pickupMode, setPickupMode] = useState<"pickup" | "dropoff">("pickup");
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [insurance, setInsurance] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const volumetricWeight = useMemo(() => Number(((length * width * height) / 5000).toFixed(2)), [length, width, height]);
  const actualWeight = useMemo(() => items.reduce((sum, item) => sum + item.weight * item.quantity, 0), [items]);
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);
  const parcelValue = items.reduce((sum, item) => sum + item.value * item.quantity, 0);
  const adjustedRates = baseRates.map((rate) => ({
    ...rate,
    amount: Math.round((rate.amount + Math.max(0, chargeableWeight - 8) * 3200) * 100) / 100,
  }));
  const selectedRate = adjustedRates.find((rate) => rate.id === selectedRateId) ?? adjustedRates[0];
  const insuranceFee = insurance ? Math.round(parcelValue * 0.033) : 0;
  const serviceCharge = 500;
  const total = selectedRate.amount + insuranceFee + serviceCharge;

  function go(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveItem() {
    setItems([itemDraft]);
    setShowItemModal(false);
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="flex items-start justify-between border-b border-zinc-100 pb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">SH-1VFW8X8RFANKK4JJ</h1>
              <Copy className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-2 text-sm text-zinc-500">Confirmed · Jun 27, 2026 12:38 PM</p>
          </div>
          <button className="rounded-none bg-[#5e1914] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4a130f]">Track shipment</button>
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
                <span className="grid h-12 w-12 place-items-center bg-yellow-400 text-xs font-bold text-zinc-900">DHL</span>
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
                Purpose: personal, Total Weight: {actualWeight}kg, Volumetric Weight: {volumetricWeight}kg, Total Value: {money(parcelValue)}
              </p>
              {items.map((item, index) => (
                <p key={item.name} className="mt-3 text-sm text-zinc-600">
                  <span className="font-semibold text-[#5e1914]">PARCEL {index + 1}</span><br />
                  {item.name}, {item.quantity} piece, {item.weight}kg, {money(item.value)}, {item.origin}
                </p>
              ))}
            </section>
          </div>
          <PaymentPanel title="Payment Details" total={total} shipping={selectedRate.amount} addOns={insuranceFee} service={serviceCharge} />
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
              subtitle="How do you want to add an address?"
              mode={addressMode}
              setMode={setAddressMode}
              address={sender}
              setAddress={setSender}
              onNext={() => go("receiver")}
              showSelected
            />
          )}
          {step === "receiver" && (
            <AddressStep
              title="Add Receiver"
              subtitle="Search from your saved addresses or create a new address."
              mode={receiverMode}
              setMode={setReceiverMode}
              address={receiver}
              setAddress={setReceiver}
              onNext={() => go("items")}
            />
          )}
          {step === "items" && (
            <section>
              <PageTitle title="Add Items" subtitle="What is in your shipment?" />
              <div className="mt-8 grid gap-4 rounded-none bg-[#f6f1ea] p-5 md:grid-cols-2">
                <SelectField label="Purpose of shipping" value={purpose} onChange={setPurpose} options={["Personal (Items are not for sale)", "Commercial", "Gift", "Documents"]} />
                <SelectField label="Select Currency" value={currency} onChange={setCurrency} options={["Nigerian Naira (NGN)", "United States Dollar (USD)", "British Pound (GBP)"]} />
              </div>
              <div className="mt-8 rounded-none bg-[#f6f1ea] p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900"><Package className="h-5 w-5 text-[#5e1914]" /> Parcel 1</h2>
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
                    <h3 className="font-semibold text-zinc-900">Items</h3>
                    <button type="button" onClick={() => setShowItemModal(true)} className="text-sm font-semibold text-[#5e1914]">+ Add Item</button>
                  </div>
                  {items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between px-4 py-4">
                      <div>
                        <p className="font-medium text-zinc-900">{item.name}</p>
                        <p className="mt-1 text-sm text-zinc-500">{item.quantity} pcs · {item.weight} kg · {money(item.value)} · {item.origin}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setShowItemModal(true)} className="border border-zinc-200 p-2 text-zinc-500"><Edit3 className="h-4 w-4" /></button>
                        <button type="button" className="border border-zinc-200 p-2 text-zinc-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-zinc-100 px-4 py-4 text-sm font-semibold text-zinc-900">
                    Parcel Weight: {actualWeight}kg, Parcel Value: {money(parcelValue)}
                  </div>
                </div>
                <div className="mt-8 grid gap-8 md:grid-cols-3">
                  {["Parcel Items", "Proof of Purchase", "Proof of Weight"].map((label) => (
                    <div key={label}>
                      <p className="text-sm font-medium text-zinc-800">{label} <span className="text-xs text-zinc-400 underline">View Sample</span></p>
                      <button className="mt-3 flex items-center gap-2 rounded-none border border-zinc-100 bg-white px-4 py-3 text-sm text-zinc-700"><Upload className="h-4 w-4" /> Upload</button>
                      <p className="mt-2 text-xs text-zinc-400">No file uploaded</p>
                    </div>
                  ))}
                </div>
              </div>
              <FooterActions onPrevious={() => go("receiver")} onNext={() => go("carrier")} />
            </section>
          )}
          {step === "carrier" && (
            <section>
              <PageTitle title="Select Carrier" subtitle="Choose your preferred rate." />
              <div className="mt-6 flex items-center justify-between bg-[#f6f1ea] p-3">
                <div className="flex gap-2">
                  <button className="rounded-none bg-zinc-900 px-4 py-2 text-sm text-white">DMX Network</button>
                  <button className="rounded-none bg-white px-4 py-2 text-sm text-zinc-700">Personal Accounts</button>
                </div>
                <div className="flex items-center gap-3">
                  <button className="border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700">Sort by: Default</button>
                  <button onClick={() => setRatesLoaded(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#5e1914]"><RefreshCw className="h-4 w-4" /> Get rates</button>
                </div>
              </div>
              {!ratesLoaded ? (
                <div className="mt-6 border border-dashed border-zinc-200 p-10 text-center">
                  <p className="text-sm text-zinc-500">Pricing is the last lookup. Click Get rates after sender, receiver, and parcel details are ready.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {adjustedRates.map((rate) => (
                    <button
                      key={rate.id}
                      type="button"
                      onClick={() => {
                        setSelectedRateId(rate.id);
                        setDropoffOpen(true);
                      }}
                      className={`w-full border bg-white p-4 text-left ${selectedRateId === rate.id ? "border-[#5e1914]" : "border-zinc-100"}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="grid h-9 w-9 place-items-center bg-yellow-400 text-[10px] font-bold text-zinc-900">{rate.name.slice(0, 3).toUpperCase()}</span>
                        <div>
                          <p className="font-semibold text-zinc-900">{rate.name} {rate.recommended ? <span className="ml-2 bg-emerald-500 px-2 py-1 text-xs text-white">Recommended</span> : null}</p>
                          <p className="text-sm text-zinc-500">{rate.service}</p>
                          <p className="mt-2 text-xs text-zinc-600">Pickup: {rate.pickup} · Delivery: {rate.delivery}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-xl font-bold text-zinc-900">{money(rate.amount)}</p>
                          <span className="mt-2 inline-block border border-[#5e1914] px-4 py-2 text-sm font-semibold text-[#5e1914]">Select</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-6 bg-amber-100 p-5 text-sm text-zinc-700">
                <p className="font-semibold text-zinc-900">Can&apos;t find a carrier?</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Some carriers have no available rates for this route.</li>
                  <li>Invalid postcode or address formats can hide rates.</li>
                  <li>Try refreshing after checking receiver and parcel details.</li>
                </ul>
              </div>
              <FooterActions onPrevious={() => go("items")} onNext={() => go("addons")} disabled={!ratesLoaded} />
            </section>
          )}
          {step === "addons" && (
            <section>
              <PageTitle title="Add-ons" subtitle="Choose optional services to protect, estimate duties, and meet compliance requirements." />
              <div className="mt-8 border border-zinc-100">
                <div className="bg-[#f6f1ea] px-5 py-4 font-semibold text-zinc-900">Insurance</div>
                <div className="flex items-center justify-between px-5 py-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#5e1914]" />
                    <span className="font-medium text-zinc-800">DMX Protection</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-bold text-zinc-900">{money(insuranceFee)}</span>
                    <button onClick={() => setInsurance((value) => !value)} className="rounded-none bg-[#5e1914] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4a130f]">
                      {insurance ? "Added" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-right text-sm font-semibold text-zinc-700">Total Add-ons {money(insuranceFee)}</p>
              <FooterActions onPrevious={() => go("carrier")} onNext={() => go("review")} />
            </section>
          )}
          {step === "review" && (
            <section>
              <PageTitle title="Review Shipment" subtitle="Confirm all details below before making payment." />
              <div className="mt-6 space-y-5">
                <ReviewRow title="Sender" onEdit={() => go("sender")}>
                  <AddressPreview address={sender} />
                </ReviewRow>
                <ReviewRow title="Receiver" onEdit={() => go("receiver")}>
                  <AddressPreview address={receiver} />
                </ReviewRow>
                <ReviewRow title="Parcel Information" onEdit={() => go("items")}>
                  <p>Purpose: personal, Total Weight: {actualWeight}kg, Volumetric Weight: {volumetricWeight}kg, Currency: NGN, Total Value: {money(parcelValue)}</p>
                  <p className="mt-2 font-semibold">Parcel 1 - {packaging} - {length}x{width}x{height} ({length}cm x {width}cm x {height}cm)</p>
                  <p className="mt-1 text-zinc-500">{items[0]?.name}, {items[0]?.quantity} piece, {items[0]?.weight}kg, {money(items[0]?.value ?? 0)}, NG.</p>
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
          <RightRail step={step} total={total} shipping={selectedRate.amount} addOns={insuranceFee} service={serviceCharge} onPay={() => setConfirmed(true)} />
        ) : null}
      </div>

      {showItemModal && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-zinc-100 p-6">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">Add Item</h2>
                <p className="mt-1 text-sm text-zinc-500">False item details or undervaluation may lead to account suspension.</p>
              </div>
              <button onClick={() => setShowItemModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <TextField label="Item name" value={itemDraft.name} onChange={(value) => setItemDraft((item) => ({ ...item, name: value }))} />
              <TextField label="HS Code" value={itemDraft.hsCode} onChange={(value) => setItemDraft((item) => ({ ...item, hsCode: value }))} />
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField label="Weight (kg)" value={itemDraft.weight} onChange={(value) => setItemDraft((item) => ({ ...item, weight: value }))} />
                <NumberField label="Quantity" value={itemDraft.quantity} onChange={(value) => setItemDraft((item) => ({ ...item, quantity: value }))} />
              </div>
              <NumberField label="Item Value" value={itemDraft.value} onChange={(value) => setItemDraft((item) => ({ ...item, value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 p-6">
              <button onClick={() => setShowItemModal(false)} className="border border-[#5e1914] px-4 py-3 font-semibold text-[#5e1914]">Cancel</button>
              <button onClick={saveItem} className="bg-[#5e1914] px-4 py-3 font-semibold text-white hover:bg-[#4a130f]">Save item</button>
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
              <p className="font-semibold text-zinc-900">Would you like to pick up your shipment?</p>
              <RadioLine checked={pickupMode === "pickup"} onClick={() => setPickupMode("pickup")} label="No, I want my shipment picked up from my address." />
              <RadioLine checked={pickupMode === "dropoff"} onClick={() => setPickupMode("dropoff")} label="Yes, I would like to drop-off at a nearby location." />
              {pickupMode === "dropoff" && (
                <div className="max-h-72 space-y-3 overflow-auto pt-2">
                  {branches.map((branch, index) => (
                    <button key={branch.name} onClick={() => setSelectedBranch(index)} className="flex w-full items-center gap-4 border border-zinc-100 p-4 text-left">
                      <MapPin className="h-5 w-5 text-zinc-500" />
                      <span className="flex-1 text-sm text-zinc-700">{branch.name}<br /><span className="text-xs text-[#5e1914]">{branch.distance}</span></span>
                      <span className={`border px-4 py-2 text-sm font-semibold ${selectedBranch === index ? "border-[#5e1914] bg-[#5e1914] text-white" : "border-[#5e1914] text-[#5e1914]"}`}>{selectedBranch === index ? "Selected" : "Select"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 p-6">
              <button onClick={() => setDropoffOpen(false)} className="border border-zinc-200 px-4 py-3 font-semibold text-zinc-700">Cancel</button>
              <button onClick={() => setDropoffOpen(false)} className="bg-[#5e1914] px-4 py-3 font-semibold text-white hover:bg-[#4a130f]">Save and continue</button>
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
          <button onClick={() => setStep(item.id)} className={item.id === step ? "font-semibold text-[#5e1914]" : "text-zinc-500"}>{item.label}</button>
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
      <p className="mt-6 text-sm text-zinc-600">{subtitle}</p>
    </header>
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
  showSelected = false,
}: {
  title: string;
  subtitle: string;
  mode: "book" | "hub" | "new";
  setMode: (mode: "book" | "hub" | "new") => void;
  address: Address;
  setAddress: (address: Address) => void;
  onNext: () => void;
  showSelected?: boolean;
}) {
  return (
    <section>
      <PageTitle title={title} subtitle={subtitle} />
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {[
          ["book", "Use Address Book"],
          ["hub", "Use Hub Address"],
          ["new", "Enter New Address"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setMode(id as "book" | "hub" | "new")} className={`border p-5 text-left font-semibold ${mode === id ? "border-[#5e1914] bg-[#f7f1ef] text-zinc-900" : "border-zinc-100 text-zinc-700"}`}>
            <span className={`mb-5 block h-4 w-4 rounded-full border ${mode === id ? "border-[#5e1914] bg-[#5e1914]" : "border-zinc-200"}`} />
            {label}
          </button>
        ))}
      </div>
      {mode === "new" ? (
        <div className="mt-8 bg-[#f6f1ea]">
          <h2 className="border-b border-zinc-200 px-5 py-4 font-semibold text-zinc-900">Enter New Address</h2>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <TextField label="First Name" value={address.firstName} onChange={(value) => setAddress({ ...address, firstName: value })} />
            <TextField label="Last Name" value={address.lastName} onChange={(value) => setAddress({ ...address, lastName: value })} />
            <TextField className="md:col-span-2" label="Address line 1" value={address.address1} onChange={(value) => setAddress({ ...address, address1: value })} />
            <TextField className="md:col-span-2" label="Address line 2" value={address.address2} onChange={(value) => setAddress({ ...address, address2: value })} />
            <TextField label="Country" value={address.country} onChange={(value) => setAddress({ ...address, country: value })} />
            <TextField label="State/Province" value={address.state} onChange={(value) => setAddress({ ...address, state: value })} />
            <TextField label="City" value={address.city} onChange={(value) => setAddress({ ...address, city: value })} />
            <TextField label="Postal / ZIP code" value={address.postalCode} onChange={(value) => setAddress({ ...address, postalCode: value })} />
            <TextField label="Phone Number" value={address.phone} onChange={(value) => setAddress({ ...address, phone: value })} />
            <TextField label="Email Address" value={address.email} onChange={(value) => setAddress({ ...address, email: value })} />
            <TextField label="Alternate Phone Number" value={address.alternatePhone} onChange={(value) => setAddress({ ...address, alternatePhone: value })} />
          </div>
        </div>
      ) : (
        <div className="mt-8 border border-zinc-100">
          <h2 className="bg-[#f6f1ea] px-5 py-4 font-semibold text-zinc-900">{showSelected ? "Selected Address" : "Saved Address"}</h2>
          <div className="p-5">
            <AddressPreview address={address} />
            <div className="mt-6 flex gap-3">
              <button className="border border-[#5e1914] px-5 py-3 font-semibold text-[#5e1914]">Edit this address</button>
              <button className="border border-[#5e1914] px-5 py-3 font-semibold text-[#5e1914]">Use another address</button>
            </div>
          </div>
        </div>
      )}
      <FooterActions onNext={onNext} />
    </section>
  );
}

function RightRail({ step, total, shipping, addOns, service, onPay }: { step: Step; total: number; shipping: number; addOns: number; service: number; onPay: () => void }) {
  if (step === "review") {
    return <PaymentPanel title="Make Payment" total={total} shipping={shipping} addOns={addOns} service={service} onPay={onPay} />;
  }

  return null;
}

function PaymentPanel({ title, total, shipping, addOns, service, onPay }: { title: string; total: number; shipping: number; addOns: number; service: number; onPay?: () => void }) {
  return (
    <aside className="bg-[#f7f1ef] px-8 py-10">
      <div className="sticky top-8 rounded-none bg-white p-8 shadow-sm">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#efe1de] text-4xl text-[#5e1914]">☺</div>
        <h2 className="mt-5 text-center text-2xl font-semibold text-zinc-900">{title}</h2>
        <p className="mx-auto mt-4 w-fit bg-[#f7f1ef] px-6 py-3 text-3xl font-bold text-[#5e1914]">{money(total)}</p>
        <div className="mt-8 space-y-4 border-b border-zinc-100 pb-6 text-sm">
          <Line label="Shipping Charge" value={money(shipping)} />
          <Line label="Add-ons" value={money(addOns)} />
          <Line label="Service Charge" value={money(service)} />
        </div>
        <Line label="Total" value={money(total)} className="mt-5 font-semibold" />
        <div className="mt-8 rounded-none border border-zinc-100 p-5">
          <p className="text-xs text-zinc-500">Wallet Balance</p>
          <p className="mt-3 text-2xl font-bold text-zinc-900">₦38,265.40 <span className="ml-2 bg-red-50 px-2 py-1 text-xs font-medium text-red-500">Low balance</span></p>
        </div>
        <button onClick={onPay} className="mt-6 w-full rounded-none bg-[#5e1914] py-4 font-semibold text-white hover:bg-[#4a130f]">Make Payment</button>
      </div>
    </aside>
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
      <p>{address.email}</p>
      <p>{address.phone}{address.alternatePhone ? `, ${address.alternatePhone}` : ""}</p>
      <p>{compactAddress(address)}</p>
    </div>
  );
}

function TextField({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5e1914] focus:ring-1 focus:ring-[#5e1914]" />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5e1914] focus:ring-1 focus:ring-[#5e1914]" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5e1914] focus:ring-1 focus:ring-[#5e1914]">
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
