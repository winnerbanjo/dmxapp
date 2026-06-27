"use client";

import { useState, useMemo } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { createBooking, type CreateBookingState } from "@/app/merchant/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, FileText, Package, Box, Pencil, Shield } from "lucide-react";
import { calculateBookingPrice } from "@/lib/booking-pricing";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Receiver details" },
  { id: 2, title: "Package & options" },
  { id: 3, title: "Review" },
];

type PresetId = "document" | "smallbox" | "largebox" | "custom";

const PACKAGE_PRESETS: { id: PresetId; label: string; weight: number; length: number; width: number; height: number; icon: typeof FileText }[] = [
  { id: "document", label: "Document", weight: 0.5, length: 30, width: 22, height: 2, icon: FileText },
  { id: "smallbox", label: "Small Box", weight: 2, length: 35, width: 25, height: 15, icon: Package },
  { id: "largebox", label: "Large Box", weight: 10, length: 50, width: 40, height: 40, icon: Box },
  { id: "custom", label: "Custom", weight: 0, length: 0, width: 0, height: 0, icon: Pencil },
];

type CourierRate = {
  id: string;
  name: string;
  service: string;
  eta: string;
  amount: number;
  recommended?: boolean;
};

function formatNaira(n: number): string {
  return `₦${n.toLocaleString()}`;
}

