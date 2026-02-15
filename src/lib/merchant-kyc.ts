import { connectDB } from "@dmx/lib/mongodb";
import Merchant, { type KycStatus } from "@dmx/lib/models/Merchant";

/** Demo merchant IDs: Mubarak (Approved), New Store (Pending). */
export const DEMO_MERCHANT_ID_APPROVED = "000000000000000000000001";
export const DEMO_MERCHANT_ID_PENDING = "000000000000000000000002";

const DEMO_DEFAULTS: Record<string, KycStatus> = {
  [DEMO_MERCHANT_ID_APPROVED]: "Approved",
  [DEMO_MERCHANT_ID_PENDING]: "Pending Verification",
};

/** In-memory overrides when DB is not connected (e.g. admin Approve/Reject). */
const statusOverrides: Record<string, KycStatus> = {};

export async function getMerchantKycStatus(merchantId: string): Promise<KycStatus> {
  if (statusOverrides[merchantId]) return statusOverrides[merchantId];
  const conn = await connectDB();
  if (conn) {
    const merchant = await Merchant.findById(merchantId).select("kycStatus").lean();
    if (merchant?.kycStatus) return merchant.kycStatus as KycStatus;
  }
  return DEMO_DEFAULTS[merchantId] ?? "Pending Verification";
}

export async function setMerchantKycStatus(merchantId: string, status: KycStatus): Promise<void> {
  const conn = await connectDB();
  if (conn) {
    await Merchant.findByIdAndUpdate(merchantId, {
      kycStatus: status,
      ...(status === "Approved" ? { isVerified: true } : {}),
    });
  } else {
    statusOverrides[merchantId] = status;
  }
}

export async function getMerchantKycDocuments(merchantId: string): Promise<{
  personalKyc: { fullName: string; dateOfBirth: string; idType: string; idDocumentUrl?: string } | null;
  businessKyc: { companyName: string; rcNumber: string; businessAddress: string; cacDocumentUrl?: string } | null;
  kycStatus: KycStatus;
} | null> {
  const conn = await connectDB();
  if (conn) {
    const merchant = await Merchant.findById(merchantId).select("personalKyc businessKyc kycStatus").lean();
    if (!merchant) return null;
    return {
      personalKyc: merchant.personalKyc ?? null,
      businessKyc: merchant.businessKyc ?? null,
      kycStatus: (merchant.kycStatus as KycStatus) ?? "Pending Verification",
    };
  }
  return getDemoKycDocuments(merchantId);
}

function getDemoKycDocuments(merchantId: string): {
  personalKyc: { fullName: string; dateOfBirth: string; idType: string; idDocumentUrl?: string } | null;
  businessKyc: { companyName: string; rcNumber: string; businessAddress: string; cacDocumentUrl?: string } | null;
  kycStatus: KycStatus;
} | null {
  const status = statusOverrides[merchantId] ?? DEMO_DEFAULTS[merchantId] ?? "Pending Verification";
  if (merchantId === DEMO_MERCHANT_ID_APPROVED) {
    return {
      personalKyc: { fullName: "Mubarak Ahmed", dateOfBirth: "1990-05-15", idType: "NIN", idDocumentUrl: "/demo-doc-placeholder.pdf" },
      businessKyc: { companyName: "Mubarak's Store", rcNumber: "RC 123456", businessAddress: "Lagos, Nigeria", cacDocumentUrl: "/demo-doc-placeholder.pdf" },
      kycStatus: status,
    };
  }
  if (merchantId === DEMO_MERCHANT_ID_PENDING) {
    return {
      personalKyc: { fullName: "New Store Owner", dateOfBirth: "1988-11-20", idType: "Passport", idDocumentUrl: "/demo-doc-placeholder.pdf" },
      businessKyc: { companyName: "New Store", rcNumber: "RC 789012", businessAddress: "Abuja, Nigeria", cacDocumentUrl: "/demo-doc-placeholder.pdf" },
      kycStatus: status,
    };
  }
  return null;
}
