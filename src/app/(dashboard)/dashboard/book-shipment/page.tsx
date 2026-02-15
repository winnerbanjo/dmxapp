"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateShippingRate, type ShipmentType } from "@/lib/shipping-rates";
import { bookShipment } from "@/app/actions/shipments";
import { cn } from "@/lib/utils";

const STEPS = ["Package & Route", "Pickup", "Receiver", "Review & Pay"];

const initialPickup = {
  name: "",
  phone: "",
  address: "",
  city: "",
  country: "Nigeria",
};
const initialReceiver = { ...initialPickup };

export default function BookShipmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ShipmentType>("LOCAL");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [pickup, setPickup] = useState(initialPickup);
  const [receiver, setReceiver] = useState(initialReceiver);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weightNum = parseFloat(weight) || 0;
  const rate = calculateShippingRate(weightNum, type);
  const cost = rate.amount;

  const canNext =
    step === 0
      ? type && weightNum > 0
      : step === 1
        ? pickup.name && pickup.phone && pickup.address && pickup.city && pickup.country
        : step === 2
          ? receiver.name && receiver.phone && receiver.address && receiver.city && receiver.country
          : true;

  const handleConfirmPay = async () => {
    const merchantId = (session?.user as { id?: string })?.id;
    if (!merchantId) {
      setError("Please sign in to book a shipment.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await bookShipment({
      merchantId,
      type,
      pickupDetails: pickup,
      receiverDetails: receiver,
      packageInfo: { weight: weightNum, category, dimensions },
      cost,
    });
    setLoading(false);
    if (result.success) {
      router.push(`/dashboard/tracking/${result.trackingId}`);
      return;
    }
    setError(result.error);
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Book a Shipment</h1>
        <p className="mt-1 text-sm text-slate-500">Multi-step form. Complete each section and confirm payment.</p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              step === i
                ? "bg-[#1e40af] text-white"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            )}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
          <CardDescription>
            {step === 0 && "Select shipment type and package weight to see cost."}
            {step === 1 && "Enter pickup/sender details."}
            {step === 2 && "Enter receiver details."}
            {step === 3 && "Review and pay from your wallet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>Shipment type</Label>
                <Select value={type} onValueChange={(v) => setType(v as ShipmentType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOCAL">Local</SelectItem>
                    <SelectItem value="INTERNATIONAL">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category (optional)</Label>
                <Input
                  placeholder="e.g. Documents, Electronics"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Dimensions (optional)</Label>
                <Input
                  placeholder="e.g. 10x20x30 cm"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                />
              </div>
              {weightNum > 0 && (
                <p className="rounded-md bg-slate-100 p-3 text-sm">
                  Estimated cost: <strong>₦{cost.toLocaleString()}</strong> ({rate.breakdown.base} + {rate.breakdown.weightKg}kg × {type === "LOCAL" ? "₦500" : "₦2,500"})
                </p>
              )}
            </>
          )}

          {step === 1 && (
            <>
              {(["name", "phone", "address", "city", "country"] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label className="capitalize">{field}</Label>
                  <Input
                    placeholder={field === "country" ? "Nigeria" : ""}
                    value={pickup[field]}
                    onChange={(e) => setPickup((p) => ({ ...p, [field]: e.target.value }))}
                  />
                </div>
              ))}
            </>
          )}

          {step === 2 && (
            <>
              {(["name", "phone", "address", "city", "country"] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label className="capitalize">Receiver {field}</Label>
                  <Input
                    placeholder={field === "country" ? "Nigeria" : ""}
                    value={receiver[field]}
                    onChange={(e) => setReceiver((r) => ({ ...r, [field]: e.target.value }))}
                  />
                </div>
              ))}
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                <p><strong>Type:</strong> {type}</p>
                <p><strong>Weight:</strong> {weightNum} kg</p>
                <p><strong>Pickup:</strong> {pickup.name}, {pickup.address}, {pickup.city}, {pickup.country}</p>
                <p><strong>Receiver:</strong> {receiver.name}, {receiver.address}, {receiver.city}, {receiver.country}</p>
                <p className="text-lg font-semibold text-[#1e40af]">Total: ₦{cost.toLocaleString()}</p>
              </div>
              <p className="text-xs text-slate-500">Amount will be deducted from your wallet balance.</p>
            </>
          )}

          {error && (
            <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button type="button" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            ) : (
              <Button
                type="button"
                disabled={loading}
                onClick={handleConfirmPay}
              >
                {loading ? "Processing..." : "Confirm & Pay"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
