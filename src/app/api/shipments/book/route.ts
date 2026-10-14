import { NextRequest, NextResponse } from "next/server";
import { connectLegacyDB } from "@/lib/legacy/connection";
import { resolveCountryId } from "@/lib/legacy/carrier-rates";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_ADMIN_ID = "652d4dd12437062da15c5551";
const DEFAULT_BRANCH_ID = "652d4541b4e88e2f748c7be6";
const DEFAULT_USER_ID = "658d817741ee3d7517d884a0";
const DHL_CARRIER_ID = "652d3bc3cb00999fcfe79d57";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      sender,
      receiver,
      items = [],
      packaging = "Box",
      length = 20,
      width = 20,
      height = 20,
      chargeableWeight = 1,
      selectedRate,
      pickupMode = "pickup",
      total = 0,
      isDraft = false,
    } = body;

    const conn = await connectLegacyDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Database connection unavailable" },
        { status: 503 }
      );
    }

    const seqCol = conn.collection("Sequences");
    const seqResult = await seqCol.findOneAndUpdate(
      { Name: "Shipments" },
      { $inc: { Value: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const trackingNumber = seqResult?.Value ?? Math.floor(100000 + Math.random() * 900000);
    const shipmentsCol = conn.collection("Shipments");

    const originCountryId = resolveCountryId(sender?.country);
    const destCountryId = resolveCountryId(receiver?.country);

    const isLocal =
      (sender?.country ?? "").toLowerCase() === "nigeria" &&
      (receiver?.country ?? "").toLowerCase() === "nigeria";

    const initialStatus = isDraft ? "DRAFT" : "PRE-TRANSIT";
    const initialActivity = isDraft
      ? "Shipment saved as Draft (Awaiting customer wallet funding)"
      : "Shipment Booked via Admin Console";

    const newShipment = {
      TrackingNumber: trackingNumber,
      CreatedBy: "Admin",
      Admin: new mongoose.Types.ObjectId(DEFAULT_ADMIN_ID),
      Branch: new mongoose.Types.ObjectId(DEFAULT_BRANCH_ID),
      User: new mongoose.Types.ObjectId(DEFAULT_USER_ID),
      Description: items[0]?.name ?? (isDraft ? "Draft Parcel" : "Export Parcel"),
      Type: isLocal ? "Local" : "Export",
      Status: initialStatus,
      Carrier: new mongoose.Types.ObjectId(DHL_CARRIER_ID),
      TotalWeight: Number(chargeableWeight) || 1,
      TotalIncomeCharge: Number(total) || 0,
      TotalExpenseCharge: Number(selectedRate?.amount) || 0,
      PickupDate: new Date(),
      PickupMode: pickupMode,
      Packaging: packaging,
      Dimensions: {
        Length: Number(length) || 20,
        Breadth: Number(width) || 20,
        Height: Number(height) || 20,
      },
      Shipper: {
        Name: `${sender?.firstName ?? ""} ${sender?.lastName ?? ""}`.trim() || "Shipper",
        Company: sender?.company || "DMX Logistics",
        Address: sender?.address1 ?? "",
        Address2: sender?.address2 ?? "",
        City: sender?.city ?? "Lekki",
        State: sender?.state ?? "Lagos",
        Country: new mongoose.Types.ObjectId(originCountryId),
        Telephone: sender?.phone ?? "+2349095305021",
        EmailAddress: sender?.email ?? "csdmxng@gmail.com",
        PostalCode: sender?.postalCode ?? "106104",
      },
      Cosignee: {
        Name: `${receiver?.firstName ?? ""} ${receiver?.lastName ?? ""}`.trim() || "Consignee",
        Company: receiver?.company || "Receiver",
        Address: receiver?.address1 ?? "",
        Address2: receiver?.address2 ?? "",
        City: receiver?.city ?? "",
        State: receiver?.state ?? "",
        Country: new mongoose.Types.ObjectId(destCountryId),
        Telephone: receiver?.phone ?? "",
        EmailAddress: receiver?.email ?? "",
        PostalCode: receiver?.postalCode ?? "",
      },
      Cargos: items.map((item: any, idx: number) => ({
        _id: new mongoose.Types.ObjectId(),
        Description: item?.name ?? `Parcel item ${idx + 1}`,
        ItemCode: item?.hsCode ?? "4421100000",
        Quantity: Number(item?.quantity) || 1,
        Weight: Number(item?.weight) || 1,
        DeclaredValue: Number(item?.value) || 10000,
        Origin: item?.origin ?? "Nigeria",
      })),
      ActivityLogs: [
        {
          _id: new mongoose.Types.ObjectId(),
          Status: initialStatus,
          Activity: initialActivity,
          UpdateType: "Admin",
          DateUpdated: new Date(),
        },
      ],
      DateAdded: new Date(),
      DateUpdated: new Date(),
    };

    const insertResult = await shipmentsCol.insertOne(newShipment);

    return NextResponse.json({
      success: true,
      shipmentId: insertResult.insertedId.toString(),
      trackingNumber,
      status: initialStatus,
      isDraft: Boolean(isDraft),
      carrier: selectedRate?.name ?? "DHL Express",
      date: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[BookingAPI] Failed to create shipment:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to book shipment",
      },
      { status: 500 }
    );
  }
}