export function BookingForm() {
  const [step, setStep] = useState(1);
  const [state, formAction] = useFormState<CreateBookingState, FormData>(createBooking, {});
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [preset, setPreset] = useState<PresetId>("smallbox");
  const [packageWeight, setPackageWeight] = useState("2");
  const [length, setLength] = useState("35");
  const [width, setWidth] = useState("25");
  const [height, setHeight] = useState("15");
  const [declaredValue, setDeclaredValue] = useState("");
  const [premiumInsurance, setPremiumInsurance] = useState(false);
  const [fragile, setFragile] = useState(false);
  const [signatureRequired, setSignatureRequired] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState("dmx");

  const weightNum = Math.max(0, parseFloat(packageWeight) || 0);
  const declaredNum = Math.max(0, parseFloat(declaredValue) || 0);

  const breakdown = useMemo(
    () =>
      calculateBookingPrice(weightNum, {
        declaredValue: declaredNum,
        premiumInsurance,
        fragile,
      }),
    [weightNum, declaredNum, premiumInsurance, fragile]
  );
  const courierRates: CourierRate[] = useMemo(() => {
    const courierBase = Math.max(0, breakdown.baseShipping + breakdown.fuelSurcharge);
    return [
      { id: "dmx", name: "DMX Express", service: "Managed Network", eta: "1-3 business days", amount: courierBase, recommended: true },
      { id: "dhl", name: "DHL Express", service: "Express Worldwide", eta: "1-3 business days", amount: Math.round(courierBase * 1.22 + 1000) },
      { id: "fedex", name: "FedEx", service: "Priority", eta: "2-4 business days", amount: Math.round(courierBase * 1.12 + 1200) },
      { id: "ups", name: "UPS", service: "Saver", eta: "3-5 business days", amount: Math.round(courierBase * 1.02 + 700) },
    ];
  }, [breakdown.baseShipping, breakdown.fuelSurcharge]);
  const selectedCourier = courierRates.find((rate) => rate.id === selectedCourierId) ?? courierRates[0];
  const customsCharge = declaredNum > 500000 ? Math.round(declaredNum * 0.025) : 0;
  const finalTotal = selectedCourier.amount + breakdown.insurance + breakdown.fragileFee + breakdown.vat + customsCharge;

  const handlePresetSelect = (id: PresetId) => {
    setPreset(id);
    const p = PACKAGE_PRESETS.find((x) => x.id === id);
    if (p && id !== "custom") {
      setPackageWeight(String(p.weight));
      setLength(String(p.length));
      setWidth(String(p.width));
      setHeight(String(p.height));
    }
  };

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
      <form action={formAction} className="min-w-0 flex-1">
        {state?.error && (
          <p className="mb-8 text-sm text-red-600 font-sans" role="alert">
            {state.error}
          </p>
        )}
        {(state?.trackingId || state?.success) && (
          <div className="mb-8 border border-zinc-100 bg-zinc-50 p-6">
            <p className="text-sm text-[#5e1914] font-sans">
              {state.success}
              {state.trackingId && (
                <>
                  {" "}
                  <Link href={`/track/${state.trackingId}`} className="font-mono underline">
                    {state.trackingId}
                  </Link>
                </>
              )}
            </p>
          </div>
        )}

        {/* Step indicator */}
        <div className="mb-12 flex gap-1">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "h-1 flex-1",
                s.id <= step ? "bg-[#5e1914]" : "bg-zinc-100"
              )}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-10">
            <div>
              <Label htmlFor="receiverName" className="text-base font-medium text-zinc-900 font-sans">
                Receiver name
              </Label>
              <Input
                id="receiverName"
                name="receiverName"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="mt-4 h-14 rounded-none border-zinc-200 bg-white text-lg font-sans"
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="receiverPhone" className="text-base font-medium text-zinc-900 font-sans">
                Receiver phone
              </Label>
              <Input
                id="receiverPhone"
                name="receiverPhone"
                type="tel"
                required
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                className="mt-4 h-14 rounded-none border-zinc-200 bg-white text-lg font-sans"
                placeholder="+234 800 000 0000"
              />
            </div>
            <div>
              <Label htmlFor="receiverAddress" className="text-base font-medium text-zinc-900 font-sans">
                Receiver address
              </Label>
              <Input
                id="receiverAddress"
                name="receiverAddress"
                required
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                className="mt-4 h-14 rounded-none border-zinc-200 bg-white text-lg font-sans"
                placeholder="123 Street, City"
              />
            </div>
            <div className="flex justify-end pt-6">
              <Button
                type="button"
                onClick={() => setStep(2)}
                className="h-12 rounded-none bg-[#5e1914] px-8 font-sans hover:bg-[#4a130f]"
              >
                Next
                <ChevronRight strokeWidth={1} className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
            {/* Quick Select presets */}
            <div>
              <Label className="text-base font-medium text-zinc-900 font-sans">
                Quick Select
              </Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {PACKAGE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetSelect(p.id)}
                    className={cn(
                      "flex items-center gap-2 border px-4 py-3 font-sans text-sm font-medium transition-colors",
                      preset === p.id
                        ? "border-[#5e1914] bg-[#5e1914] text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                    )}
                  >
                    <p.icon className="h-4 w-4" />
                    {p.label}
                    {p.id !== "custom" && (
                      <span className="opacity-80">
                        {p.weight}kg
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="packageWeight" className="font-sans text-zinc-900">
                  Weight (kg)
                </Label>
                <Input
                  id="packageWeight"
                  name="packageWeight"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={packageWeight}
                  onChange={(e) => setPackageWeight(e.target.value)}
                  className="mt-2 h-12 rounded-none border-zinc-200 bg-white font-sans"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="font-sans text-zinc-900">L (cm)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="mt-2 h-12 rounded-none border-zinc-200 bg-white font-sans"
                  />
                </div>
                <div>
                  <Label className="font-sans text-zinc-900">W (cm)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="mt-2 h-12 rounded-none border-zinc-200 bg-white font-sans"
                  />
                </div>
                <div>
                  <Label className="font-sans text-zinc-900">H (cm)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="mt-2 h-12 rounded-none border-zinc-200 bg-white font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div className="space-y-4 border-t border-zinc-100 pt-8">
              <Label className="font-sans text-base font-medium text-zinc-900">
                Insurance
              </Label>
              <div>
                <Label className="text-sm text-zinc-600 font-sans">Declared value (₦)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={declaredValue}
                  onChange={(e) => setDeclaredValue(e.target.value)}
                  placeholder="0"
                  className="mt-2 h-12 rounded-none border-zinc-200 bg-white font-sans"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={premiumInsurance}
                  onChange={(e) => setPremiumInsurance(e.target.checked)}
                  className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914] focus:ring-[#5e1914]"
                />
                <span className="font-sans text-sm font-medium text-zinc-900">
                  Add Premium Insurance (1.5% of declared value)
                </span>
              </label>
              {premiumInsurance && (
                <div className="inline-flex items-center gap-2 border border-[#5e1914] bg-[#5e1914]/5 px-3 py-2">
                  <Shield className="h-4 w-4 text-[#5e1914]" />
                  <span className="text-sm font-medium text-[#5e1914] font-sans">
                    Protection Secured
                  </span>
                </div>
              )}
            </div>

            {/* Fragile & Signature */}
            <div className="space-y-4 border-t border-zinc-100 pt-8">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="fragile"
                  value="on"
                  checked={fragile}
                  onChange={(e) => setFragile(e.target.checked)}
                  className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914] focus:ring-[#5e1914]"
                />
                <span className="font-sans text-sm font-medium text-zinc-900">
                  Fragile (+₦500 handling fee)
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="signatureRequired"
                  value="on"
                  checked={signatureRequired}
                  onChange={(e) => setSignatureRequired(e.target.checked)}
                  className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914] focus:ring-[#5e1914]"
                />
                <span className="font-sans text-sm font-medium text-zinc-900">
                  Signature required on delivery
                </span>
              </label>
            </div>

            <div className="flex justify-between border-t border-zinc-100 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="h-12 rounded-none border-zinc-200 font-sans"
              >
                <ChevronLeft strokeWidth={1} className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                className="h-12 rounded-none bg-[#5e1914] px-8 font-sans hover:bg-[#4a130f]"
              >
                Next
                <ChevronRight strokeWidth={1} className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="border border-zinc-100 bg-white p-8">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans">
                Receiver
              </p>
              <p className="mt-2 text-lg text-zinc-900 font-sans">{receiverName || "—"}</p>
              <p className="text-zinc-600 font-sans">{receiverPhone || "—"}</p>
              <p className="text-zinc-600 font-sans">{receiverAddress || "—"}</p>
            </div>
            <div className="border border-zinc-100 bg-white p-8">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans">
                Package
              </p>
              <p className="mt-2 text-lg text-zinc-900 font-sans">{packageWeight} kg</p>
              <p className="text-sm text-zinc-600 font-sans">
                {length} × {width} × {height} cm
              </p>
              {fragile && <p className="mt-1 text-sm text-[#5e1914] font-sans">Fragile</p>}
              {signatureRequired && <p className="text-sm text-[#5e1914] font-sans">Signature required</p>}
            </div>
            <div className="border border-zinc-100 bg-white p-8">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans">
                Select courier
              </p>
              <p className="mt-1 text-sm text-zinc-500 font-sans">Choose the courier rate before creating the booking.</p>
              <div className="mt-5 grid gap-3 border border-zinc-100 bg-[#f7f1ef] p-5 sm:grid-cols-3">
                <SummaryMetric label="Total weight" value={`${weightNum} kg`} />
                <SummaryMetric label="Dimensions" value={`${length} x ${width} x ${height} cm`} />
                <SummaryMetric label="Declared value" value={formatNaira(declaredNum)} />
              </div>
              <div className="mt-5 space-y-3">
                {courierRates.map((rate) => (
                  <button
                    key={rate.id}
                    type="button"
                    onClick={() => setSelectedCourierId(rate.id)}
                    className={cn(
                      "w-full border bg-white p-4 text-left transition-colors",
                      selectedCourier.id === rate.id ? "border-[#5e1914] bg-[#f7f1ef]" : "border-zinc-100 hover:border-[#5e1914]"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-sans font-semibold text-zinc-900">{rate.name}</p>
                          {rate.recommended && <span className="bg-[#5e1914] px-2 py-1 text-xs font-semibold text-white">Recommended</span>}
                        </div>
                        <p className="mt-1 font-sans text-sm text-zinc-500">{rate.service} · ETA {rate.eta}</p>
                      </div>
                      <p className="font-sans text-xl font-semibold tracking-tight text-[#5e1914]">{formatNaira(rate.amount)}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 border border-zinc-100 bg-zinc-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-sans font-semibold text-zinc-900">Checkout add-ons</p>
                    <p className="mt-1 font-sans text-sm text-zinc-500">These charges are included before payment or final booking creation.</p>
                  </div>
                  <p className="font-sans text-sm font-semibold text-[#5e1914]">Payable {formatNaira(finalTotal)}</p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <SummaryMetric label="Insurance" value={formatNaira(breakdown.insurance)} />
                  <SummaryMetric label="Customs estimate" value={formatNaira(customsCharge)} />
                  <SummaryMetric label="Fragile handling" value={formatNaira(breakdown.fragileFee)} />
                  <SummaryMetric label="VAT" value={formatNaira(breakdown.vat)} />
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="h-12 rounded-none border-zinc-200 font-sans"
              >
                <ChevronLeft strokeWidth={1} className="mr-2 h-4 w-4" />
                Back
              </Button>
              <input type="hidden" name="packageWeight" value={packageWeight} />
              <input type="hidden" name="declaredValue" value={declaredValue} />
              <input type="hidden" name="courierId" value={selectedCourier.id} />
              <input type="hidden" name="courierName" value={selectedCourier.name} />
              <input type="hidden" name="courierPrice" value={selectedCourier.amount} />
              <input type="hidden" name="customsCharge" value={customsCharge} />
              <input type="hidden" name="payableTotal" value={finalTotal} />
              {premiumInsurance && <input type="hidden" name="premiumInsurance" value="on" />}
              {fragile && <input type="hidden" name="fragile" value="on" />}
              {signatureRequired && <input type="hidden" name="signatureRequired" value="on" />}
              <Button
                type="submit"
                className="h-12 rounded-none bg-[#5e1914] px-8 font-sans hover:bg-[#4a130f]"
              >
                Create booking
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Price Summary sidebar */}
      <aside className="w-full shrink-0 border border-zinc-100 bg-white p-6 font-sans lg:w-80">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Price Summary
        </h3>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between text-zinc-700">
            <dt>Selected courier</dt>
            <dd>{selectedCourier.name}</dd>
          </div>
          <div className="flex justify-between text-zinc-700">
            <dt>Courier price</dt>
            <dd>{formatNaira(selectedCourier.amount)}</dd>
          </div>
          <div className="flex justify-between text-zinc-700">
            <dt>Insurance</dt>
            <dd>{formatNaira(breakdown.insurance)}</dd>
          </div>
          <div className="flex justify-between text-zinc-700">
            <dt>Customs estimate</dt>
            <dd>{formatNaira(customsCharge)}</dd>
          </div>
          {breakdown.fragileFee > 0 && (
            <div className="flex justify-between text-zinc-700">
              <dt>Fragile handling</dt>
              <dd>{formatNaira(breakdown.fragileFee)}</dd>
            </div>
          )}
          <div className="flex justify-between text-zinc-700">
            <dt>VAT (7.5%)</dt>
            <dd>{formatNaira(breakdown.vat)}</dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-zinc-100 pt-4">
          <div className="flex justify-between text-base font-semibold text-zinc-900">
            <dt>Grand Total</dt>
            <dd>{formatNaira(finalTotal)}</dd>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 font-sans text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
