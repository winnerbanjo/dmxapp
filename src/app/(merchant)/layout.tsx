import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MerchantSidebar } from "@/components/merchant-dmx-sidebar";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "MERCHANT" && role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-black text-white">
      <MerchantSidebar />
      <main className="flex-1 overflow-auto bg-black">{children}</main>
    </div>
  );
}
