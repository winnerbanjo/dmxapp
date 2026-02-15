"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  INITIAL_API_CONFIG,
  DEMO_MANUAL_RATES,
  type ManualRate,
  type ApiPricingConfig,
} from "@/data/pricing-demo";
import { useRateCard, type RateCardRow, type InternationalRateRow, type MoversRateRow } from "@/contexts/rate-card-context";
import { parseRateCardCsv, parseInternationalRateCsv, parseMoversRateCsv } from "@/lib/csv-parse";
import { downloadTemplateCsv, downloadPricingStructureCsv } from "@/lib/csv-templates";
import { Label } from "@/components/ui/label";
import { Zap, Upload, Table2, CheckCircle, AlertCircle, FileSpreadsheet, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDemoDateTime, formatDemoDateOnly, STATIC_ISO } from "@/lib/demo-date";
import type { CustomMerchantRates } from "@/contexts/rate-card-context";

/** Local demo merchants for Assign to Merchant dropdown (avoids importing Mongoose in Client Component). */
const DEMO_MERCHANTS = [
  { id: "1", businessName: "Mubarak" },
  { id: "2", businessName: "The Lagos Paparazzi" },
];

const TAB_STYLES =
  "rounded-none border-0 border-b-2 border-transparent px-6 py-3 text-sm font-medium text-zinc-600 data-[state=active]:border-[#5e1914] data-[state=active]:text-[#5e1914] data-[state=active]:shadow-none";

const TOAST_DURATION_MS = 4000;

type RateCardType = "economy" | "express" | "international" | "movers";

const emptyCustomRates = (merchantName: string): CustomMerchantRates => ({
  merchantName,
  economyRates: [],
  expressRates: [],
  internationalRates: [],
  moversRates: [],
  moversDiscountPercent: 0,
});

