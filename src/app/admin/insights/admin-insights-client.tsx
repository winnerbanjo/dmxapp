"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Filter,
  Globe2,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

export type AdminInsightTab = "overview" | "monitoring" | "sla" | "controls";
export type LaneStatus = "On track" | "At risk" | "Needs attention";

export interface LaneItem {
  lane: string;
  carrier: string;
  shipments: number;
  tat: string;
  sla: number;
  status: LaneStatus;
  country: string;
}

export interface HubHealthItem {
  hub: string;
  location: string;
  shipments: number;
  openTasks: number;
  walletRisk: string;
  status: string;
}

export interface ControlActionItem {
  item: string;
  owner: string;
  route: string;
  priority: "High" | "Medium" | "Low";
}

export interface AdminInsightsClientProps {
  totalShipments: number;
  deliveredCount: number;
  inTransitCount: number;
  pendingCount: number;
  averageSla: number;
  lanes: LaneItem[];
  hubs: HubHealthItem[];
  initialActions: ControlActionItem[];
}

export function AdminInsightsClient({
  totalShipments,
  deliveredCount,
  inTransitCount,
  pendingCount,
  averageSla,
  lanes,
  hubs,
  initialActions,
}: AdminInsightsClientProps) {
  const [activeTab, setActiveTab] = useState<AdminInsightTab>("overview");
  const [scope, setScope] = useState("System-wide");
  const [country, setCountry] = useState("All countries");
  const [applied, setApplied] = useState("System-wide · All countries");
  const [actions, setActions] = useState(initialActions);

  const filteredLanes = useMemo(() => {
    if (country === "All countries") return lanes;
    return lanes.filter(
      (lane) =>
        lane.country.toLowerCase() === country.toLowerCase() ||
        lane.lane.toLowerCase().includes(country.toLowerCase())
    );
  }, [country, lanes]);

  const viewTotals = useMemo(() => {
    const totalCount = filteredLanes.reduce((sum, lane) => sum + lane.shipments, 0);
    const avgSla =
      filteredLanes.length > 0
        ? Math.round(filteredLanes.reduce((sum, lane) => sum + lane.sla, 0) / filteredLanes.length)
        : averageSla;
    const risks = filteredLanes.filter((lane) => lane.status !== "On track").length;
    return {
      shipments: country === "All countries" && scope === "System-wide" ? totalShipments : totalCount,
      averageSla: avgSla,
      risks,
    };
  }, [filteredLanes, country, scope, totalShipments, averageSla]);

  function resolveAction(item: string) {
    setActions((current) => current.filter((action) => action.item !== item));
  }

  return (
    <div className="mx-auto max-w-6xl bg-white px-8 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e1914]">
            Admin intelligence
          </p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-zinc-900">
            <BarChart3 className="h-7 w-7 text-[#5e1914]" />
            System Insights
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Live operational intelligence across {totalShipments.toLocaleString()} shipments, {hubs.length} network hubs, and DHL Express international routes.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-zinc-100">
        <Tab
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          icon={<BarChart3 className="h-4 w-4" />}
          label="Overview"
        />
        <Tab
          active={activeTab === "monitoring"}
          onClick={() => setActiveTab("monitoring")}
          icon={<Globe2 className="h-4 w-4" />}
          label="Package Monitoring"
        />
        <Tab
          active={activeTab === "sla"}
          onClick={() => setActiveTab("sla")}
          icon={<PackageCheck className="h-4 w-4" />}
          label="Delivery SLAs"
        />
        <Tab
          active={activeTab === "controls"}
          onClick={() => setActiveTab("controls")}
          icon={<ShieldCheck className="h-4 w-4" />}
          label={`Control Queue (${actions.length})`}
        />
      </div>

      <section className="mt-6 border border-zinc-100 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <Select
            label="Scope"
            value={scope}
            onChange={setScope}
            options={["System-wide", "Merchants", "Hubs", "Customers", "Carriers"]}
          />
          <Select
            label="Country"
            value={country}
            onChange={setCountry}
            options={["All countries", "United Kingdom", "United States", "Canada", "Ghana", "Nigeria"]}
          />
          <button
            type="button"
            onClick={() => setApplied(`${scope} · ${country}`)}
            className="mt-auto inline-flex h-11 items-center justify-center gap-2 bg-[#5e1914] px-5 text-sm font-semibold text-white hover:bg-[#4a130f]"
          >
            <Filter className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-zinc-400">
          Current view: {applied}
        </p>
      </section>

      {activeTab === "overview" ? (
        <Overview
          totals={viewTotals}
          lanes={filteredLanes}
          hubs={hubs}
          actionCount={actions.length}
          deliveredCount={deliveredCount}
          inTransitCount={inTransitCount}
        />
      ) : null}
      {activeTab === "monitoring" ? (
        <Monitoring lanes={filteredLanes} totalShipments={totalShipments} inTransitCount={inTransitCount} />
      ) : null}
      {activeTab === "sla" ? <Sla lanes={filteredLanes} averageSla={viewTotals.averageSla} /> : null}
      {activeTab === "controls" ? (
        <Controls actions={actions} resolveAction={resolveAction} />
      ) : null}
    </div>
  );
}

