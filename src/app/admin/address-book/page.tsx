"use client";

import type { ReactNode } from "react";
import { useMemo, useState, useEffect } from "react";
import { Building2, Loader2, MapPin, Plus, Search, ShieldCheck, ToggleLeft, ToggleRight, X } from "lucide-react";

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

const defaultHubAddresses: AdminAddress[] = [
  {
    id: "hub-lagos",
    scope: "Hub",
    owner: "Lagos Lekki Hub (Headquarters)",
    contact: "+2349091384828",
    email: "operations@dmxlogistics.com.ng",
    country: "NG",
    location: "3, Oriwu Street, Lekki Phase I, Lagos, Nigeria",
    status: "Active",
  },
  {
    id: "hub-abuja",
    scope: "Hub",
    owner: "Abuja Wuse Hub",
    contact: "+2349095305021",
    email: "abuja@dmxlogistics.com.ng",
    country: "NG",
    location: "Plot 342, Aminu Kano Crescent, Wuse 2, Abuja, Nigeria",
    status: "Active",
  },
  {
    id: "hub-ilorin",
    scope: "Branch",
    owner: "Ilorin Kwara Dropoff",
    contact: "+2347084856884",
    email: "ilorin@dmxlogistics.com.ng",
    country: "NG",
    location: "Yusuf Idiaro Road, Oko Erin, Ilorin, Kwara State",
    status: "Active",
  },
];

const flagByCountry: Record<string, string> = {
  NG: "🇳🇬",
  GB: "🇬🇧",
  US: "🇺🇸",
  CA: "🇨🇦",
  DE: "🇩🇪",
  FR: "🇫🇷",
};

