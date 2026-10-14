"use server";

import { connectLegacyDB } from "@/lib/legacy/connection";

export interface RealMerchantRecord {
  id: string;
  businessName: string;
  email?: string;
  phone?: string;
  hub: string;
  shipments: number;
  kycStatus: "Approved" | "Pending" | "Rejected";
}

const HUB_MAP: Record<string, string> = {
  "652d4541b4e88e2f748c7be6": "Lagos",
  "652d4b04b4e88e2f748c7d2c": "Abuja",
  "652dae5a9df846e1bbec0f76": "Ilorin",
};

export async function getMerchantsWithKycStatus(): Promise<RealMerchantRecord[]> {
  try {
    const conn = await connectLegacyDB();
    if (!conn || !conn.db) return [];

    const users = await conn.db
      .collection("Users")
      .find({})
      .sort({ DateCreated: -1, _id: -1 })
      .limit(100)
      .toArray();

    return users.map((u) => {
      const branchId = u.Branch ? String(u.Branch) : "";
      const hub = HUB_MAP[branchId] || "Lagos";
      const name = u.Company || u.Name || "Merchant Account";
      const isApproved = u.AccountCreationStatus === 1 || u.LoginActive === true;

      return {
        id: String(u._id),
        businessName: name,
        email: u.EmailAddress || undefined,
        phone: u.Telephone || undefined,
        hub,
        shipments: typeof u.Expenses === "number" ? u.Expenses : 0,
        kycStatus: isApproved ? "Approved" : "Pending",
      };
    });
  } catch (err) {
    console.error("[Merchants] Failed to fetch real merchants from database:", err);
    return [];
  }
}