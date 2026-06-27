import { Schema, type Connection, type Model } from "mongoose";
import { connectLegacyDB } from "./connection";

export interface LegacyResourceConfig {
  collection: string;
  defaultSort?: Record<string, 1 | -1>;
  searchableFields?: string[];
}

export const LEGACY_RESOURCES = {
  admins: {
    collection: "Admins",
    defaultSort: { DateCreated: -1, _id: -1 },
    searchableFields: ["Name", "EmailAddress", "Telephone", "Status"],
  },
  users: {
    collection: "Users",
    defaultSort: { DateCreated: -1, DateAdded: -1, _id: -1 },
    searchableFields: ["Name", "EmailAddress", "Telephone", "BusinessName", "Status"],
  },
  riders: {
    collection: "Riders",
    defaultSort: { DateCreated: -1, DateAdded: -1, _id: -1 },
    searchableFields: ["Name", "EmailAddress", "Telephone", "Status"],
  },
  branches: {
    collection: "Branches",
    defaultSort: { Name: 1, _id: -1 },
    searchableFields: ["Name", "Code", "Address", "Status"],
  },
  carriers: {
    collection: "Carriers",
    defaultSort: { Name: 1, _id: -1 },
    searchableFields: ["Name", "Code", "Status"],
  },
  shipments: {
    collection: "Shipments",
    defaultSort: { DateAdded: -1, _id: -1 },
    searchableFields: ["TrackingNumber", "DHLTrackingNumber", "Description", "Status", "Type"],
  },
  invoices: {
    collection: "Invoice",
    defaultSort: { DateAdded: -1, _id: -1 },
  },
  wallets: {
    collection: "Wallets",
    defaultSort: { DateAdded: -1, _id: -1 },
  },
  walletTopups: {
    collection: "WalletTopups",
    defaultSort: { Date: -1, _id: -1 },
  },
  transactions: {
    collection: "Transactions",
    defaultSort: { Date: -1, DateAdded: -1, _id: -1 },
  },
  paystackPayments: {
    collection: "PaystackPayments",
    defaultSort: { DateInitiated: -1, _id: -1 },
  },
  contacts: {
    collection: "Contacts",
    defaultSort: { DateAdded: -1, _id: -1 },
    searchableFields: ["Name", "EmailAddress", "Telephone", "Company", "City"],
  },
  cargos: {
    collection: "Cargos",
    defaultSort: { Name: 1, _id: -1 },
    searchableFields: ["Name", "Code", "Status"],
  },
  countries: {
    collection: "Countries",
    defaultSort: { Name: 1, _id: -1 },
    searchableFields: ["Name", "Code"],
  },
  currencies: {
    collection: "Currencies",
    defaultSort: { Name: 1, _id: -1 },
    searchableFields: ["Name", "Code"],
  },
  charges: {
    collection: "Charges",
    defaultSort: { Code: 1, _id: -1 },
    searchableFields: ["Name", "Code", "Status"],
  },
  invoiceTypes: {
    collection: "InvoiceTypes",
    defaultSort: { Name: 1, _id: -1 },
    searchableFields: ["Name", "Code"],
  },
  shippingTerms: {
    collection: "ShippingTerms",
    defaultSort: { Name: 1, _id: -1 },
    searchableFields: ["Name", "Code"],
  },
  exportReasons: {
    collection: "ExportReasons",
    defaultSort: { Name: 1, _id: -1 },
    searchableFields: ["Name", "Code"],
  },
  packagingTypes: {
    collection: "PackagingTypes",
    defaultSort: { Name: 1, _id: -1 },
    searchableFields: ["Name", "Code"],
  },
  shipmentCharges: {
    collection: "ShipmentsCharges",
    defaultSort: { DateAdded: -1, _id: -1 },
  },
  shipmentCargos: {
    collection: "ShipmentsCargos",
    defaultSort: { DateAdded: -1, _id: -1 },
  },
  shipmentActivityLogs: {
    collection: "ShipmentsActivityLogs",
    defaultSort: { Date: -1, DateAdded: -1, _id: -1 },
  },
} satisfies Record<string, LegacyResourceConfig>;

export type LegacyResourceName = keyof typeof LEGACY_RESOURCES;

function getResourceModel(conn: Connection, name: LegacyResourceName): Model<Record<string, unknown>> {
  const config = LEGACY_RESOURCES[name];
  const modelName = `LegacyResource_${config.collection}`;

  if (conn.models[modelName]) {
    return conn.models[modelName] as Model<Record<string, unknown>>;
  }

  return conn.model<Record<string, unknown>>(
    modelName,
    new Schema(
      {},
      {
        collection: config.collection,
        strict: false,
        versionKey: false,
      },
    ),
  );
}

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function isLegacyResourceName(value: string): value is LegacyResourceName {
  return Object.prototype.hasOwnProperty.call(LEGACY_RESOURCES, value);
}

export function listLegacyResourceNames() {
  return Object.keys(LEGACY_RESOURCES) as LegacyResourceName[];
}

export async function getLegacyResourcePage(
  resource: LegacyResourceName,
  options?: { limit?: number; page?: number; search?: string },
) {
  const conn = await connectLegacyDB();
  if (!conn) {
    throw new Error("LEGACY_MONGO_URI is not configured");
  }

  const config = LEGACY_RESOURCES[resource];
  const model = getResourceModel(conn, resource);
  const limit = Math.min(Math.max(options?.limit ?? 25, 1), 100);
  const page = Math.max(options?.page ?? 1, 1);
  const query: Record<string, unknown> = {};
  const searchableFields =
    "searchableFields" in config ? config.searchableFields : undefined;

  if (options?.search && searchableFields?.length) {
    const search = options.search.trim();
    if (search) {
      query.$or = searchableFields.map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }
  }

  const [total, items] = await Promise.all([
    model.countDocuments(query),
    model
      .find(query)
      .sort(config.defaultSort ?? { _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return {
    resource,
    collection: config.collection,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items: serialize(items),
  };
}

export async function getLegacyResourceCounts() {
  const conn = await connectLegacyDB();
  if (!conn) {
    throw new Error("LEGACY_MONGO_URI is not configured");
  }

  const entries = await Promise.all(
    listLegacyResourceNames().map(async (name) => {
      const model = getResourceModel(conn, name);
      return [name, await model.countDocuments()] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<LegacyResourceName, number>;
}
