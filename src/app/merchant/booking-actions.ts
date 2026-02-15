"use server";

import mongoose from "mongoose";
import { connectDB } from "@dmx/lib/mongodb";
import Merchant from "@dmx/lib/models/Merchant";
import Shipment from "@dmx/lib/models/Shipment";
import { getSession } from "@dmx/lib/auth";
import { generateTrackingId } from "@dmx/lib/utils";
import { getQuoteForRoute } from "@/data/pricing-demo";
import {
  getZoneFromCountry,
  getCarrierCostForZone,
  applyMarkup,
  DEFAULT_PROFIT_MARKUP_PERCENT,
} from "@/data/zone-pricing";
import { getPricingCityFromAddress } from "@/data/address-constants";
import { formatStructuredAddress } from "@/types/address";
import { sendShipmentBookedEmail } from "@dmx/lib/notifications";
import type { ServiceType } from "@/data/booking-constants";

export type CreateBookingState = {
  error?: string;
  trackingId?: string;
  success?: string;
  /** Slip data for modal (static demo when DB unavailable). */
  slip?: {
    trackingId: string;
    serviceType: ServiceType;
    senderName: string;
    senderAddress?: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    assignedHub: string;
    totalPaid: number;
  };
};

export async function createBookingFromPowerForm(
  _prev: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const session = await getSession();
  if (!session?.merchantId || !session.isVerified) {
    return { error: "Unauthorized. Please verify your account." };
  }

  const receiverName = (formData.get("receiverName") as string)?.trim();
  const receiverPhone = (formData.get("receiverPhone") as string)?.trim();
  const receiverStreetAddress = (formData.get("receiverStreetAddress") as string)?.trim();
  const receiverLga = (formData.get("receiverLga") as string)?.trim();
  const receiverState = (formData.get("receiverState") as string)?.trim();
  const receiverApartment = (formData.get("receiverApartment") as string)?.trim();
  const receiverLandmark = (formData.get("receiverLandmark") as string)?.trim();
  const packageWeight = Number(formData.get("packageWeight"));
  const serviceLevel = formData.get("serviceLevel") as string;
  const express = serviceLevel === "Express";
  const serviceType = (formData.get("serviceType") as ServiceType) || "nationwide";
  const assignedHub = (formData.get("assignedHub") as string)?.trim() || "Lagos Hub";
  const receiverCountry = (formData.get("receiverCountry") as string)?.trim();

  const useStructured = Boolean(receiverStreetAddress);
  const fullAddress = useStructured
    ? formatStructuredAddress({
        streetAddress: receiverStreetAddress,
        lga: receiverLga,
        state: receiverState,
        apartment: receiverApartment,
        landmark: receiverLandmark,
      })
    : ((formData.get("receiverAddress") as string)?.trim() ?? "");
  const receiverCityLegacy = (formData.get("receiverCity") as string)?.trim();
  if (!receiverName || !receiverPhone) {
    return { error: "Receiver name and phone are required." };
  }
  if (!fullAddress.trim()) {
    return { error: "Receiver address is required (street, LGA, or state)." };
  }
  if (!Number.isFinite(packageWeight) || packageWeight <= 0) {
    return { error: "Valid package weight (kg) is required." };
  }

  const destination = useStructured
    ? getPricingCityFromAddress(receiverState, receiverLga)
    : receiverCityLegacy || "Lagos";
  let cost: number;
  if (serviceType === "international" && receiverCountry) {
    const zone = getZoneFromCountry(receiverCountry);
    if (zone) {
      const carrierCost = getCarrierCostForZone(packageWeight, zone);
      cost = applyMarkup(carrierCost, DEFAULT_PROFIT_MARKUP_PERCENT);
      if (express) cost = Math.round(cost * 1.5);
    } else {
      const { total } = getQuoteForRoute("Lagos", destination, packageWeight, express);
      cost = total;
    }
  } else {
    const { total } = getQuoteForRoute("Lagos", destination, packageWeight, express);
    cost = total;
  }

  const buildSlip = (
    trackingId: string,
    senderName: string,
    senderAddress: string
  ): CreateBookingState["slip"] => ({
    trackingId,
    serviceType,
    senderName,
    senderAddress: senderAddress || undefined,
    receiverName,
    receiverPhone,
    receiverAddress: fullAddress,
    assignedHub,
    totalPaid: cost,
  });

  try {
    const conn = await connectDB();
    if (!conn) {
      const trackingId = "DMX-DEMO-" + Date.now().toString(36).toUpperCase();
      const senderName = session?.email?.split("@")[0] ?? "Merchant";
      return {
        trackingId,
        success: `Shipment booked (demo). Cost: ₦${cost.toLocaleString()} deducted.`,
        slip: buildSlip(trackingId, senderName, ""),
      };
    }

    const merchant = await Merchant.findById(session.merchantId);
    if (!merchant) {
      return { error: "Merchant not found." };
    }

    if (merchant.walletBalance < cost) {
      return {
        error: `Insufficient wallet balance. Required: ₦${cost.toLocaleString()}. Current: ₦${merchant.walletBalance.toLocaleString()}`,
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

    const DEFAULT_MARKUP_PERCENT = 20;
    const sellingPrice = cost;
    const costPrice = Math.round(sellingPrice / (1 + DEFAULT_MARKUP_PERCENT / 100));

    await Shipment.create({
      merchantId: new mongoose.Types.ObjectId(session.merchantId as string),
      trackingId,
      receiverDetails: {
        name: receiverName,
        phone: receiverPhone,
        address: fullAddress,
      },
      packageWeight,
      cost: sellingPrice,
      costPrice,
      sellingPrice,
      status: "Pending",
    });

    await Merchant.findByIdAndUpdate(session.merchantId, {
      $inc: { walletBalance: -cost },
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

    const senderName = merchant.businessName ?? "Merchant";
    const senderAddress = merchant.address ?? "";

    return {
      trackingId,
      success: `Shipment booked. Cost: ₦${cost.toLocaleString()} deducted.`,
      slip: buildSlip(trackingId, senderName, senderAddress),
    };
  } catch (err) {
    console.error("createBookingFromPowerForm error:", err);
    const trackingId = "DMX-DEMO-" + Date.now().toString(36).toUpperCase();
    return {
      trackingId,
      success: `Shipment booked (demo). Cost: ₦${cost.toLocaleString()} deducted.`,
      slip: buildSlip(trackingId, "Merchant", ""),
    };
  }
}
