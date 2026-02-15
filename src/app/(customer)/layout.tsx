import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CustomerSidebar } from "@/components/customer-sidebar";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/customer");
  if ((session.user as { role?: string })?.role === "ADMIN") redirect("/admin");

  return (
    <div className="flex min-h-screen">
      <CustomerSidebar />
      <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
    </div>
  );
}
