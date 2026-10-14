"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search } from "lucide-react";

export function TrackDetailHeader() {
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="border-b border-zinc-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            {!logoError ? (
              <Image
                src="/dmxlogo.svg"
                alt="DMX Logistics"
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
            <span className="hidden text-sm font-semibold tracking-tight text-zinc-900 sm:inline">
              DMX Logistics
            </span>
          </Link>
          <span className="hidden h-4 w-px bg-zinc-200 sm:inline" />
          <span className="hidden text-xs font-medium uppercase tracking-wider text-zinc-500 sm:inline">
            Global Cargo Tracking
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/track"
            className="inline-flex items-center gap-1.5 rounded-none border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
          >
            <Search className="h-3.5 w-3.5 text-zinc-400" />
            Track Another
          </Link>
          <Link
            href="/admin/booking"
            className="rounded-none bg-[#5e1914] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4a130f]"
          >
            Book Shipment
          </Link>
        </div>
      </div>
    </header>
  );
}
