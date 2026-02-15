"use client";

import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getZoneFromCountry,
  getCarrierCostForZone,
  applyMarkup,
  ZONE_LABELS,
  DEFAULT_PROFIT_MARKUP_PERCENT,
  type ZoneId,
} from "@/data/zone-pricing";
import { QUICK_QUOTE_COUNTRIES } from "@/data/quick-quote-countries";
import { cn } from "@/lib/utils";
import { Package, X } from "lucide-react";

type QuoteMode = "export" | "import";

export type QuoteResult = {
  amount: number;
  currency: string;
  zoneLabel?: string;
  zoneId?: ZoneId;
  weightKg: number;
  mode: QuoteMode;
  /** For share text: origin and destination labels */
  originLabel: string;
  destinationLabel: string;
};

function getShareText(result: QuoteResult): string {
  const price = `₦${result.amount.toLocaleString("en-NG")}`;
  return `DMX Estimate: ${result.originLabel} to ${result.destinationLabel} for ${result.weightKg}kg is ${price}.`;
}

function ShareQuoteButton({ result }: { result: QuoteResult }) {
  const text = getShareText(result);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "DMX Shipping Quote",
          text,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          window.open(whatsappUrl, "_blank");
        }
      }
    } else {
      window.open(whatsappUrl, "_blank");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleShare}
      className="mt-4 h-12 min-h-[3rem] w-full rounded-none border-[#5e1914] font-sans font-medium text-[#5e1914] hover:bg-[#5e1914]/5 sm:h-10 sm:min-h-0"
    >
      Share Quote
    </Button>
  );
}

function QuoteResultView({ result, onClose }: { result: QuoteResult; onClose?: () => void }) {
  return (
    <div className="border-t border-zinc-100 pt-4 font-sans">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Estimated Quote
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 min-h-[3rem] w-12 min-w-[3rem] items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 sm:h-8 sm:min-h-0 sm:w-8 sm:min-w-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#5e1914]">
        ₦{result.amount.toLocaleString("en-NG")}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {result.weightKg} kg · {result.zoneLabel ?? "Standard rate"}
      </p>
      <ShareQuoteButton result={result} />
    </div>
  );
}

export function QuickQuoteCard({ className }: { className?: string }) {
  const [mode, setMode] = useState<QuoteMode>("export");
  const [weight, setWeight] = useState("");
  const [country, setCountry] = useState<string>("");
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const weightNum = useMemo(() => {
    const n = parseFloat(weight);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [weight]);

  const countryOptions = useMemo(() => QUICK_QUOTE_COUNTRIES, []);

  function handleGenerateQuote() {
    if (!country?.trim() || weightNum <= 0) return;

    const countryLabel = countryOptions.find((c) => c.value === country)?.label ?? country;
    const originLabel = mode === "export" ? "Nigeria" : countryLabel;
    const destinationLabel = mode === "export" ? countryLabel : "Nigeria";

    const zone = getZoneFromCountry(country);
    if (!zone) {
      setResult({
        amount: 0,
        currency: "NGN",
        weightKg: weightNum,
        mode,
        originLabel,
        destinationLabel,
      });
    } else {
      const cost = getCarrierCostForZone(weightNum, zone);
      const amount = applyMarkup(cost, DEFAULT_PROFIT_MARKUP_PERCENT);
      const quote: QuoteResult = {
        amount,
        currency: "NGN",
        zoneLabel: ZONE_LABELS[zone],
        zoneId: zone,
        weightKg: weightNum,
        mode,
        originLabel,
        destinationLabel,
      };
      setResult(quote);

      if (isMobile) {
        setShowMobileModal(true);
      }
    }
  }

  return (
    <>
      <div
        className={cn(
          "border border-zinc-100 bg-white p-6 font-sans",
          className
        )}
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Quick Quote
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          Get an instant shipping estimate
        </p>

        {/* Mode toggle */}
        <div className="mt-4 flex gap-1 rounded-none border border-zinc-100 p-0.5">
          <button
            type="button"
            onClick={() => {
              setMode("export");
              setCountry("");
              setResult(null);
            }}
            className={cn(
              "flex-1 py-3 text-xs font-medium transition-colors sm:py-2",
              mode === "export"
                ? "bg-[#5e1914] text-white"
                : "bg-transparent text-zinc-600 hover:bg-zinc-50"
            )}
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("import");
              setCountry("");
              setResult(null);
            }}
            className={cn(
              "flex-1 py-3 text-xs font-medium transition-colors sm:py-2",
              mode === "import"
                ? "bg-[#5e1914] text-white"
                : "bg-transparent text-zinc-600 hover:bg-zinc-50"
            )}
          >
            Import
          </button>
        </div>

        {/* Inputs — grid-cols-1 on small, grid-cols-2 on md+ */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quick-quote-origin" className="text-xs font-medium text-zinc-700">
              {mode === "export" ? "Origin" : "Destination"}
            </Label>
            <div
              id="quick-quote-origin"
              className="flex h-10 items-center rounded-none border border-zinc-100 bg-zinc-50 px-4 text-sm text-zinc-500"
            >
              Nigeria (locked)
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-quote-dest" className="text-xs font-medium text-zinc-700">
              {mode === "export" ? "Destination" : "Origin"}
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger
                id="quick-quote-dest"
                className="h-10 rounded-none border-zinc-100 font-sans"
              >
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="font-sans">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="quick-quote-weight" className="text-xs font-medium text-zinc-700">
              Weight (kg)
            </Label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="quick-quote-weight"
                type="number"
                min={0.1}
                step={0.1}
                placeholder="e.g. 2.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="pl-10 font-sans"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            onClick={handleGenerateQuote}
            className="h-12 min-h-[3rem] w-full rounded-none bg-[#5e1914] font-sans font-medium text-white hover:bg-[#4a130f] sm:h-10 sm:min-h-0"
          >
            Generate Quote
          </Button>
        </div>

        {/* Inline result — hidden on mobile when modal is open */}
        {result && (
          <div className={cn("mt-4", isMobile && showMobileModal && "hidden")}>
            <QuoteResultView result={result} />
          </div>
        )}
      </div>

      {/* Mobile Modal / Drawer for quote results */}
      {showMobileModal && result && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-result-title"
          onClick={() => setShowMobileModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-lg border-t border-zinc-200 bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="quote-result-title" className="font-sans text-lg font-semibold text-zinc-900">
                Your Quote
              </h2>
              <button
                type="button"
                onClick={() => setShowMobileModal(false)}
                className="rounded p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <QuoteResultView result={result} onClose={() => setShowMobileModal(false)} />
            <Button
              type="button"
              onClick={() => setShowMobileModal(false)}
              variant="secondary"
              className="mt-4 h-12 min-h-[3rem] w-full rounded-none font-sans"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
