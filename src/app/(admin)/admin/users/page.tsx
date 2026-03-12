"use client";

import { useState } from "react";

const MERCHANT_EMPLOYEES = [
  { id: "me-1", name: "Aisha Bello", group: "Merchant Employee", permission: "Booking + Tracking", branch: "Lagos HQ" },
  { id: "me-2", name: "Tunde Ade", group: "Merchant Employee", permission: "Limited Reporting", branch: "Abuja Central" },
];

const HUB_STAFF = [
  { id: "hs-1", name: "Musa Idris", group: "Hub Staff", permission: "Shipment Processing", branch: "Lagos Hub" },
  { id: "hs-2", name: "Grace Sunday", group: "Hub Staff", permission: "Delivery Confirmation", branch: "Abuja Hub" },
];

export default function AdminUserManagementPage() {
  const [notificationConfig, setNotificationConfig] = useState({
    whatsapp: true,
    urgentAlerts: true,
    statusBroadcasts: false,
  });

  return (
    <div className="mx-auto max-w-5xl bg-white px-8 py-8">
      <div className="border-b border-zinc-200 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">User Control</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Manage user structures, permission groups, status overrides, balance actions, and notification configuration.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Merchant workers → Employees</h2>
          <p className="mt-1 text-sm text-zinc-500">Separate reporting and permission group for merchant-side users.</p>
          <div className="mt-5 overflow-hidden border border-zinc-100">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="px-4 py-3 font-medium text-zinc-900">Name</th>
                  <th className="px-4 py-3 font-medium text-zinc-900">Permission</th>
                  <th className="px-4 py-3 font-medium text-zinc-900">Branch</th>
                </tr>
              </thead>
              <tbody>
                {MERCHANT_EMPLOYEES.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="px-4 py-3 text-zinc-900">{user.name}</td>
                    <td className="px-4 py-3 text-zinc-700">{user.permission}</td>
                    <td className="px-4 py-3 text-zinc-700">{user.branch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Hub workers → Staff</h2>
          <p className="mt-1 text-sm text-zinc-500">Internal operations users with distinct permissions and reporting categories.</p>
          <div className="mt-5 overflow-hidden border border-zinc-100">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="px-4 py-3 font-medium text-zinc-900">Name</th>
                  <th className="px-4 py-3 font-medium text-zinc-900">Permission</th>
                  <th className="px-4 py-3 font-medium text-zinc-900">Hub</th>
                </tr>
              </thead>
              <tbody>
                {HUB_STAFF.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="px-4 py-3 text-zinc-900">{user.name}</td>
                    <td className="px-4 py-3 text-zinc-700">{user.permission}</td>
                    <td className="px-4 py-3 text-zinc-700">{user.branch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Permission controls</h2>
          <div className="mt-5 space-y-3 text-sm">
            <label className="flex items-center justify-between gap-3"><span className="text-zinc-700">Pricing edit access</span><input type="checkbox" defaultChecked className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914]" /></label>
            <label className="flex items-center justify-between gap-3"><span className="text-zinc-700">Status override</span><input type="checkbox" defaultChecked className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914]" /></label>
            <label className="flex items-center justify-between gap-3"><span className="text-zinc-700">Balance adjustment</span><input type="checkbox" defaultChecked className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914]" /></label>
          </div>
        </section>

        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Notification config</h2>
          <div className="mt-5 space-y-3 text-sm">
            <label className="flex items-center justify-between gap-3"><span className="text-zinc-700">WhatsApp updates</span><input type="checkbox" checked={notificationConfig.whatsapp} onChange={(e) => setNotificationConfig((prev) => ({ ...prev, whatsapp: e.target.checked }))} className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914]" /></label>
            <label className="flex items-center justify-between gap-3"><span className="text-zinc-700">Urgent alert routing</span><input type="checkbox" checked={notificationConfig.urgentAlerts} onChange={(e) => setNotificationConfig((prev) => ({ ...prev, urgentAlerts: e.target.checked }))} className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914]" /></label>
            <label className="flex items-center justify-between gap-3"><span className="text-zinc-700">System status broadcasts</span><input type="checkbox" checked={notificationConfig.statusBroadcasts} onChange={(e) => setNotificationConfig((prev) => ({ ...prev, statusBroadcasts: e.target.checked }))} className="h-4 w-4 rounded-none border-zinc-300 text-[#5e1914]" /></label>
          </div>
        </section>

        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Operational controls</h2>
          <div className="mt-5 space-y-3">
            <button type="button" className="w-full border border-zinc-200 bg-white px-4 py-3 text-left text-sm text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">Open merchant balance adjuster</button>
            <button type="button" className="w-full border border-zinc-200 bg-white px-4 py-3 text-left text-sm text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">Open shipment status override</button>
            <button type="button" className="w-full border border-zinc-200 bg-white px-4 py-3 text-left text-sm text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">Open pricing permission editor</button>
          </div>
        </section>
      </div>
    </div>
  );
}
