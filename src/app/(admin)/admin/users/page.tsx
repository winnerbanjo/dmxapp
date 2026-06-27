"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { CheckCircle2, LockKeyhole, Plus, Search, Shield, UserCog } from "lucide-react";

type PermissionKey =
  | "dashboard.view"
  | "booking.create"
  | "booking.override"
  | "shipments.manage"
  | "pricing.manage"
  | "wallet.adjust"
  | "reports.view"
  | "users.manage"
  | "settings.manage";

type Role = {
  id: string;
  name: string;
  scope: string;
  description: string;
  locked?: boolean;
  permissions: PermissionKey[];
};

type UserRecord = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  workspace: string;
  status: "Active" | "Suspended";
  lastSeen: string;
};

const permissionGroups: { title: string; items: { key: PermissionKey; label: string; detail: string }[] }[] = [
  {
    title: "Operations",
    items: [
      { key: "dashboard.view", label: "View dashboards", detail: "Can see operational summaries and KPIs." },
      { key: "booking.create", label: "Create bookings", detail: "Can create shipments and waybills." },
      { key: "booking.override", label: "Override bookings", detail: "Can edit booking pricing, courier, and status decisions." },
      { key: "shipments.manage", label: "Manage shipments", detail: "Can update shipment status and resolve exceptions." },
    ],
  },
  {
    title: "Commercial",
    items: [
      { key: "pricing.manage", label: "Manage pricing", detail: "Can edit rate cards, zones, markups, and courier costs." },
      { key: "wallet.adjust", label: "Adjust wallets", detail: "Can credit, debit, or correct balances." },
      { key: "reports.view", label: "View reports", detail: "Can access revenue, SLA, merchant, and hub reports." },
    ],
  },
  {
    title: "Administration",
    items: [
      { key: "users.manage", label: "Manage users", detail: "Can invite, suspend, assign roles, and edit permissions." },
      { key: "settings.manage", label: "System settings", detail: "Can change account, notification, and platform settings." },
    ],
  },
];

const allPermissions = permissionGroups.flatMap((group) => group.items.map((item) => item.key));

const initialRoles: Role[] = [
  {
    id: "owner",
    name: "Owner / Super Admin",
    scope: "System",
    description: "Full platform access across admin, merchant, hub, pricing, and user control.",
    locked: true,
    permissions: allPermissions,
  },
  {
    id: "ops-manager",
    name: "Operations Manager",
    scope: "Admin",
    description: "Runs bookings, shipments, courier decisions, hubs, and exception handling.",
    permissions: ["dashboard.view", "booking.create", "booking.override", "shipments.manage", "reports.view"],
  },
  {
    id: "finance",
    name: "Finance",
    scope: "Admin",
    description: "Controls wallet adjustments, pricing visibility, and commercial reporting.",
    permissions: ["dashboard.view", "pricing.manage", "wallet.adjust", "reports.view"],
  },
  {
    id: "hub-lead",
    name: "Hub Lead",
    scope: "Hub",
    description: "Manages hub intake, package processing, and shipment updates.",
    permissions: ["dashboard.view", "booking.create", "shipments.manage"],
  },
  {
    id: "merchant-staff",
    name: "Merchant Staff",
    scope: "Merchant",
    description: "Creates bookings and views shipment activity for a merchant account.",
    permissions: ["dashboard.view", "booking.create", "reports.view"],
  },
];

const initialUsers: UserRecord[] = [
  { id: "u-1", name: "Admin Lead", email: "admin@dmx.com", roleId: "owner", workspace: "DMX Admin", status: "Active", lastSeen: "Today, 2:41 PM" },
  { id: "u-2", name: "Musa Idris", email: "musa@dmx.com", roleId: "hub-lead", workspace: "Lagos Hub", status: "Active", lastSeen: "Today, 1:28 PM" },
  { id: "u-3", name: "Aisha Bello", email: "aisha@merchant.com", roleId: "merchant-staff", workspace: "Trish O Luxury Brand", status: "Active", lastSeen: "Yesterday" },
  { id: "u-4", name: "Finance Desk", email: "finance@dmx.com", roleId: "finance", workspace: "DMX Admin", status: "Suspended", lastSeen: "Jun 25, 2026" },
];

