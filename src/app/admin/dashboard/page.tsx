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
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { ADMIN_DEMO_SHIPMENTS } from "@/data/demo-shipments";
import { GlobalShipmentsTable } from "./global-shipments-table";

type RecentCard =
  | {
      title: string;
      subtitle: string;
      href: string;
      tone: "action";
    }
  | {
      title: string;
      subtitle: string;
      href: string;
      status: string;
      amount: number;
      id: string;
      tone: "shipment";
    };

const recentCards: RecentCard[] = [
  {
    title: "Create Admin Booking",
    subtitle: "Book for any merchant, hub, or customer",
    href: "/admin/booking",
    tone: "action",
  },
  ...ADMIN_DEMO_SHIPMENTS.slice(0, 4).map((shipment) => ({
    title: shipment.merchant,
    subtitle: `${shipment.origin} to ${shipment.destination}`,
    href: `/track/${shipment.trackingId}`,
    status: shipment.status,
    amount: shipment.amount,
    id: shipment.trackingId,
    tone: "shipment" as const,
  })),
];

function money(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("delivered")) return "bg-emerald-50 text-emerald-700";
  if (normalized.includes("transit") || normalized.includes("delivery") || normalized.includes("picked")) return "bg-[#f7f1ef] text-[#5e1914]";
  if (normalized.includes("pending")) return "bg-amber-50 text-amber-700";
  return "bg-zinc-100 text-zinc-600";
}

export default function AdminDashboardPage() {
  const totalShipments = ADMIN_DEMO_SHIPMENTS.length;
  const inTransit = ADMIN_DEMO_SHIPMENTS.filter((shipment) => {
    const status = shipment.status.toLowerCase();
    return status.includes("transit") || status.includes("picked") || status.includes("delivery");
  }).length;
  const delivered = ADMIN_DEMO_SHIPMENTS.filter((shipment) => shipment.status.toLowerCase().includes("delivered")).length;
  const pending = ADMIN_DEMO_SHIPMENTS.filter((shipment) => shipment.status.toLowerCase().includes("pending")).length;
  const walletFloat = 38265.4;
  const revenue = ADMIN_DEMO_SHIPMENTS.reduce((sum, shipment) => sum + shipment.amount, 0);
  const profit = ADMIN_DEMO_SHIPMENTS.reduce((sum, shipment) => sum + shipment.amount - shipment.partnerCost, 0);

  const metrics = [
    { label: "Total Shipments", value: totalShipments.toLocaleString("en-NG"), icon: Truck, href: "/admin/shipments", color: "text-sky-600" },
    { label: "Shipments in Transit", value: inTransit.toLocaleString("en-NG"), icon: Clock3, href: "/admin/shipments", color: "text-amber-600" },
    { label: "Delivered Shipments", value: delivered.toLocaleString("en-NG"), icon: CheckCircle2, href: "/admin/shipments", color: "text-emerald-600" },
    { label: "Pending Review", value: pending.toLocaleString("en-NG"), icon: XCircle, href: "/admin/insights", color: "text-red-600" },
  ];

  return (
    <div className="min-h-full bg-[#f4f1ed]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="flex h-16 items-center justify-between gap-4 px-7">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-[#5e1914] text-sm font-bold text-white">D</span>
            <span className="text-sm font-semibold text-zinc-900">DMX Admin</span>
          </Link>
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/admin/booking" className="inline-flex h-10 items-center gap-2 bg-[#5e1914] px-4 text-sm font-semibold text-white hover:bg-[#4a130f]">
              <PackagePlus className="h-4 w-4" />
              Book Shipment
            </Link>
            <Link href="/track" className="inline-flex h-10 items-center gap-2 border border-[#5e1914]/30 bg-white px-4 text-sm font-semibold text-[#5e1914] hover:border-[#5e1914]">
              <Search className="h-4 w-4" />
              Track Shipment
            </Link>
            <Link href="/admin/pricing" className="inline-flex h-10 items-center gap-2 border border-[#5e1914]/30 bg-white px-4 text-sm font-semibold text-[#5e1914] hover:border-[#5e1914]">
              <Calculator className="h-4 w-4" />
              Rates Calculator
            </Link>
          </div>
          <Link href="/admin/users" className="inline-flex h-10 items-center gap-2 text-sm font-medium text-zinc-600 hover:text-[#5e1914]">
            <ShieldCheck className="h-4 w-4" />
            Admin Help
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 bg-[#5e1914] px-4 py-3 text-center text-sm text-white">
          <AlertCircle className="h-4 w-4" />
          System control is active across merchants, hubs, couriers, rates, and permissions.
          <Link href="/admin/insights" className="font-semibold underline">
            Open command insights
          </Link>
        </div>
      </header>

      <main className="px-7 py-9">
        <div className="mx-auto max-w-7xl">
          <section className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Hello, Admin!</h1>
              <p className="mt-1 text-sm text-zinc-500">Consider the whole network monitored.</p>
            </div>

          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="border border-zinc-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <p className="flex items-center gap-2 text-sm text-zinc-500">
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                      {metric.label}
                    </p>
                    <Link href={metric.href} className="bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-[#f7f1ef] hover:text-[#5e1914]">
                      View
                    </Link>
                  </div>
                  <p className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">{metric.value}</p>
                </div>
              );
            })}
          </section>
{/* Financial Summary */}
<section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
  <div className="border border-zinc-100 bg-white p-5 shadow-sm">
    <p className="text-sm text-zinc-500">Revenue</p>
    <p className="mt-2 text-2xl font-semibold text-zinc-900">{money(revenue)}</p>
  </div>
  <div className="border border-zinc-100 bg-white p-5 shadow-sm">
    <p className="text-sm text-zinc-500">Gross Profit</p>
    <p className="mt-2 text-2xl font-semibold text-zinc-900">{money(profit)}</p>
  </div>
  <div className="border border-zinc-100 bg-white p-5 shadow-sm">
    <p className="text-sm text-zinc-500">Net Profit</p>
    <p className="mt-2 text-2xl font-semibold text-zinc-900">{money(profit)}</p>
  </div>
  <div className="border border-zinc-100 bg-white p-5 shadow-sm">
    <p className="text-sm text-zinc-500">Net Profit Margin %</p>
    <p className="mt-2 text-2xl font-semibold text-[#5e1914]">
      {revenue > 0 ? Math.round((profit / revenue) * 100) : 0}%
    </p>
  </div>
  <div className="border border-zinc-100 bg-white p-5 shadow-sm">
    <p className="text-sm text-zinc-500">Net Expense</p>
    <p className="mt-2 text-2xl font-semibold text-zinc-900">{money(0)}</p>
  </div>
