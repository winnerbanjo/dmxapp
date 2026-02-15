import Image from "next/image";
import { GlobalShipmentsTable } from "./global-shipments-table";
import { AdminDashboardContent } from "./admin-dashboard-content";

const DEMO_MERCHANTS = [
  { id: "1", businessName: "Mubarak's Store", email: "mubarak@example.com", verified: true },
  { id: "2", businessName: "Lagos Boutique", email: "contact@lagosboutique.com", verified: true },
  { id: "3", businessName: "Abuja Essentials", email: "hello@abujaessentials.ng", verified: true },
  { id: "4", businessName: "Port Harcourt Goods", email: "info@phgoods.com", verified: true },
  { id: "5", businessName: "Ibadan Market Co.", email: "support@ibadanmarket.co", verified: true },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl bg-white px-8 py-8">
      {/* Header with logo */}
      <header className="flex items-center gap-4 border-b border-zinc-200 pb-6">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-white">
          <Image
            src="/dmxlogo.svg"
            alt="DMX"
            fill
            className="object-contain"
            sizes="40px"
          />
        </div>
        <div>
          <h1 className="font-sans text-3xl font-semibold tracking-tighter text-zinc-900">
            Admin Command Center
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            System metrics, hub performance, and global shipments.
          </p>
        </div>
      </header>

      {/* Date Filter + Layer 1 (Cards) + Layer 2 (Hub Performance Table) */}
      <AdminDashboardContent />

      {/* Global Shipments */}
      <section className="mt-16">
        <h2 className="font-sans text-lg font-semibold tracking-tighter text-zinc-900">
          Global Shipments
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Search and filter by branch. Selecting a branch shows only that hub&apos;s shipments.
        </p>
        <div className="mt-6">
          <GlobalShipmentsTable />
        </div>
      </section>

      {/* Merchant List */}
      <section className="mt-16">
        <h2 className="font-sans text-lg font-semibold tracking-tighter text-zinc-900">
          Merchant list
        </h2>
        <div className="mt-6 overflow-hidden rounded-none border border-zinc-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                  Business
                </th>
                <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                  Email
                </th>
                <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {DEMO_MERCHANTS.map((m) => (
                <tr key={m.id} className="border-b border-zinc-100 last:border-b-0">
                  <td className="px-8 py-5 font-medium text-zinc-900">{m.businessName}</td>
                  <td className="px-8 py-5 text-zinc-600">{m.email}</td>
                  <td className="px-8 py-5">
                    <span className="inline-block border border-[#5e1914] bg-[#5e1914]/10 px-2 py-1 text-xs font-medium text-[#5e1914]">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
