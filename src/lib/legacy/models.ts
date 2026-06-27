import { Schema, type Connection, type Model, type Types } from "mongoose";

type LegacyId = Types.ObjectId | string;

export interface LegacyAdmin {
  _id: LegacyId;
  RoleGroup?: "Admin" | "SuperAdmin";
  Branch?: LegacyId;
  Name?: string;
  EmailAddress: string;
  Telephone?: string;
  Password?: string;
  Status?: "ACTIVE" | "INACTIVE";
  DateCreated?: Date;
}

export interface LegacyShipment {
  _id: LegacyId;
  CreatedBy?: "User" | "Admin";
  Admin?: LegacyId;
  Branch?: LegacyId;
  User?: LegacyId;
  Description?: string;
  Type?: "Local" | "Nationwide" | "Export";
  Status?: string;
  TotalWeight?: number;
  TotalIncomeCharge?: number;
  TotalExpenseCharge?: number;
  TrackingNumber?: string;
  DHLTrackingNumber?: string;
  DateAdded?: Date;
  DateUpdated?: Date;
}

export interface LegacyNamedRecord {
  _id: LegacyId;
  Name?: string;
  Code?: string;
  Status?: string;
  DateAdded?: Date;
}

function getLooseModel<T>(
  conn: Connection,
  modelName: string,
  collection: string,
): Model<T> {
  if (conn.models[modelName]) {
    return conn.models[modelName] as Model<T>;
  }

  const schema = new Schema<T>(
    {},
    {
      collection,
      strict: false,
      versionKey: false,
    },
  );

  return conn.model<T>(modelName, schema);
}

export function getLegacyModels(conn: Connection) {
  return {
    Admin: getLooseModel<LegacyAdmin>(conn, "LegacyAdmin", "Admins"),
    Shipment: getLooseModel<LegacyShipment>(conn, "LegacyShipment", "Shipments"),
    User: getLooseModel<LegacyNamedRecord>(conn, "LegacyUser", "Users"),
    Rider: getLooseModel<LegacyNamedRecord>(conn, "LegacyRider", "Riders"),
    Branch: getLooseModel<LegacyNamedRecord>(conn, "LegacyBranch", "Branches"),
    Carrier: getLooseModel<LegacyNamedRecord>(conn, "LegacyCarrier", "Carriers"),
    Invoice: getLooseModel<LegacyNamedRecord>(conn, "LegacyInvoice", "Invoice"),
    Transaction: getLooseModel<LegacyNamedRecord>(conn, "LegacyTransaction", "Transactions"),
    Wallet: getLooseModel<LegacyNamedRecord>(conn, "LegacyWallet", "Wallets"),
  };
}

export function toLegacyId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return null;
}

