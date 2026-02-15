"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { setDemoMerchantSession, setDemoMerchantPendingSession, setDemoHubSession } from "./actions";

export default function AuthLoginPage() {
  const router = useRouter();
  const [logoError, setLogoError] = useState(false);

  function handleAdminDemo() {
    router.push("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          {!logoError ? (
            <Image
              src="/dmxlogo.svg"
              alt="DMX"
              width={96}
              height={96}
              className="h-24 w-24 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <p className="text-center text-2xl font-bold tracking-[0.2em] text-[#5e1914]">
              DMX
            </p>
          )}
        </div>

        <div className="w-full border border-zinc-100 bg-white p-8">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Merchant Sign In
          </p>

          <div className="mt-10 flex flex-col gap-4">
            <form action={setDemoMerchantSession}>
              <button
                type="submit"
                className="w-full rounded-none bg-[#5e1914] py-4 text-sm font-medium text-white hover:bg-[#4a130f]"
              >
                Merchant Demo (Approved)
              </button>
            </form>
            <form action={setDemoMerchantPendingSession}>
              <button
                type="submit"
                className="w-full rounded-none border border-zinc-200 bg-white py-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Merchant Demo (Pending KYC)
              </button>
            </form>
            <button
              type="button"
              onClick={handleAdminDemo}
              className="w-full rounded-none border border-zinc-100 bg-white py-4 text-sm font-medium text-[#5e1914] hover:bg-zinc-50"
            >
              Admin Demo
            </button>
            <form action={setDemoHubSession}>
              <button
                type="submit"
                className="w-full rounded-none border border-zinc-100 bg-white py-4 text-sm font-medium text-[#5e1914] hover:bg-zinc-50"
              >
                Hub Demo
              </button>
            </form>
          </div>

          <div className="mt-12 space-y-4 text-center">
            <p className="text-xs text-zinc-500">
              <Link href="/auth/merchant-signup" className="text-[#5e1914] hover:underline">
                Register as Merchant
              </Link>
              {" · "}
              <Link href="/track" className="text-[#5e1914] hover:underline">
                Track a Package
              </Link>
            </p>
          </div>

          <p className="mt-8 text-center text-[11px] text-zinc-400">
            Demo access only. No credentials required.
          </p>
        </div>
      </div>
    </div>
  );
}
