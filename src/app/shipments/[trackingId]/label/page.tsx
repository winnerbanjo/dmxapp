import { getShipmentDocData } from "@/lib/shipment-document";
import { ShippingLabelView } from "./shipping-label-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ShipmentLabelPage({
  params,
}: {
  params: Promise<{ trackingId: string }>;
}) {
  const { trackingId } = await params;
  const data = await getShipmentDocData(trackingId);

  return <ShippingLabelView data={data} />;
}
