import Link from "next/link";
import mongoose from "mongoose";
import { connectDB } from "@dmx/lib/mongodb";
import Shipment from "@dmx/lib/models/Shipment";
import Merchant from "@dmx/lib/models/Merchant";
import { getSession } from "@dmx/lib/auth";
import { Package, CheckCircle, Wallet, Truck } from "lucide-react";
import { MerchantDashboardDateFilter } from "./merchant-dashboard-date-filter";
import { MerchantKycBanner } from "@/components/merchant-kyc-banner";
import { QuickQuoteModalTrigger } from "@/components/quick-quote-modal-trigger";
import { getMerchantKycStatus } from "@/lib/merchant-kyc";
import { formatDemoDateOnly, STATIC_DISPLAY_DATE } from "@/lib/demo-date";

const DEMO_STATS = {
  totalShipments: 1248,
  delivered: 1120,
  inTransit: 94,
  walletBalance: 450_000,
};

const DEMO_MONTHLY_VOLUME = [
  { month: "Sep", count: 168 },
  { month: "Oct", count: 192 },
  { month: "Nov", count: 210 },
  { month: "Dec", count: 245 },
  { month: "Jan", count: 198 },
  { month: "Feb", count: 235 },
];

const DEMO_RECENT_ACTIVITY = [
  { trackingId: "DMX-782", route: "Lagos to Abuja", amount: 4500, status: "In-Transit" },
  { trackingId: "DMX-781", route: "Ikeja to Lekki", amount: 2500, status: "Delivered" },
  { trackingId: "DMX-780", route: "Kano to Lagos", amount: 12000, status: "Delivered" },
  { trackingId: "DMX-779", route: "Port Harcourt to Enugu", amount: 6000, status: "Pending" },
  { trackingId: "DMX-778", route: "Victoria Island to Ajah", amount: 3000, status: "Delivered" },
];

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

  let totalShipments = DEMO_STATS.totalShipments;
  let totalDelivered = DEMO_STATS.delivered;
  let inTransit = DEMO_STATS.inTransit;
  let walletBalance = DEMO_STATS.walletBalance;
  let recentActivity: { trackingId: string; status: string; receiverName?: string; createdAt?: Date; route?: string; amount?: number }[] = [];
  let volumeByMonth = DEMO_MONTHLY_VOLUME;

  if (session?.merchantId) {
    const conn = await connectDB();
    if (conn) {
      const merchantId = new mongoose.Types.ObjectId(session.merchantId as string);
      const [merchant, allShipments, deliveredCount, inTransitCount, recent, volume] = await Promise.all([
        Merchant.findById(merchantId).select("walletBalance").lean(),
        Shipment.countDocuments({ merchantId }),
        Shipment.countDocuments({ merchantId, status: "Delivered" }),
        Shipment.countDocuments({ merchantId, status: "In-Transit" }),
        Shipment.find({ merchantId })
          .sort({ createdAt: -1 })
          .limit(10)
          .select("trackingId status receiverDetails createdAt")
          .lean(),
        Shipment.aggregate([
          { $match: { merchantId } },
          { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $limit: 6 },
        ]),
      ]);
      if (allShipments > 0) {
        totalShipments = allShipments;
        totalDelivered = deliveredCount;
        inTransit = inTransitCount;
        walletBalance = merchant?.walletBalance ?? 0;
        recentActivity = recent.map((s) => ({
          trackingId: s.trackingId,
          status: s.status,
          receiverName: (s.receiverDetails as { name?: string })?.name ?? "—",
          createdAt: s.createdAt,
        }));
        if (volume.length > 0) {
          volumeByMonth = volume.map((v) => ({
            month: formatDemoDateOnly(v._id + "-01T00:00:00.000Z").split(" ")[0] ?? v._id,
            count: v.count,
          }));
        }
      } else {
        recentActivity = DEMO_RECENT_ACTIVITY.map((d) => ({
          trackingId: d.trackingId,
          status: d.status,
          route: d.route,
          amount: d.amount,
        }));
      }
    } else {
      recentActivity = DEMO_RECENT_ACTIVITY.map((d) => ({
        trackingId: d.trackingId,
        status: d.status,
        route: d.route,
        amount: d.amount,
      }));
    }
  }

  const statCards = [
    { label: "Total Shipments", value: totalShipments, icon: Package },
    { label: "Delivered", value: totalDelivered, icon: CheckCircle },
    { label: "In Transit", value: inTransit, icon: Truck },
    { label: "Wallet Balance", value: `₦${walletBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`, icon: Wallet },
  ];

  const maxVolume = Math.max(...volumeByMonth.map((x) => x.count), 1);

  return (
    <div className="mx-auto max-w-5xl px-0">
      <QuickQuoteModalTrigger />
      {showKycBanner && <MerchantKycBanner showBlockedMessage={showBlockedMessage} />}
      <MerchantDashboardDateFilter />
      <div className="text-center md:text-left">
        <h1 className="mt-8 font-sans text-4xl font-bold tracking-tighter text-zinc-900">
          Welcome, Mubarak
        </h1>
        <p className="mt-4 text-sm text-zinc-500">
          Your logistics at a glance.
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          As of {STATIC_DISPLAY_DATE}
        </p>
      </div>

      {/* Stats — Logistics at a glance, stack vertically on mobile */}
      <div className="mt-12 flex flex-col gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-zinc-100 bg-white p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center border border-zinc-100 bg-zinc-50">
                <Icon strokeWidth={1} className="h-6 w-6 text-[#5e1914]" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {label}
                </p>
                <p className="mt-1 font-sans text-2xl font-semibold tracking-tighter text-zinc-900">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            Recent activity
          </h2>
          <Link href="/merchant/dashboard/shipments" className="text-sm font-medium text-[#5e1914] hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 border border-zinc-100 bg-white">
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Package strokeWidth={1} className="h-10 w-10 text-zinc-300" />
              <p className="text-sm text-zinc-500">No activity yet</p>
              <Link href="/merchant/booking" className="text-sm font-medium text-[#5e1914] hover:underline">
                Create a shipment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Tracking</th>
                  <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Route</th>
                  <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Amount</th>
                  <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row) => (
                  <tr key={row.trackingId} className="border-b border-zinc-100 last:border-b-0">
                    <td className="px-8 py-5">
                      <Link href={`/track/${row.trackingId}`} className="font-mono text-[#5e1914] hover:underline">
                        {row.trackingId}
                      </Link>
                    </td>
                    <td className="px-8 py-5 text-zinc-900">{row.route ?? row.receiverName ?? "—"}</td>
                    <td className="px-8 py-5 text-zinc-900">
                      {row.amount != null
                        ? `₦${row.amount.toLocaleString("en-NG")}`
                        : row.createdAt
                        ? formatDemoDateOnly(new Date(row.createdAt).toISOString())
                        : "—"}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-block border px-2 py-1 text-xs font-medium ${
                          row.status === "Delivered"
                            ? "border-green-600 bg-green-50 text-green-700"
                            : row.status === "In-Transit"
                            ? "border-[#5e1914] bg-[#5e1914]/5 text-[#5e1914]"
                            : "border-zinc-200 bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
          Monthly volume
        </h2>
        <div className="mt-6 border border-zinc-100 bg-zinc-50 p-10">
          <div className="flex items-end justify-between gap-4" style={{ minHeight: 140 }}>
            {volumeByMonth.map((v) => (
              <div key={v.month} className="flex flex-1 flex-col items-center gap-3">
                <div
                  className="w-full border border-[#5e1914] bg-[#5e1914]"
                  style={{ height: Math.max(12, (v.count / maxVolume) * 100) }}
                />
                <span className="text-xs text-zinc-500">{v.month}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
