import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSession as getMerchantSession } from "@dmx/lib/auth";
import { AdminAppleSidebar } from "@/components/apple-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const merchantSession = await getMerchantSession();
  const role = (session?.user as { role?: string })?.role;
  const adminEmail = process.env.ADMIN_EMAIL;
  const isMerchantAdmin = adminEmail && merchantSession?.email === adminEmail;
  const isAdmin = role === "ADMIN" || isMerchantAdmin;

  return (
    <div className="flex h-screen bg-white text-zinc-900">
      <AdminAppleSidebar />
      <main className="flex-1 overflow-auto bg-white">{children}</main>
    </div>
  );
}
