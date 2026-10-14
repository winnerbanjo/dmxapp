import { getShipmentDocData } from "@/lib/shipment-document";
import { WaybillView } from "./waybill-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ShipmentWaybillPage({
  params,
}: {
  params: Promise<{ trackingId: string }>;
}) {
  const { trackingId } = await params;
  const data = await getShipmentDocData(trackingId);

  return <WaybillView data={data} />;
}
