"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Filter, Globe2, PackageCheck, ShieldCheck, Truck } from "lucide-react";

type AdminInsightTab = "overview" | "monitoring" | "sla" | "controls";
type LaneStatus = "On track" | "At risk" | "Needs attention";

const lanes = [
  { lane: "Nigeria → United Kingdom", carrier: "DHL Express", shipments: 42, tat: "4.8 days", sla: 82, status: "On track" as LaneStatus },
  { lane: "Nigeria → United States", carrier: "FedEx", shipments: 31, tat: "6.4 days", sla: 71, status: "At risk" as LaneStatus },
  { lane: "United Kingdom → Nigeria", carrier: "DMX Express", shipments: 18, tat: "5.2 days", sla: 76, status: "On track" as LaneStatus },
  { lane: "Nigeria → Australia", carrier: "Partner Courier", shipments: 9, tat: "10.1 days", sla: 45, status: "Needs attention" as LaneStatus },
];

const hubRows = [
  { hub: "Lagos Hub", openTasks: 18, shipments: 224, walletRisk: "Low", status: "On track" },
  { hub: "Abuja Hub", openTasks: 11, shipments: 180, walletRisk: "Medium", status: "On track" },
  { hub: "Port Harcourt Hub", openTasks: 7, shipments: 72, walletRisk: "Low", status: "At risk" },
];

const actionRows = [
  { item: "Approve held receiver address", owner: "Naomi Ezeh", route: "US receiver address", priority: "Medium" },
  { item: "Review slow SLA lane", owner: "Ops team", route: "Nigeria → Australia", priority: "High" },
  { item: "Refresh rate cache", owner: "Pricing engine", route: "International lanes", priority: "Low" },
];

export default function AdminInsightsPage() {
  const [activeTab, setActiveTab] = useState<AdminInsightTab>("overview");
  const [scope, setScope] = useState("System-wide");
  const [country, setCountry] = useState("All countries");
  const [applied, setApplied] = useState("System-wide · All countries");
  const [actions, setActions] = useState(actionRows);

  const totals = useMemo(() => {
    const shipments = lanes.reduce((sum, lane) => sum + lane.shipments, 0);
    const averageSla = Math.round(lanes.reduce((sum, lane) => sum + lane.sla, 0) / lanes.length);
    const risks = lanes.filter((lane) => lane.status !== "On track").length;
    return { shipments, averageSla, risks };
  }, []);

  function resolveAction(item: string) {
    setActions((current) => current.filter((action) => action.item !== item));
  }

  return (
    <div className="mx-auto max-w-6xl bg-white px-8 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e1914]">Admin intelligence</p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-zinc-900">
            <BarChart3 className="h-7 w-7 text-[#5e1914]" />
            System Insights
          </h1>
          <p className="mt-2 text-sm text-zinc-500">Monitor merchant, hub, customer, carrier, and SLA performance from one admin layer.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-zinc-100">
        <Tab active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<BarChart3 className="h-4 w-4" />} label="Overview" />
        <Tab active={activeTab === "monitoring"} onClick={() => setActiveTab("monitoring")} icon={<Globe2 className="h-4 w-4" />} label="Package Monitoring" />
        <Tab active={activeTab === "sla"} onClick={() => setActiveTab("sla")} icon={<PackageCheck className="h-4 w-4" />} label="Delivery SLAs" />
        <Tab active={activeTab === "controls"} onClick={() => setActiveTab("controls")} icon={<ShieldCheck className="h-4 w-4" />} label="Control Queue" />
      </div>

      <section className="mt-6 border border-zinc-100 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <Select label="Scope" value={scope} onChange={setScope} options={["System-wide", "Merchants", "Hubs", "Customers", "Carriers"]} />
          <Select label="Country" value={country} onChange={setCountry} options={["All countries", "Nigeria", "United Kingdom", "United States", "Australia"]} />
          <button type="button" onClick={() => setApplied(`${scope} · ${country}`)} className="mt-auto inline-flex h-11 items-center justify-center gap-2 bg-[#5e1914] px-5 text-sm font-semibold text-white hover:bg-[#4a130f]">
            <Filter className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-zinc-400">Current view: {applied}</p>
      </section>

      {activeTab === "overview" ? <Overview totals={totals} /> : null}
      {activeTab === "monitoring" ? <Monitoring /> : null}
      {activeTab === "sla" ? <Sla /> : null}
      {activeTab === "controls" ? <Controls actions={actions} resolveAction={resolveAction} /> : null}
    </div>
  );
}

