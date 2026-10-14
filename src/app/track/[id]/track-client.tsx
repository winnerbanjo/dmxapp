"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  ExternalLink,
  CheckCircle,
  Truck,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Share2,
  Printer,
  AlertCircle,
} from "lucide-react";

export interface CargoItem {
  name: string;
  hsCode?: string;
  quantity?: number;
  weight?: number;
  declaredValue?: number;
}

export interface ActivityLogItem {
  status: string;
  activity: string;
  date: string;
  location?: string;
}

export interface TrackPageData {
  trackingId: string;
  dhlTrackingNumber?: string;
  status: string;
  carrierName: string;
  carrierTrackingUrl: string;
  origin: {
    name?: string;
    city?: string;
    state?: string;
    country: string;
    hub?: string;
  };
  destination: {
    name?: string;
    city?: string;
    state?: string;
    country: string;
  };
  packageWeight: number;
  cost: number;
  packaging?: string;
  dimensions?: {
    length?: number;
    breadth?: number;
    height?: number;
  };
  cargos?: CargoItem[];
  activityLogs?: ActivityLogItem[];
  createdAt: string;
  updatedAt?: string;
  isRegisteredOnly?: boolean;
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "Pending update";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function statusColor(status: string) {
  const norm = status.toUpperCase();
  if (norm.includes("DELIVER")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (norm.includes("TRANSIT")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (norm.includes("CANCEL") || norm.includes("FAIL")) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  return "bg-amber-50 text-amber-800 border-amber-200";
}

export function TrackPageClient({ data }: { data: TrackPageData }) {
  const [copied, setCopied] = useState(false);

  const dhlAwb = data.dhlTrackingNumber || data.trackingId;
  const dhlUrl =
    data.carrierTrackingUrl ||
    `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(dhlAwb)}`;

  function handleCopy() {
    navigator.clipboard.writeText(data.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const normStatus = (data.status || "PRE-TRANSIT").toUpperCase();
  const isDelivered = normStatus.includes("DELIVER");
  const isInTransit = normStatus.includes("TRANSIT") || isDelivered;
  const isSorted = isInTransit || normStatus.includes("HUB") || normStatus.includes("SORT");

  // Stages calculation
  const stages = [
    {
      label: "Order Booked & Confirmed",
      detail: `Consignment registered in DMX Network · Origin: ${data.origin.city || "Lagos"}, ${data.origin.country || "Nigeria"}`,
      date: data.createdAt,
      done: true,
      current: !isSorted && !isInTransit && !isDelivered,
    },
    {
      label: "Hub Processing & Security Clearance",
      detail: `${data.origin.hub || "Lagos Hub (Lekki Phase 1)"} · Cargo inspected & verified for export`,
      date: isSorted ? data.updatedAt || data.createdAt : null,
      done: isSorted,
      current: isSorted && !isInTransit && !isDelivered,
    },
    {
      label: "Handed to Carrier · International Transit",
      detail: `${data.carrierName || "DHL Express"} Air Network · En route to ${data.destination.city || data.destination.country || "Destination"}`,
      date: isInTransit ? data.updatedAt : null,
      done: isInTransit,
      current: isInTransit && !isDelivered,
    },
    {
      label: "Out for Destination Delivery",
      detail: `Courier dispatch at local destination facility (${data.destination.country || "Destination"})`,
      date: isDelivered ? data.updatedAt : null,
      done: isDelivered,
      current: false,
    },
    {
      label: "Delivered to Consignee",
      detail: `Signed for by ${data.destination.name || "Recipient"} · Destination: ${data.destination.city ? data.destination.city + ", " : ""}${data.destination.country || "Delivered"}`,
      date: isDelivered ? data.updatedAt : null,
      done: isDelivered,
      current: false,
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-zinc-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/track" className="hover:text-zinc-900">Tracking</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-zinc-900">#{data.trackingId}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 font-medium text-zinc-700 hover:text-[#5e1914]"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied tracking ID!" : "Copy ID"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 font-medium text-zinc-700 hover:text-[#5e1914]"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Main Header Hero Card */}
      <div className="border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Tracking Number
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-none border px-2.5 py-0.5 text-xs font-semibold ${statusColor(
                  data.status
                )}`}
              >
                {data.status || "PRE-TRANSIT"}
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              {data.trackingId}
            </h1>
            {data.dhlTrackingNumber && (
              <p className="mt-1 text-sm text-zinc-600">
                Carrier Waybill (AWB):{" "}
                <span className="font-mono font-semibold text-zinc-900">
                  {data.dhlTrackingNumber}
                </span>
              </p>
            )}
            <p className="mt-2 text-sm text-zinc-500">
              Routed via{" "}
              <strong className="text-zinc-900">{data.carrierName || "DHL Express"}</strong> · Registered{" "}
              {formatDateTime(data.createdAt)}
            </p>
          </div>

          {/* Direct Carrier Action Buttons */}
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <a
              href={dhlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-yellow-500 bg-[#FFCC00] px-5 py-3 text-sm font-bold text-zinc-950 shadow-sm transition-all hover:bg-yellow-400"
            >
              <span>Track on DHL Express</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            <Link
              href="/admin/shipments"
              className="inline-flex items-center justify-center gap-2 border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
            >
              <span>Shipments Console</span>
            </Link>
          </div>
        </div>

        {/* Route Highlights */}
        <div className="mt-8 grid gap-4 border-t border-zinc-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-zinc-100 bg-zinc-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Origin
            </p>
            <p className="mt-1 text-base font-semibold text-zinc-900">
              {data.origin.city ? `${data.origin.city}, ` : ""}
              {data.origin.country || "Nigeria"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {data.origin.hub || "Lagos Lekki Hub"}
            </p>
          </div>

          <div className="border border-zinc-100 bg-zinc-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Destination
            </p>
            <p className="mt-1 text-base font-semibold text-zinc-900">
              {data.destination.city ? `${data.destination.city}, ` : ""}
              {data.destination.country || "Destination"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Consignee: {data.destination.name || "Customer"}
            </p>
          </div>

          <div className="border border-zinc-100 bg-zinc-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Chargeable Weight
            </p>
            <p className="mt-1 text-base font-semibold text-zinc-900">
              {data.packageWeight ? `${data.packageWeight} kg` : "1.00 kg"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Packaging: {data.packaging || "Carton / Box"}
            </p>
          </div>

          <div className="border border-zinc-100 bg-zinc-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Declared Value / Charge
            </p>
            <p className="mt-1 text-base font-semibold text-zinc-900">
              {data.cost
                ? `₦${data.cost.toLocaleString("en-NG")}`
                : "Standard Rate"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Service: Express Worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Notice if newly registered */}
      {data.isRegisteredOnly && (
        <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Live Consignment Booking Verified</p>
            <p className="mt-0.5 text-xs text-amber-800">
              This shipment is registered in the DMX network. You can follow local hub dispatch events below, or track air transit directly via the DHL Express Global Tracking portal.
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Journey Timeline & Parcel Details */}
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        {/* Left: Interactive Delivery Journey */}
        <section className="border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900">
                Delivery Journey Milestones
              </h2>
              <p className="text-xs text-zinc-500">
                End-to-end tracking timeline powered by DMX & DHL Network
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>

          {/* Stepper */}
          <div className="mt-8">
            <ul className="relative space-y-0">
              {stages.map((stage, i) => {
                const isLast = i === stages.length - 1;
                return (
                  <li key={stage.label} className="relative flex gap-5 pb-8 last:pb-2">
                    {!isLast && (
                      <div
                        className={`absolute left-[13px] top-6 h-[calc(100%+0.5rem)] w-0.5 ${
                          stage.done ? "bg-[#5e1914]" : "bg-zinc-200"
                        }`}
                        aria-hidden
                      />
                    )}
                    <div
                      className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-none border-2 text-xs font-bold ${
                        stage.done
                          ? "border-[#5e1914] bg-[#5e1914] text-white"
                          : stage.current
                            ? "border-[#5e1914] bg-white text-[#5e1914]"
                            : "border-zinc-200 bg-white text-zinc-400"
                      }`}
                    >
                      {stage.done ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p
                          className={`text-sm font-bold ${
                            stage.done || stage.current
                              ? "text-zinc-900"
                              : "text-zinc-400"
                          }`}
                        >
                          {stage.label}
                        </p>
                        {stage.date && (
                          <span className="text-xs text-zinc-400">
                            {formatDateTime(stage.date)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-zinc-600">
                        {stage.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Activity Logs from Database if present */}
          {data.activityLogs && data.activityLogs.length > 0 && (
            <div className="mt-8 border-t border-zinc-100 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Carrier Audit & Activity Log
              </h3>
              <div className="mt-4 space-y-3">
                {data.activityLogs.map((log, index) => (
                  <div
                    key={`${log.date}-${index}`}
                    className="flex items-start justify-between gap-4 border border-zinc-100 bg-zinc-50/50 p-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {log.activity || log.status}
                      </p>
                      {log.location && (
                        <p className="text-zinc-500">Facility: {log.location}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-zinc-400">
                      {formatDateTime(log.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right: Sender, Receiver & Cargo Breakdown */}
        <div className="space-y-6">
          {/* Parties Card */}
          <section className="border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              Shipment Parties
            </h2>
            <div className="mt-4 space-y-4">
              <div className="border border-zinc-100 bg-zinc-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Shipper (Sender)
                </span>
                <p className="mt-1 font-semibold text-zinc-900">
                  {data.origin.name || "DMX Verified Shipper"}
                </p>
                <p className="text-xs text-zinc-600">
                  {data.origin.city ? `${data.origin.city}, ` : ""}
                  {data.origin.state ? `${data.origin.state}, ` : ""}
                  {data.origin.country || "Nigeria"}
                </p>
              </div>

              <div className="border border-zinc-100 bg-zinc-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Consignee (Receiver)
                </span>
                <p className="mt-1 font-semibold text-zinc-900">
                  {data.destination.name || "Designated Recipient"}
                </p>
                <p className="text-xs text-zinc-600">
                  {data.destination.city ? `${data.destination.city}, ` : ""}
                  {data.destination.state ? `${data.destination.state}, ` : ""}
                  {data.destination.country || "International"}
                </p>
              </div>
            </div>
          </section>

          {/* Cargo / Parcel Content */}
          <section className="border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              Package & Cargo Description
            </h2>
            <div className="mt-4 space-y-3">
              {data.cargos && data.cargos.length > 0 ? (
                data.cargos.map((cargo, idx) => (
                  <div
                    key={`${cargo.name}-${idx}`}
                    className="border border-zinc-100 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-zinc-900">
                      <span>{cargo.name}</span>
                      <span>Qty: {cargo.quantity || 1}</span>
                    </div>
                    {cargo.hsCode && (
                      <p className="mt-1 font-mono text-[11px] text-zinc-500">
                        Tariff HS Code: {cargo.hsCode}
                      </p>
                    )}
                    {cargo.declaredValue ? (
                      <p className="mt-0.5 text-zinc-500">
                        Declared Value: ₦{Number(cargo.declaredValue).toLocaleString("en-NG")}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="border border-zinc-100 p-3 text-xs text-zinc-600">
                  <p className="font-semibold text-zinc-900">General Export Parcel</p>
                  <p className="text-zinc-500 mt-1">
                    Chargeable Weight: {data.packageWeight} kg · Verified by DMX
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Partner Carrier Card */}
          <section className="border border-yellow-400/80 bg-[#FFFDF0] p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center bg-[#FFCC00] font-bold text-zinc-950 text-xs">
                DHL
              </span>
              <div>
                <p className="font-bold text-zinc-900">DHL Express Partner</p>
                <p className="text-xs text-zinc-600">
                  International Air Waybill fulfillment
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-600">
              For real-time flight telemetry, customs scans, and destination delivery courier signatures, consult DHL directly.
            </p>
            <a
              href={dhlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[#5e1914] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#4a130f]"
            >
              <span>Open in DHL Express Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