export default function AdminUserManagementPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [selectedRoleId, setSelectedRoleId] = useState("ops-manager");
  const [query, setQuery] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", workspace: "DMX Admin", roleId: "ops-manager" });

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];
  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) =>
      [user.name, user.email, user.workspace, roles.find((role) => role.id === user.roleId)?.name ?? ""].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [query, roles, users]);

  const activeUsers = users.filter((user) => user.status === "Active").length;
  const suspendedUsers = users.length - activeUsers;

  function togglePermission(permission: PermissionKey) {
    if (selectedRole.locked) return;
    setRoles((current) =>
      current.map((role) => {
        if (role.id !== selectedRole.id) return role;
        const hasPermission = role.permissions.includes(permission);
        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter((item) => item !== permission)
            : [...role.permissions, permission],
        };
      }),
    );
  }

  function updateUserRole(userId: string, roleId: string) {
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, roleId } : user)));
  }

  function toggleUserStatus(userId: string) {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, status: user.status === "Active" ? "Suspended" : "Active" } : user,
      ),
    );
  }

  function createUser() {
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    setUsers((current) => [
      {
        id: `u-${Date.now()}`,
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        workspace: newUser.workspace.trim() || "DMX Admin",
        roleId: newUser.roleId,
        status: "Active",
        lastSeen: "Invite pending",
      },
      ...current,
    ]);
    setNewUser({ name: "", email: "", workspace: "DMX Admin", roleId: "ops-manager" });
  }

  return (
    <div className="mx-auto max-w-6xl bg-white px-8 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e1914]">Access control</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Roles & Permissions</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Manage who can view, create, override, price, report, and administer every part of the DMX platform.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric label="Roles" value={roles.length.toString()} icon={<Shield className="h-5 w-5" />} />
        <Metric label="Users" value={users.length.toString()} icon={<UserCog className="h-5 w-5" />} />
        <Metric label="Active" value={activeUsers.toString()} icon={<CheckCircle2 className="h-5 w-5" />} />
        <Metric label="Suspended" value={suspendedUsers.toString()} icon={<LockKeyhole className="h-5 w-5" />} tone="warn" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="border border-zinc-100 bg-white">
          <div className="border-b border-zinc-100 p-5">
            <h2 className="font-semibold text-zinc-900">Role templates</h2>
            <p className="mt-1 text-sm text-zinc-500">Select a role to edit its permission matrix.</p>
          </div>
          <div className="divide-y divide-zinc-100">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full p-5 text-left transition-colors ${
                  selectedRole.id === role.id ? "bg-[#f7f1ef]" : "bg-white hover:bg-zinc-50"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-zinc-900">{role.name}</p>
                  <span className="border border-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-500">{role.scope}</span>
                </div>
                <p className="mt-2 text-sm leading-5 text-zinc-500">{role.description}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#5e1914]">
                  {role.permissions.length} permissions
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="border border-zinc-100 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{selectedRole.name}</h2>
              <p className="mt-1 text-sm text-zinc-500">{selectedRole.description}</p>
            </div>
            {selectedRole.locked ? (
              <span className="inline-flex items-center gap-2 bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-600">
                <LockKeyhole className="h-4 w-4" />
                Locked owner role
              </span>
            ) : null}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            {permissionGroups.map((group) => (
              <div key={group.title} className="border border-zinc-100">
                <div className="bg-zinc-50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-zinc-900">{group.title}</h3>
                </div>
                <div className="divide-y divide-zinc-100">
                  {group.items.map((permission) => {
                    const enabled = selectedRole.permissions.includes(permission.key);
                    return (
                      <button
                        key={permission.key}
                        type="button"
                        disabled={selectedRole.locked}
                        onClick={() => togglePermission(permission.key)}
                        className={`w-full p-4 text-left ${enabled ? "bg-[#f7f1ef]" : "bg-white"} ${selectedRole.locked ? "cursor-not-allowed" : "hover:bg-zinc-50"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-zinc-900">{permission.label}</p>
                          <span className={`h-5 w-9 border p-0.5 ${enabled ? "border-[#5e1914] bg-[#5e1914]" : "border-zinc-200 bg-zinc-100"}`}>
                            <span className={`block h-3.5 w-3.5 bg-white transition-transform ${enabled ? "translate-x-4" : ""}`} />
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-zinc-500">{permission.detail}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 border border-zinc-100 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">User assignments</h2>
            <p className="mt-1 text-sm text-zinc-500">Assign roles by admin, hub, merchant, or finance workspace.</p>
          </div>
          <label className="relative block w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users or workspace"
              className="h-11 w-full border border-zinc-200 pl-10 pr-3 text-sm outline-none focus:border-[#5e1914]"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 border border-zinc-100 bg-zinc-50 p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <input value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} placeholder="Name" className="h-11 border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]" />
          <input value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} placeholder="Email" className="h-11 border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]" />
          <select value={newUser.roleId} onChange={(event) => setNewUser({ ...newUser, roleId: event.target.value })} className="h-11 border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]">
            {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
          </select>
          <button type="button" onClick={createUser} className="inline-flex h-11 items-center justify-center gap-2 bg-[#5e1914] px-4 text-sm font-semibold text-white hover:bg-[#4a130f]">
            <Plus className="h-4 w-4" />
            Invite
          </button>
          <input value={newUser.workspace} onChange={(event) => setNewUser({ ...newUser, workspace: event.target.value })} placeholder="Workspace" className="h-11 border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914] md:col-span-3" />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-medium">User</th>
                <th className="px-5 py-4 font-medium">Workspace</th>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Last seen</th>
                <th className="px-5 py-4 font-medium">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900">{user.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-zinc-600">{user.workspace}</td>
                  <td className="px-5 py-4">
                    <select value={user.roleId} onChange={(event) => updateUserRole(user.id, event.target.value)} className="h-10 border border-zinc-200 px-3 text-sm outline-none focus:border-[#5e1914]">
                      {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold ${user.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{user.status}</span>
                  </td>
                  <td className="px-5 py-4 text-zinc-600">{user.lastSeen}</td>
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => toggleUserStatus(user.id)} className="border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">
                      {user.status === "Active" ? "Suspend" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 border border-zinc-100 bg-white p-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Access audit</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "Owner role protected from edits",
            "Ops Manager granted booking override",
            "Finance Desk suspended by Admin Lead",
          ].map((item) => (
            <div key={item} className="border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-700">{item}</div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, icon, tone = "default" }: { label: string; value: string; icon: ReactNode; tone?: "default" | "warn" }) {
  return (
    <div className="border border-zinc-100 bg-white p-5">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center ${tone === "warn" ? "bg-red-50 text-red-700" : "bg-[#f7f1ef] text-[#5e1914]"}`}>{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}
