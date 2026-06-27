"use client";

import { useMemo, useState } from "react";
import { MapPin, Plus, Search, X } from "lucide-react";

type AddressRow = {
  date: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  location: string;
};

const initialAddresses: AddressRow[] = [
  { date: "27/06/2026", name: "DMX Service", phone: "+447867458320", email: "jumpus2003@yahoo.com", country: "GB", location: "3 Oriwu Street, Lekki, Lagos, Nigeria" },
  { date: "27/06/2026", name: "DMX Service", phone: "+447867458320", email: "jumpus2003@yahoo.com", country: "GB", location: "Manchester, UK Manchester, United Kingdom" },
  { date: "27/06/2026", name: "Naomi Ezeh", phone: "+14244535163", email: "csdmxng@gmail.com", country: "US", location: "672, Timm Valley Road Northeast, Atlanta, Georgia" },
  { date: "27/06/2026", name: "Trish O Luxury Brand", phone: "+2349095305021", email: "csdmxng@gmail.com", country: "NG", location: "3 Oriwu Street, Lekki, Lagos, Nigeria" },
  { date: "26/06/2026", name: "Buki Oloruntoba", phone: "+61447452245", email: "bukky73@yahoo.com", country: "AU", location: "98A, Ringarooma Way, Willetton, Australia" },
];

const flagByCountry: Record<string, string> = {
  NG: "🇳🇬",
  GB: "🇬🇧",
  US: "🇺🇸",
  AU: "🇦🇺",
};

export default function MerchantAddressBookPage() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<AddressRow>({
    date: "27/06/2026",
    name: "",
    phone: "",
    email: "",
    country: "NG",
    location: "",
  });

  const filteredAddresses = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return addresses;
    return addresses.filter((address) =>
      [address.name, address.phone, address.email, address.location, address.country].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [addresses, query]);

  function saveAddress() {
    if (!draft.name.trim() || !draft.location.trim()) return;
    setAddresses((current) => [draft, ...current]);
    setDraft({ date: "27/06/2026", name: "", phone: "", email: "", country: "NG", location: "" });
    setModalOpen(false);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e1914]">Merchant tools</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Addresses</h1>
          <p className="mt-2 text-sm text-zinc-500">Keep sender, receiver, hub, and branch addresses ready for faster bookings.</p>
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

      <section className="mt-8 border border-zinc-100 bg-white p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🇳🇬</span>
          <div>
            <p className="font-semibold text-zinc-900">3 Oriwu Street, Lekki, Nigeria, Lekki, Lagos, Nigeria</p>
            <p className="mt-1 text-sm text-zinc-500">Default merchant address</p>
            <p className="mt-3 text-sm font-medium text-zinc-900">106104</p>
            <p className="text-xs text-zinc-400">Zip Code</p>
          </div>
          <button type="button" className="ml-auto hidden bg-zinc-900 px-4 py-2 text-sm font-semibold text-white sm:block">
            Edit Your Default Address
          </button>
        </div>
      </section>

      <section className="mt-8 border border-zinc-100 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 p-5">
          <h2 className="font-semibold text-zinc-900">All Addresses</h2>
          <label className="relative block w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="h-11 w-full border border-zinc-100 pl-10 pr-3 text-sm outline-none focus:border-[#5e1914]"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Phone No</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredAddresses.map((address, index) => (
                <tr key={`${address.name}-${address.location}-${index}`} className="hover:bg-[#f7f1ef]">
                  <td className="px-5 py-4 text-zinc-600">{address.date}</td>
                  <td className="px-5 py-4 font-medium text-zinc-900">{address.name}</td>
                  <td className="px-5 py-4 text-zinc-600">{address.phone}</td>
                  <td className="px-5 py-4 text-zinc-600">{address.email}</td>
                  <td className="px-5 py-4 text-zinc-600">
                    <span className="mr-2">{flagByCountry[address.country] ?? "📍"}</span>
                    {address.location}
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
                <h2 className="text-xl font-semibold text-zinc-900">Create Address</h2>
                <p className="mt-1 text-sm text-zinc-500">Add a saved address for sender, receiver, or hub booking use.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <Field label="Name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
              <Field label="Phone" value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} />
              <Field label="Email" value={draft.email} onChange={(value) => setDraft({ ...draft, email: value })} />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Country</span>
                <select
                  value={draft.country}
                  onChange={(event) => setDraft({ ...draft, country: event.target.value })}
                  className="h-11 w-full border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]"
                >
                  <option value="NG">Nigeria</option>
                  <option value="GB">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="AU">Australia</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Address</span>
                <textarea
                  value={draft.location}
                  onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                  className="min-h-24 w-full border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#5e1914]"
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-zinc-100 p-6">
              <button type="button" onClick={() => setModalOpen(false)} className="border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700">
                Cancel
              </button>
              <button type="button" onClick={saveAddress} className="inline-flex items-center gap-2 bg-[#5e1914] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4a130f]">
                <MapPin className="h-4 w-4" />
                Save Address
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]"
      />
    </label>
  );
}
