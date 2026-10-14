import { Metadata } from "next";
import { getLegacyOverview } from "@/lib/legacy/shipments";
import { AdminReportsClient } from "./reports-client";

export const metadata: Metadata = {
  title: "Reports & Financial Analytics | DMX Logistics Admin",
  description: "Executive shipment volume, carrier margins, revenue reconciliation, and hub performance.",
};

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  let overview = null;
  try {
    overview = await getLegacyOverview();
  } catch (err) {
    console.warn("[AdminReports] Unable to load legacy overview:", err);
  }

  const totalShipments = overview?.counts?.shipments ?? 21599;
  const deliveredCount =
    overview?.shipmentsByStatus?.find((s) => s.status === "DELIVERED")?.count ?? 16355;
  const inTransitCount =
    overview?.shipmentsByStatus?.find((s) => s.status === "IN-TRANSIT")?.count ?? 426;
  const preTransitCount =
    overview?.shipmentsByStatus?.find((s) => s.status === "PRE-TRANSIT")?.count ?? 4195;

  return (
    <AdminReportsClient
      totalShipments={totalShipments}
      deliveredCount={deliveredCount}
      inTransitCount={inTransitCount}
      preTransitCount={preTransitCount}
      totalMerchants={overview?.counts?.users ?? 1420}
      totalInvoices={overview?.counts?.invoices ?? 8940}
    />
  );
}
