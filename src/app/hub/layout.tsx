import { HubSidebar } from "@/components/hub-sidebar";

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white">
      <HubSidebar />
      <main className="flex-1 overflow-auto bg-white p-8 md:p-12">
        {children}
      </main>
    </div>
  );
}
