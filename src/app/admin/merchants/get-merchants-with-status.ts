"use server";

import { DEMO_MERCHANTS } from "@/data/demo-merchants";
import { getMerchantKycStatus } from "@/lib/merchant-kyc";

export async function getMerchantsWithKycStatus() {
  const withStatus = await Promise.all(
    DEMO_MERCHANTS.map(async (m) => ({
      ...m,
      kycStatus: await getMerchantKycStatus(m.id),
    }))
  );
  return withStatus;
}