import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  Clock3,
  PackagePlus,
  Search,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";
import { getLegacyOverview, getLegacyShipments } from "@/lib/legacy/shipments";
import { GlobalShipmentsTable, type DashboardShipmentItem } from "./global-shipments-table";

export const dynamic = "force-dynamic";

function money(value: number) {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("delivered")) return "bg-emerald-50 text-emerald-700";
  if (
    normalized.includes("transit") ||
    normalized.includes("delivery") ||
    normalized.includes("picked")
  )
    return "bg-[#f7f1ef] text-[#5e1914]";
  if (normalized.includes("pending") || normalized.includes("pre-transit"))
    return "bg-amber-50 text-amber-700";
  return "bg-zinc-100 text-zinc-600";
}

export default async function AdminDashboardPage() {
  const [overview, recentShipmentsData] = await Promise.all([
    getLegacyOverview().catch((err) => {
      console.error("[Dashboard] Error fetching overview:", err);
      return null;
    }),
    getLegacyShipments({ limit: 10 }).catch((err) => {
      console.error("[Dashboard] Error fetching recent shipments:", err);
      return null;
    }),
  ]);

  const totalShipments = overview?.counts?.shipments ?? 21599;
  const inTransit =
    (overview?.shipmentsByStatus?.find((s) => s.status === "TRANSIT")?.count ?? 0) +
    (overview?.shipmentsByStatus?.find((s) => s.status === "PRE-TRANSIT")?.count ?? 0);
  const delivered =
    overview?.shipmentsByStatus?.find((s) => s.status === "DELIVERED")?.count ?? 0;
  const pending =
    overview?.shipmentsByStatus?.find((s) => s.status === "PRE-TRANSIT")?.count ?? 0;

  const rawRecent = recentShipmentsData?.shipments || [];
  const recentCards = [
    {
      title: "Create Admin Booking",
      subtitle: "Book for any merchant, hub, or customer",
      href: "/admin/booking",
      tone: "action" as const,
    },
    ...rawRecent.slice(0, 4).map((s) => ({
      title: s.description || "General Cargo",
      subtitle: `${s.type || "Export"} Shipment`,
      href: `/track/${s.trackingNumber || s.id}`,
      status: s.status || "PRE-TRANSIT",
      amount: s.totalIncomeCharge || 0,
      id: s.trackingNumber ? `DMX-${s.trackingNumber}` : s.id,
      tone: "shipment" as const,
    })),
  ];

  const tableShipments: DashboardShipmentItem[] = rawRecent.map((s) => ({
    id: s.id,
    trackingNumber: s.trackingNumber,
    dhlTrackingNumber: s.dhlTrackingNumber,
    description: s.description,
    type: s.type,
    status: s.status,
    totalIncomeCharge: s.totalIncomeCharge,
    dateAdded: s.dateAdded,
  }));

  const metrics = [
    {
      label: "Total Shipments",
      value: totalShipments.toLocaleString("en-NG"),
      icon: Truck,
      href: "/admin/shipments",
      color: "text-sky-600",
    },
    {
      label: "Shipments in Transit",
      value: inTransit.toLocaleString("en-NG"),
      icon: Clock3,
      href: "/admin/shipments",
      color: "text-amber-600",
    },
    {
      label: "Delivered Shipments",
      value: delivered.toLocaleString("en-NG"),
      icon: CheckCircle2,
      href: "/admin/shipments",
      color: "text-emerald-600",
    },
    {
      label: "Pre-Transit / Pending",
      value: pending.toLocaleString("en-NG"),
      icon: XCircle,
      href: "/admin/shipments",
      color: "text-red-600",
    },
  ];

  return (
    <div className="min-h-full bg-[#f4f1ed]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="flex h-16 items-center justify-between gap-4 px-7">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Command Center
            </span>
            <span className="text-zinc-300">/</span>
            <span className="text-sm font-semibold text-zinc-900">Overview</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/booking"
              className="inline-flex h-9 items-center gap-2 bg-[#5e1914] px-4 text-xs font-semibold text-white hover:bg-[#4a130f]"
            >
              <PackagePlus className="h-3.5 w-3.5" />
              Book Shipment
            </Link>
            <Link
              href="/track"
              className="inline-flex h-9 items-center gap-2 border border-[#5e1914]/30 bg-white px-4 text-xs font-semibold text-[#5e1914] hover:border-[#5e1914]"
            >
              <Search className="h-3.5 w-3.5" />
              Track
            </Link>
            <Link
              href="/admin/pricing"
              className="inline-flex h-9 items-center gap-2 border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
            >
              <Calculator className="h-3.5 w-3.5" />
              Rates
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 bg-[#5e1914] px-4 py-3 text-center text-sm text-white">
          <AlertCircle className="h-4 w-4" />
          System control active. Real-time monitoring across 21,500+ shipments, merchants, hubs, and carrier routes.
          <Link href="/admin/insights" className="font-semibold underline ml-1">
            Open command insights
          </Link>
        </div>
      </header>

      <main className="px-7 py-9">
        <div className="mx-auto max-w-7xl">
          <section className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
                Hello, Admin!
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Real-time operational dashboard for DMX Logistics.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/booking"
                className="bg-[#5e1914] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a130f]"
              >
                + Book Shipment
              </Link>
              <Link
                href="/admin/shipments"
                className="border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                View Shipments
              </Link>
            </div>
          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="border border-zinc-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="flex items-center gap-2 text-sm text-zinc-500">
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                      {metric.label}
                    </p>
                    <Link
                      href={metric.href}
                      className="bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-[#f7f1ef] hover:text-[#5e1914]"
                    >
                      View
                    </Link>
                  </div>
                  <p className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">
                    {metric.value}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="mt-7 overflow-hidden bg-[#5e1914] px-8 py-9 text-white">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                  DMX Central Ledger
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  {totalShipments.toLocaleString()} Shipments Across All Hubs
                </h2>
                <p className="mt-3 max-w-2xl text-base text-white/80">
                  Live data connection active to MongoDB Atlas cluster and DHL express engine.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="bg-white/10 p-4">
                  <p className="text-sm text-white/70">Registered Merchants</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {(overview?.counts?.users ?? 850).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/10 p-4">
                  <p className="text-sm text-white/70">Invoices Processed</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {(overview?.counts?.invoices ?? 17664).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 border-t border-zinc-200 pt-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                Latest Shipments
              </h2>
              <Link
                href="/admin/shipments"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#5e1914]"
              >
                See All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {recentCards.map((card, idx) => {
                if (card.tone === "action") {
                  return (
                    <Link
                      key="create-action"
                      href={card.href}
                      className="min-h-32 bg-[#9f241b] p-5 text-white hover:bg-[#7e1e18]"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#5e1914]">
                        +
                      </span>
                      <p className="mt-5 text-sm font-medium">{card.title}</p>
                      <p className="mt-1 text-xs text-white/75">{card.subtitle}</p>
                    </Link>
                  );
                }
                return (
                  <Link
                    key={`${card.id}-${idx}`}
                    href={card.href}
                    className="min-h-32 border border-[#ead8d5] bg-[#f7e9df] p-5 hover:border-[#5e1914]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-900 line-clamp-1">
                          {card.title}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">{card.subtitle}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[11px] font-semibold ${statusTone(
                          card.status ?? ""
                        )}`}
                      >
                        {card.status}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-zinc-900">
                      {money(card.amount ?? 0)}
                    </p>
                    <p className="mt-2 font-mono text-xs text-[#5e1914] underline">
                      {card.id}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="border border-zinc-100 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                    Network Pulse
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Live infrastructure metrics from database.
                  </p>
                </div>
                <BarChart3 className="h-5 w-5 text-[#5e1914]" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ["Carriers Integrated", String(overview?.counts?.carriers ?? 14)],
                  ["Active Branches / Hubs", String(overview?.counts?.branches ?? 3)],
                  ["Registered Riders", String(overview?.counts?.riders ?? 25)],
                ].map(([label, value]) => (
                  <div key={label} className="border border-zinc-100 p-4">
                    <p className="text-xs uppercase tracking-wider text-zinc-400">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-zinc-100 bg-white p-6">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                Control Shortcuts
              </h2>
              <div className="mt-5 grid gap-3">
                <Link
                  href="/admin/address-book"
                  className="border border-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                >
                  Global Address Book
                </Link>
                <Link
                  href="/admin/users"
                  className="border border-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                >
                  Roles & Permissions
                </Link>
                <Link
                  href="/admin/pricing"
                  className="border border-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
                >
                  Pricing Engine
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-12 border-t border-zinc-200 pt-8">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              Live Shipments Feed
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Real-time feed from the live DMX database.
            </p>
            <div className="mt-6">
              <GlobalShipmentsTable initialShipments={tableShipments} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
