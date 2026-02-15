"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function logoutMerchant() {
  const cookieStore = await cookies();
  cookieStore.delete("dmx-merchant-token");
  redirect("/auth/login");
}
