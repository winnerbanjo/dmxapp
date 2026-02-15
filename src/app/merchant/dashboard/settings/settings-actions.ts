"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@dmx/lib/mongodb";
import Merchant from "@dmx/lib/models/Merchant";
import { getSession } from "@dmx/lib/auth";
import { generateMockApiKey } from "@/lib/utils";

type ProfileState = { error?: string; ok?: boolean } | null;

export async function updateMerchantProfile(prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await getSession();
  if (!session?.merchantId) return { error: "Unauthorized" };

  const businessName = (formData.get("businessName") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  if (!businessName) return { error: "Business name is required." };

  await connectDB();
  await Merchant.findByIdAndUpdate(session.merchantId, {
    businessName,
    ...(address !== undefined && { address }),
  });
  revalidatePath("/merchant/dashboard/settings");
  return { ok: true };
}

export async function generateApiKey(): Promise<{ error?: string; apiKey?: string }> {
  const session = await getSession();
  if (!session?.merchantId) return { error: "Unauthorized" };

  await connectDB();
  const apiKey = generateMockApiKey();
  await Merchant.findByIdAndUpdate(session.merchantId, { apiKey });
  revalidatePath("/merchant/dashboard/settings");
  return { apiKey };
}
