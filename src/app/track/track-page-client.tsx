"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { TrackForm } from "./track-form";
import { ShieldCheck, Truck, Globe, ArrowLeft } from "lucide-react";

export function TrackPageClient() {
  const [logoError, setLogoError] = useState(false);

  return (
    <>
      <header className="border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            {!logoError ? (
              <Image
                src="/dmxlogo.svg"
                alt="DMX"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-xl font-bold tracking-tight text-[#5e1914]">
                DMX
              </span>
            )}
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              DMX Logistics
            </span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-[#5e1914]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Admin Console</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5e1914]">
            Consignment Tracking Portal
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Track your shipment
          </h1>
          <p className="mt-3 text-sm text-zinc-600 sm:text-base">
            Enter your DMX tracking number, shipment sequence, or DHL Express Air Waybill (AWB) to monitor your live journey.
          </p>

          <div className="mt-8">
            <TrackForm />
          </div>

          <div className="mt-14 grid gap-5 border-t border-zinc-200 pt-8 sm:grid-cols-3">
            <div className="border border-zinc-100 bg-white p-4 shadow-sm">
              <Truck className="h-5 w-5 text-[#5e1914]" />
              <p className="mt-3 font-semibold text-zinc-900 text-sm">
                Live Network Milestones
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Track departure from Lagos, Abuja, or Ilorin hubs through destination delivery.
              </p>
            </div>

            <div className="border border-zinc-100 bg-white p-4 shadow-sm">
              <Globe className="h-5 w-5 text-[#5e1914]" />
              <p className="mt-3 font-semibold text-zinc-900 text-sm">
                DHL Express Integration
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Direct cross-reference with official DHL Express tracking and international flights.
              </p>
            </div>

            <div className="border border-zinc-100 bg-white p-4 shadow-sm">
              <ShieldCheck className="h-5 w-5 text-[#5e1914]" />
              <p className="mt-3 font-semibold text-zinc-900 text-sm">
                Verified Customs Clearance
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                HS Tariff code alignment and audit logging for seamless international transit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
