import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Store,
  Building2,
  Search,
  ArrowRight,
  Package,
  Layers,
  Wallet,
  Truck,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Top Navigation */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-[#5e1914] text-white">
              <span className="font-bold tracking-wider">DMX</span>
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-zinc-900">DMX Logistics</p>
              <p className="text-xs text-zinc-500">Enterprise Logistics & Supply Chain OS</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Interactive Demo
            </span>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914] transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              Track Package
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5e1914]">
            Unified Logistics Platform
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
            Choose a workspace to explore
          </h1>
          <p className="mt-4 text-base text-zinc-600 md:text-lg">
            No login required for demo preview. Select any role below to experience live bookings,
            rate calculations, waybill creation, and tracking flows.
          </p>
        </div>

        {/* Workspace Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Card 1: Admin */}
          <div className="flex flex-col justify-between border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-[#5e1914] hover:shadow-md">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center bg-[#f7f1ef] text-[#5e1914]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#5e1914]">
                Headquarters
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                Admin Command
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Central control for shipment operations, merchant KYC verifications, carrier pricing
                margins, zone tables, and revenue analytics.
              </p>

              <div className="mt-6 space-y-2 border-t border-zinc-100 pt-5">
                <Link
                  href="/admin/booking"
                  className="flex items-center justify-between text-xs font-medium text-zinc-600 hover:text-[#5e1914]"
                >
                  <span>Omni-Channel Booking Flow</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/admin/shipments"
                  className="flex items-center justify-between text-xs font-medium text-zinc-600 hover:text-[#5e1914]"
                >
                  <span>Shipments & Margin Tracker</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/admin/insights"
                  className="flex items-center justify-between text-xs font-medium text-zinc-600 hover:text-[#5e1914]"
                >
                  <span>Financial & Route Insights</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href="/admin/dashboard"
                className="flex w-full items-center justify-center gap-2 bg-[#5e1914] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4a130f]"
              >
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Merchant */}
          <div className="flex flex-col justify-between border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-[#5e1914] hover:shadow-md">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center bg-[#f7f1ef] text-[#5e1914]">
                <Store className="h-6 w-6" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#5e1914]">
                E-Commerce & B2B
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                Merchant Portal
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Tailored for merchants: fast parcel booking, wallet balance funding, address book
                contacts, carrier selection, and instant waybill generation.
              </p>

              <div className="mt-6 space-y-2 border-t border-zinc-100 pt-5">
                <Link
                  href="/merchant/dashboard/book"
                  className="flex items-center justify-between text-xs font-medium text-zinc-600 hover:text-[#5e1914]"
                >
                  <span>Power Booking Form</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/merchant/dashboard/wallet"
                  className="flex items-center justify-between text-xs font-medium text-zinc-600 hover:text-[#5e1914]"
                >
                  <span>Prepaid Wallet & Transactions</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/merchant/dashboard/address-book"
                  className="flex items-center justify-between text-xs font-medium text-zinc-600 hover:text-[#5e1914]"
                >
                  <span>Merchant Address Book</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href="/merchant/dashboard"
                className="flex w-full items-center justify-center gap-2 border border-[#5e1914] bg-white px-5 py-3 text-sm font-semibold text-[#5e1914] transition-colors hover:bg-[#5e1914] hover:text-white"
              >
                <span>Enter Merchant Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Hub Operations */}
          <div className="flex flex-col justify-between border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-[#5e1914] hover:shadow-md">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center bg-[#f7f1ef] text-[#5e1914]">
                <Building2 className="h-6 w-6" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#5e1914]">
                Branch & Fulfillment
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                Hub Operations
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Branch-level operations: barcode scan intake, walk-in customer booking, package sorting,
                inventory tracking, and outbound delivery dispatch.
              </p>

              <div className="mt-6 space-y-2 border-t border-zinc-100 pt-5">
                <Link
                  href="/hub/booking"
                  className="flex items-center justify-between text-xs font-medium text-zinc-600 hover:text-[#5e1914]"
                >
                  <span>Walk-in Customer Desk</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/hub/scan"
                  className="flex items-center justify-between text-xs font-medium text-zinc-600 hover:text-[#5e1914]"
                >
                  <span>Barcode Package Scanner</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/hub/inventory"
                  className="flex items-center justify-between text-xs font-medium text-zinc-600 hover:text-[#5e1914]"
                >
                  <span>Hub Storage & Inventory</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href="/hub/dashboard"
                className="flex w-full items-center justify-center gap-2 border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-[#5e1914] hover:text-[#5e1914]"
              >
                <span>Enter Hub Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Public Tracking Banner */}
        <section className="mt-12 border border-zinc-200 bg-white p-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5e1914]">
                Public Tracking
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
                Track Any Shipment Live
              </h3>
              <p className="mt-1 text-sm text-zinc-600">
                Anyone can test the real-time milestone timeline without signing in. Try demo ID:{" "}
                <span className="font-mono font-semibold text-[#5e1914]">DMX-LOS-1001</span>
              </p>
            </div>
            <Link
              href="/track/DMX-LOS-1001"
              className="inline-flex items-center gap-2 bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-black transition-colors"
            >
              <Truck className="h-4 w-4" />
              <span>View Live Tracking Demo</span>
            </Link>
          </div>
        </section>

        {/* Footer info */}
        <footer className="mt-16 border-t border-zinc-200 pt-8 text-center text-xs text-zinc-500">
          <p>DMX Logistics Platform · Built with Next.js, Prisma, and Tailwind CSS</p>
          <p className="mt-2 text-zinc-400">
            To test formal credential login pages:{" "}
            <Link href="/admin/login" className="underline hover:text-zinc-600">Admin Login</Link> ·{" "}
            <Link href="/merchant/login" className="underline hover:text-zinc-600">Merchant Login</Link> ·{" "}
            <Link href="/hub/login" className="underline hover:text-zinc-600">Hub Login</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
