"use server";

import { createToken } from "@dmx/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_MERCHANT_ID_APPROVED, DEMO_MERCHANT_ID_PENDING } from "@/lib/merchant-kyc";

export async function setDemoMerchantSession() {
  const token = await createToken({
    merchantId: DEMO_MERCHANT_ID_APPROVED,
    email: "demo@dmx.com",
    isVerified: true,
  });
  const store = await cookies();
  store.set("dmx-merchant-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  redirect("/merchant/dashboard");
}

/** Demo login as "New Store" (Pending Verification) to test KYC approval flow. */
export async function setDemoMerchantPendingSession() {
  const token = await createToken({
    merchantId: DEMO_MERCHANT_ID_PENDING,
    email: "newstore@dmx.com",
    isVerified: false,
  });
  const store = await cookies();
  store.set("dmx-merchant-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  redirect("/merchant/dashboard");
}

export async function setDemoHubSession() {
  const store = await cookies();
  store.set("dmx-hub-token", "demo-hub-staff", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  redirect("/hub/dashboard");
}
