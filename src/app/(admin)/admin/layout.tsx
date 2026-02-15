import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="font-semibold text-[#1e40af]">
            DMX Admin
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="text-slate-600 hover:text-[#1e40af]">
              Merchant Approvals
            </Link>
            <Link href="/merchant/dashboard" className="text-slate-600 hover:text-[#1e40af]">
              Merchant
            </Link>
            <Link href="/customer/dashboard" className="text-slate-600 hover:text-[#1e40af]">
              Customer
            </Link>
          </nav>
        </div>
      </header>
      <main className="p-6 md:p-8">{children}</main>
    </div>
  );
}
