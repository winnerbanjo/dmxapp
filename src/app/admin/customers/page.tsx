import Image from "next/image";
import Link from "next/link";
import { MERCHANT_DEMO_CUSTOMERS_15 } from "@/data/demo-customers";
import { AdminCustomersTable } from "./customers-table";
import { useState } from "react";

export default function AdminCustomersPage() {
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
  return (
    <div className="mx-auto max-w-5xl bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6">
          <button type="button" onClick={() => setShowModal(true)} className="bg-[#5e1914] text-white px-4 py-2 rounded-none text-sm">Add Customer</button>
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
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Customers
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Global database of all DMX customers. Use search and filters above the table.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
        >
          ← Admin
        </Link>
      </div>

      <AdminCustomersTable customers={MERCHANT_DEMO_CUSTOMERS_15} />
{showModal && (
  <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4">
    <div className="w-full max-w-md bg-white shadow-xl p-6">
      <h2 className="text-xl font-semibold mb-4">New Customer</h2>
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Name</span>
          <input value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} className="mt-1 w-full border border-zinc-200 rounded-none px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Email</span>
          <input value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} className="mt-1 w-full border border-zinc-200 rounded-none px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Phone</span>
          <input value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="mt-1 w-full border border-zinc-200 rounded-none px-3 py-2 text-sm" />
        </label>
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowModal(false)} className="border border-[#5e1914] px-4 py-2 text-[#5e1914] rounded-none">Cancel</button>
          <button onClick={() => { /* TODO: call API to create customer */ setShowModal(false); }} className="bg-[#5e1914] px-4 py-2 text-white rounded-none">Create</button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
