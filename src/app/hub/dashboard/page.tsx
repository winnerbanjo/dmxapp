"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { ScanLine, RefreshCw, UserPlus, Package } from "lucide-react";
import { HUB_INVENTORY_DEMO_SHIPMENTS } from "@/data/demo-shipments";
import { DateFilter, type DateFilterState } from "@/components/date-filter";
import {
  getHubOperationsForPeriod,
  getTimeAtHubMinutes,
  formatTimeAtHub,
} from "@/data/hub-operations-demo";

const QUICK_ACTIONS = [
  { href: "/hub/scan", label: "Scan Package", icon: ScanLine, primary: true },
  { href: "/hub/update-status", label: "Update Status", icon: RefreshCw, primary: false },
  { href: "/hub/register-walkin", label: "Register Walk-in Customer", icon: UserPlus, primary: true },
];

export default function HubDashboardPage() {
  const [logoError, setLogoError] = useState(false);
  const [dateState, setDateState] = useState<DateFilterState>({ period: "today" });

  const metrics = useMemo(
    () =>
      getHubOperationsForPeriod(
        dateState.period,
        dateState.customFrom,
        dateState.customTo
      ),
    [dateState]
  );

  const inventoryPreview = useMemo(
    () =>
      HUB_INVENTORY_DEMO_SHIPMENTS.slice(0, 8).map((s) => ({
        ...s,
        timeAtHub: formatTimeAtHub(getTimeAtHubMinutes(s.id)),
      })),
    []
  );

  return (
    <div className="mx-auto max-w-5xl bg-white">
      <header className="flex items-center gap-4 border-b border-zinc-100 pb-6">
        {!logoError ? (
          <Image
            src="/dmxlogo.svg"
            alt="DMX"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <span className="font-sans text-lg font-semibold tracking-tighter text-[#5e1914]">DMX</span>
        )}
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tighter text-zinc-900">
            Hub Operations
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Operational metrics. No financial data.
          </p>
        </div>
      </header>

      <section className="mt-6 border-b border-zinc-100 pb-6">
        <DateFilter value={dateState} onChange={setDateState} />
      </section>

      {/* Quick actions — Scan & Register Walk-in in Wine Red */}
      <section className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Quick actions
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon, primary }) => (
            <Link
              key={href}
              href={href}
              className={
                primary
                  ? "flex items-center gap-4 border-0 bg-[#5e1914] p-6 font-medium text-white transition-colors hover:bg-[#4a130f]"
                  : "flex items-center gap-4 border border-zinc-100 bg-white p-6 transition-colors hover:border-zinc-200 hover:bg-zinc-50"
              }
            >
              <div
                className={
                  primary
                    ? "flex h-12 w-12 items-center justify-center bg-white/15"
                    : "flex h-12 w-12 items-center justify-center border border-zinc-100 bg-zinc-50"
                }
              >
                <Icon strokeWidth={1} className={`h-6 w-6 ${primary ? "text-white" : "text-[#5e1914]"}`} />
              </div>
              <span className={primary ? "text-white" : "text-zinc-900"}>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Operations Master Grid — 4 high-impact metrics */}
      <section className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Operations
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-none border border-zinc-100 bg-white p-6">
            <p className="font-sans text-2xl font-semibold tracking-tighter text-zinc-900">
              {metrics.currentInventory}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Current Inventory</p>
            <p className="mt-0.5 text-xs text-zinc-400">Total packages sitting in hub</p>
          </div>
          <div className="rounded-none border border-zinc-100 bg-white p-6">
            <p className="font-sans text-2xl font-semibold tracking-tighter text-zinc-900">
              {metrics.pendingDispatches}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Pending Dispatches</p>
            <p className="mt-0.5 text-xs text-zinc-400">Need to leave the hub today</p>
          </div>
          <div className="rounded-none border border-zinc-100 bg-white p-6">
            <p className="font-sans text-2xl font-semibold tracking-tighter text-zinc-900">
              {metrics.inboundShipments}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Inbound Shipments</p>
            <p className="mt-0.5 text-xs text-zinc-400">Expected to arrive at hub today</p>
          </div>
          <div className="rounded-none border border-zinc-100 bg-white p-6">
            <p className="font-sans text-2xl font-semibold tracking-tighter text-zinc-900">
              {metrics.avgProcessingTimeMins} mins
            </p>
            <p className="mt-1 text-sm text-zinc-500">Avg. Processing Time</p>
            <p className="mt-0.5 text-xs text-zinc-400">Arrived → Dispatched</p>
          </div>
        </div>
      </section>

      {/* Activity row — Walk-ins & Tasks Assigned */}
      <section className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Activity
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-none border border-zinc-100 bg-white p-6">
            <p className="font-sans text-2xl font-semibold tracking-tighter text-zinc-900">
              {metrics.walkInsToday}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Walk-ins registered today</p>
          </div>
          <div className="rounded-none border border-zinc-100 bg-white p-6">
            <p className="font-sans text-2xl font-semibold tracking-tighter text-zinc-900">
              {metrics.tasksAssigned}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Tasks Assigned</p>
            <p className="mt-0.5 text-xs text-zinc-400">IG/WhatsApp pickups from Admin</p>
          </div>
        </div>
      </section>

      {/* Inventory Preview — no Amount, add Time at Hub */}
      <section className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          At hub — preview
        </h2>
        <div className="mt-4 overflow-hidden rounded-none border border-zinc-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-6 py-4 font-medium font-sans tracking-tighter text-zinc-900">
                  Tracking
                </th>
                <th className="px-6 py-4 font-medium font-sans tracking-tighter text-zinc-900">
                  Merchant
                </th>
                <th className="px-6 py-4 font-medium font-sans tracking-tighter text-zinc-900">
                  Destination
                </th>
                <th className="px-6 py-4 font-medium font-sans tracking-tighter text-zinc-900">
                  Time at Hub
                </th>
              </tr>
            </thead>
            <tbody>
              {inventoryPreview.map((s) => (
                <tr key={s.id} className="border-b border-zinc-100 last:border-b-0">
                  <td className="px-6 py-4 font-mono font-sans tracking-tighter text-[#5e1914]">
                    {s.trackingId}
                  </td>
                  <td className="px-6 py-4 font-sans tracking-tighter text-zinc-900">
                    {s.merchant}
                  </td>
                  <td className="px-6 py-4 font-sans tracking-tighter text-zinc-600">
                    {s.destination}
                  </td>
                  <td className="px-6 py-4 font-mono font-sans tracking-tighter text-zinc-900">
                    {(s as { timeAtHub: string }).timeAtHub}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link
          href="/hub/inventory"
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#5e1914] hover:underline"
        >
          <Package className="h-4 w-4" />
          View full Branch Inventory
        </Link>
      </section>
    </div>
  );
}
