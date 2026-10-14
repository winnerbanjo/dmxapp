import { connectLegacyDB } from "./legacy/connection";
import { connectDB } from "@dmx/lib/mongodb";
import Shipment from "@dmx/lib/models/Shipment";
import QRCode from "qrcode";
import { generateBarcodeSvg } from "./barcode";
import mongoose from "mongoose";

export interface ShipmentDocItem {
  name: string;
  hsCode: string;
  quantity: number;
  weight: number;
  value: number;
  origin: string;
}

export interface ShipmentParty {
  name: string;
  company: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  postalCode: string;
}

export interface ShipmentDocData {
  id: string;
  trackingNumber: string;
  dhlTrackingNumber?: string;
  carrier: string;
  carrierService: string;
  status: string;
  dateAdded: string;
  type: string;
  packaging: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  cost: {
    shipping: number;
    insurance: number;
    customs: number;
    service: number;
    total: number;
  };
  shipper: ShipmentParty;
  receiver: ShipmentParty;
  items: ShipmentDocItem[];
  trackUrl: string;
  qrCodeDataUrl: string;
  barcodeSvg: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dmxapp.vercel.app";

export async function getShipmentDocData(idOrTracking: string): Promise<ShipmentDocData> {
  const rawId = (idOrTracking || "132718").trim();
  const normalizedId = rawId.replace(/^DMX-?/i, "").replace(/-COPY$/i, "");
  const asNumber = !isNaN(Number(normalizedId)) ? Number(normalizedId) : null;

  let doc: any = null;

  // 1. Check Legacy MongoDB Shipments collection
  try {
    const conn = await connectLegacyDB();
    if (conn) {
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

      doc = await shipmentsCol.findOne({ $or: conditions });
    }
  } catch (err) {
    console.warn("[ShipmentDoc] Legacy DB query failed:", err);
  }

  // 2. Check local DB if not found
  if (!doc) {
    try {
      await connectDB();
      const local = await Shipment.findOne({
        $or: [{ trackingId: rawId }, { trackingId: normalizedId }],
      }).lean();

      if (local) {
        doc = {
          _id: local._id,
          TrackingNumber: local.trackingId,
          Status: local.status,
          TotalWeight: local.packageWeight,
          TotalIncomeCharge: local.cost,
          Shipper: {
            Name: "DMX Logistics Shipper",
            Company: "DMX Global Hub",
            Address: "Plot 12 Admiralty Way",
            City: "Lekki Phase 1",
            State: "Lagos",
            Country: "Nigeria",
            Telephone: "+2349095305021",
            EmailAddress: "csdmxng@gmail.com",
            PostalCode: "106104",
          },
          Cosignee: {
            Name: (local.receiverDetails as any)?.name || "Receiver",
            Address: (local.receiverDetails as any)?.address || "International Address",
            Telephone: (local.receiverDetails as any)?.phone || "",
            EmailAddress: (local.receiverDetails as any)?.email || "",
            City: "International",
            Country: "United Kingdom",
          },
          Cargos: [
            {
              Description: "Consignment Parcel",
              ItemCode: "6204.42",
              Quantity: 1,
              Weight: local.packageWeight || 1,
              DeclaredValue: 50000,
              Origin: "Nigeria",
            },
          ],
          DateAdded: local.createdAt,
        };
      }
    } catch (localErr) {
      console.warn("[ShipmentDoc] Local DB query failed:", localErr);
    }
  }

  const trackingStr = doc?.TrackingNumber ? String(doc.TrackingNumber) : (normalizedId || "132718");
  const fullTrackingId = trackingStr.startsWith("DMX-") ? trackingStr : `DMX-${trackingStr}`;
  const dhlTrackingNumber = doc?.DHLTrackingNumber ? String(doc.DHLTrackingNumber) : undefined;

  const actualWeight = Number(doc?.TotalWeight || 1.2);
  const length = Number(doc?.Dimensions?.Length || 20);
  const width = Number(doc?.Dimensions?.Breadth || doc?.Dimensions?.Width || 20);
  const height = Number(doc?.Dimensions?.Height || 20);
  const volumetricWeight = Number(((length * width * height) / 5000).toFixed(2));
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);

