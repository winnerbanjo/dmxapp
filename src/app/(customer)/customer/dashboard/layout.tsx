import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/customer/dashboard");
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "CUSTOMER" && role !== "ADMIN" && role !== "MERCHANT") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/customer/dashboard" className="font-semibold text-[#1e40af]">
            DMX Customer
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/merchant/dashboard">Merchant</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customer/dashboard/settings">Settings</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="p-6 md:p-8">{children}</main>
    </div>
  );
}
