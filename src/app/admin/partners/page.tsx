"use client";

import { useState } from "react";
import Image from "next/image";
import { DEMO_PARTNERS, type Partner, type ServiceType } from "@/data/partners-demo";
import { Plus, Mail, Key, Globe, Edit2 } from "lucide-react";

const SERVICE_LABELS: Record<ServiceType, string> = {
  domestic: "Domestic",
  international: "International",
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>(DEMO_PARTNERS);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    apiKey: "",
    serviceType: "domestic" as ServiceType,
    trackingUrl: "",
  });

  function resetForm() {
    setForm({
      name: "",
      contact: "",
      apiKey: "",
      serviceType: "domestic",
      trackingUrl: "",
    });
    setShowForm(false);
    setEditing(null);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editing) {
      setPartners((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                name: form.name,
                contact: form.contact,
                apiKey: form.apiKey || undefined,
                serviceType: form.serviceType,
                trackingUrl: form.trackingUrl || undefined,
              }
            : p
        )
      );
    } else {
      const newPartner: Partner = {
        id: `partner-${Date.now()}`,
        name: form.name,
        contact: form.contact,
        apiKey: form.apiKey || undefined,
        serviceType: form.serviceType,
        trackingUrl: form.trackingUrl || undefined,
        isInternal: false,
      };
      setPartners((prev) => [...prev, newPartner]);
    }
    resetForm();
  }

  function handleEdit(p: Partner) {
    if (p.isInternal) return;
    setEditing(p);
    setForm({
      name: p.name,
      contact: p.contact,
      apiKey: p.apiKey ?? "",
      serviceType: p.serviceType,
      trackingUrl: p.trackingUrl ?? "",
    });
    setShowForm(true);
  }

  return (
    <div className="mx-auto max-w-5xl bg-white px-8 py-8">
      <header className="flex items-center justify-between border-b border-zinc-200 pb-6">
        <div className="flex items-center gap-4">
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
            <h1 className="font-sans text-3xl font-semibold tracking-tighter text-zinc-900">
              Partner Management
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage 3PL partners: DHL, GIG, FedEx, or Internal Fleet.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 border border-[#5e1914] bg-[#5e1914] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4a130f]"
        >
          <Plus className="h-4 w-4" />
          Add New Partner
        </button>
      </header>

      {showForm && (
        <div className="mt-8 border border-zinc-200 bg-white p-8">
          <h2 className="font-sans text-lg font-semibold tracking-tighter text-zinc-900">
            {editing ? "Edit Partner" : "New Partner"}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Partner Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. DHL"
                className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                <Mail className="h-3.5 w-3.5" />
                Contact
              </label>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                placeholder="partners@example.com"
                className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                <Key className="h-3.5 w-3.5" />
                API Key (optional)
              </label>
              <input
                type="password"
                value={form.apiKey}
                onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                placeholder="••••••••"
                className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Service Type
              </label>
              <select
                value={form.serviceType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, serviceType: e.target.value as ServiceType }))
                }
                className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
              >
                <option value="domestic">Domestic</option>
                <option value="international">International</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                <Globe className="h-3.5 w-3.5" />
                Tracking URL (optional)
              </label>
              <input
                type="url"
                value={form.trackingUrl}
                onChange={(e) => setForm((f) => ({ ...f, trackingUrl: e.target.value }))}
                placeholder="https://partner.com/track?ref="
                className="mt-2 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="border border-[#5e1914] bg-[#5e1914] px-6 py-2 text-sm font-medium text-white hover:bg-[#4a130f]"
            >
              {editing ? "Save" : "Add Partner"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="border border-zinc-200 bg-white px-6 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 overflow-hidden border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                Partner
              </th>
              <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                Contact
              </th>
              <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                Service
              </th>
              <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                Type
              </th>
              <th className="px-8 py-5 font-medium font-sans tracking-tighter text-zinc-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 last:border-b-0">
                <td className="px-8 py-5 font-medium text-zinc-900">
                  {p.name}
                  {p.isInternal && (
                    <span className="ml-2 inline-block border border-[#5e1914] bg-[#5e1914]/10 px-2 py-0.5 text-xs font-medium text-[#5e1914]">
                      Internal
                    </span>
                  )}
                </td>
                <td className="px-8 py-5 text-zinc-600">{p.contact}</td>
                <td className="px-8 py-5 text-zinc-600">
                  {SERVICE_LABELS[p.serviceType]}
                </td>
                <td className="px-8 py-5 text-zinc-600">
                  {p.trackingUrl ? (
                    <span className="text-[#5e1914]">Track via Partner</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-8 py-5">
                  {!p.isInternal && (
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="flex items-center gap-1 text-zinc-600 hover:text-[#5e1914]"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
