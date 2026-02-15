import { getSession } from "@dmx/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShipmentsWithSearch } from "./shipments-with-search";
import { DEMO_SHIPMENTS } from "./demo-shipments";

export default async function MerchantShipmentsPage() {
  const session = await getSession();
  if (!session?.merchantId || !session.isVerified) redirect("/auth/login");

  const list = DEMO_SHIPMENTS.map((d) => ({
    id: d.id,
    trackingId: d.trackingId,
    receiverName: d.receiverName,
    receiverPhone: d.receiverPhone,
    status: d.status,
    packageWeight: d.packageWeight,
    cost: d.cost,
    createdAt: d.createdAt,
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Shipments
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            The ledger. View and track all shipments.
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
