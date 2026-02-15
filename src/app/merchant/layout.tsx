import { redirect } from "next/navigation";
import { getSession } from "@dmx/lib/auth";
import { MerchantDashboardSidebar } from "@/components/merchant-dashboard-sidebar";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isAdmin =
    process.env.ADMIN_EMAIL && session?.email === process.env.ADMIN_EMAIL;

  return (
    <div className="flex h-screen bg-white">
      <MerchantDashboardSidebar
        email={session?.email ?? "Demo"}
        isAdmin={!!isAdmin}
      />
      <main className="flex-1 overflow-auto bg-white p-12 md:p-16">
        {children}
      </main>
    </div>
  );
}
