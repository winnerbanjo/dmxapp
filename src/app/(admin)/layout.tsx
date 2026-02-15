import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GlassSidebar } from "@/components/glass-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/admin");
  if ((session.user as { role?: string })?.role !== "ADMIN") redirect("/customer");

  return (
    <div className="flex h-screen bg-pure-black text-white">
      <GlassSidebar role="ADMIN" title="DMX Admin" />
      <main className="flex-1 overflow-auto bg-slate-gray p-6">{children}</main>
    </div>
  );
}
