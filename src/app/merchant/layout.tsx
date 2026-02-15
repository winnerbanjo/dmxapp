import { redirect } from "next/navigation";
import { getSession } from "@dmx/lib/auth";
import { MerchantDashboardSidebar } from "@/components/merchant-dashboard-sidebar";
import { MerchantMobileNav } from "@/components/merchant-mobile-nav";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isAdmin =
    process.env.ADMIN_EMAIL && session?.email === process.env.ADMIN_EMAIL;

  return (
    <div className="flex h-screen flex-col bg-white md:flex-row">
      <MerchantMobileNav email={session?.email ?? "Demo"} isAdmin={!!isAdmin} />
      <MerchantDashboardSidebar
        email={session?.email ?? "Demo"}
        isAdmin={!!isAdmin}
      />
      <main className="flex-1 overflow-auto bg-white px-4 py-8 md:px-8 md:py-12 lg:px-16 lg:py-16">
        {children}
      </main>
    </div>
  );
}