export default function AdminAddressBookPage() {
  const [addresses, setAddresses] = useState<AdminAddress[]>(defaultHubAddresses);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function loadRealAddresses() {
      try {
        const [branchesRes, contactsRes] = await Promise.all([
          fetch("/api/legacy/resources/branches?limit=10").catch(() => null),
          fetch("/api/legacy/resources/contacts?limit=50").catch(() => null),
        ]);

        const loaded: AdminAddress[] = [];

        if (branchesRes && branchesRes.ok) {
          const bData = await branchesRes.json();
          if (Array.isArray(bData.items)) {
            for (const b of bData.items) {
              loaded.push({
                id: String(b._id),
                scope: "Hub",
                owner: `${b.Name || "Branch"} Hub`,
                contact: "+2349091384828",
                email: "operations@dmxlogistics.com.ng",
                country: "NG",
                location: [b.Address, b.Suburb, b.City, b.State].filter(Boolean).join(", "),
                status: "Active",
              });
            }
          }
        }

        if (contactsRes && contactsRes.ok) {
          const cData = await contactsRes.json();
          if (Array.isArray(cData.items)) {
            for (const c of cData.items) {
              loaded.push({
                id: String(c._id),
                scope: c.Company ? "Merchant" : "Customer",
                owner: c.Name || c.Company || "DMX Contact",
                contact: c.Telephone || "—",
                email: c.EmailAddress || "—",
                country: "NG",
                location: [c.Address, c.City, c.State].filter(Boolean).join(", "),
                status: "Active",
              });
            }
          }
        }

        if (loaded.length > 0) {
          setAddresses(loaded);
        }
      } catch (err) {
        console.error("Error loading real addresses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRealAddresses();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return addresses.filter((address) => {
      const matchesScope = scope === "All" || address.scope === scope;
      const matchesQuery =
        !needle ||
        [
          address.scope,
          address.owner,
          address.contact,
          address.email,
          address.country,
          address.location,
          address.status,
        ].some((value) => value.toLowerCase().includes(needle));
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
        address.id === id
          ? { ...address, status: address.status === "Active" ? "Review" : "Active" }
          : address
      )
    );
  }

  function saveAddress() {
    if (!draft.owner.trim() || !draft.location.trim()) return;
    setAddresses((current) => [{ ...draft, id: `addr-${Date.now()}` }, ...current]);
    setDraft({
      id: "addr-new",
      scope: "Merchant",
      owner: "",
      contact: "",
      email: "",
      country: "NG",
      location: "",
      status: "Active",
    });
    setModalOpen(false);
  }

  return (
    <div className="mx-auto max-w-6xl bg-white px-8 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e1914]">System control</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Global Address Book</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Live database of verified merchant, hub, branch, and destination addresses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#5e1914] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4a130f]"
        >
          <Plus className="h-4 w-4" />
          Create Address
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat label="Total Addresses" value={totals.all} icon={<MapPin className="h-5 w-5" />} />
        <Stat label="Merchant addresses" value={totals.merchants} icon={<Building2 className="h-5 w-5" />} />
        <Stat label="Hub and branch" value={totals.hubs} icon={<ShieldCheck className="h-5 w-5" />} />
        <Stat label="Needs review" value={totals.review} tone="warn" icon={<ToggleLeft className="h-5 w-5" />} />
      </div>

      <section className="mt-8 border border-zinc-100 bg-white">
        <div className="grid gap-4 border-b border-zinc-100 p-5 md:grid-cols-[220px_1fr]">
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value as "All" | AddressScope)}
            className="h-11 border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]"
          >
            <option value="All">All address types</option>
            <option value="Merchant">Merchants</option>
            <option value="Hub">Hubs</option>
            <option value="Branch">Branches</option>
            <option value="Customer">Customers</option>
          </select>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search owner, email, country, location, or status..."
              className="h-11 w-full border border-zinc-200 pl-10 pr-3 text-sm outline-none focus:border-[#5e1914]"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#5e1914]" />
              Loading real addresses from database...
            </div>
          ) : (
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#f6f1ea] text-xs font-semibold uppercase tracking-wider text-zinc-600">
                <tr>
                  <th className="px-5 py-3">Owner / Contact</th>
                  <th className="px-5 py-3">Scope</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Country</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((address) => (
                  <tr key={address.id} className="hover:bg-zinc-50/70">
                    <td className="px-5 py-4 font-semibold text-zinc-900">
                      {address.owner}
                      <span className="block text-xs font-normal text-zinc-500">{address.contact}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block border px-2.5 py-1 text-xs font-semibold ${
                          address.scope === "Hub" || address.scope === "Branch"
                            ? "border-sky-200 bg-sky-50 text-sky-800"
                            : "border-zinc-200 bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        {address.scope}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-600 max-w-[280px] truncate">{address.location}</td>
                    <td className="px-5 py-4 text-xs font-semibold text-zinc-800">
                      {flagByCountry[address.country] || "🌐"} {address.country}
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500">{address.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block border px-2.5 py-1 text-xs font-semibold ${
                          address.status === "Active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        {address.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(address.id)}
                        className="text-zinc-600 hover:text-zinc-900"
                      >
                        {address.status === "Active" ? (
                          <ToggleRight className="h-6 w-6 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-zinc-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 p-6">
              <h2 className="text-xl font-semibold text-zinc-900">Create System Address</h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Scope</span>
                <select
                  value={draft.scope}
                  onChange={(e) => setDraft({ ...draft, scope: e.target.value as AddressScope })}
                  className="w-full border border-zinc-200 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="Merchant">Merchant</option>
                  <option value="Customer">Customer</option>
                  <option value="Hub">Hub</option>
                  <option value="Branch">Branch</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Owner / Company Name</span>
                <input
                  value={draft.owner}
                  onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
                  className="w-full border border-zinc-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Address Location</span>
                <input
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  className="w-full border border-zinc-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Phone Contact</span>
                <input
                  value={draft.contact}
                  onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
                  className="w-full border border-zinc-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Email Address</span>
                <input
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  className="w-full border border-zinc-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 p-6">
              <button
                onClick={() => setModalOpen(false)}
                className="border border-zinc-200 px-4 py-3 font-semibold text-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={saveAddress}
                className="bg-[#5e1914] px-4 py-3 font-semibold text-white hover:bg-[#4a130f]"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone?: "neutral" | "warn";
}) {
  return (
    <div className="border border-zinc-100 bg-white p-5">
      <div className="flex items-center justify-between text-zinc-500">
        <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
        <span className={tone === "warn" ? "text-amber-600" : "text-[#5e1914]"}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}
