"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, Filter, MapPin, PackageCheck, ShieldCheck } from "lucide-react";

type InsightTab = "overview" | "monitoring" | "sla";

const shipmentTrend = [1, 2, 2, 1, 1, 1, 1, 1, 2, 1];
const spendTrend = [210000, 240000, 780000, 190000, 120000, 410000, 90000, 520000, 230000, 290000];
const carrierRows = [
  { carrier: "FedEx", shipments: 8, share: "62.4%", weight: "65.66 kg", average: "9.38 days", percentile: "8.37 days" },
  { carrier: "DHL Express", shipments: 7, share: "36.4%", weight: "38.3 kg", average: "4.37 days", percentile: "4.87 days" },
  { carrier: "Parcels Express", shipments: 1, share: "1.2%", weight: "1.3 kg", average: "5.10 days", percentile: "5.20 days" },
];
const monitoringRows = [
  { country: "Nigeria", shipments: 2, status: "On track", x: "58%", y: "62%" },
  { country: "United States", shipments: 1, status: "On track", x: "29%", y: "39%" },
];

export default function MerchantInsightsPage() {
  const [activeTab, setActiveTab] = useState<InsightTab>("overview");
  const [carrier, setCarrier] = useState("All carriers");
  const [country, setCountry] = useState("All countries");
  const [applied, setApplied] = useState("May 28, 2026 - Jun 27, 2026");

  const tabTitle = activeTab === "overview" ? "Performance Insights" : activeTab === "monitoring" ? "Package Monitoring" : "Delivery SLAs";
  const totalShipments = useMemo(() => carrierRows.reduce((sum, row) => sum + row.shipments, 0), []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e1914]">Insights</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-zinc-900">
            <BarChart3 className="h-7 w-7 text-[#5e1914]" />
            {tabTitle}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{applied}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-zinc-100">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<BarChart3 className="h-4 w-4" />} label="Overview" />
        <TabButton active={activeTab === "monitoring"} onClick={() => setActiveTab("monitoring")} icon={<MapPin className="h-4 w-4" />} label="Package Monitoring" />
        <TabButton active={activeTab === "sla"} onClick={() => setActiveTab("sla")} icon={<PackageCheck className="h-4 w-4" />} label="Delivery SLAs" />
      </div>

      <section className="mt-6 border border-zinc-100 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-5">
          <DateField label="Start date" defaultValue="2026-05-28" />
          <DateField label="End date" defaultValue="2026-06-27" />
          <SelectField label="Carrier" value={carrier} onChange={setCarrier} options={["All carriers", "DHL Express", "FedEx", "Parcels Express"]} />
          <SelectField label="Country" value={country} onChange={setCountry} options={["All countries", "Nigeria", "United States", "United Kingdom"]} />
          <button
            type="button"
            onClick={() => setApplied(`${carrier} · ${country}`)}
            className="mt-auto inline-flex h-11 items-center justify-center gap-2 bg-[#5e1914] px-4 text-sm font-semibold text-white hover:bg-[#4a130f]"
          >
            <Filter className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </section>

      {activeTab === "overview" ? <Overview totalShipments={totalShipments} /> : null}
      {activeTab === "monitoring" ? <Monitoring /> : null}
      {activeTab === "sla" ? <DeliverySla /> : null}
    </div>
  );
}

function Overview({ totalShipments }: { totalShipments: number }) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard label="Shipments" value={totalShipments.toString()} detail="Total shipments processed">
          <TinyLine values={shipmentTrend} color="#2f8ca3" />
        </MetricCard>
        <MetricCard label="Spend" value="₦2,875,192" detail="Total shipment spend">
          <TinyLine values={spendTrend} color="#5e1914" />
        </MetricCard>
        <MetricCard label="Profit" value="₦0" detail="Total profit earned">
          <TinyLine values={[0, 0, 0, 0, 0, 0, 0]} color="#a1a1aa" />
        </MetricCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="font-semibold text-zinc-900">Volume</h2>
          <p className="mt-1 text-sm text-zinc-500">Shipment volume by carrier</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatBox label="Total weight" value="105.26 kg" />
            <StatBox label="Total shipments" value="16" />
          </div>
          <CarrierTable />
        </section>
        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="font-semibold text-zinc-900">Delivery Timelines</h2>
          <p className="mt-1 text-sm text-zinc-500">Delivery timelines by carrier</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatBox label="Average" value="6.88 days" />
            <StatBox label="50th percentile" value="6.62 days" />
            <StatBox label="90th percentile" value="10.07 days" />
          </div>
          <CarrierTable timeline />
        </section>
      </div>
    </div>
  );
}

