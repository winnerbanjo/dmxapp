"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@dmx/lib/mongodb";
import Merchant from "@dmx/lib/models/Merchant";
import { setMerchantKycStatus, getMerchantKycDocuments } from "@/lib/merchant-kyc";

export async function toggleMerchantVerification(formData: FormData) {
  const merchantId = formData.get("merchantId") as string;
  if (!merchantId) return;

  await connectDB();
  const merchant = await Merchant.findById(merchantId);
  if (!merchant) return;

  await Merchant.findByIdAndUpdate(merchantId, { isVerified: !merchant.isVerified });
  revalidatePath("/admin/merchants");
  revalidatePath("/admin/dashboard");
}

export async function addWalletBalance(formData: FormData) {
  const merchantId = formData.get("merchantId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  if (!merchantId || isNaN(amount) || amount <= 0) return;

  await connectDB();
  await Merchant.findByIdAndUpdate(merchantId, { $inc: { walletBalance: amount } });
  revalidatePath("/admin/merchants");
}

export async function setMerchantKycStatusAction(
  merchantId: string,
  status: "Pending Verification" | "Approved" | "Rejected"
) {
  if (!merchantId) return;
  await setMerchantKycStatus(merchantId, status);
  revalidatePath("/admin/merchants");
  revalidatePath("/merchant/dashboard");
}

export async function getMerchantKycDocumentsAction(merchantId: string) {
  if (!merchantId) return null;
  return getMerchantKycDocuments(merchantId);
}
