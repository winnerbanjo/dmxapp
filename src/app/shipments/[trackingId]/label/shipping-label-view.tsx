"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Printer, ArrowLeft } from "lucide-react";
import type { ShipmentDocData } from "@/lib/shipment-document";

export function ShippingLabelView({ data }: { data: ShipmentDocData }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("print") === "true") {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const firstItem = data.items[0] || {
    name: "General Consignment",
    hsCode: "6204.42",
    quantity: 1,
    weight: data.actualWeight,
    value: 50000,
    origin: "Nigeria",
  };

  const formattedDate = new Date(data.dateAdded).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-100 py-6 print:min-h-0 print:bg-white print:p-0">
      <style jsx global>{`
        @media print {
          @page {
            size: 4in 6in;
            margin: 0;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            border: 2px solid black !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 4in !important;
            height: auto !important;
            page-break-after: always;
          }
        }
      `}</style>

      {/* Action Toolbar */}
      <div className="no-print mx-auto mb-6 flex max-w-[420px] items-center justify-between gap-3 px-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href={`/api/shipments/${encodeURIComponent(data.trackingNumber)}/label?download=1`}
            className="inline-flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            title="Download PDF label"
          >
            <Download className="h-3.5 w-3.5 text-zinc-600" />
            <span>Download PDF</span>
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-[#5e1914] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4a130f]"
          >
            <Printer className="h-4 w-4" />
            <span>Print Label</span>
          </button>
        </div>
      </div>

      {/* 4" x 6" Physical Label Layout */}
      <div className="print-area mx-auto w-[390px] border-2 border-black bg-white p-4 font-sans text-black shadow-xl">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-2">
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#5e1914]">DMX LOGISTICS</h1>
            <p className="text-[10px] font-bold tracking-wider text-zinc-600 uppercase">
              Global Express & Air Freight
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase text-zinc-950">
              DHL PARTNER
            </span>
            <p className="mt-1 text-[11px] font-black tracking-tight text-zinc-900 uppercase">
              EXPRESS WORLDWIDE
            </p>
          </div>
        </div>

        {/* SHIPPER (FROM) */}
        <div className="border-b-2 border-black py-2 text-[11px] leading-tight">
          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
            FROM (SHIPPER):
          </div>
          <p className="font-bold text-zinc-950">{data.shipper.name}</p>
          {data.shipper.company ? (
            <p className="text-zinc-700">{data.shipper.company}</p>
          ) : null}
          <p className="text-zinc-800">{data.shipper.address}</p>
          <p className="text-zinc-800">
            {data.shipper.city}, {data.shipper.state}, {data.shipper.country}
          </p>
          <p className="font-semibold text-zinc-900">TEL: {data.shipper.phone}</p>
        </div>

        {/* CONSIGNEE (SHIP TO) - Large bold typography */}
        <div className="border-b-2 border-black py-2.5 leading-tight">
          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
            SHIP TO (CONSIGNEE):
          </div>
          <p className="mt-0.5 text-base font-black text-black uppercase">
            {data.receiver.name}
          </p>
          {data.receiver.company ? (
            <p className="text-xs font-semibold text-zinc-700">{data.receiver.company}</p>
          ) : null}
          <p className="mt-1 text-sm font-bold text-zinc-900">{data.receiver.address}</p>
          <p className="text-xs font-medium text-zinc-800">
            {data.receiver.city} {data.receiver.postalCode || ""}
          </p>
          <p className="mt-1.5 text-lg font-black tracking-wider text-black uppercase">
            {data.receiver.country}
          </p>
          <p className="mt-1 text-xs font-bold text-zinc-900">
            TEL: {data.receiver.phone}
          </p>
        </div>

        {/* AWB, BARCODE & QR */}
        <div className="border-b-2 border-black py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                WAYBILL / AWB:
              </div>
              <p className="text-xl font-black tracking-tight text-zinc-950 font-mono">
                {data.trackingNumber}
              </p>
              {data.dhlTrackingNumber ? (
                <p className="text-[10px] font-bold text-zinc-700 font-mono">
                  DHL AWB: {data.dhlTrackingNumber}
                </p>
              ) : null}
              <p className="mt-1 text-[9px] text-zinc-500">
                Scan to track on DMX live network
              </p>
            </div>

            {data.qrCodeDataUrl ? (
              <div className="border border-zinc-300 p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.qrCodeDataUrl}
                  alt="Tracking QR Code"
                  className="h-20 w-20"
                />
              </div>
            ) : null}
          </div>

          {/* Scannable SVG Barcode */}
          <div className="mt-2.5 flex flex-col items-center justify-center overflow-hidden border-t border-zinc-200 pt-2">
            <div
              className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-12"
              dangerouslySetInnerHTML={{ __html: data.barcodeSvg }}
            />
            <span className="mt-1 text-[11px] font-mono font-bold tracking-widest text-zinc-900">
              *{data.trackingNumber}*
            </span>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-4 border-b-2 border-black py-2 text-center text-[10px]">
          <div className="border-r border-zinc-300 pr-1">
            <span className="block font-bold text-zinc-500">ACTUAL WT</span>
            <span className="font-black text-zinc-900">{data.actualWeight.toFixed(2)} kg</span>
          </div>
          <div className="border-r border-zinc-300 px-1">
            <span className="block font-bold text-zinc-500">CHG WT</span>
            <span className="font-black text-zinc-900">{data.chargeableWeight.toFixed(2)} kg</span>
          </div>
          <div className="border-r border-zinc-300 px-1">
            <span className="block font-bold text-zinc-500">PCS</span>
            <span className="font-black text-zinc-900">1 / 1</span>
          </div>
          <div className="pl-1">
            <span className="block font-bold text-zinc-500">DATE</span>
            <span className="font-bold text-zinc-900">{formattedDate}</span>
          </div>
        </div>

        {/* CUSTOMS COMMODITY & HS TARIFF CODE */}
        <div className="border-b-2 border-black py-2 text-[10px] leading-tight">
          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
            CUSTOMS DECLARATION & COMMODITY:
          </div>
          <p className="mt-0.5 font-bold text-zinc-900">{firstItem.name}</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[9.5px]">
            <span className="font-bold text-[#5e1914]">
              HS CODE: {firstItem.hsCode || "6204.42"}
            </span>
            <span className="text-zinc-700">ORIGIN: {firstItem.origin || "Nigeria"}</span>
            <span className="font-semibold text-zinc-900">
              VALUE: ₦{firstItem.value.toLocaleString()}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-2 text-center text-[8px] text-zinc-500 uppercase tracking-tight">
          Security Inspected & Cleared for Air Carriage · DMX Air Network
        </div>
      </div>
    </div>
  );
}
