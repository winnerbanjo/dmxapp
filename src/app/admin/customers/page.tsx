import Image from "next/image";
import Link from "next/link";
import { connectLegacyDB } from "@/lib/legacy/connection";
import { AdminCustomersTable } from "./customers-table";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  let realCustomers: Array<{
    id: string;
    name: string;
    phone: string;
    city: string;
    orderCount: number;
    lastOrder?: string;
    email?: string;
  }> = [];

  try {
    const conn = await connectLegacyDB();
    if (conn && conn.db) {
      const contacts = await conn.db
        .collection("Contacts")
        .find({})
        .sort({ DateAdded: -1, _id: -1 })
        .limit(100)
        .toArray();

      realCustomers = contacts.map((c) => ({
        id: String(c._id),
        name: c.Name || c.Company || "Customer Contact",
        phone: c.Telephone || "—",
        city: c.City || c.State || "Lagos",
        orderCount: 1,
        lastOrder: c.DateAdded
          ? new Date(c.DateAdded).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
        email: c.EmailAddress || "—",
      }));
    }
  } catch (err) {
    console.error("[Customers] Failed to fetch real contacts:", err);
  }

  return (
    <div className="mx-auto max-w-5xl bg-white px-8 py-8">
      <header className="flex items-center gap-4 border-b border-zinc-100 pb-6">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-white">
          <Image
            src="/dmxlogo.svg"
            alt="DMX"
            fill
            className="object-contain"
            sizes="40px"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Customers & Contacts
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Live database of DMX shipping contacts and customers.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
        >
          ← Admin
        </Link>
      </header>

      <AdminCustomersTable customers={realCustomers} />
    </div>
  );
}
