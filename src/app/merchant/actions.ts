"use server";

import mongoose from "mongoose";
import { connectDB } from "@dmx/lib/mongodb";
import Merchant from "@dmx/lib/models/Merchant";
import Shipment from "@dmx/lib/models/Shipment";
import { getSession } from "@dmx/lib/auth";
import { generateTrackingId } from "@dmx/lib/utils";
import { sendShipmentBookedEmail } from "@dmx/lib/notifications";
import { calculateBookingPrice } from "@/lib/booking-pricing";

export type CreateBookingState = { error?: string; trackingId?: string; success?: string };

export async function createBooking(
  _prev: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const session = await getSession();
  if (!session?.merchantId || !session.isVerified) {
    return { error: "Unauthorized. Please verify your account." };
  }

  const receiverName = formData.get("receiverName") as string;
  const receiverPhone = formData.get("receiverPhone") as string;
  const receiverAddress = formData.get("receiverAddress") as string;
  const packageWeight = Number(formData.get("packageWeight"));
  const declaredValue = Number(formData.get("declaredValue")) || 0;
  const premiumInsurance = formData.get("premiumInsurance") === "on";
  const fragile = formData.get("fragile") === "on";
  const _signatureRequired = formData.get("signatureRequired") === "on";

  if (!receiverName?.trim() || !receiverPhone?.trim() || !receiverAddress?.trim()) {
    return { error: "Receiver name, phone and address are required." };
  }
  if (!Number.isFinite(packageWeight) || packageWeight <= 0) {
    return { error: "Valid package weight (kg) is required." };
  }

  const { grandTotal: sellingPrice } = calculateBookingPrice(packageWeight, {
    declaredValue,
    premiumInsurance,
    fragile,
  });

  const DEFAULT_MARKUP_PERCENT = 20;
  const costPrice = Math.round(sellingPrice / (1 + DEFAULT_MARKUP_PERCENT / 100));

  try {
    await connectDB();

    const merchant = await Merchant.findById(session.merchantId);
    if (!merchant) {
      return { error: "Merchant not found." };
    }

    if (merchant.walletBalance < sellingPrice) {
      return {
        error: `Insufficient wallet balance. Required: ₦${sellingPrice.toLocaleString()}. Current: ₦${merchant.walletBalance.toLocaleString()}`,
      };
    }

    let trackingId = generateTrackingId();
    let attempts = 0;
    while (attempts < 10) {
      const exists = await Shipment.findOne({ trackingId });
      if (!exists) break;
      trackingId = generateTrackingId();
      attempts++;
    }
    if (attempts >= 10) {
      return { error: "Could not generate unique tracking ID. Try again." };
    }

    const doc = await Shipment.create({
      merchantId: new mongoose.Types.ObjectId(session.merchantId),
      trackingId,
      receiverDetails: {
        name: receiverName.trim(),
        phone: receiverPhone.trim(),
        address: receiverAddress.trim(),
      },
      packageWeight,
      cost: sellingPrice,
      costPrice,
      sellingPrice,
      status: "Pending",
    });

    await Merchant.findByIdAndUpdate(session.merchantId, {
      $inc: { walletBalance: -sellingPrice },
    });

    console.log("[Booking] Shipment created", {
      trackingId: doc.trackingId,
      merchantId: session.merchantId,
      cost: sellingPrice,
    });

    try {
      await sendShipmentBookedEmail({
        to: session.email,
        recipientName: session.email.split("@")[0],
        trackingId,
      });
    } catch (emailErr) {
      console.warn("Shipment booked but email failed:", emailErr);
    }

    return { trackingId: doc.trackingId, success: `Shipment booked. ₦${sellingPrice.toLocaleString()} deducted.` };
  } catch (err) {
    console.error("createBooking error:", err);
    return { error: "Booking failed. Please try again." };
  }
}
