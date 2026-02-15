"use server";

import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface UpdateStatusInput {
  shipmentId: string;
  newStatus: ShipmentStatus;
  merchantEmail: string;
  trackingNumber: string;
}

/**
 * Update shipment status and trigger mock email/notification to merchant.
 */
export async function updateShipmentStatusAndNotify(input: UpdateStatusInput): Promise<void> {
  const { shipmentId, newStatus, merchantEmail, trackingNumber } = input;

  const shipment = await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      status: newStatus,
      ...(newStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}),
    },
  });

  // Mock: log "notification" as if we sent email/push. In production, send real email (e.g. Resend) or push.
  console.info("[Admin] Mock notification to merchant:", {
    to: merchantEmail,
    type: "SHIPMENT_STATUS_UPDATE",
    trackingNumber: shipment.trackingNumber,
    newStatus: shipment.status,
    message: `Your shipment ${trackingNumber} is now ${shipment.status.replace("_", " ")}.`,
  });

  revalidatePath("/admin/shipments");
  revalidatePath("/dashboard/shipments");
}
