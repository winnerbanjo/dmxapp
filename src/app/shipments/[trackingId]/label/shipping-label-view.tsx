"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Printer, ArrowLeft } from "lucide-react";
import type { ShipmentDocData } from "@/lib/shipment-document";
import { formatDhlLabelData } from "@/lib/dhl-label-helper";

export function ShippingLabelView({ data }: { data: ShipmentDocData }) {
  const searchParams = useSearchParams();
  const dhl = formatDhlLabelData(data);

  useEffect(() => {
    if (searchParams?.get("print") === "true") {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-zinc-200 py-6 print:min-h-0 print:bg-white print:p-0">
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
          .dhl-label-sheet {
            border: none !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 4in !important;
            height: auto !important;
            padding: 0.15in !important;
            page-break-after: always;
          }
        }
      `}</style>

      {/* Floating Action Bar (Hidden during print) */}
      <div className="no-print mx-auto mb-6 flex max-w-[430px] items-center justify-between gap-3 px-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href={`/api/shipments/${encodeURIComponent(data.trackingNumber)}/label?download=1`}
            className="inline-flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
            title="Download official DHL PDF label"
          >
            <Download className="h-3.5 w-3.5 text-zinc-700" />
            <span>Download PDF</span>
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-[#d40511] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#b0040e]"
          >
            <Printer className="h-4 w-4" />
            <span>Print DHL Label</span>
          </button>
        </div>
      </div>

      {/* Official DHL Express Thermal Label (A6 / 4" x 6") */}
      <div className="dhl-label-sheet mx-auto w-[420px] bg-white p-5 font-sans text-black shadow-2xl">
        {/* 1. Header: EXPRESS WORLDWIDE | WPX | DHL */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <h1 className="text-[17px] font-black tracking-tight text-black leading-none uppercase">
              EXPRESS WORLDWIDE
            </h1>
            <p className="mt-1 font-mono text-[8px] font-medium text-black tracking-tighter">
              {dhl.dateStr} MyDHL API 1.0 / *GLS certified label*
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* WPX Badge */}
            <div className="flex h-8 w-14 items-center justify-center bg-black text-center font-sans text-lg font-black tracking-wider text-white">
              WPX
            </div>

            {/* Authentic DHL Logo Mark */}
            <div className="flex items-center gap-1 pl-1">
              <div className="flex flex-col gap-[2.5px]">
                <div className="h-[2px] w-2.5 bg-black" />
                <div className="h-[2px] w-4 bg-black" />
                <div className="h-[2.5px] w-6 bg-black" />
              </div>
              <span className="font-sans text-2xl font-black italic tracking-tighter text-black -mx-0.5">
                DHL
              </span>
              <div className="flex flex-col items-end gap-[2.5px]">
                <div className="h-[2.5px] w-6 bg-black" />
                <div className="h-[2px] w-4 bg-black" />
                <div className="h-[2px] w-2.5 bg-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Thick divider below header */}
        <div className="h-[2px] w-full bg-black mb-1.5" />

        {/* 2. Shipper (From) & Origin Airport Code */}
        <div className="flex items-start justify-between py-1 text-[11px] leading-[1.25]">
          <div>
            <p className="font-bold text-black">
              From : <span className="font-medium">{dhl.shipper.name}</span>
            </p>
            <p className="font-medium text-black pl-9">{dhl.shipper.company}</p>
            <p className="font-medium text-black pl-9">{dhl.shipper.address}</p>
            <p className="font-medium text-black pl-9">{dhl.shipper.cityState}</p>
            <p className="font-medium text-black pl-9 uppercase">{dhl.shipper.country}</p>
          </div>

          <div className="pr-1 text-right">
            <span className="text-[10px] font-normal text-black block">Origin:</span>
            <span className="text-2xl font-black tracking-tight text-black font-sans leading-none block mt-0.5">
              {dhl.originAirport}
            </span>
          </div>
        </div>

        {/* Divider line */}
        <div className="h-[1.5px] w-full bg-black my-1" />

        {/* 3. Corner-Bracketed Recipient (To) Section */}
        <div className="relative py-2 px-1">
          {/* Top-Left Bracket with "To :" */}
          <div className="flex items-start">
            <div className="h-4 w-4 border-t-2 border-l-2 border-black" />
            <span className="text-sm font-bold text-black -mt-1 ml-1.5">To :</span>
          </div>

          {/* Top-Right Bracket with "Contact:" */}
          <div className="absolute top-2 right-1 flex items-start">
            <span className="text-[10px] font-normal text-black mr-2 -mt-0.5">Contact:</span>
            <div className="h-4 w-4 border-t-2 border-r-2 border-black" />
          </div>

          {/* Recipient Details Inside Bracket */}
          <div className="px-6 py-1 leading-[1.25]">
            <p className="text-[13.5px] font-normal text-black">{dhl.receiver.name}</p>
            <p className="text-[13.5px] font-normal text-black">{dhl.receiver.company}</p>
            <p className="text-[13.5px] font-normal text-black mt-0.5">{dhl.receiver.address}</p>
            <p className="text-[15px] font-black text-black mt-1 font-sans">
              {dhl.receiver.cityStatePostal}
            </p>
            <p className="text-[15px] font-black text-black mt-0.5 uppercase font-sans">
              {dhl.receiver.country}
            </p>
          </div>

          {/* Bottom-Left Bracket */}
          <div className="h-4 w-4 border-b-2 border-l-2 border-black -mt-2" />

          {/* Bottom-Right Bracket */}
          <div className="absolute bottom-2 right-1 h-4 w-4 border-b-2 border-r-2 border-black" />
        </div>

        {/* Divider line */}
        <div className="h-[1.5px] w-full bg-black my-1" />

        {/* 4. Routing Code Row (e.g. FC03 GB-MSE-MSE .) */}
        <div className="py-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[23px] font-black tracking-tight text-black font-sans leading-none">
              {dhl.routingCode}
            </span>
            <span className="h-2 w-2 bg-black inline-block" />
          </div>
        </div>

        {/* Divider line */}
        <div className="h-[1.5px] w-full bg-black my-1" />

        {/* 5. Service Box (C-ADI) & Day/Time Columns */}
        <div className="flex items-stretch border-b-[1.5px] border-black">
          <div className="flex items-center bg-black px-3.5 py-0.5 font-sans text-base font-black tracking-wider text-white">
            {dhl.serviceCode}
          </div>

          <div className="flex flex-1 justify-end">
            <div className="flex w-16 flex-col justify-between border-l-[1.5px] border-black px-2 py-0.5 text-center">
              <span className="text-[8.5px] font-semibold text-black leading-none">Day</span>
              <span className="h-3" />
            </div>
            <div className="flex w-16 flex-col justify-between border-l-[1.5px] border-black px-2 py-0.5 text-center">
              <span className="text-[8.5px] font-semibold text-black leading-none">Time</span>
              <span className="h-3" />
            </div>
          </div>
        </div>

        {/* 6. Ref No, Content & Weight Summary */}
        <div className="flex items-start justify-between py-2 leading-tight">
          <div className="max-w-[210px]">
            <p className="text-[10px] font-bold text-black font-mono">
              Ref No: <span className="font-normal font-sans">{dhl.refNo}</span>
            </p>
            <p className="mt-1 text-[10px] font-bold text-black">
              Content : <span className="font-normal">{dhl.content}</span>
            </p>
          </div>

          <div className="flex items-baseline gap-7 text-right">
            <div>
              <span className="block text-[8.5px] font-semibold text-black leading-none">
                Pce/Shpt Weight
              </span>
              <span className="mt-0.5 block text-[21px] font-black tracking-tight text-black font-sans leading-none">
                {dhl.weightKg}
              </span>
            </div>
            <div>
              <span className="block text-[8.5px] font-semibold text-black leading-none">
                Piece
              </span>
              <span className="mt-0.5 block text-[21px] font-black tracking-tight text-black font-sans leading-none">
                {dhl.piece}
              </span>
            </div>
          </div>
        </div>

        {/* Divider line before Barcodes */}
        <div className="h-[1.5px] w-full bg-black mb-3" />

        {/* 7. Barcode 1: WAYBILL Barcode */}
        <div className="flex flex-col items-center justify-center py-2">
          <div
            className="w-full flex justify-center [&>svg]:max-w-[80%] [&>svg]:h-12"
            dangerouslySetInnerHTML={{ __html: dhl.waybillBarcodeSvg }}
          />
          <span className="mt-1 font-sans text-xs font-black tracking-widest text-black">
            WAYBILL {dhl.waybillFormatted}
          </span>
        </div>

        {/* 8. Barcode 2: 2L Routing Barcode */}
        <div className="flex flex-col items-center justify-center py-3 border-t-[1.5px] border-black">
          <div
            className="w-full flex justify-center [&>svg]:max-w-[88%] [&>svg]:h-[72px]"
            dangerouslySetInnerHTML={{ __html: dhl.twoLBarcodeSvg }}
          />
          <span className="mt-1 font-sans text-xs font-bold tracking-wider text-black">
            {dhl.twoLCode}
          </span>
        </div>

        {/* 9. Barcode 3: License Plate / J-Code Piece Identifier */}
        <div className="py-2 border-t-[1.5px] border-black">
          <div className="text-[10px] font-bold text-black mb-1">Ref Code:</div>
          <div className="flex flex-col items-center justify-center">
            <div
              className="w-full flex justify-center [&>svg]:max-w-[88%] [&>svg]:h-[72px]"
              dangerouslySetInnerHTML={{ __html: dhl.jCodeBarcodeSvg }}
            />
            <span className="mt-1 font-sans text-xs font-bold tracking-wider text-black">
              {dhl.jCodeFormatted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
