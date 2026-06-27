"use client";

import { useState, useMemo, useEffect } from "react";
import { useFormState } from "react-dom";
import { createBookingFromPowerForm, type CreateBookingState } from "@/app/merchant/booking-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ServiceType } from "@/data/booking-constants";
import { extractCityFromAddress } from "@/data/pricing-demo";
import { useRateCard } from "@/contexts/rate-card-context";
import { DESTINATION_HUB_OPTIONS } from "@/data/booking-constants";
import { getPricingCityFromAddress } from "@/data/address-constants";
import {
  getZoneFromCountry,
  getCarrierCostForZone,
  applyMarkup,
  DEFAULT_PROFIT_MARKUP_PERCENT,
  ZONE_LABELS,
} from "@/data/zone-pricing";
import { BookingSlipModal } from "@/components/booking-slip-modal";
import { StructuredAddressField } from "@/components/structured-address-field";
import { emptyStructuredAddress, type StructuredAddressValue } from "@/types/address";

const ITEM_CATEGORIES = ["Documents", "Electronics", "Fashion", "Food & Beverage", "General Merchandise", "Other"] as const;
const PACKAGE_CATEGORY_OPTIONS = [
  { value: "personal", label: "Personal" },
  { value: "commercial", label: "Commercial" },
] as const;

type Sender = { businessName: string; email: string; address: string };
type CourierRate = {
  id: string;
  name: string;
  service: string;
  eta: string;
  pickup: string;
  amount: number;
  recommended?: boolean;
};

