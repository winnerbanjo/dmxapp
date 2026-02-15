"use client";

import { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ServiceType } from "@/data/booking-constants";
import { SERVICE_LABELS, TERMS_BY_SERVICE } from "@/data/booking-constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SlipData = {
  trackingId: string;
  serviceType: ServiceType;
  senderName: string;
  senderAddress?: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  assignedHub: string;
  totalPaid: number;
};

type BookingSlipModalProps = {
  open: boolean;
  onClose: () => void;
  data: SlipData;
  /** Optional: print container ref; defaults to internal slip div */
  printRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
};

export function BookingSlipModal({ open, onClose, data, className }: BookingSlipModalProps) {
  const router = useRouter();
  const slipRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    if (typeof window === "undefined") return;
    const printContent = slipRef.current;
    if (!printContent) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head><title>Booking Slip ${data.trackingId}</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px;max-width:400px;margin:0 auto;}</style>
      </head><body>${printContent.innerHTML}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 250);
  }

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="slip-title"
    >
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-none border border-zinc-200 bg-white shadow-lg">
        <div ref={slipRef} className="p-8">
          {/* Logo */}
          <div className="relative mb-6 h-10 w-10 shrink-0 overflow-hidden bg-white">
            <Image
              src="/dmxlogo.svg"
              alt="DMX"
              fill
              className="object-contain"
              sizes="40px"
            />
          </div>
          <h2 id="slip-title" className="font-sans text-lg font-semibold tracking-tighter text-zinc-900">
            Booking Slip
          </h2>

          {/* Service Type — bold Wine Red */}
          <p className="mt-4 font-sans text-sm font-bold tracking-tighter text-[#5e1914]">
            {SERVICE_LABELS[data.serviceType]}
          </p>

          {/* Tracking ID + QR placeholder */}
          <div className="mt-4 flex items-center gap-4 border-b border-zinc-100 pb-4">
            <p className="font-mono font-sans text-sm font-semibold tracking-tighter text-zinc-900">
              {data.trackingId}
            </p>
            <div className="h-14 w-14 shrink-0 border border-zinc-200 bg-zinc-50 flex items-center justify-center text-xs text-zinc-400">
              QR
            </div>
          </div>

          {/* Sender / Receiver */}
          <div className="mt-4 grid gap-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Sender</p>
              <p className="mt-1 font-sans tracking-tighter text-zinc-900">{data.senderName}</p>
              {data.senderAddress && (
                <p className="mt-0.5 text-zinc-600">{data.senderAddress}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Receiver</p>
              <p className="mt-1 font-sans tracking-tighter text-zinc-900">{data.receiverName}</p>
              <p className="mt-0.5 text-zinc-600">{data.receiverPhone}</p>
              <p className="mt-0.5 text-zinc-600">{data.receiverAddress}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Assigned Hub</p>
              <p className="mt-1 font-sans tracking-tighter text-zinc-900">{data.assignedHub}</p>
            </div>
            <div className="border-t border-zinc-100 pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total Paid</p>
              <p className="mt-1 font-sans text-lg font-semibold tracking-tighter text-[#5e1914]">
                ₦{data.totalPaid.toLocaleString("en-NG")}
              </p>
            </div>
          </div>

          {/* Terms & Conditions — service-specific */}
          <p className="mt-6 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
            {TERMS_BY_SERVICE[data.serviceType]}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-zinc-100 bg-zinc-50 p-4">
          <Button
            type="button"
            onClick={handlePrint}
            className="rounded-none bg-[#5e1914] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a130f]"
          >
            Print Slip
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="rounded-none border-zinc-200"
          >
            Close
          </Button>
          <Button
            type="button"
            variant="link"
            onClick={() => {
              router.push(`/track/${data.trackingId}`);
              onClose();
            }}
            className="text-[#5e1914]"
          >
            Track shipment
          </Button>
        </div>
      </div>
    </div>
  );
}