function Overview({
  totals,
  lanes,
  hubs,
  actionCount,
  deliveredCount,
  inTransitCount,
}: {
  totals: { shipments: number; averageSla: number; risks: number };
  lanes: LaneItem[];
  hubs: HubHealthItem[];
  actionCount: number;
  deliveredCount: number;
  inTransitCount: number;
}) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric
          label="Total shipments"
          value={totals.shipments.toLocaleString()}
          icon={<Truck className="h-5 w-5" />}
          subtext="Verified live shipments"
        />
        <Metric
          label="Average Delivery SLA"
          value={`${totals.averageSla}%`}
          icon={<PackageCheck className="h-5 w-5 text-emerald-600" />}
          subtext={`${deliveredCount.toLocaleString()} delivered successfully`}
        />
        <Metric
          label="Active In-Transit"
          value={inTransitCount.toLocaleString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone={totals.risks > 0 ? "warn" : "default"}
          subtext="Packages moving through network"
        />
        <Metric
          label="Open controls"
          value={actionCount.toString()}
          icon={<ShieldCheck className="h-5 w-5" />}
          subtext="Operational items needing review"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-zinc-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Lane Performance & Turnaround Time (TAT)</h2>
            <span className="text-xs text-zinc-400">Carrier: DHL Express</span>
          </div>
          <div className="mt-6 space-y-5">
            {lanes.map((lane) => (
              <div key={lane.lane}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-zinc-900">{lane.lane}</span>
                    <span className="ml-2 text-xs text-zinc-400">({lane.carrier})</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-600">
                    {lane.shipments.toLocaleString()} shipments · {lane.tat}
                  </span>
                </div>
                <div className="h-3 bg-zinc-100">
                  <div
                    className={`h-3 ${
                      lane.sla < 60
                        ? "bg-red-500"
                        : lane.sla < 80
                        ? "bg-amber-500"
                        : "bg-[#5e1914]"
                    }`}
                    style={{ width: `${lane.sla}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="font-semibold text-zinc-900">DMX Hub Health ({hubs.length} Active Hubs)</h2>
          <div className="mt-5 space-y-3">
            {hubs.map((hub) => (
              <div key={hub.hub} className="border border-zinc-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">{hub.hub}</p>
                    <p className="text-xs text-zinc-400">{hub.location}</p>
                  </div>
                  <Status status={hub.status} />
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  {hub.shipments.toLocaleString()} shipments · {hub.openTasks} open tasks · Wallet risk: {hub.walletRisk}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Monitoring({
  lanes,
  totalShipments,
  inTransitCount,
}: {
  lanes: LaneItem[];
  totalShipments: number;
  inTransitCount: number;
}) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
      <section className="border border-zinc-100 bg-white p-6">
        <h2 className="font-semibold text-zinc-900">Countries and Lanes</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Global air cargo routes powered by DHL Express.
        </p>
        <div className="mt-6 space-y-3">
          {lanes.map((lane) => (
            <div
              key={lane.lane}
              className="w-full border border-zinc-100 p-4 text-left hover:border-[#5e1914]"
            >
              <span className="font-medium text-zinc-900">{lane.lane}</span>
              <span className="mt-1 block text-xs text-zinc-500">
                {lane.carrier} · {lane.shipments.toLocaleString()} shipment(s)
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-zinc-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900">Global Movement Map</h2>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1">
            {inTransitCount.toLocaleString()} In Transit Globally
          </span>
        </div>
        <div className="relative mt-5 h-80 overflow-hidden border border-zinc-100 bg-[#d9eef2]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(94,25,20,0.08)_1px,transparent_1px),linear-gradient(rgba(94,25,20,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <span className="absolute left-[54%] top-[58%] grid h-12 w-12 place-items-center rounded-full bg-[#5e1914] text-sm font-bold text-white shadow-lg">
            NG
          </span>
          <span className="absolute left-[47%] top-[24%] grid h-10 w-10 place-items-center rounded-full bg-[#5e1914] text-sm font-bold text-white shadow-md">
            UK
          </span>
          <span className="absolute left-[22%] top-[34%] grid h-10 w-10 place-items-center rounded-full bg-[#5e1914] text-sm font-bold text-white shadow-md">
            US
          </span>
          <span className="absolute left-[18%] top-[20%] grid h-9 w-9 place-items-center rounded-full bg-[#5e1914] text-xs font-bold text-white shadow-md">
            CA
          </span>
          <span className="absolute left-[50%] top-[62%] grid h-9 w-9 place-items-center rounded-full bg-[#5e1914] text-xs font-bold text-white shadow-md">
            GH
          </span>
        </div>
        <LaneTable lanes={lanes} />
      </section>
    </div>
  );
}

function Sla({ lanes, averageSla }: { lanes: LaneItem[]; averageSla: number }) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="border border-zinc-100 bg-white p-6">
        <h2 className="font-semibold text-zinc-900">SLA Timeline by Route</h2>
        <LaneTable lanes={lanes} />
      </section>
      <section className="border border-zinc-100 bg-white p-6">
        <h2 className="font-semibold text-zinc-900">SLA Performance Matrix</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Overall Network SLA is at <span className="font-bold text-[#5e1914]">{averageSla}%</span> on-time delivery across active trade corridors.
        </p>
        <div className="mt-5 space-y-4">
          {lanes.map((lane) => (
            <div
              key={lane.lane}
              className="flex items-center justify-between border border-zinc-100 p-4"
            >
              <div>
                <p className="font-medium text-zinc-900">{lane.lane}</p>
                <p className="text-sm text-zinc-500">
                  {lane.carrier} · SLA: {lane.sla}% · TAT: {lane.tat}
                </p>
              </div>
              <Status status={lane.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Controls({
  actions,
  resolveAction,
}: {
  actions: ControlActionItem[];
  resolveAction: (item: string) => void;
}) {
  return (
    <section className="mt-6 border border-zinc-100 bg-white p-6">
      <h2 className="font-semibold text-zinc-900">Admin Control Queue</h2>
      <p className="mt-2 text-sm text-zinc-500">
        Review operational items affecting addresses, customs tariff classification, and international flight clearance.
      </p>
      <div className="mt-6 space-y-3">
        {actions.length === 0 ? (
          <div className="border border-emerald-100 bg-emerald-50 p-5 text-sm font-medium text-emerald-700">
            All current controls have been resolved.
          </div>
        ) : (
          actions.map((action) => (
            <div
              key={action.item}
              className="flex flex-wrap items-center justify-between gap-4 border border-zinc-100 p-4"
            >
              <div>
                <p className="font-medium text-zinc-900">{action.item}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {action.owner} · {action.route}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold ${
                    action.priority === "High"
                      ? "bg-red-50 text-red-700"
                      : action.priority === "Medium"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {action.priority}
                </span>
                <button
                  type="button"
                  onClick={() => resolveAction(action.item)}
                  className="inline-flex items-center gap-2 bg-[#5e1914] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4a130f]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Resolve
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function Tab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
        active
          ? "border-[#5e1914] text-[#5e1914]"
          : "border-transparent text-zinc-500 hover:text-zinc-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Metric({
  label,
  value,
  icon,
  tone = "default",
  subtext,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "default" | "warn";
  subtext?: string;
}) {
  return (
    <div className="border border-zinc-100 bg-white p-5">
      <div
        className={`mb-4 inline-flex h-10 w-10 items-center justify-center ${
          tone === "warn" ? "bg-amber-50 text-amber-700" : "bg-[#f7f1ef] text-[#5e1914]"
        }`}
      >
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
      {subtext ? <p className="mt-1 text-xs text-zinc-400">{subtext}</p> : null}
    </div>
  );
}

function Status({ status }: { status: string }) {
  const isHealthy = status === "On track";
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold ${
        isHealthy ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {status}
    </span>
  );
}

function LaneTable({ lanes }: { lanes: LaneItem[] }) {
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
              <td className="px-4 py-3 text-zinc-600 font-semibold">{lane.carrier}</td>
              <td className="px-4 py-3 text-zinc-600">{lane.shipments.toLocaleString()}</td>
              <td className="px-4 py-3 text-zinc-600">{lane.tat}</td>
              <td className="px-4 py-3 text-zinc-600 font-medium">{lane.sla}%</td>
              <td className="px-4 py-3">
                <Status status={lane.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
