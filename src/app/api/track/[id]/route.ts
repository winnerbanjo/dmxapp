import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@dmx/lib/mongodb";
import Shipment from "@dmx/lib/models/Shipment";
import { isValidTrackingFormat } from "@/lib/tracking";

/**
 * GET /api/track/[id] — Public tracking: fetch shipment by Tracking ID.
 * Returns minimal shipment + timeline for the Delivery Journey UI.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trackingId = id?.trim().toUpperCase();

  if (!trackingId || !isValidTrackingFormat(trackingId)) {
    return NextResponse.json(
      { error: "Invalid tracking ID format. Use DMX-XXXX-XXXX." },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const shipment = await Shipment.findOne({ trackingId })
      .select("trackingId receiverDetails packageWeight cost status timeline createdAt updatedAt")
      .lean();

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found." }, { status: 404 });
    }

    return NextResponse.json({
      trackingId: shipment.trackingId,
      receiverName: shipment.receiverDetails?.name,
      status: shipment.status,
      packageWeight: shipment.packageWeight,
      cost: shipment.cost,
      timeline: shipment.timeline ?? {},
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
    });
  } catch (err) {
    console.error("Track API error:", err);
    return NextResponse.json(
      { error: "Unable to fetch shipment." },
      { status: 500 }
    );
  }
}
