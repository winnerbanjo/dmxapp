import { redirect } from "next/navigation";

export default function MerchantWalletRedirect() {
  redirect("/merchant/dashboard/wallet");
}
