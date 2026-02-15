"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { TrackForm } from "./track-form";
import { TrackJourney } from "./track-journey";

export function TrackPageClient() {
  const [showMock, setShowMock] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <>
      <header className="border-b border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            {!logoError ? (
              <Image
                src="/dmxlogo.svg"
                alt="DMX"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-lg font-semibold tracking-tight text-[#5e1914]">DMX</span>
            )}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Track your shipment
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          Enter your tracking ID. No login required.
        </p>

        <div className="mt-14 flex flex-col items-start gap-5">
          <TrackForm onMockResult={() => setShowMock(true)} />
        </div>

        {showMock && (
          <div className="mt-20">
            <TrackJourney />
          </div>
        )}
      </div>
    </>
  );
}
