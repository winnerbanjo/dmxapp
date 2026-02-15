"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEMO_TASKS,
  BOOKING_FROM_TASK_KEY,
  type DemoTask,
  type TaskStatus,
  type HubBookingFromTask,
} from "@/data/demo-tasks";

const HUB_SLUG = "Lagos";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "All statuses", label: "All statuses" },
  { value: "Assigned", label: "Assigned" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

function displayStatus(status: TaskStatus): string {
  if (status === "Assigned") return "NEW TASK";
  if (status === "In Progress") return "IN PROGRESS";
  if (status === "Completed") return "COMPLETED";
  return status;
}

function statusBadgeClass(status: TaskStatus): string {
  if (status === "Completed") return "border-green-600 bg-green-50 text-green-700";
  if (status === "In Progress") return "border-[#5e1914] bg-[#5e1914]/10 text-[#5e1914]";
  return "border-[#5e1914] bg-[#5e1914]/10 text-[#5e1914]";
}

export default function HubTasksPage() {
  const initialTasks = useMemo(
    () => DEMO_TASKS.filter((t) => t.assignedHub === HUB_SLUG),
    []
  );
  const [tasks, setTasks] = useState<DemoTask[]>(initialTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const filtered = useMemo(() => {
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
          (t.deliveryAddress && t.deliveryAddress.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "All statuses") {
      list = list.filter((t) => t.status === statusFilter);
    }
    return list;
  }, [tasks, search, statusFilter]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("All statuses");
  }

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "All statuses";

  const router = useRouter();

  function acceptTask(task: DemoTask) {
    if (task.status !== "Assigned") return;
    const payload: HubBookingFromTask = {
      customerName: task.customerName,
      phone: task.phone,
      specialInstructions: task.specialInstructions,
      item: task.item,
      pickupAddress: task.pickupAddress,
      deliveryAddress: task.deliveryAddress,
      orderRef: task.orderRef,
      source: task.source,
      serviceType: task.serviceType ?? "local",
    };
    try {
      sessionStorage.setItem(BOOKING_FROM_TASK_KEY, JSON.stringify(payload));
    } catch (_) {}
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: "In Progress" as TaskStatus } : t))
    );
    router.push("/hub/booking");
  }

  function completeTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id && t.status === "In Progress" ? { ...t, status: "Completed" as TaskStatus } : t))
    );
  }

  return (
    <div className="mx-auto max-w-4xl bg-white">
      <header className="flex items-center gap-4 border-b border-zinc-100 pb-6">
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
            Tasks
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Pending pickups & deliveries for {HUB_SLUG} Hub. Accept and complete below.
          </p>
        </div>
        <Link
          href="/hub/dashboard"
          className="rounded-none border border-zinc-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-none border border-zinc-200 bg-white p-4">
        <input
          type="search"
          placeholder="Search by ID or Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 flex-1 min-w-[200px] rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
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

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-none border border-zinc-200 bg-white py-16 text-center text-sm text-zinc-500">
            No matches found
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="rounded-none border border-zinc-200 bg-white"
            >
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900">
                    {t.source} Order {t.orderRef}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {t.deliveryAddress
                      ? `Delivery to ${t.deliveryAddress}`
                      : `Pickup at ${t.pickupAddress}`}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {t.item} · {t.customerName} · {t.phone}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
                  <span
                    className={`inline-block border px-2 py-1 text-xs font-medium ${statusBadgeClass(t.status)}`}
                  >
                    {displayStatus(t.status)}
                  </span>
                  {t.status === "Assigned" && (
                    <button
                      type="button"
                      onClick={() => acceptTask(t)}
                      className="border border-[#5e1914] bg-[#5e1914] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a130f]"
                    >
                      Accept Task
                    </button>
                  )}
                  {t.status === "In Progress" && (
                    <button
                      type="button"
                      onClick={() => completeTask(t.id)}
                      className="border border-[#5e1914] bg-[#5e1914] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a130f]"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
              {t.specialInstructions && (
                <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Special Instructions
                  </p>
                  <p className="mt-1.5 text-sm text-zinc-800">
                    {t.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
