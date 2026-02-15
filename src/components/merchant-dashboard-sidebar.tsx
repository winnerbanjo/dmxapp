"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Wallet,
  Settings,
  LogOut,
  Users,
} from "lucide-react";
import { logoutMerchant } from "@/app/auth/logout/actions";

const nav = [
  { href: "/merchant/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/merchant/booking", label: "Booking", icon: Package },
  { href: "/merchant/dashboard/shipments", label: "Shipments", icon: Package },
  { href: "/merchant/dashboard/customers", label: "Customers", icon: Users },
  { href: "/merchant/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/merchant/dashboard/settings", label: "Settings", icon: Settings },
];

export function MerchantDashboardSidebar({
  email,
  isAdmin,
}: {
  email: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 flex-col border-r border-zinc-100 bg-zinc-50 md:flex">
      <div className="flex h-20 items-center border-b border-zinc-100 px-8">
        <Link
          href="/merchant/dashboard"
          className="text-xl font-bold tracking-[0.2em] text-[#5e1914]"
        >
          DMX
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-6">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 border-l-[3px] px-5 py-3.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-l-[#5e1914] bg-white text-[#5e1914]"
                  : "border-l-transparent text-zinc-600 hover:bg-white/80 hover:text-zinc-900"
              }`}
            >
              <Icon
                strokeWidth={1}
                className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-[#5e1914]" : "text-zinc-500"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin/merchants"
            className="flex items-center gap-4 border-l-[3px] border-l-transparent px-5 py-3.5 text-sm font-medium text-amber-700 hover:bg-white/80"
          >
            Admin
          </Link>
        )}
      </nav>
      <div className="border-t border-zinc-100 p-6">
        <p className="truncate px-5 text-xs text-zinc-500">{email}</p>
        <form action={logoutMerchant} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-4 border-l-[3px] border-l-transparent px-5 py-3.5 text-left text-sm font-medium text-zinc-600 transition-colors hover:bg-white/80 hover:text-zinc-900"
          >
            <LogOut strokeWidth={1} className="h-4 w-4" />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
