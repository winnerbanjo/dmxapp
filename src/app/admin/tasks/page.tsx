"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DEMO_TASKS,
  HUB_OPTIONS,
  type DemoTask,
  type HubSlug,
  type TaskSource,
} from "@/data/demo-tasks";

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("completed")) return "border-green-600 bg-green-50 text-green-700";
  if (s.includes("progress")) return "border-amber-600 bg-amber-50 text-amber-700";
  if (s.includes("assigned")) return "border-[#5e1914] bg-[#5e1914]/10 text-[#5e1914]";
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<DemoTask[]>(DEMO_TASKS);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [item, setItem] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [assignedHub, setAssignedHub] = useState<HubSlug>("Lagos");
  const [source, setSource] = useState<TaskSource>("WhatsApp");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.orderRef.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.source.toLowerCase().includes(q) ||
          (t.item && t.item.toLowerCase().includes(q)) ||
          (t.pickupAddress && t.pickupAddress.toLowerCase().includes(q)) ||
          (t.assignedHub.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "All statuses") {
      list = list.filter((t) => t.status === statusFilter);
    }
    return list;
  }, [tasks, search, statusFilter]);

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "All statuses";
  function clearFilters() {
    setSearch("");
    setStatusFilter("All statuses");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const orderRef = String(400 + tasks.length + 1);
    const newTask: DemoTask = {
      id: `t-new-${Date.now()}`,
      source,
      orderRef: `#${orderRef}`,
      customerName: customerName.trim() || "—",
      phone: phone.trim() || "—",
      item: item.trim() || "—",
      pickupAddress: pickupAddress.trim() || "—",
      specialInstructions: specialInstructions.trim() || undefined,
      assignedHub,
      status: "Assigned",
      createdAt: "Feb 15, 2026",
    };
    setTasks((prev) => [newTask, ...prev]);
    setCustomerName("");
    setPhone("");
    setItem("");
    setPickupAddress("");
    setSpecialInstructions("");
  }

  return (
    <div className="mx-auto max-w-6xl bg-white">
      <header className="flex items-center gap-4 border-b border-zinc-100 pb-8">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-white">
          <Image
            src="/dmxlogo.svg"
            alt="DMX"
            fill
            className="object-contain"
            sizes="40px"
            unoptimized
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Task Dispatcher
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Log IG/WhatsApp orders and assign to hubs. Push-dispatch system.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
        >
          ← Admin
        </Link>
      </header>

      {/* Form: Log order */}
      <section className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Log new order
        </h2>
        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-6 border border-zinc-100 bg-white p-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <label htmlFor="source" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Source
            </label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value as TaskSource)}
              className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
            >
              <option value="IG">IG</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>
          <div>
            <label htmlFor="customerName" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Customer name
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Full name"
              className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Phone
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 ..."
              className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="item" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Item
            </label>
            <input
              id="item"
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g. 2x Designer handbags"
              className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
            />
          </div>
          <div>
            <label htmlFor="pickupAddress" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Pickup address
            </label>
            <input
              id="pickupAddress"
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g. Lekki Phase 1, Lagos"
              className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
            />
          </div>
          <div>
            <label htmlFor="assignedHub" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Assign to hub
            </label>
            <select
              id="assignedHub"
              value={assignedHub}
              onChange={(e) => setAssignedHub(e.target.value as HubSlug)}
              className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
            >
              {HUB_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="specialInstructions" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Special Instructions / Conversation Notes
            </label>
            <textarea
              id="specialInstructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Customer is only available after 4 PM. Fragile—contains glass ornaments."
              rows={4}
              className="mt-2 w-full resize-y rounded-none border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="w-full border border-[#5e1914] bg-[#5e1914] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4a130f]"
            >
              Save & push to hub
            </button>
          </div>
        </form>
      </section>

      {/* Global Task Board */}
      <section className="mt-12">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Global task board
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-none border border-zinc-200 bg-white p-4">
          <input
            type="search"
            placeholder="Search by ID or Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 min-w-[200px] flex-1 rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
          >
            <option value="All statuses">All statuses</option>
            <option value="Unassigned">Unassigned</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
            >
              Clear Filters
            </button>
          )}
        </div>
        <div className="mt-4 overflow-hidden border border-zinc-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Order</th>
                <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Customer</th>
                <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Item</th>
                <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Pickup</th>
                <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Hub</th>
                <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Notes</th>
                <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-sm text-zinc-500">
                    No matches found
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                <tr key={t.id} className="border-b border-zinc-100 last:border-b-0">
                  <td className="px-8 py-5">
                    <span className="font-medium text-zinc-900">{t.source} Order {t.orderRef}</span>
                  </td>
                  <td className="px-8 py-5 text-zinc-900">{t.customerName}</td>
                  <td className="px-8 py-5 text-zinc-600">{t.item}</td>
                  <td className="px-8 py-5 text-zinc-600">{t.pickupAddress}</td>
                  <td className="px-8 py-5 text-zinc-600">{t.assignedHub}</td>
                  <td className="max-w-[200px] px-8 py-5 text-zinc-600">
                    {t.specialInstructions ? (
                      <span className="line-clamp-2 text-xs">{t.specialInstructions}</span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-block border px-2 py-1 text-xs font-medium ${statusClass(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
