import { getSession } from "@dmx/lib/auth";
import { redirect } from "next/navigation";
import { MERCHANT_DEMO_CUSTOMERS_15 } from "@/data/demo-customers";
import { MerchantCustomersTable } from "./customers-table";

export default async function MerchantCustomersPage() {
  const session = await getSession();
  if (!session?.merchantId || !session.isVerified) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Customers
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        People you have shipped to. Use search and filters above the table.
      </p>
      <div className="mt-8">
        <MerchantCustomersTable customers={MERCHANT_DEMO_CUSTOMERS_15} />
      </div>
    </div>
  );
}