  const totalCharge = Number(doc?.TotalIncomeCharge || 4940);
  const shippingFee = Number(doc?.TotalExpenseCharge || Math.round(totalCharge * 0.85));

  const trackUrl = `${APP_URL}/track/${encodeURIComponent(trackingStr)}`;

  let qrCodeDataUrl = "";
  try {
    qrCodeDataUrl = await QRCode.toDataURL(trackUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  } catch (qrErr) {
    console.error("[ShipmentDoc] Failed to generate QR code:", qrErr);
  }

  const barcodeSvg = generateBarcodeSvg(fullTrackingId, 68, 2);

  // Extract raw cargos
  let cargos: ShipmentDocItem[] = [];
  if (Array.isArray(doc?.Cargos) && doc.Cargos.length > 0) {
    cargos = doc.Cargos.map((c: any) => ({
      name: c.Description || "Declared Item",
      hsCode: c.ItemCode || "6204.42",
      quantity: Number(c.Quantity) || 1,
      weight: Number(c.Weight) || Number((actualWeight / doc.Cargos.length).toFixed(2)),
      value: Number(c.DeclaredValue) || 50000,
      origin: c.Origin || "Nigeria",
    }));
  } else {
    cargos = [
      {
        name: doc?.Description || "Apparel & Personal Goods",
        hsCode: "6204.42",
        quantity: 1,
        weight: actualWeight,
        value: 50000,
        origin: "Nigeria",
      },
    ];
  }

  const shipper: ShipmentParty = {
    name: doc?.Shipper?.Name || "Oyekunle Banjo",
    company: doc?.Shipper?.Company || "DMX Logistics",
    address: doc?.Shipper?.Address || "Plot 12 Admiralty Way, Lekki Phase 1",
    address2: doc?.Shipper?.Address2 || "",
    city: doc?.Shipper?.City || "Lekki",
    state: doc?.Shipper?.State || "Lagos",
    country: doc?.Shipper?.Country?.name || "Nigeria",
    phone: doc?.Shipper?.Telephone || "+2349095305021",
    email: doc?.Shipper?.EmailAddress || "csdmxng@gmail.com",
    postalCode: doc?.Shipper?.PostalCode || "106104",
  };

  const receiver: ShipmentParty = {
    name: doc?.Cosignee?.Name || doc?.Consignee?.Name || "Consignee",
    company: doc?.Cosignee?.Company || doc?.Consignee?.Company || "",
    address: doc?.Cosignee?.Address || doc?.Consignee?.Address || "International Destination Address",
    address2: doc?.Cosignee?.Address2 || doc?.Consignee?.Address2 || "",
    city: doc?.Cosignee?.City || doc?.Consignee?.City || "London",
    state: doc?.Cosignee?.State || doc?.Consignee?.State || "Greater London",
    country: doc?.Cosignee?.Country?.name || "United Kingdom",
    phone: doc?.Cosignee?.Telephone || doc?.Consignee?.Telephone || "+44 7700 900077",
    email: doc?.Cosignee?.EmailAddress || doc?.Consignee?.EmailAddress || "receiver@example.com",
    postalCode: doc?.Cosignee?.PostalCode || doc?.Consignee?.PostalCode || "W1D 1LL",
  };

  return {
    id: String(doc?._id || trackingStr),
    trackingNumber: fullTrackingId,
    dhlTrackingNumber,
    carrier: "DHL Express",
    carrierService: "Express Worldwide",
    status: doc?.Status || "PRE-TRANSIT",
    dateAdded: doc?.DateAdded ? new Date(doc.DateAdded).toISOString() : new Date().toISOString(),
    type: doc?.Type || "Export",
    packaging: doc?.Packaging || "Box",
    dimensions: {
      length,
      width,
      height,
    },
    actualWeight,
    volumetricWeight,
    chargeableWeight,
    cost: {
      shipping: shippingFee,
      insurance: Math.round(totalCharge * 0.05),
      customs: 0,
      service: 0,
      total: totalCharge,
    },
    shipper,
    receiver,
    items: cargos,
    trackUrl,
    qrCodeDataUrl,
    barcodeSvg,
  };
}