</section>

          <section className="mt-8 border-t border-zinc-200 pt-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">System Shipments</h2>
              <Link href="/admin/shipments" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5e1914]">
                See All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {recentCards.map((card) => {
                if (card.tone === "action") {
                  return (
                    <Link key={card.title} href={card.href} className="min-h-32 bg-[#9f241b] p-5 text-white hover:bg-[#7e1e18]">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#5e1914]">+</span>
                      <p className="mt-5 text-sm font-medium">{card.title}</p>
                      <p className="mt-1 text-xs text-white/75">{card.subtitle}</p>
                    </Link>
                  );
                }
                return (
                  <Link key={card.id} href={card.href} className="min-h-32 border border-[#ead8d5] bg-[#f7e9df] p-5 hover:border-[#5e1914]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-900">{card.title}</p>
                        <p className="mt-1 text-xs text-zinc-600">{card.subtitle}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold ${statusTone(card.status ?? "")}`}>{card.status}</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-zinc-900">{money(card.amount ?? 0)}</p>
                    <p className="mt-2 font-mono text-xs text-[#5e1914] underline">{card.id}</p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="border border-zinc-100 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Operational Pulse</h2>
                  <p className="mt-1 text-sm text-zinc-500">A quick admin view of shipment movement and exceptions.</p>
                </div>
                <BarChart3 className="h-5 w-5 text-[#5e1914]" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ["Courier lanes active", "8"],
                  ["Hub queues open", "3"],
                  ["Address reviews", "1"],
                ].map(([label, value]) => (
                  <div key={label} className="border border-zinc-100 p-4">
                    <p className="text-xs uppercase tracking-wider text-zinc-400">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-zinc-100 bg-white p-6">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Control Shortcuts</h2>
              <div className="mt-5 grid gap-3">
                <Link href="/admin/address-book" className="border border-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">Global Address Book</Link>
                <Link href="/admin/users" className="border border-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">Roles & Permissions</Link>
                <Link href="/admin/pricing" className="border border-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">Pricing Engine</Link>
              </div>
            </div>
          </section>

          <section className="mt-12 border-t border-zinc-200 pt-8">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Global Shipments</h2>
            <p className="mt-1 text-sm text-zinc-500">Search and filter by branch. Selecting a branch shows only that hub&apos;s shipments.</p>
            <div className="mt-6">
              <GlobalShipmentsTable />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
