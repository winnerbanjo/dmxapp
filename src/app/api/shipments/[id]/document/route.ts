import { NextRequest, NextResponse } from "next/server";
import { getShipmentDocData } from "@/lib/shipment-document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getShipmentDocData(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[ShipmentDocAPI] Failed to fetch document data:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipment document data" },
      { status: 500 }
    );
  }
}
