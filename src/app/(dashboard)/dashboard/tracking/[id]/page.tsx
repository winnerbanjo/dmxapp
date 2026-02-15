import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrackingTimeline } from "./tracking-timeline";

const STATUS_ORDER = [
  "PENDING",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const { id: trackingId } = await params;

  const shipment = await prisma.shipment.findFirst({
    where: {
      trackingNumber: decodeURIComponent(trackingId),
      ...(userId ? { userId } : {}),
    },
  });

  if (!shipment) notFound();

  const currentIndex = STATUS_ORDER.indexOf(shipment.status as (typeof STATUS_ORDER)[number]);
  const steps = STATUS_ORDER.map((status, i) => ({
    status,
    label: status.replace(/_/g, " "),
    done: i <= currentIndex,
    current: i === currentIndex,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/shipments">← Shipments</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-lg">{shipment.trackingNumber}</CardTitle>
          <CardDescription>
            {shipment.type} • ₦{Number(shipment.priceAmount).toLocaleString()} • {shipment.recipientName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrackingTimeline steps={steps} />
        </CardContent>
      </Card>
    </div>
  );
}