function Monitoring() {
  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap gap-2 border border-zinc-100 bg-white p-4 text-sm">
        <Chip active label="All statuses" />
        <Chip label="On track 3" tone="green" />
        <Chip label="At risk 0" tone="amber" />
        <Chip label="Breached 0" tone="red" />
        <Chip label="Active customs delays 0" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="font-semibold text-zinc-900">Countries</h2>
          <p className="mt-2 text-sm text-zinc-500">Total: 3 shipments across 2 countries</p>
          <div className="mt-6 space-y-3">
            {monitoringRows.map((row) => (
              <button key={row.country} className="flex w-full items-center justify-between border border-zinc-100 p-4 text-left hover:border-[#5e1914]">
                <span>
                  <span className="font-medium text-zinc-900">{row.country}</span>
                  <span className="block text-xs text-zinc-500">{row.shipments} shipment(s)</span>
                </span>
                <span className="bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{row.status}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="border border-zinc-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-zinc-900">Map</h2>
              <p className="mt-1 text-sm text-zinc-500">Geographic view of transit shipments.</p>
            </div>
            <p className="text-sm text-zinc-400">Countries: 2</p>
          </div>
          <div className="relative mt-5 h-80 overflow-hidden border border-zinc-100 bg-[#d9eef2]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(94,25,20,0.08)_1px,transparent_1px),linear-gradient(rgba(94,25,20,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
            <div className="absolute left-[20%] top-[34%] text-sm font-semibold text-zinc-500">UNITED STATES</div>
            <div className="absolute left-[55%] top-[58%] text-sm font-semibold text-zinc-500">NIGERIA</div>
            {monitoringRows.map((row) => (
              <span
                key={row.country}
                className="absolute grid h-10 w-10 place-items-center rounded-full bg-[#5e1914] text-sm font-bold text-white shadow"
                style={{ left: row.x, top: row.y }}
              >
                {row.shipments}
              </span>
            ))}
          </div>
          <CarrierPerformanceTable />
        </section>
      </div>
    </div>
  );
}

function DeliverySla() {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatBox label="Total carriers" value="2" />
        <StatBox label="Total shipments" value="11" />
        <StatBox label="Average TAT" value="5.8 days" />
        <StatBox label="Average SLA success" value="18.18%" danger />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="font-semibold text-zinc-900">Delivery SLA Timelines</h2>
          <DataTable
            headings={["Carrier", "Avg TAT", "Median", "90th Percentile", "Shipments"]}
            rows={[
              ["FedEx", "6.4 days", "7.0 days", "8.4 days", "7"],
              ["DHL Express", "4.8 days", "5.3 days", "5.8 days", "4"],
            ]}
          />
        </section>
        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="font-semibold text-zinc-900">SLA Success Rate</h2>
          <DataTable
            headings={["Carrier", "Success Rate", "Shipments"]}
            rows={[
              ["FedEx", "14.29%", "7"],
              ["DHL Express", "25.00%", "4"],
            ]}
          />
        </section>
      </div>
      <p className="text-center text-xs text-zinc-400">Insights powered by Beacon</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
        active ? "border-[#5e1914] text-[#5e1914]" : "border-transparent text-zinc-500 hover:text-zinc-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DateField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input type="date" defaultValue={defaultValue} className="h-11 w-full border border-zinc-200 px-3 pr-9 text-sm outline-none focus:border-[#5e1914]" />
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function MetricCard({ label, value, detail, children }: { label: string; value: string; detail: string; children: ReactNode }) {
  return (
    <section className="border border-zinc-100 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{detail}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TinyLine({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${70 - (value / max) * 55}`).join(" ");
  return (
    <svg viewBox="0 0 100 76" className="h-28 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
      <line x1="0" y1="72" x2="100" y2="72" stroke="#e4e4e7" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function StatBox({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="border border-zinc-100 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${danger ? "text-red-600" : "text-zinc-900"}`}>{value}</p>
    </div>
  );
}

function CarrierTable({ timeline = false }: { timeline?: boolean }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-zinc-400">
          <tr>
            <th className="py-3 font-medium">Carrier</th>
            <th className="py-3 font-medium">{timeline ? "Average" : "Shipments"}</th>
            <th className="py-3 font-medium">{timeline ? "50th Percentile" : "Share"}</th>
            <th className="py-3 font-medium">{timeline ? "90th Percentile" : "Weight"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {carrierRows.slice(0, timeline ? 2 : 3).map((row) => (
            <tr key={`${row.carrier}-${timeline}`}>
              <td className="py-3 font-medium text-zinc-900">{row.carrier}</td>
              <td className="py-3 text-zinc-600">{timeline ? row.average : row.shipments}</td>
              <td className="py-3 text-zinc-600">{timeline ? row.percentile : row.share}</td>
              <td className="py-3 text-zinc-600">{timeline ? "10.07 days" : row.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Chip({ label, active = false, tone }: { label: string; active?: boolean; tone?: "green" | "amber" | "red" }) {
  const toneClass = tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : tone === "red" ? "bg-red-50 text-red-700" : "bg-white text-zinc-600";
  return <span className={`border px-3 py-1.5 text-xs font-semibold ${active ? "border-[#5e1914] bg-[#f7f1ef] text-[#5e1914]" : `border-zinc-100 ${toneClass}`}`}>{label}</span>;
}

function CarrierPerformanceTable() {
  return (
    <section className="mt-5">
      <h3 className="text-sm font-semibold text-zinc-900">Carrier performance by status</h3>
      <DataTable
        headings={["Carrier", "On Track", "At Risk", "Breached", "Needs Attention", "Total"]}
        rows={[
          ["DHL Express", "2", "0", "0", "0", "2"],
          ["Parcels Express", "1", "0", "0", "0", "1"],
          ["Total", "3", "0", "0", "0", "3"],
        ]}
      />
    </section>
  );
}

function DataTable({ headings, rows }: { headings: string[]; rows: string[][] }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-[#f7f1ef] text-xs uppercase tracking-wider text-zinc-500">
          <tr>{headings.map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className={`px-4 py-3 ${index === 0 ? "font-medium text-zinc-900" : "text-zinc-600"}`}>
                  {index === 0 ? <ShieldCheck className="mr-2 inline h-4 w-4 text-[#5e1914]" /> : null}
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
