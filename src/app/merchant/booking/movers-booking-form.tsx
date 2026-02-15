"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRateCard } from "@/contexts/rate-card-context";
import { cn } from "@/lib/utils";

const VAN_SIZES = [
  { id: "mini", label: "Mini Van", value: "Mini Van" },
  { id: "mid", label: "Mid-Size", value: "Mid-Size" },
  { id: "5ton", label: "5-Ton Truck", value: "5-Ton Truck" },
] as const;

const LABORER_COST = 5000;
const BOXES_COST = 2000;
const BUBBLE_WRAP_COST = 1500;

const DEFAULT_VAN_PRICES: Record<string, number> = {
  "Mini Van": 15000,
  "Mid-Size": 22000,
  "5-Ton Truck": 45000,
};

type Sender = { businessName: string; email: string; address: string };

export function MoversBookingForm({
  sender,
  merchantId,
  onBack,
}: {
  sender: Sender;
  merchantId?: string;
  onBack: () => void;
}) {
  const { getMoversRatesForMerchant, getMoversDiscountPercent } = useRateCard();
  const moversRates = getMoversRatesForMerchant(merchantId);
  const discountPercent = getMoversDiscountPercent(merchantId);
  const [vanSize, setVanSize] = useState<string>("Mini Van");
  const [laborersCount, setLaborersCount] = useState(0);
  const [addBoxes, setAddBoxes] = useState(false);
  const [addBubbleWrap, setAddBubbleWrap] = useState(false);
  const [pickupAddress, setPickupAddress] = useState(sender.address || "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  const baseVanPrice = useMemo(() => {
    const rate = moversRates.find((r) => r.vanSize.trim().toLowerCase() === vanSize.trim().toLowerCase());
    return rate?.basePrice ?? DEFAULT_VAN_PRICES[vanSize] ?? 15000;
  }, [vanSize, moversRates]);

  const subtotal = useMemo(() => {
    let t = baseVanPrice;
    t += laborersCount * LABORER_COST;
    if (addBoxes) t += BOXES_COST;
    if (addBubbleWrap) t += BUBBLE_WRAP_COST;
    return t;
  }, [baseVanPrice, laborersCount, addBoxes, addBubbleWrap]);

  const total = useMemo(() => {
    if (discountPercent <= 0) return subtotal;
    return Math.round(subtotal * (1 - discountPercent / 100));
  }, [subtotal, discountPercent]);

  return (
    <div className="mx-auto max-w-2xl font-sans">
      <div className="mb-8 flex items-center gap-4 border-b border-zinc-100 pb-6">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-white">
          <Image
            src="/dmxlogo.svg"
            alt="DMX"
            fill
            className="object-contain"
            sizes="40px"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tighter text-zinc-900">
            DMX Movers / Heavy Van
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Van size, laborers, and packaging. Quote updates as you select.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <Label className="text-sm font-medium text-zinc-900">Van Size</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {VAN_SIZES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVanSize(v.value)}
                className={cn(
                  "rounded-none border px-4 py-3 text-sm font-medium font-sans transition-colors",
                  vanSize === v.value
                    ? "border-[#5e1914] bg-[#5e1914] text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-zinc-900">Laborers Needed</Label>
          <p className="mt-1 text-xs text-zinc-500">+₦{LABORER_COST.toLocaleString()} per helper</p>
          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLaborersCount((c) => Math.max(0, c - 1))}
              className="rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center font-medium text-zinc-900">{laborersCount}</span>
            <button
              type="button"
              onClick={() => setLaborersCount((c) => c + 1)}
              className="rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-zinc-900">Packaging Material</Label>
          <div className="mt-3 space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={addBoxes}
                onChange={(e) => setAddBoxes(e.target.checked)}
                className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914] focus:ring-[#5e1914]"
              />
              <span className="text-sm text-zinc-900">Boxes (+₦{BOXES_COST.toLocaleString()})</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={addBubbleWrap}
                onChange={(e) => setAddBubbleWrap(e.target.checked)}
                className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914] focus:ring-[#5e1914]"
              />
              <span className="text-sm text-zinc-900">Bubble Wrap (+₦{BUBBLE_WRAP_COST.toLocaleString()})</span>
            </label>
          </div>
        </div>

        <div>
          <Label htmlFor="pickup" className="text-sm font-medium text-zinc-900">Pickup address</Label>
          <Input
            id="pickup"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            className="mt-2 rounded-none border-zinc-200 bg-white font-sans"
            placeholder="Street, city"
          />
        </div>
        <div>
          <Label htmlFor="delivery" className="text-sm font-medium text-zinc-900">Delivery address</Label>
          <Input
            id="delivery"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="mt-2 rounded-none border-zinc-200 bg-white font-sans"
            placeholder="Street, city"
          />
        </div>
        <div>
          <Label htmlFor="notes" className="text-sm font-medium text-zinc-900">Notes (optional)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2 rounded-none border-zinc-200 bg-white font-sans"
            placeholder="Floor, access, etc."
          />
        </div>

        <div className="border-t border-zinc-100 pt-6">
          {discountPercent > 0 && (
            <p className="mb-2 text-sm text-[#5e1914] font-sans">
              {discountPercent}% merchant discount applied
            </p>
          )}
          <div className="flex items-center justify-between text-lg font-semibold text-zinc-900">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="rounded-none border-zinc-200 font-sans"
          >
            ← Change service
          </Button>
          <Button
            type="button"
            className="rounded-none bg-[#5e1914] font-sans hover:bg-[#4a130f]"
          >
            Book Van
          </Button>
        </div>
      </div>
    </div>
  );
}
