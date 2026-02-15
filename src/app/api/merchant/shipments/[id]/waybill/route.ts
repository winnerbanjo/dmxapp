import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@dmx/lib/auth";
import { connectDB } from "@dmx/lib/mongodb";
import Shipment from "@dmx/lib/models/Shipment";
import Merchant from "@dmx/lib/models/Merchant";
import { generateWaybillPdf } from "@dmx/lib/waybill";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Shipment ID required" }, { status: 400 });
  }

  try {
    await connectDB();
    const shipment = await Shipment.findById(id).lean();
    if (!shipment || shipment.merchantId.toString() !== session.merchantId) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    const merchant = await Merchant.findById(shipment.merchantId).lean();
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    const trackUrl = `${APP_URL}/track/${encodeURIComponent(shipment.trackingId)}`;
    const pdf = await generateWaybillPdf({
      trackingId: shipment.trackingId,
      merchantName: merchant.businessName,
      merchantEmail: merchant.email,
      merchantAddress: merchant.address,
      receiverName: shipment.receiverDetails.name,
      receiverPhone: shipment.receiverDetails.phone,
      receiverAddress: shipment.receiverDetails.address,
      packageWeightKg: shipment.packageWeight,
      cost: shipment.cost,
      trackUrl,
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="DMX-Waybill-${shipment.trackingId}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Waybill generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate waybill" },
      { status: 500 }
    );
  }
}