export default function AdminPricingPage() {
  const {
    setEconomyRates,
    setExpressRates,
    setInternationalRates,
    setMoversRates,
    markupPercent,
    setMarkupPercent,
    customRatesByMerchant,
    setCustomRatesForMerchant,
    merchantsWithCustomPricing,
  } = useRateCard();
  const [rateMode, setRateMode] = useState<"global" | "custom">("global");
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [merchantSearch, setMerchantSearch] = useState("");
  const [customMoversDiscount, setCustomMoversDiscount] = useState<string>("");
  const [apiConfig, setApiConfig] = useState<ApiPricingConfig>(INITIAL_API_CONFIG);
  const [csvLastUploaded, setCsvLastUploaded] = useState<string | null>(STATIC_ISO);
  const [manualRates, setManualRates] = useState<ManualRate[]>(() =>
    Array.isArray(DEMO_MANUAL_RATES) ? [...DEMO_MANUAL_RATES] : []
  );
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [economyRateStatus, setEconomyRateStatus] = useState<"Active" | string>("Last Updated: Feb 15");
  const [expressRateStatus, setExpressRateStatus] = useState<"Active" | string>("Last Updated: Feb 15");
  const [internationalRateStatus, setInternationalRateStatus] = useState<"Active" | string>("—");
  const [moversRateStatus, setMoversRateStatus] = useState<"Active" | string>("—");
  const [economyPreview, setEconomyPreview] = useState<RateCardRow[]>([]);
  const [expressPreview, setExpressPreview] = useState<RateCardRow[]>([]);
  const [internationalPreview, setInternationalPreview] = useState<InternationalRateRow[]>([]);
  const [moversPreview, setMoversPreview] = useState<MoversRateRow[]>([]);
  const [hover, setHover] = useState<RateCardType | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tab, setTab] = useState<"api" | "csv" | "manual" | "merchant-rates">("api");

  function handleTabChange(value: string) {
    setTab(value as "api" | "csv" | "manual" | "merchant-rates");
    if (typeof window !== "undefined") {
      console.log("Tab Changed to:", value);
    }
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, TOAST_DURATION_MS);
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [toast]);

  async function processCsvFile(file: File, type: RateCardType) {
    setCsvError(null);
    if (!file?.name.endsWith(".csv")) return;
    try {
      const text = await file.text();
      if (!text?.trim()) {
        setCsvError("File is empty.");
        return;
      }
      const dateStr = formatDemoDateOnly();
      const isCustom = rateMode === "custom" && selectedMerchantId;
      const merchant = selectedMerchantId ? DEMO_MERCHANTS.find((m) => m.id === selectedMerchantId) : null;
      const merchantName = merchant?.businessName ?? "Merchant";

      if (isCustom && selectedMerchantId) {
        const existing = customRatesByMerchant[selectedMerchantId] ?? emptyCustomRates(merchantName);
        if (type === "economy") {
          const { rows } = parseRateCardCsv(text);
          const safeRows = Array.isArray(rows) ? rows : [];
          setCustomRatesForMerchant(selectedMerchantId, { ...existing, economyRates: safeRows });
          setEconomyPreview(safeRows.slice(0, 5));
          setEconomyRateStatus(`Custom · ${safeRows.length} routes · ${dateStr}`);
        } else if (type === "express") {
          const { rows } = parseRateCardCsv(text);
          const safeRows = Array.isArray(rows) ? rows : [];
          setCustomRatesForMerchant(selectedMerchantId, { ...existing, expressRates: safeRows });
          setExpressPreview(safeRows.slice(0, 5));
          setExpressRateStatus(`Custom · ${safeRows.length} routes · ${dateStr}`);
        } else if (type === "international") {
          const { rows } = parseInternationalRateCsv(text);
          const safeRows = Array.isArray(rows) ? rows : [];
          setCustomRatesForMerchant(selectedMerchantId, { ...existing, internationalRates: safeRows });
          setInternationalPreview(safeRows.slice(0, 5));
          setInternationalRateStatus(`Custom · ${safeRows.length} rows · ${dateStr}`);
        } else {
          const { rows } = parseMoversRateCsv(text);
          const safeRows = Array.isArray(rows) ? rows : [];
          const discount = Math.min(100, Math.max(0, parseFloat(customMoversDiscount) || 0));
          setCustomRatesForMerchant(selectedMerchantId, {
            ...existing,
            moversRates: safeRows,
            moversDiscountPercent: discount || undefined,
          });
          setMoversPreview(safeRows.slice(0, 5));
          setMoversRateStatus(`Custom · ${safeRows.length} rows · ${dateStr}`);
        }
      } else {
        if (type === "economy") {
          const { rows } = parseRateCardCsv(text);
          const safeRows = Array.isArray(rows) ? rows : [];
          setEconomyRates(safeRows);
          setEconomyPreview(safeRows.slice(0, 5));
          setEconomyRateStatus(`Active · ${safeRows.length} routes · ${dateStr}`);
        } else if (type === "express") {
          const { rows } = parseRateCardCsv(text);
          const safeRows = Array.isArray(rows) ? rows : [];
          setExpressRates(safeRows);
          setExpressPreview(safeRows.slice(0, 5));
          setExpressRateStatus(`Active · ${safeRows.length} routes · ${dateStr}`);
        } else if (type === "international") {
          const { rows } = parseInternationalRateCsv(text);
          const safeRows = Array.isArray(rows) ? rows : [];
          setInternationalRates(safeRows);
          setInternationalPreview(safeRows.slice(0, 5));
          setInternationalRateStatus(`Active · ${safeRows.length} rows · ${dateStr}`);
        } else {
          const { rows } = parseMoversRateCsv(text);
          const safeRows = Array.isArray(rows) ? rows : [];
          setMoversRates(safeRows);
          setMoversPreview(safeRows.slice(0, 5));
          setMoversRateStatus(`Active · ${safeRows.length} rows · ${dateStr}`);
        }
      }
      setToast("Merchant Rate Card Updated Successfully.");
    } catch (err) {
      try {
        const msg = err instanceof Error ? err.message : String(err);
        setCsvError(msg || "Invalid CSV format. Please ensure column headers match.");
      } catch (_) {
        setCsvError("Invalid CSV format. Please ensure column headers match.");
      }
    }
  }

  function assignMoversDiscountToMerchant() {
    if (!selectedMerchantId || rateMode !== "custom") return;
    const merchant = DEMO_MERCHANTS.find((m) => m.id === selectedMerchantId);
    const existing = customRatesByMerchant[selectedMerchantId] ?? emptyCustomRates(merchant?.businessName ?? "Merchant");
    const discount = Math.min(100, Math.max(0, parseFloat(customMoversDiscount) || 0));
    setCustomRatesForMerchant(selectedMerchantId, { ...existing, moversDiscountPercent: discount || undefined });
    setToast("Movers discount updated.");
  }

  const filteredMerchants = useMemo(
    () =>
      DEMO_MERCHANTS.filter((m) =>
        m.businessName.toLowerCase().includes(merchantSearch.toLowerCase())
      ),
    [merchantSearch]
  );

  useEffect(() => {
    if (rateMode !== "custom" || !selectedMerchantId) return;
    const c = customRatesByMerchant[selectedMerchantId];
    if (!c) return;
    setEconomyPreview(c.economyRates.slice(0, 5));
    setExpressPreview(c.expressRates.slice(0, 5));
    setInternationalPreview(c.internationalRates.slice(0, 5));
    setMoversPreview(c.moversRates.slice(0, 5));
    setCustomMoversDiscount(c.moversDiscountPercent != null ? String(c.moversDiscountPercent) : "");
  }, [rateMode, selectedMerchantId, customRatesByMerchant]);

  function handleFileDrop(e: React.DragEvent, type: RateCardType) {
    e.preventDefault();
    e.stopPropagation();
    setHover(null);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) processCsvFile(file, type);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, type: RateCardType) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file?.name.endsWith(".csv")) processCsvFile(file, type);
    e.target.value = "";
  }

  function handleManualUpdate(id: string, field: keyof ManualRate, value: number | string) {
    setManualRates((prev) =>
      (Array.isArray(prev) ? prev : []).map((r) => (r?.id === id ? { ...r, [field]: value } : r))
    );
  }

  if (!isMounted) return null;

  if (!isMounted) {
    return (
      <div className="relative mx-auto max-w-5xl bg-white px-8 py-8">
        <div className="border-b border-zinc-200 pb-6">
          <div className="h-10 w-10 shrink-0 bg-zinc-100" aria-hidden />
          <div className="mt-4 h-8 w-48 animate-pulse bg-zinc-100" aria-hidden />
          <div className="mt-2 h-4 w-64 animate-pulse bg-zinc-50" aria-hidden />
        </div>
        <div className="mt-10 flex items-center gap-2 text-sm text-zinc-500">
          Loading pricing…
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-5xl bg-white px-8 py-8">
      <header className="flex items-center gap-4 border-b border-zinc-200 pb-6">
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
          <h1 className="font-sans text-3xl font-semibold tracking-tighter text-zinc-900">
            Pricing Engine
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage rate sources: DML API, CSV upload, or manual routes.
          </p>
        </div>
      </header>

      <Tabs value={tab} onValueChange={handleTabChange} className="mt-10">
        <TabsList className="relative z-20 h-auto w-full justify-start gap-0 rounded-none border-0 border-b border-zinc-200 bg-transparent p-0">
          <TabsTrigger value="api" className={cn(TAB_STYLES, "cursor-pointer hover:bg-zinc-50")}>
            <Zap className="mr-2 h-4 w-4" />
            API Connection
          </TabsTrigger>
          <TabsTrigger value="csv" className={cn(TAB_STYLES, "cursor-pointer hover:bg-zinc-50")}>
            <Upload className="mr-2 h-4 w-4" />
            CSV / Sheet Upload
          </TabsTrigger>
          <TabsTrigger value="manual" className={cn(TAB_STYLES, "cursor-pointer hover:bg-zinc-50")}>
            <Table2 className="mr-2 h-4 w-4" />
            Manual Rate Editor
          </TabsTrigger>
          <TabsTrigger value="merchant-rates" className={cn(TAB_STYLES, "cursor-pointer hover:bg-zinc-50")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Merchant Rate Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="mt-10 space-y-10">
          {/* Cost vs. Profit — Profit Markup global setting */}
          <div className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-8 py-6">
              <h2 className="font-sans text-lg font-semibold tracking-tighter text-zinc-900">
                Cost vs. Profit
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Profit Markup is applied to Carrier Cost from the rate sheet to generate Selling Price. Cost Price is stored on each Shipment for Admin auditing.
              </p>
            </div>
            <div className="flex items-center gap-6 p-8">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Profit Markup %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={20}
                  id="profit-markup"
                  className="mt-2 w-24 border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                />
              </div>
              <p className="text-sm text-zinc-600">
                Default 20%. Selling Price = Carrier Cost × (1 + Markup/100).
              </p>
            </div>
          </div>

          <div className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-8 py-6">
              <h2 className="font-sans text-lg font-semibold tracking-tighter text-zinc-900">
                DML API Settings
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Connect to the DML rate API for dynamic pricing.
              </p>
            </div>
            <div className="space-y-6 p-8">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 text-sm font-medium ${
                    apiConfig.connected ? "text-[#166534]" : "text-zinc-600"
                  }`}
                >
                  {apiConfig.connected ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Status: Connected
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      Status: Disconnected
                    </>
                  )}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  API Endpoint
                </label>
                <input
                  type="text"
                  value={apiConfig.endpoint}
                  onChange={(e) =>
                    setApiConfig((c) => ({ ...c, endpoint: e.target.value }))
                  }
                  className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                />
              </div>
              {apiConfig.lastSync && (
                <p className="text-xs text-zinc-500">
                  Last sync: {formatDemoDateTime(apiConfig.lastSync)}
                </p>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setApiConfig((c) => ({
                    ...c,
                    connected: !c.connected,
                    lastSync: c.connected ? c.lastSync : STATIC_ISO,
                  }));
                }}
                className="cursor-pointer border border-[#5e1914] bg-[#5e1914] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a130f]"
              >
                {apiConfig.connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="csv" className="mt-10">
          <div className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-8 py-6">
              <h2 className="font-sans text-lg font-semibold tracking-tighter text-zinc-900">
                Upload Rate Sheet
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Upload CSV with columns: Origin, Destination, Base Price, Weight Rate, Cost Price (optional), Cost Weight Rate (optional). Selling price = Cost × (1 + Markup %).
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Label htmlFor="markup-pct" className="text-sm font-medium text-zinc-700">
                  Markup %
                </Label>
                <input
                  id="markup-pct"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={markupPercent ?? 20}
                  onChange={(e) => setMarkupPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="w-24 border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                />
                <span className="text-xs text-zinc-500">Applied to cost price to get selling price</span>
              </div>
            </div>
            <div className="p-8">
              <div
                onDragOver={(e) => {
                  handleDragOver(e);
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDrop={(e) => handleFileDrop(e, "economy")}
                className={`flex min-h-[200px] flex-col items-center justify-center border-2 border-dashed p-12 transition-colors ${
                  isDragging
                    ? "border-[#5e1914] bg-[#5e1914]/5"
                    : "border-zinc-200 bg-zinc-50"
                }`}
              >
                <Upload className="mb-4 h-12 w-12 text-zinc-400" />
                <p className="text-sm font-medium text-zinc-700">
                  Drag and drop your rate sheet here
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  or click to browse — CSV, XLSX
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="mt-4 hidden"
                  id="csv-upload"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setCsvLastUploaded(STATIC_ISO);
                  }}
                />
                <label
                  htmlFor="csv-upload"
                  className="mt-4 cursor-pointer border border-[#5e1914] bg-[#5e1914] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a130f]"
                >
                  Choose file
                </label>
              </div>
              <p className="mt-6 text-sm font-medium text-zinc-900">
                Last Uploaded:{" "}
                <span className="text-[#5e1914]">
                  {csvLastUploaded ? formatDemoDateTime(csvLastUploaded) : "Never"}
                </span>
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="mt-10">
          <div className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-8 py-6">
              <h2 className="font-sans text-lg font-semibold tracking-tighter text-zinc-900">
                Manual Rate Editor
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Set Base Price and Per KG for specific routes (e.g. Lagos → Abuja).
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                      Origin
                    </th>
                    <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                      Destination
                    </th>
                    <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                      Base Price (₦)
                    </th>
                    <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                      Per KG (₦)
                    </th>
                    <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                      Currency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(manualRates ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-sm text-zinc-500">
                        No data — using demo rates. Edit above or upload CSV in Merchant Rate Cards.
                      </td>
                    </tr>
                  ) : (
                  (manualRates ?? []).map((r, idx) => (
                    <tr
                      key={r?.id ?? idx}
                      className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/50"
                    >
                      <td className="px-8 py-4 font-medium text-zinc-900">
                        {r?.origin ?? ""}
                      </td>
                      <td className="px-8 py-4 text-zinc-700">{r?.destination ?? ""}</td>
                      <td className="px-8 py-4">
                        <input
                          type="number"
                          min={0}
                          value={r?.basePrice ?? 0}
                          onChange={(e) =>
                            handleManualUpdate(
                              r?.id ?? "",
                              "basePrice",
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          onFocus={() => setEditingId(r?.id ?? null)}
                          onBlur={() => setEditingId(null)}
                          className="w-24 border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                        />
                      </td>
                      <td className="px-8 py-4">
                        <input
                          type="number"
                          min={0}
                          value={r?.perKgPrice ?? 0}
                          onChange={(e) =>
                            handleManualUpdate(
                              r?.id ?? "",
                              "perKgPrice",
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          onFocus={() => setEditingId(r?.id ?? null)}
                          onBlur={() => setEditingId(null)}
                          className="w-24 border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                        />
                      </td>
                      <td className="px-8 py-4 text-zinc-600">{r?.currency ?? "NGN"}</td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="merchant-rates" className="mt-10">
          <div className="border border-zinc-100 bg-white">
            <div className="border-b border-zinc-100 px-8 py-6">
              <h2 className="font-sans text-lg font-semibold tracking-tighter text-zinc-900">
                Merchant Rate Cards
              </h2>
              <p className="mt-1 text-sm text-zinc-500 font-sans">
                Each service has its own CSV upload. Economy/Express: Origin, Destination, BasePrice, WeightRate. International: Weight (KG), UK (Zone 1), West Africa (Zone 2), Canada & USA (Zone 3), Australia (Zone 4). Movers: Van Size, Base Price, Per KM.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (typeof window !== "undefined" && typeof document !== "undefined") {
                    downloadPricingStructureCsv();
                  }
                }}
                className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded-none border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 font-sans transition-colors hover:border-[#5e1914] hover:text-[#5e1914]"
              >
                <Download className="h-3.5 w-3.5" />
                Download Pricing Structure (Country→Zone)
              </button>
              <div className="mt-6 flex items-center gap-2 font-sans">
                <span className="text-sm font-medium text-zinc-600">Rate mode:</span>
                <div className="flex rounded-none border border-zinc-200 bg-white">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRateMode("global");
                    }}
                    className={cn(
                      "cursor-pointer px-4 py-2 text-sm font-medium transition-colors",
                      rateMode === "global"
                        ? "border border-[#5e1914] bg-[#5e1914] text-white"
                        : "text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    Global Rates
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRateMode("custom");
                    }}
                    className={cn(
                      "cursor-pointer px-4 py-2 text-sm font-medium transition-colors",
                      rateMode === "custom"
                        ? "border border-[#5e1914] bg-[#5e1914] text-white"
                        : "text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    Custom Merchant Rates
                  </button>
                </div>
              </div>
              {rateMode === "custom" && (
                <div className="mt-6">
                  <Label className="text-sm font-medium text-zinc-900 font-sans">Select merchant</Label>
                  <div className="relative mt-2 max-w-md">
                    <input
                      type="text"
                      value={merchantSearch}
                      onChange={(e) => setMerchantSearch(e.target.value)}
                      placeholder="Search (e.g. Mubarak, Greenlife)..."
                      className="w-full rounded-none border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 font-sans placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
                    />
                    {(merchantSearch.length > 0 || selectedMerchantId) && (
                      <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto border border-zinc-100 bg-white font-sans text-sm shadow-lg">
                        {(filteredMerchants ?? []).slice(0, 10).map((m) => (
                          <li key={m.id}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedMerchantId(m.id);
                                setMerchantSearch(m.businessName);
                                const custom = customRatesByMerchant[m.id];
                                setCustomMoversDiscount(custom?.moversDiscountPercent != null ? String(custom.moversDiscountPercent) : "");
                              }}
                              className={cn(
                                "w-full cursor-pointer px-4 py-2.5 text-left transition-colors hover:bg-zinc-50",
                                selectedMerchantId === m.id ? "bg-[#5e1914]/10 text-[#5e1914]" : "text-zinc-900"
                              )}
                            >
                              {m.businessName}
                            </button>
                          </li>
                        ))}
                        {filteredMerchants.length === 0 && (
                          <li className="px-4 py-3 text-zinc-500">No merchants match</li>
                        )}
                      </ul>
                    )}
                  </div>
                  {selectedMerchantId && (
                    <p className="mt-2 text-xs text-zinc-500 font-sans">
                      Custom rates for: <span className="font-medium text-[#5e1914]">{DEMO_MERCHANTS.find((m) => m.id === selectedMerchantId)?.businessName ?? selectedMerchantId}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="p-8">
              {csvError && (
                <p className="mb-6 border border-[#5e1914] bg-[#5e1914]/10 px-4 py-3 text-sm font-medium text-[#5e1914] font-sans">
                  {csvError}
                </p>
              )}
              <div className="grid gap-8 sm:grid-cols-2">
                {(["economy", "express", "international", "movers"] as const).map((type) => (
                  <div key={type}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-zinc-900 font-sans">
                        {type === "economy" && "Economy"}
                        {type === "express" && "Express"}
                        {type === "international" && "International"}
                        {type === "movers" && "DMX Movers"}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          downloadTemplateCsv(type);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-[#5e1914] bg-white px-3 py-1.5 text-xs font-medium text-[#5e1914] font-sans transition-colors hover:bg-[#5e1914]/5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Demo CSV
                      </button>
                    </div>
                    <div
                      onDragOver={(e) => {
                        handleDragOver(e);
                        setHover(type);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setHover(null);
                      }}
                      onDrop={(e) => handleFileDrop(e, type)}
                      className={cn(
                        "flex min-h-[140px] flex-col items-center justify-center rounded-none border-2 border-dashed bg-white p-6 transition-colors font-sans",
                        hover === type ? "border-[#5e1914] bg-[#5e1914]/5" : "border-zinc-200 hover:border-[#5e1914] hover:bg-[#5e1914]/5"
                      )}
                    >
                      <Upload className="mb-2 h-8 w-8 text-zinc-400" />
                      <p className="text-center text-sm text-zinc-600">Drop CSV or click to upload</p>
                      <input
                        type="file"
                        accept=".csv"
                        className="sr-only"
                        id={`${type}-csv`}
                        onChange={(e) => handleFileSelect(e, type)}
                      />
                      <label htmlFor={`${type}-csv`} className="mt-2 cursor-pointer rounded-none border border-[#5e1914] bg-[#5e1914] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a130f]">
                        Choose file
                      </label>
                    </div>
                    <p className="mt-2 text-xs font-medium text-zinc-500 font-sans">
                      Status: <span className="text-[#5e1914]">
                        {type === "economy" && economyRateStatus}
                        {type === "express" && expressRateStatus}
                        {type === "international" && internationalRateStatus}
                        {type === "movers" && moversRateStatus}
                      </span>
                    </p>
                    {type === "economy" && Array.isArray(economyPreview) && economyPreview.length > 0 && (
                      <div className="mt-4 overflow-hidden border border-zinc-100">
                        <p className="border-b border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans">Preview (first 5)</p>
                        <table className="w-full text-left text-xs font-sans">
                          <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50">
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Origin</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Dest</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Base</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Per kg</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(economyPreview ?? []).map((r, i) => (
                              <tr key={i} className="border-b border-zinc-100 last:border-b-0">
                                <td className="px-3 py-1.5 text-zinc-700">{r?.origin ?? "—"}</td>
                                <td className="px-3 py-1.5 text-zinc-700">{r?.destination ?? "—"}</td>
                                <td className="px-3 py-1.5 text-zinc-700">₦{(r?.basePrice ?? 0).toLocaleString()}</td>
                                <td className="px-3 py-1.5 text-zinc-700">₦{(r?.weightRate ?? 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {type === "express" && Array.isArray(expressPreview) && expressPreview.length > 0 && (
                      <div className="mt-4 overflow-hidden border border-zinc-100">
                        <p className="border-b border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans">Preview (first 5)</p>
                        <table className="w-full text-left text-xs font-sans">
                          <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50">
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Origin</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Dest</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Base</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Per kg</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(expressPreview ?? []).map((r, i) => (
                              <tr key={i} className="border-b border-zinc-100 last:border-b-0">
                                <td className="px-3 py-1.5 text-zinc-700">{r?.origin ?? "—"}</td>
                                <td className="px-3 py-1.5 text-zinc-700">{r?.destination ?? "—"}</td>
                                <td className="px-3 py-1.5 text-zinc-700">₦{(r?.basePrice ?? 0).toLocaleString()}</td>
                                <td className="px-3 py-1.5 text-zinc-700">₦{(r?.weightRate ?? 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {type === "international" && Array.isArray(internationalPreview) && internationalPreview.length > 0 && (
                      <div className="mt-4 overflow-hidden border border-zinc-100">
                        <p className="border-b border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans">Preview (first 5)</p>
                        <table className="w-full text-left text-xs font-sans">
                          <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50">
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Weight</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">UK (Z1)</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">W.Afr (Z2)</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">USA/CAN (Z3)</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">AUS (Z4)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(internationalPreview ?? []).map((r, i) => (
                              <tr key={i} className="border-b border-zinc-100 last:border-b-0">
                                <td className="px-3 py-1.5 text-zinc-700">{r?.weightKg ?? "—"}</td>
                                <td className="px-3 py-1.5 text-zinc-700">₦{(r?.zone1Amount ?? 0).toLocaleString()}</td>
                                <td className="px-3 py-1.5 text-zinc-700">₦{(r?.zone2Amount ?? 0).toLocaleString()}</td>
                                <td className="px-3 py-1.5 text-zinc-700">₦{(r?.zone3Amount ?? 0).toLocaleString()}</td>
                                <td className="px-3 py-1.5 text-zinc-700">₦{(r?.zone4Amount ?? 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {type === "movers" && Array.isArray(moversPreview) && moversPreview.length > 0 && (
                      <div className="mt-4 overflow-hidden border border-zinc-100">
                        <p className="border-b border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans">Preview (first 5)</p>
                        <table className="w-full text-left text-xs font-sans">
                          <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50">
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Van Size</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Base</th>
                              <th className="px-3 py-1.5 font-medium text-zinc-900">Per KM</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(moversPreview ?? []).map((r, i) => (
                              <tr key={i} className="border-b border-zinc-100 last:border-b-0">
                                <td className="px-3 py-1.5 text-zinc-700">{r?.vanSize ?? "—"}</td>
                                <td className="px-3 py-1.5 text-zinc-700">₦{(r?.basePrice ?? 0).toLocaleString()}</td>
                                <td className="px-3 py-1.5 text-zinc-700">₦{(r?.perKm ?? 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {type === "movers" && rateMode === "custom" && selectedMerchantId && (
                      <div className="mt-4 flex flex-wrap items-end gap-2">
                        <div>
                          <Label className="text-xs font-medium text-zinc-600 font-sans">Movers discount % (e.g. 10)</Label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={customMoversDiscount}
                            onChange={(e) => setCustomMoversDiscount(e.target.value)}
                            placeholder="0"
                            className="mt-1 w-20 rounded-none border border-zinc-200 bg-white px-2 py-1.5 text-sm font-sans text-zinc-900"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            assignMoversDiscountToMerchant();
                          }}
                          className="cursor-pointer rounded-none border border-[#5e1914] bg-[#5e1914] px-3 py-1.5 text-xs font-medium text-white font-sans transition-colors hover:bg-[#4a130f]"
                        >
                          Assign Rate
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-10 border-t border-zinc-100 pt-8">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Merchants with Custom Pricing
                </h3>
                <p className="mt-1 text-xs text-zinc-500 font-sans">Audit list for the accountant.</p>
                {(merchantsWithCustomPricing ?? []).length === 0 ? (
                  <p className="mt-4 text-sm text-zinc-500 font-sans">None. Upload custom CSV for a merchant to see them here.</p>
                ) : (
                  <ul className="mt-4 space-y-2 font-sans text-sm">
                    {(merchantsWithCustomPricing ?? []).map(({ merchantId: mid, merchantName }) => (
                      <li key={mid} className="flex items-center gap-2">
                        <span className="font-medium text-zinc-900">{merchantName}</span>
                        <span className="text-zinc-500">(ID: {mid})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Success toast — rendered at high z-index, outside flow */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[100] border border-[#5e1914] bg-white px-6 py-4 font-sans text-sm font-medium text-zinc-900 shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
