import { NextRequest, NextResponse } from "next/server";
import { connectLegacyDB } from "@/lib/legacy/connection";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawId = (id || "").trim();
    const normalizedId = rawId.replace(/^DMX-?/i, "").replace(/-COPY$/i, "");
    const asNumber = !isNaN(Number(normalizedId)) ? Number(normalizedId) : null;

    const conn = await connectLegacyDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Database connection unavailable" },
        { status: 503 }
      );
    }

    const shipmentsCol = conn.collection("Shipments");
    const conditions: any[] = [
      { TrackingNumber: rawId },
      { TrackingNumber: normalizedId },
      { DHLTrackingNumber: rawId },
      { DHLTrackingNumber: normalizedId },
    ];
    if (asNumber !== null) {
      conditions.push({ TrackingNumber: asNumber });
    }
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      conditions.push({ _id: new mongoose.Types.ObjectId(rawId) });
    }

    const doc = await shipmentsCol.findOne({ $or: conditions });
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Shipment draft not found" },
        { status: 404 }
      );
    }

    const newLog = {
      _id: new mongoose.Types.ObjectId(),
      Status: "PRE-TRANSIT",
      Activity: "Draft Promoted to Live Carrier Booking (Customer Wallet Funded)",
      UpdateType: "Admin",
      DateUpdated: new Date(),
    };

    await shipmentsCol.updateOne(
      { _id: doc._id },
      {
        $set: {
          Status: "PRE-TRANSIT",
          DateUpdated: new Date(),
        },
        $push: {
          ActivityLogs: newLog as any,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Shipment successfully booked onto carrier!",
      trackingNumber: doc.TrackingNumber,
      status: "PRE-TRANSIT",
      date: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[BookCarrierAPI] Failed to promote draft to carrier booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to book shipment onto carrier",
      },
      { status: 500 }
    );
  }
}