export function BookingPowerForm({
  sender,
  serviceType,
  merchantId,
  initialValues,
  onBack,
}: {
  sender: Sender;
  serviceType: ServiceType;
  merchantId?: string;
  initialValues?: {
    receiverName?: string;
    receiverPhone?: string;
    destination?: string;
    weight?: string;
    declaredValue?: string;
    receiverCountry?: string;
  };
  onBack: () => void;
}) {
  const [receiverName, setReceiverName] = useState(initialValues?.receiverName ?? "");
  const [receiverPhone, setReceiverPhone] = useState(initialValues?.receiverPhone ?? "");
  const [receiverStructured, setReceiverStructured] = useState<StructuredAddressValue>(emptyStructuredAddress());
  const [assignedHub, setAssignedHub] = useState(DESTINATION_HUB_OPTIONS[0].value);
  const [weight, setWeight] = useState(initialValues?.weight ?? "");
  const [itemCategory, setItemCategory] = useState("");
  const [declaredValue, setDeclaredValue] = useState(initialValues?.declaredValue ?? "");
  const [serviceLevel, setServiceLevel] = useState<"Standard" | "Express">("Standard");
  const [itemValueCustoms, setItemValueCustoms] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [idPassportNumber, setIdPassportNumber] = useState("");
  const [packageCategory, setPackageCategory] = useState("");
  const [receiverCountry, setReceiverCountry] = useState(initialValues?.receiverCountry ?? "");
  const [selectedCourierId, setSelectedCourierId] = useState("dmx");

  const isInternational = serviceType === "international";

  function handleReceiverHubSuggest(hub: string | null) {
    if (hub && DESTINATION_HUB_OPTIONS.some((o) => o.value === hub)) setAssignedHub(hub);
  }

  const { getQuote } = useRateCard();
  const [state, formAction] = useFormState<CreateBookingState, FormData>(createBookingFromPowerForm, {});

  const weightNum = parseFloat(weight) || 0;
  const declaredNum = parseFloat(declaredValue) || 0;
  const itemValueNum = parseFloat(itemValueCustoms) || 0;
  const express = serviceLevel === "Express";
  const origin = extractCityFromAddress(sender.address) || "Lagos";
  const destination = getPricingCityFromAddress(receiverStructured.state, receiverStructured.lga);
  const zone = getZoneFromCountry(receiverCountry);
  const { baseFare, insurance } = useMemo(() => {
    let baseFareVal = 0;
    if (weightNum > 0) {
      if (isInternational && zone) {
        const cost = getCarrierCostForZone(weightNum, zone);
        baseFareVal = applyMarkup(cost, DEFAULT_PROFIT_MARKUP_PERCENT);
      } else {
        const quote = getQuote(origin, destination, weightNum, express, merchantId);
        baseFareVal = quote.baseFare;
      }
    }
    const ins = declaredNum > 0 ? Math.round(declaredNum * 0.005) : 0;
    const intlIns = isInternational && itemValueNum > 0 ? Math.round(itemValueNum * 0.01) : 0;
    return { baseFare: baseFareVal, insurance: ins + intlIns };
  }, [weightNum, express, declaredNum, isInternational, itemValueNum, origin, destination, zone, getQuote, merchantId]);

  const courierRates: CourierRate[] = useMemo(() => {
    const tierFactor = express ? 1.35 : 1;
    const internationalFactor = isInternational ? 1.45 : 1;
    const base = Math.max(0, Math.round(baseFare * tierFactor * internationalFactor));

    return [
      {
        id: "dmx",
        name: "DMX Express",
        service: express ? "Priority Network" : "Standard Network",
        eta: express ? "1-2 business days" : "2-4 business days",
        pickup: "Pickup or hub drop-off",
        amount: base,
        recommended: true,
      },
      {
        id: "dhl",
        name: "DHL Express",
        service: "Express Worldwide",
        eta: isInternational ? "2-5 business days" : "1-3 business days",
        pickup: "Pickup available",
        amount: Math.round(base * 1.18 + 1200),
      },
      {
        id: "fedex",
        name: "FedEx",
        service: express ? "International Priority" : "International Economy",
        eta: isInternational ? "3-6 business days" : "2-5 business days",
        pickup: "Pickup available",
        amount: Math.round(base * 1.08 + 1800),
      },
      {
        id: "ups",
        name: "UPS",
        service: "Saver",
        eta: isInternational ? "4-7 business days" : "3-5 business days",
        pickup: "Drop-off preferred",
        amount: Math.round(base * 0.98 + 900),
      },
    ];
  }, [baseFare, express, isInternational]);

  const selectedCourier = courierRates.find((rate) => rate.id === selectedCourierId) ?? courierRates[0];
  const customsCharge = isInternational && itemValueNum > 0 ? Math.round(itemValueNum * 0.035) : 0;
  const total = selectedCourier.amount + insurance + customsCharge;

  const [showSlip, setShowSlip] = useState(false);
  useEffect(() => {
    if (state?.slip) setShowSlip(true);
  }, [state?.slip]);

  return (
    <>
      <div className="mt-12 flex gap-0">
        <form id="booking-power-form" action={formAction} className="min-w-0 flex-1 pr-12">
          <input type="hidden" name="serviceType" value={serviceType} />
          <input type="hidden" name="courierId" value={selectedCourier.id} />
          <input type="hidden" name="courierName" value={selectedCourier.name} />
          <input type="hidden" name="courierPrice" value={selectedCourier.amount} />
          <input type="hidden" name="insuranceFee" value={insurance} />
          <input type="hidden" name="customsCharge" value={customsCharge} />
          <input type="hidden" name="payableTotal" value={total} />

          {state?.error && (
            <p className="mb-6 text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}
          {state?.success && !state?.slip && (
            <p className="mb-6 text-sm text-[#5e1914]">{state.success}</p>
          )}

          <div className="mb-8 flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={onBack} className="rounded-none border-zinc-200">
              ← Change service
            </Button>
          </div>

          {/* Economy | Express toggle — Economy = Standard (slower, cheaper), Express = premium */}
          <div className="mb-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Service tier</p>
            <div className="flex items-center gap-0 rounded-none border border-zinc-100 bg-white p-1">
              <button
                type="button"
                onClick={() => setServiceLevel("Standard")}
                className={`flex-1 rounded-none px-6 py-3 text-sm font-medium transition-colors ${
                  serviceLevel === "Standard"
                    ? "bg-[#5e1914] text-white"
                    : "bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                Economy
              </button>
              <button
                type="button"
                onClick={() => setServiceLevel("Express")}
                className={`flex-1 rounded-none px-6 py-3 text-sm font-medium transition-colors ${
                  serviceLevel === "Express"
                    ? "bg-[#5e1914] text-white"
                    : "bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                Express
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Economy: Slower, cheaper. Express: Faster, premium.
            </p>
          </div>

          <div className="space-y-16">
            {/* Sender */}
            <section className="border-b border-zinc-100 pb-12">
              <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Sender details</h2>
              <p className="mt-1 text-sm text-zinc-400">From your merchant profile</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <Label className="text-zinc-700">Business name</Label>
                  <Input readOnly value={sender.businessName} className="mt-2 h-12 rounded-none border-zinc-100 bg-zinc-50" />
                </div>
                <div>
                  <Label className="text-zinc-700">Email</Label>
                  <Input readOnly value={sender.email} className="mt-2 h-12 rounded-none border-zinc-100 bg-zinc-50" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-zinc-700">Address</Label>
                  <Input readOnly value={sender.address} className="mt-2 h-12 rounded-none border-zinc-100 bg-zinc-50" />
                </div>
              </div>
            </section>

            {/* Receiver + Destination Hub */}
            <section className="border-b border-zinc-100 pb-12">
              <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Receiver details</h2>
              <div className="mt-8 space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="receiverName" className="text-zinc-700">Name</Label>
                    <Input
                      id="receiverName"
                      name="receiverName"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="mt-2 h-12 rounded-none border-zinc-100"
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="receiverPhone" className="text-zinc-700">Phone</Label>
                    <Input
                      id="receiverPhone"
                      name="receiverPhone"
                      type="tel"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      className="mt-2 h-12 rounded-none border-zinc-100"
                      placeholder="+234 800 000 0000"
                      required
                    />
                  </div>
                </div>
                <StructuredAddressField
                  label="Delivery address"
                  value={receiverStructured}
                  onChange={setReceiverStructured}
                  namePrefix="receiver"
                  showMapPreview={true}
                  required={true}
                  onHubSuggest={handleReceiverHubSuggest}
                />
                {initialValues?.destination && !receiverStructured.streetAddress && (
                  <p className="text-xs text-zinc-500">
                    Quote selection destination: {initialValues.destination}. Complete the full structured address below for dispatch.
                  </p>
                )}
                <div>
                  <Label htmlFor="assignedHub" className="text-zinc-700">Destination Hub (Smart mapping)</Label>
                  <select
                    id="assignedHub"
                    name="assignedHub"
                    value={assignedHub}
                    onChange={(e) => setAssignedHub(e.target.value)}
                    required
                    className="mt-2 flex h-12 w-full rounded-none border border-zinc-100 bg-white px-4 font-sans text-zinc-900"
                  >
                    {DESTINATION_HUB_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-zinc-500">Set from LGA/State; you can override.</p>
                </div>
              </div>
              <input type="hidden" name="receiverStreetAddress" value={receiverStructured.streetAddress} />
              <input type="hidden" name="receiverLga" value={receiverStructured.lga} />
              <input type="hidden" name="receiverState" value={receiverStructured.state} />
              <input type="hidden" name="receiverApartment" value={receiverStructured.apartment} />
              <input type="hidden" name="receiverLandmark" value={receiverStructured.landmark} />
            </section>

            {/* Package */}
            <section className="border-b border-zinc-100 pb-12">
              <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Package details</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="packageWeight" className="text-zinc-700">Weight (kg)</Label>
                  <Input
                    id="packageWeight"
                    name="packageWeight"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="mt-2 h-12 rounded-none border-zinc-100"
                    placeholder="2.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="itemCategory" className="text-zinc-700">Item category</Label>
                  <select
                    id="itemCategory"
                    name="itemCategory"
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="mt-2 flex h-12 w-full rounded-none border border-zinc-100 bg-white px-4 text-zinc-900"
                  >
                    <option value="">Select</option>
                    {ITEM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="declaredValue" className="text-zinc-700">Declared value (₦)</Label>
                  <Input
                    id="declaredValue"
                    name="declaredValue"
                    type="number"
                    min="0"
                    value={declaredValue}
                    onChange={(e) => setDeclaredValue(e.target.value)}
                    className="mt-2 h-12 rounded-none border-zinc-100"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {isInternational && (
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="receiverCountry" className="text-zinc-700">Destination country</Label>
                    <Input
                      id="receiverCountry"
                      name="receiverCountry"
                      value={receiverCountry}
                      onChange={(e) => setReceiverCountry(e.target.value)}
                      placeholder="e.g. Cameroon, UK, USA"
                      className="mt-2 h-12 rounded-none border-zinc-100"
                    />
                    {zone && (
                      <p className="mt-1 text-xs font-medium text-[#5e1914]">
                        Zone detected: {ZONE_LABELS[zone]} — rate pulled from sheet
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="itemValueCustoms" className="text-zinc-700">Item Value for Customs (₦)</Label>
                    <Input
                      id="itemValueCustoms"
                      name="itemValueCustoms"
                      type="number"
                      min="0"
                      value={itemValueCustoms}
                      onChange={(e) => setItemValueCustoms(e.target.value)}
                      className="mt-2 h-12 rounded-none border-zinc-100"
                      placeholder="Required for international"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hsCode" className="text-zinc-700">HS Code (optional)</Label>
                    <Input
                      id="hsCode"
                      name="hsCode"
                      value={hsCode}
                      onChange={(e) => setHsCode(e.target.value)}
                      className="mt-2 h-12 rounded-none border-zinc-100"
                      placeholder="e.g. 8471.30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="idPassportNumber" className="text-zinc-700">ID / Passport Number</Label>
                    <Input
                      id="idPassportNumber"
                      name="idPassportNumber"
                      value={idPassportNumber}
                      onChange={(e) => setIdPassportNumber(e.target.value)}
                      className="mt-2 h-12 rounded-none border-zinc-100"
                      placeholder="For customs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="packageCategory" className="text-zinc-700">Package Category</Label>
                    <select
                      id="packageCategory"
                      name="packageCategory"
                      value={packageCategory}
                      onChange={(e) => setPackageCategory(e.target.value)}
                      className="mt-2 flex h-12 w-full rounded-none border border-zinc-100 bg-white px-4 text-zinc-900"
                    >
                      <option value="">Select</option>
                      {PACKAGE_CATEGORY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </section>

            {/* Service level */}
            <section className="border-b border-zinc-100 pb-12">
              <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Service level</h2>
              <div className="mt-6 flex gap-4">
                <label className="flex flex-1 cursor-pointer items-center rounded-none border border-zinc-100 bg-white p-6">
                  <input
                    type="radio"
                    name="serviceLevel"
                    value="Standard"
                    checked={serviceLevel === "Standard"}
                    onChange={() => setServiceLevel("Standard")}
                    className="h-4 w-4 border-zinc-300 text-[#5e1914]"
                  />
                  <span className="ml-3 text-sm font-medium text-zinc-900">Standard</span>
                </label>
                <label className="flex flex-1 cursor-pointer items-center rounded-none border border-zinc-100 bg-white p-6">
                  <input
                    type="radio"
                    name="serviceLevel"
                    value="Express"
                    checked={serviceLevel === "Express"}
                    onChange={() => setServiceLevel("Express")}
                    className="h-4 w-4 border-zinc-300 text-[#5e1914]"
                  />
                  <span className="ml-3 text-sm font-medium text-zinc-900">Express</span>
                </label>
              </div>
            </section>

            {/* Courier selection */}
            <section>
              <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Select courier</h2>
              <p className="mt-1 text-sm text-zinc-500">Final courier rates are shown here before payment or waybill generation.</p>
              <div className="mt-5 grid gap-3 border border-zinc-100 bg-[#f7f1ef] p-5 sm:grid-cols-4">
                <QuoteMetric label="Total weight" value={weightNum > 0 ? `${weightNum} kg` : "Pending"} />
                <QuoteMetric label="Declared value" value={`₦${declaredNum.toLocaleString("en-NG")}`} />
                <QuoteMetric label="Customs value" value={isInternational ? `₦${itemValueNum.toLocaleString("en-NG")}` : "Not required"} />
                <QuoteMetric label="Destination" value={isInternational ? receiverCountry || "International" : assignedHub} />
              </div>
              <div className="mt-6 space-y-3">
                {courierRates.map((rate) => (
                  <button
                    key={rate.id}
                    type="button"
                    disabled={weightNum <= 0}
                    onClick={() => setSelectedCourierId(rate.id)}
                    className={`w-full border bg-white p-5 text-left transition-colors ${
                      selectedCourier.id === rate.id ? "border-[#5e1914] bg-[#f7f1ef]" : "border-zinc-100 hover:border-[#5e1914]"
                    } ${weightNum <= 0 ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-zinc-900">{rate.name}</p>
                          {rate.recommended ? <span className="bg-[#5e1914] px-2 py-1 text-xs font-semibold text-white">Recommended</span> : null}
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">{rate.service}</p>
                        <p className="mt-2 text-xs text-zinc-500">ETA: {rate.eta} · {rate.pickup}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wider text-zinc-400">Courier price</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-[#5e1914]">₦{rate.amount.toLocaleString("en-NG")}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 border border-zinc-100 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-900">Checkout add-ons</p>
                    <p className="mt-1 text-sm text-zinc-500">Insurance and customs estimate are factored into the payable total.</p>
                  </div>
                  <p className="text-sm font-semibold text-[#5e1914]">Payable ₦{total.toLocaleString("en-NG")}</p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <QuoteMetric label="Insurance fee" value={`₦${insurance.toLocaleString("en-NG")}`} />
                  <QuoteMetric label="Customs estimate" value={`₦${customsCharge.toLocaleString("en-NG")}`} />
                  <QuoteMetric label="Courier selected" value={selectedCourier.name} />
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12">
            <Button type="submit" className="h-12 rounded-none bg-[#5e1914] px-8 text-sm font-medium text-white hover:bg-[#4a130f]">
              Generate Waybill
            </Button>
          </div>
        </form>

        <aside className="sticky top-8 hidden w-80 shrink-0 border-l border-zinc-100 bg-white pl-10 lg:block">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans">Live quote</p>
          <div className="mt-6 space-y-4 rounded-none border border-zinc-100 bg-zinc-50 p-6 font-sans">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Selected courier</span>
              <span className="font-medium text-zinc-900">{selectedCourier.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Courier price</span>
              <span className="font-medium text-zinc-900">₦{selectedCourier.amount.toLocaleString("en-NG")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Service tier</span>
              <span className="font-medium text-zinc-900">{serviceLevel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Insurance</span>
              <span className="font-medium text-zinc-900">₦{insurance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Customs estimate</span>
              <span className="font-medium text-zinc-900">₦{customsCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-100 pt-4">
              <span className="text-sm font-medium text-zinc-900">Total</span>
              <span className="text-xl font-semibold tracking-tighter text-[#5e1914]">
                ₦{total.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            {weightNum > 0 ? `${weightNum} kg · ${serviceLevel}` : "Enter weight to see quote"}
          </p>
          <Button type="submit" form="booking-power-form" className="mt-8 w-full rounded-none bg-[#5e1914] py-3 text-sm font-medium text-white hover:bg-[#4a130f]">
            Generate Waybill
          </Button>
        </aside>
      </div>

      {state?.slip && (
        <BookingSlipModal
          open={showSlip}
          onClose={() => setShowSlip(false)}
          data={state.slip}
        />
      )}
    </>
  );
}

function QuoteMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
