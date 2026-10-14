import { getSession } from "@dmx/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShipmentsWithSearch } from "./shipments-with-search";
import { getLegacyShipments } from "@/lib/legacy/shipments";

export const dynamic = "force-dynamic";

export default async function MerchantShipmentsPage() {
  const session = await getSession();
  if (!session?.merchantId || !session.isVerified) redirect("/merchant/login");

  let list: Array<{
    id: string;
    trackingId: string;
    receiverName: string;
    receiverPhone: string;
    status: string;
    packageWeight: number;
    cost: number;
    createdAt: string;
  }> = [];

  try {
    const data = await getLegacyShipments({ limit: 50 });
    list = data.shipments.map((d) => ({
      id: d.id,
      trackingId: d.trackingNumber ? `DMX-${d.trackingNumber}` : d.id,
      receiverName: d.description || "International Shipment",
      receiverPhone: "—",
      status: d.status || "PRE-TRANSIT",
      packageWeight: d.totalWeight || 1,
      cost: d.totalIncomeCharge || 0,
      createdAt: d.dateAdded || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("[MerchantShipments] Failed to load shipments:", err);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Shipments
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Live database ledger. View and track all shipments in real time.
          </p>
        </div>
        <Link
          href="/merchant/dashboard/booking"
          className="inline-flex h-12 items-center rounded-none border border-zinc-100 bg-[#5e1914] px-6 text-sm font-medium text-white hover:bg-[#4a130f]"
        >
          Book shipment
        </Link>
      </div>

      <div className="mt-12">
        <ShipmentsWithSearch shipments={list} />
      </div>
    </div>
  );
}
