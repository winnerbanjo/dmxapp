import { connectLegacyDB } from "./connection";
import { getLegacyModels, toLegacyId, type LegacyShipment } from "./models";

export interface LegacyShipmentListItem {
  id: string;
  trackingNumber: string | null;
  dhlTrackingNumber: string | null;
  description: string | null;
  type: string | null;
  status: string | null;
  totalWeight: number | null;
  totalIncomeCharge: number | null;
  branchId: string | null;
  userId: string | null;
  adminId: string | null;
  dateAdded: string | null;
}

function serializeShipment(shipment: LegacyShipment): LegacyShipmentListItem {
  return {
    id: toLegacyId(shipment._id) ?? "",
    trackingNumber: shipment.TrackingNumber ?? null,
    dhlTrackingNumber: shipment.DHLTrackingNumber ?? null,
    description: shipment.Description ?? null,
    type: shipment.Type ?? null,
    status: shipment.Status ?? null,
    totalWeight: typeof shipment.TotalWeight === "number" ? shipment.TotalWeight : null,
    totalIncomeCharge:
      typeof shipment.TotalIncomeCharge === "number" ? shipment.TotalIncomeCharge : null,
    branchId: toLegacyId(shipment.Branch),
    userId: toLegacyId(shipment.User),
    adminId: toLegacyId(shipment.Admin),
    dateAdded: shipment.DateAdded ? new Date(shipment.DateAdded).toISOString() : null,
  };
}

export async function getLegacyShipments(options?: {
  limit?: number;
  page?: number;
  status?: string;
  search?: string;
}) {
  const conn = await connectLegacyDB();
  if (!conn) {
    throw new Error("LEGACY_MONGO_URI is not configured");
  }

  const { Shipment } = getLegacyModels(conn);
  const limit = Math.min(Math.max(options?.limit ?? 25, 1), 100);
  const page = Math.max(options?.page ?? 1, 1);
  const query: Record<string, unknown> = {};

  if (options?.status) {
    query.Status = options.status;
  }

  if (options?.search) {
    const search = options.search.trim();
    query.$or = [
      { TrackingNumber: { $regex: search, $options: "i" } },
      { DHLTrackingNumber: { $regex: search, $options: "i" } },
      { Description: { $regex: search, $options: "i" } },
    ];
  }

  const [total, shipments] = await Promise.all([
    Shipment.countDocuments(query),
    Shipment.find(query)
      .select(
        "_id TrackingNumber DHLTrackingNumber Description Type Status TotalWeight TotalIncomeCharge Branch User Admin DateAdded",
      )
      .sort({ DateAdded: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<LegacyShipment[]>(),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    shipments: shipments.map(serializeShipment),
  };
}

export async function getLegacyOverview() {
  const conn = await connectLegacyDB();
  if (!conn) {
    throw new Error("LEGACY_MONGO_URI is not configured");
  }

  const { Shipment, User, Admin, Rider, Branch, Carrier, Invoice, Transaction, Wallet } =
    getLegacyModels(conn);

  const [
    shipments,
    users,
    admins,
    riders,
    branches,
    carriers,
    invoices,
    transactions,
    wallets,
    statusBreakdown,
  ] = await Promise.all([
    Shipment.countDocuments(),
    User.countDocuments(),
    Admin.countDocuments(),
    Rider.countDocuments(),
    Branch.countDocuments(),
    Carrier.countDocuments(),
    Invoice.countDocuments(),
    Transaction.countDocuments(),
    Wallet.countDocuments(),
    Shipment.aggregate<{ _id: string | null; count: number }>([
      { $group: { _id: "$Status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    counts: {
      shipments,
      users,
      admins,
      riders,
      branches,
      carriers,
      invoices,
      transactions,
      wallets,
    },
    shipmentsByStatus: statusBreakdown.map((item) => ({
      status: item._id ?? "UNKNOWN",
      count: item.count,
    })),
  };
}

