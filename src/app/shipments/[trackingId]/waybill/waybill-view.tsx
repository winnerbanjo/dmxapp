"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Printer, ArrowLeft, ShieldCheck } from "lucide-react";
import type { ShipmentDocData } from "@/lib/shipment-document";

export function WaybillView({ data }: { data: ShipmentDocData }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("print") === "true") {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const formattedDate = new Date(data.dateAdded).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-zinc-100 py-6 print:min-h-0 print:bg-white print:p-0">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
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
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Action Toolbar */}
      <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between gap-3 px-4">
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
            href={`/api/shipments/${encodeURIComponent(data.trackingNumber)}/waybill?download=1`}
            className="inline-flex items-center gap-1.5 border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            title="Download PDF waybill"
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
            <span>Print Waybill</span>
          </button>
        </div>
      </div>

      {/* A4 Air Waybill Document */}
      <div className="print-area mx-auto max-w-4xl border border-zinc-200 bg-white p-8 font-sans text-zinc-900 shadow-xl">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-[#5e1914] pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-[#5e1914]">DMX LOGISTICS</h1>
              <span className="rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                VERIFIED CONSIGNMENT
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              DMX Global Logistics Network · International Air Carriage & Freight
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold tracking-wider text-zinc-900 uppercase">
              International Air Waybill
            </h2>
            <p className="text-[11px] font-medium text-zinc-500 uppercase">
              Consignment Note & Customs Manifest
            </p>
          </div>
        </div>

        {/* Tracking & Metadata Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-zinc-200 bg-zinc-50 p-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              AIR WAYBILL NUMBER (AWB):
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-black text-zinc-900">
                {data.trackingNumber}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-4 text-xs text-zinc-600">
              <span>Date: {formattedDate}</span>
              <span>
                Carrier: <strong className="text-zinc-900">{data.carrier}</strong> ({data.carrierService})
              </span>
              {data.dhlTrackingNumber ? (
                <span className="font-mono font-semibold text-[#5e1914]">
                  Partner AWB: {data.dhlTrackingNumber}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Scannable SVG Barcode */}
            <div className="hidden flex-col items-center sm:flex">
              <div
                className="[&>svg]:max-w-[220px] [&>svg]:h-11"
                dangerouslySetInnerHTML={{ __html: data.barcodeSvg }}
              />
              <span className="text-[10px] font-mono tracking-widest text-zinc-600">
                *{data.trackingNumber}*
              </span>
            </div>

            {data.qrCodeDataUrl ? (
              <div className="border border-zinc-200 bg-white p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.qrCodeDataUrl}
                  alt="Waybill QR Code"
                  className="h-16 w-16"
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* 2-Column Parties Grid (Shipper & Consignee) */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Shipper */}
          <div className="border border-zinc-200 p-4">
            <div className="border-b border-zinc-200 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#5e1914]">
              1. Shipper / Consignor (From)
            </div>
            <div className="mt-2 text-xs space-y-1">
              <p className="font-bold text-zinc-950 text-sm">{data.shipper.name}</p>
              {data.shipper.company ? (
                <p className="text-zinc-600">{data.shipper.company}</p>
              ) : null}
              <p className="text-zinc-800">{data.shipper.address}</p>
              <p className="text-zinc-800">
                {data.shipper.city}, {data.shipper.state}, {data.shipper.country}
              </p>
              <p className="pt-1 font-semibold text-zinc-900">Tel: {data.shipper.phone}</p>
              <p className="text-zinc-600">Email: {data.shipper.email}</p>
            </div>
          </div>

          {/* Consignee */}
          <div className="border border-zinc-200 p-4">
            <div className="border-b border-zinc-200 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#5e1914]">
              2. Consignee / Receiver (To)
            </div>
            <div className="mt-2 text-xs space-y-1">
              <p className="font-bold text-zinc-950 text-sm uppercase">{data.receiver.name}</p>
              {data.receiver.company ? (
                <p className="text-zinc-600">{data.receiver.company}</p>
              ) : null}
              <p className="text-zinc-800">{data.receiver.address}</p>
              <p className="text-zinc-800">
                {data.receiver.city} {data.receiver.postalCode || ""}
              </p>
              <p className="font-bold text-base text-zinc-950 uppercase pt-0.5">
                {data.receiver.country}
              </p>
              <p className="pt-1 font-semibold text-zinc-900">Tel: {data.receiver.phone}</p>
              <p className="text-zinc-600">Email: {data.receiver.email}</p>
            </div>
          </div>
        </div>

        {/* Specifications Bar */}
        <div className="mt-4 grid grid-cols-6 border border-zinc-200 bg-zinc-50 p-3 text-center text-xs">
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 uppercase">Pieces</span>
            <span className="font-bold text-zinc-900">1 Box</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 uppercase">Actual Weight</span>
            <span className="font-bold text-zinc-900">{data.actualWeight.toFixed(2)} kg</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 uppercase">Vol. Weight</span>
            <span className="font-bold text-zinc-900">{data.volumetricWeight.toFixed(2)} kg</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 uppercase">Chg. Weight</span>
            <span className="font-bold text-zinc-900">{data.chargeableWeight.toFixed(2)} kg</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 uppercase">Dimensions</span>
            <span className="font-bold text-zinc-900">
              {data.dimensions.length}×{data.dimensions.width}×{data.dimensions.height} cm
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 uppercase">Payment</span>
            <span className="font-bold text-emerald-700">PAID</span>
          </div>
        </div>

        {/* Customs Cargo Manifest Table */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5e1914]">
              3. Customs Cargo Manifest & Declared Items
            </h3>
            <span className="text-[11px] text-zinc-500">
              Harmonized System (HS) Clearance Declaration
            </span>
          </div>

          <table className="w-full border-collapse border border-zinc-200 text-left text-xs">
            <thead>
              <tr className="bg-[#5e1914] text-white">
                <th className="p-2.5 font-semibold">#</th>
                <th className="p-2.5 font-semibold">Item Description</th>
                <th className="p-2.5 font-semibold">HS Tariff Code</th>
                <th className="p-2.5 font-semibold text-center">Qty</th>
                <th className="p-2.5 font-semibold text-center">Weight</th>
                <th className="p-2.5 font-semibold">Origin</th>
                <th className="p-2.5 font-semibold text-right">Declared Value</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-b border-zinc-200 hover:bg-zinc-50">
                  <td className="p-2.5 font-semibold text-zinc-500">{index + 1}</td>
                  <td className="p-2.5 font-medium text-zinc-900">{item.name}</td>
                  <td className="p-2.5 font-mono font-bold text-[#5e1914]">
                    {item.hsCode || "6204.42"}
                  </td>
                  <td className="p-2.5 text-center text-zinc-700">{item.quantity}</td>
                  <td className="p-2.5 text-center text-zinc-700">{item.weight} kg</td>
                  <td className="p-2.5 text-zinc-700">{item.origin || "Nigeria"}</td>
                  <td className="p-2.5 text-right font-semibold text-zinc-900">
                    ₦{item.value.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Declarations, Charges, Signatures */}
        <div className="mt-5 grid grid-cols-1 gap-4 border border-zinc-200 p-4 md:grid-cols-[1.4fr_1fr]">
          {/* Terms & Signatures */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5e1914]">
              Shipper&apos;s Declaration & Carriage Conditions
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
              I/We hereby certify that the contents of this consignment are fully and accurately
              described above, and are classified, packaged, marked and labelled, and in proper
              condition for carriage by air according to applicable international civil aviation
              regulations. DMX Logistics standard trading terms apply.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="border-b border-zinc-400 pb-6" />
                <span className="mt-1 block text-[10px] text-zinc-500">Shipper Signature & Date</span>
              </div>
              <div>
                <div className="border-b border-zinc-400 pb-6" />
                <span className="mt-1 block text-[10px] text-zinc-500">Carrier / Agent Signature</span>
              </div>
            </div>
          </div>

          {/* Charges Breakdown */}
          <div className="border-t border-zinc-200 pt-3 md:border-l md:border-t-0 md:pl-4 md:pt-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">
              Billing & Charges Summary
            </div>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Freight / Shipping</span>
                <span>₦{data.cost.shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Insurance & Handling</span>
                <span>₦{data.cost.insurance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Customs Clearance</span>
                <span>₦{data.cost.customs.toLocaleString()}</span>
              </div>
              <div className="border-t border-zinc-200 pt-1.5">
                <div className="flex justify-between text-sm font-black text-zinc-950">
                  <span>Total Amount Paid</span>
                  <span className="text-[#5e1914]">₦{data.cost.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                <span>Payment Verified via DMX Network</span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between border-t border-zinc-200 pt-3 text-[10px] text-zinc-400">
          <span>Official DMX Logistics Consignment Note · International Air Transport Association compliant</span>
          <span>Online Verification: {data.trackUrl}</span>
        </div>
      </div>
    </div>
  );
}
