import { redirect } from "next/navigation";
import { connectDB } from "@dmx/lib/mongodb";
import Merchant from "@dmx/lib/models/Merchant";
import Shipment from "@dmx/lib/models/Shipment";
import { getSession } from "@dmx/lib/auth";
import { WalletPageClient } from "./wallet-page-client";
import { DEMO_BALANCE, DEMO_TRANSACTIONS } from "./demo-transactions";
import { formatDemoDateOnly } from "@/lib/demo-date";

export default async function MerchantWalletPage() {
  const session = await getSession();
  if (!session?.merchantId || !session.isVerified) {
    redirect("/auth/login");
  }

  const conn = await connectDB();
  let balance = DEMO_BALANCE;
  let transactions: { id: string; label: string; amount: number; date: string }[] = DEMO_TRANSACTIONS;

  if (conn) {
    const [merchant, shipments] = await Promise.all([
      Merchant.findById(session.merchantId).select("walletBalance").lean(),
      Shipment.find({ merchantId: session.merchantId })
        .sort({ createdAt: -1 })
        .limit(30)
        .select("trackingId cost createdAt")
        .lean(),
    ]);
    if (shipments.length > 0) {
      balance = merchant?.walletBalance ?? 0;
      transactions = [
        ...shipments.map((s) => ({
          id: s._id.toString(),
          label: `Shipment ${s.trackingId}`,
          amount: -s.cost,
          date: formatDemoDateOnly(new Date(s.createdAt).toISOString()),
        })),
      ];
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Wallet
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Financial hub. Balance and transaction history.
      </p>
      <WalletPageClient initialBalance={balance} transactions={transactions} />
    </div>
  );
}
