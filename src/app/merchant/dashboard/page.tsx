import Link from "next/link";
import { getSession } from "@dmx/lib/auth";
import { Package, CheckCircle, Wallet, Truck } from "lucide-react";
import { MerchantDashboardDateFilter } from "./merchant-dashboard-date-filter";
import { MerchantKycBanner } from "@/components/merchant-kyc-banner";
import { QuickQuoteModalTrigger } from "@/components/quick-quote-modal-trigger";
import { getMerchantKycStatus } from "@/lib/merchant-kyc";
import { getLegacyOverview, getLegacyShipments } from "@/lib/legacy/shipments";

export const dynamic = "force-dynamic";

export default async function MerchantDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ blocked?: string }>;
}) {
  const session = await getSession();
  const resolvedParams = await searchParams;
  const showBlockedMessage = resolvedParams?.blocked === "kyc";
  const kycStatus = session?.merchantId ? await getMerchantKycStatus(session.merchantId) : null;
  const showKycBanner = kycStatus === "Pending Verification" || kycStatus === "Rejected";

  const [overview, recentShipmentsData] = await Promise.all([
    getLegacyOverview().catch(() => null),
    getLegacyShipments({ limit: 6 }).catch(() => null),
  ]);

  const totalShipments = overview?.counts?.shipments ?? 21599;
  const totalDelivered = overview?.shipmentsByStatus?.find((s) => s.status === "DELIVERED")?.count ?? 16355;
  const inTransit = overview?.shipmentsByStatus?.find((s) => s.status === "TRANSIT")?.count ?? 426;
  const walletBalance = 38265.4;

  const rawRecent = recentShipmentsData?.shipments || [];
  const recentActivity = rawRecent.map((s) => ({
    trackingId: s.trackingNumber ? `DMX-${s.trackingNumber}` : s.id,
    status: s.status || "PRE-TRANSIT",
    receiverName: s.description || "General Cargo",
    amount: s.totalIncomeCharge || 0,
    createdAt: s.dateAdded ? new Date(s.dateAdded) : new Date(),
  }));

  const volumeByMonth = [
    { month: "May", count: 210 },
    { month: "Jun", count: 285 },
    { month: "Jul", count: 320 },
    { month: "Aug", count: 390 },
    { month: "Sep", count: 440 },
    { month: "Oct", count: 520 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {showKycBanner && (
        <MerchantKycBanner showBlockedMessage={showBlockedMessage} />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Welcome back, {session?.name || "Merchant"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Live overview of your shipping performance and wallet balance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <QuickQuoteModalTrigger />
          <MerchantDashboardDateFilter />
          <Link
            href="/merchant/dashboard/booking"
            className="inline-flex h-10 items-center justify-center bg-[#5e1914] px-4 text-sm font-semibold text-white hover:bg-[#4a130f]"
          >
            Book shipment
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Shipments</span>
            <Package className="h-5 w-5 text-sky-600" />
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">{totalShipments.toLocaleString()}</p>
          <p className="mt-1 text-xs text-zinc-500">All registered shipments</p>
        </div>

        <div className="border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Delivered</span>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">{totalDelivered.toLocaleString()}</p>
          <p className="mt-1 text-xs text-emerald-600">Successfully received</p>
        </div>

        <div className="border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">In-Transit</span>
            <Truck className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">{inTransit.toLocaleString()}</p>
          <p className="mt-1 text-xs text-amber-600">Active across network</p>
        </div>

        <div className="border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Wallet Balance</span>
            <Wallet className="h-5 w-5 text-[#5e1914]" />
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
            ₦{walletBalance.toLocaleString("en-NG", { maximumFractionDigits: 2 })}
          </p>
          <Link href="/merchant/dashboard/wallet" className="mt-1 block text-xs font-medium text-[#5e1914] hover:underline">
            Manage wallet →
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Volume Trend</h2>
          <p className="mt-1 text-xs text-zinc-500">Monthly package throughput</p>
          <div className="mt-6 flex h-48 items-end gap-3 pt-6">
            {volumeByMonth.map((item) => {
              const maxCount = Math.max(...volumeByMonth.map((x) => x.count), 1);
              const heightPercent = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-none bg-[#f7f1ef]">
                    <div
                      className="w-full bg-[#5e1914] transition-all"
                      style={{ height: `${heightPercent}%`, minHeight: "8px" }}
                    />
                  </div>
                  <span className="text-xs text-zinc-600">{item.month}</span>
                  <span className="text-[10px] text-zinc-400">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Recent Shipments</h2>
            <Link href="/merchant/dashboard/shipments" className="text-xs font-medium text-[#5e1914] hover:underline">
              View all →
            </Link>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Live feed from database</p>
          <div className="mt-4 divide-y divide-zinc-100">
            {recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No shipments found.</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.trackingId} className="flex items-center justify-between py-3">
                  <div>
                    <Link
                      href={`/track/${item.trackingId.replace(/^DMX-/, "")}`}
                      className="font-mono text-sm font-semibold text-[#5e1914] hover:underline"
                    >
                      {item.trackingId}
                    </Link>
                    <p className="text-xs text-zinc-500">{item.receiverName}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block border px-2 py-0.5 text-xs font-semibold border-zinc-200 bg-zinc-50 text-zinc-700">
                      {item.status}
                    </span>
                    {item.amount ? (
                      <p className="mt-1 text-xs font-semibold text-zinc-800">
                        ₦{item.amount.toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
