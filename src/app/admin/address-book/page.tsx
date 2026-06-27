"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Building2, MapPin, Plus, Search, ShieldCheck, ToggleLeft, ToggleRight, X } from "lucide-react";

type AddressScope = "Merchant" | "Hub" | "Customer" | "Branch";
type AddressStatus = "Active" | "Review";

type AdminAddress = {
  id: string;
  scope: AddressScope;
  owner: string;
  contact: string;
  email: string;
  country: string;
  location: string;
  status: AddressStatus;
};

const initialAddresses: AdminAddress[] = [
  { id: "addr-001", scope: "Merchant", owner: "DMX Service", contact: "+447867458320", email: "jumpus2003@yahoo.com", country: "GB", location: "Manchester, United Kingdom", status: "Active" },
  { id: "addr-002", scope: "Merchant", owner: "Trish O Luxury Brand", contact: "+2349095305021", email: "csdmxng@gmail.com", country: "NG", location: "3 Oriwu Street, Lekki, Lagos, Nigeria", status: "Active" },
  { id: "addr-003", scope: "Hub", owner: "Lagos Hub", contact: "+2349010001000", email: "lagos-hub@dmx.com", country: "NG", location: "32 Awolowo Road, Ikoyi Lagos", status: "Active" },
  { id: "addr-004", scope: "Customer", owner: "Naomi Ezeh", contact: "+14244535163", email: "csdmxng@gmail.com", country: "US", location: "672 Timm Valley Road Northeast, Atlanta, Georgia", status: "Review" },
  { id: "addr-005", scope: "Branch", owner: "Victoria Island Dropoff", contact: "+2349010002000", email: "vi-branch@dmx.com", country: "NG", location: "Plot 1302A, Akin Adesola Street, Victoria Island", status: "Active" },
];

const flagByCountry: Record<string, string> = {
  NG: "🇳🇬",
  GB: "🇬🇧",
  US: "🇺🇸",
};

export default function AdminAddressBookPage() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"All" | AddressScope>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<AdminAddress>({
    id: "addr-new",
    scope: "Merchant",
    owner: "",
    contact: "",
    email: "",
    country: "NG",
    location: "",
    status: "Active",
  });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return addresses.filter((address) => {
      const matchesScope = scope === "All" || address.scope === scope;
      const matchesQuery = !needle || [address.scope, address.owner, address.contact, address.email, address.country, address.location, address.status].some((value) => value.toLowerCase().includes(needle));
      return matchesScope && matchesQuery;
    });
  }, [addresses, query, scope]);

  const totals = useMemo(() => {
    return {
      all: addresses.length,
      merchants: addresses.filter((address) => address.scope === "Merchant").length,
      hubs: addresses.filter((address) => address.scope === "Hub" || address.scope === "Branch").length,
      review: addresses.filter((address) => address.status === "Review").length,
    };
  }, [addresses]);

  function toggleStatus(id: string) {
    setAddresses((current) =>
      current.map((address) =>
        address.id === id ? { ...address, status: address.status === "Active" ? "Review" : "Active" } : address,
      ),
    );
  }

  function saveAddress() {
    if (!draft.owner.trim() || !draft.location.trim()) return;
    setAddresses((current) => [{ ...draft, id: `addr-${Date.now()}` }, ...current]);
    setDraft({ id: "addr-new", scope: "Merchant", owner: "", contact: "", email: "", country: "NG", location: "", status: "Active" });
    setModalOpen(false);
  }

  return (
    <div className="mx-auto max-w-6xl bg-white px-8 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e1914]">System control</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Global Address Book</h1>
          <p className="mt-2 text-sm text-zinc-500">Control merchant, hub, branch, and customer addresses from one admin view.</p>
        </div>
        <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 bg-[#5e1914] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4a130f]">
          <Plus className="h-4 w-4" />
          Create Address
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat label="All addresses" value={totals.all} icon={<MapPin className="h-5 w-5" />} />
        <Stat label="Merchant addresses" value={totals.merchants} icon={<Building2 className="h-5 w-5" />} />
        <Stat label="Hub and branch" value={totals.hubs} icon={<ShieldCheck className="h-5 w-5" />} />
        <Stat label="Needs review" value={totals.review} tone="warn" icon={<ToggleLeft className="h-5 w-5" />} />
      </div>

      <section className="mt-8 border border-zinc-100 bg-white">
        <div className="grid gap-4 border-b border-zinc-100 p-5 md:grid-cols-[220px_1fr]">
          <select value={scope} onChange={(event) => setScope(event.target.value as "All" | AddressScope)} className="h-11 border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]">
            <option value="All">All address types</option>
            <option value="Merchant">Merchants</option>
            <option value="Hub">Hubs</option>
            <option value="Branch">Branches</option>
            <option value="Customer">Customers</option>
          </select>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search owner, email, country, location, or status" className="h-11 w-full border border-zinc-200 pl-10 pr-3 text-sm outline-none focus:border-[#5e1914]" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Owner</th>
                <th className="px-5 py-4 font-medium">Contact</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Location</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((address) => (
                <tr key={address.id} className="hover:bg-[#f7f1ef]">
                  <td className="px-5 py-4 font-medium text-zinc-900">{address.scope}</td>
                  <td className="px-5 py-4 text-zinc-900">{address.owner}</td>
                  <td className="px-5 py-4 text-zinc-600">{address.contact}</td>
                  <td className="px-5 py-4 text-zinc-600">{address.email}</td>
                  <td className="px-5 py-4 text-zinc-600"><span className="mr-2">{flagByCountry[address.country] ?? "📍"}</span>{address.location}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold ${address.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{address.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => toggleStatus(address.id)} className="inline-flex items-center gap-2 border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">
                      {address.status === "Active" ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {address.status === "Active" ? "Mark review" : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-zinc-100 p-6">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">Create System Address</h2>
                <p className="mt-1 text-sm text-zinc-500">Add an address to any operational part of the platform.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close"><X className="h-5 w-5 text-zinc-500" /></button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-medium text-zinc-700">Type</span>
                <select value={draft.scope} onChange={(event) => setDraft({ ...draft, scope: event.target.value as AddressScope })} className="h-11 w-full border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]">
                  <option>Merchant</option>
                  <option>Hub</option>
                  <option>Branch</option>
                  <option>Customer</option>
                </select>
              </label>
              <Field label="Owner" value={draft.owner} onChange={(value) => setDraft({ ...draft, owner: value })} />
              <Field label="Contact" value={draft.contact} onChange={(value) => setDraft({ ...draft, contact: value })} />
              <Field label="Email" value={draft.email} onChange={(value) => setDraft({ ...draft, email: value })} />
              <Field label="Country code" value={draft.country} onChange={(value) => setDraft({ ...draft, country: value.toUpperCase() })} />
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Location</span>
                <textarea value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} className="min-h-24 w-full border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#5e1914]" />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-zinc-100 p-6">
              <button type="button" onClick={() => setModalOpen(false)} className="border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700">Cancel</button>
              <button type="button" onClick={saveAddress} className="bg-[#5e1914] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4a130f]">Save Address</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, icon, tone = "default" }: { label: string; value: number; icon: ReactNode; tone?: "default" | "warn" }) {
  return (
    <div className="border border-zinc-100 bg-white p-5">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center ${tone === "warn" ? "bg-amber-50 text-amber-700" : "bg-[#f7f1ef] text-[#5e1914]"}`}>{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]" />
    </label>
  );
}
