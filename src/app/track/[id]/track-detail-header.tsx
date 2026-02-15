"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function TrackDetailHeader() {
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="border-b border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
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
        <Link
          href="/track"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Track another
        </Link>
      </div>
    </header>
  );
}
