"use server";

import { prisma } from "@/lib/prisma";
import { generateTrackingId } from "@/lib/tracking";
import { PaymentStatus, ShipmentStatus, ShipmentType, TransactionType, TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface PickupDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface ReceiverDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface PackageInfo {
  weight: number;
  category: string;
  dimensions: string;
}

export type BookShipmentInput = {
  merchantId: string;
  type: ShipmentType;
  pickupDetails: PickupDetails;
  receiverDetails: ReceiverDetails;
  packageInfo: PackageInfo;
  cost: number;
};

export type BookShipmentResult =
  | { success: true; trackingId: string; shipmentId: string }
  | { success: false; error: string };

/**
 * Atomic Book Shipment: validate wallet, deduct, create shipment, create transaction.
 */
export async function bookShipment(input: BookShipmentInput): Promise<BookShipmentResult> {
  const { merchantId, type, pickupDetails, receiverDetails, packageInfo, cost } = input;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: merchantId },
      });

      if (!wallet) {
        return { success: false as const, error: "Wallet not found. Please complete profile." };
      }

      const balance = Number(wallet.balance);
      if (balance < cost) {
        return { success: false as const, error: "Insufficient Funds" };
      }

      let trackingNumber = generateTrackingId();
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        const existing = await tx.shipment.findUnique({ where: { trackingNumber } });
        if (!existing) break;
        trackingNumber = generateTrackingId();
        attempts++;
      }
      if (attempts >= maxAttempts) {
        return { success: false as const, error: "Failed to generate unique tracking ID. Please try again." };
      }

      const shipment = await tx.shipment.create({
        data: {
          userId: merchantId,
          trackingNumber,
          type,
          status: ShipmentStatus.PENDING,
          paymentStatus: PaymentStatus.PAID,
          weightKg: packageInfo.weight,
          priceAmount: cost,
          currency: "NGN",
          category: packageInfo.category || null,
          dimensions: packageInfo.dimensions || null,
          senderName: pickupDetails.name,
          senderPhone: pickupDetails.phone,
          senderAddress: pickupDetails.address,
          senderCity: pickupDetails.city,
          senderCountry: pickupDetails.country,
          recipientName: receiverDetails.name,
          recipientPhone: receiverDetails.phone,
          recipientAddress: receiverDetails.address,
          recipientCity: receiverDetails.city,
          recipientCountry: receiverDetails.country,
          notes: null,
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: cost } },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.SHIPMENT_PAYMENT,
          amount: -cost,
          status: TransactionStatus.SUCCESS,
          description: `Shipment fee - ${trackingNumber}`,
          reference: `ship-${shipment.id}-${Date.now()}`,
          shipmentId: shipment.id,
        },
      });

      return {
        success: true as const,
        trackingId: trackingNumber,
        shipmentId: shipment.id,
      };
    });

    if (result.success) {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/shipments");
    }
    return result;
  } catch (e) {
    console.error("bookShipment error:", e);
    return { success: false, error: "Booking failed. Please try again." };
  }
}
