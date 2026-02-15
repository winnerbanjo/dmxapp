import { redirect } from "next/navigation";
import { connectDB } from "@dmx/lib/mongodb";
import Merchant from "@dmx/lib/models/Merchant";
import { getSession } from "@dmx/lib/auth";
import { SettingsClient } from "./settings-client";

export default async function MerchantSettingsPage() {
  const session = await getSession();
  if (!session?.merchantId || !session.isVerified) {
    redirect("/auth/login");
  }

  const conn = await connectDB();
  let profile = { businessName: "", email: "", phone: "", address: "" };
  let apiKeyMasked = "";
  if (conn) {
    const merchant = await Merchant.findById(session.merchantId)
      .select("businessName email address apiKey")
      .lean();
    if (merchant) {
      profile = {
        businessName: merchant.businessName ?? "",
        email: merchant.email ?? "",
        phone: (merchant as { phone?: string }).phone ?? "",
        address: merchant.address ?? "",
      };
      apiKeyMasked = merchant.apiKey ? `${merchant.apiKey.slice(0, 8)}••••••••` : "";
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Settings
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Profile, bank details, and API access.
      </p>
      <SettingsClient profile={profile} apiKeyMasked={apiKeyMasked} />
    </div>
  );
}
