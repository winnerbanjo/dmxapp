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

function valueFromForm(formData: FormData | undefined, key: string): string {
  const value = formData?.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function startMerchantSession(formData?: FormData) {
  const email = valueFromForm(formData, "email").toLowerCase();
  const password = valueFromForm(formData, "password");
  if (email !== "merchant@dmx.com" || password !== "merchant123") {
    redirect("/merchant/login?error=invalid");
  }
  await setDemoMerchantSession();
}

export async function startHubSession(formData?: FormData) {
  const email = valueFromForm(formData, "email").toLowerCase();
  const password = valueFromForm(formData, "password");
  if (email !== "hub@dmx.com" || password !== "hub123") {
    redirect("/hub/login?error=invalid");
  }
  await setDemoHubSession();
}