function Overview({ totals }: { totals: { shipments: number; averageSla: number; risks: number } }) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Total shipments" value={totals.shipments.toString()} icon={<Truck className="h-5 w-5" />} />
        <Metric label="Average SLA" value={`${totals.averageSla}%`} icon={<PackageCheck className="h-5 w-5" />} />
        <Metric label="Risk lanes" value={totals.risks.toString()} icon={<AlertTriangle className="h-5 w-5" />} tone="warn" />
        <Metric label="Open controls" value={actionRows.length.toString()} icon={<ShieldCheck className="h-5 w-5" />} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="font-semibold text-zinc-900">Lane performance</h2>
          <div className="mt-6 space-y-5">
            {lanes.map((lane) => (
              <div key={lane.lane}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-900">{lane.lane}</span>
                  <span className="text-zinc-500">{lane.shipments} shipments · {lane.tat}</span>
                </div>
                <div className="h-3 bg-zinc-100">
                  <div className={`h-3 ${lane.sla < 60 ? "bg-red-500" : lane.sla < 75 ? "bg-amber-500" : "bg-[#5e1914]"}`} style={{ width: `${lane.sla}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="font-semibold text-zinc-900">Hub health</h2>
          <div className="mt-5 space-y-3">
            {hubRows.map((hub) => (
              <div key={hub.hub} className="border border-zinc-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-zinc-900">{hub.hub}</p>
                  <Status status={hub.status} />
                </div>
                <p className="mt-2 text-sm text-zinc-500">{hub.shipments} shipments · {hub.openTasks} open tasks · Wallet risk {hub.walletRisk}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Monitoring() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
      <section className="border border-zinc-100 bg-white p-6">
        <h2 className="font-semibold text-zinc-900">Countries and lanes</h2>
        <p className="mt-2 text-sm text-zinc-500">Low-level shipment visibility across the current operating scope.</p>
        <div className="mt-6 space-y-3">
          {lanes.map((lane) => (
            <button key={lane.lane} className="w-full border border-zinc-100 p-4 text-left hover:border-[#5e1914]">
              <span className="font-medium text-zinc-900">{lane.lane}</span>
              <span className="mt-1 block text-xs text-zinc-500">{lane.carrier} · {lane.shipments} shipment(s)</span>
            </button>
          ))}
        </div>
      </section>
      <section className="border border-zinc-100 bg-white p-6">
        <h2 className="font-semibold text-zinc-900">Global movement map</h2>
        <div className="relative mt-5 h-80 overflow-hidden border border-zinc-100 bg-[#d9eef2]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(94,25,20,0.08)_1px,transparent_1px),linear-gradient(rgba(94,25,20,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <span className="absolute left-[56%] top-[61%] grid h-12 w-12 place-items-center rounded-full bg-[#5e1914] text-sm font-bold text-white">NG</span>
          <span className="absolute left-[45%] top-[28%] grid h-10 w-10 place-items-center rounded-full bg-[#5e1914] text-sm font-bold text-white">UK</span>
          <span className="absolute left-[25%] top-[38%] grid h-10 w-10 place-items-center rounded-full bg-[#5e1914] text-sm font-bold text-white">US</span>
          <span className="absolute left-[77%] top-[72%] grid h-10 w-10 place-items-center rounded-full bg-amber-500 text-sm font-bold text-white">AU</span>
        </div>
        <LaneTable />
      </section>
    </div>
  );
}

function Sla() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="border border-zinc-100 bg-white p-6">
        <h2 className="font-semibold text-zinc-900">SLA timeline by route</h2>
        <LaneTable />
      </section>
      <section className="border border-zinc-100 bg-white p-6">
        <h2 className="font-semibold text-zinc-900">SLA actions</h2>
        <div className="mt-5 space-y-4">
          {lanes.map((lane) => (
            <div key={lane.lane} className="flex items-center justify-between border border-zinc-100 p-4">
              <div>
                <p className="font-medium text-zinc-900">{lane.lane}</p>
                <p className="text-sm text-zinc-500">{lane.carrier} · SLA {lane.sla}%</p>
              </div>
              <Status status={lane.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Controls({ actions, resolveAction }: { actions: typeof actionRows; resolveAction: (item: string) => void }) {
  return (
    <section className="mt-6 border border-zinc-100 bg-white p-6">
      <h2 className="font-semibold text-zinc-900">Admin control queue</h2>
      <p className="mt-2 text-sm text-zinc-500">Resolve operational items that affect addresses, routes, rates, and delivery health.</p>
      <div className="mt-6 space-y-3">
        {actions.length === 0 ? (
          <div className="border border-emerald-100 bg-emerald-50 p-5 text-sm font-medium text-emerald-700">All current controls are resolved.</div>
        ) : actions.map((action) => (
          <div key={action.item} className="flex flex-wrap items-center justify-between gap-4 border border-zinc-100 p-4">
            <div>
              <p className="font-medium text-zinc-900">{action.item}</p>
              <p className="mt-1 text-sm text-zinc-500">{action.owner} · {action.route}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 text-xs font-semibold ${action.priority === "High" ? "bg-red-50 text-red-700" : action.priority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-zinc-100 text-zinc-600"}`}>{action.priority}</span>
              <button type="button" onClick={() => resolveAction(action.item)} className="inline-flex items-center gap-2 bg-[#5e1914] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4a130f]">
                <CheckCircle2 className="h-4 w-4" />
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Tab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${active ? "border-[#5e1914] text-[#5e1914]" : "border-transparent text-zinc-500 hover:text-zinc-900"}`}>
      {icon}
      {label}
    </button>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Metric({ label, value, icon, tone = "default" }: { label: string; value: string; icon: ReactNode; tone?: "default" | "warn" }) {
  return (
    <div className="border border-zinc-100 bg-white p-5">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center ${tone === "warn" ? "bg-amber-50 text-amber-700" : "bg-[#f7f1ef] text-[#5e1914]"}`}>{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const risky = status !== "On track";
  return <span className={`px-2 py-1 text-xs font-semibold ${risky ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{status}</span>;
}

function LaneTable() {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-[#f7f1ef] text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">Lane</th>
            <th className="px-4 py-3 font-medium">Carrier</th>
            <th className="px-4 py-3 font-medium">Shipments</th>
            <th className="px-4 py-3 font-medium">Avg TAT</th>
            <th className="px-4 py-3 font-medium">SLA</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {lanes.map((lane) => (
            <tr key={lane.lane}>
              <td className="px-4 py-3 font-medium text-zinc-900">{lane.lane}</td>
              <td className="px-4 py-3 text-zinc-600">{lane.carrier}</td>
              <td className="px-4 py-3 text-zinc-600">{lane.shipments}</td>
              <td className="px-4 py-3 text-zinc-600">{lane.tat}</td>
              <td className="px-4 py-3 text-zinc-600">{lane.sla}%</td>
              <td className="px-4 py-3"><Status status={lane.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
