import { AdminAppleSidebar } from "@/components/apple-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white text-zinc-900">
      <AdminAppleSidebar />
      <main className="flex-1 overflow-auto bg-white">{children}</main>
    </div>
  );
}
