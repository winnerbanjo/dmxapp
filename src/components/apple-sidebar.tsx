"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Package,
  History,
  LogOut,
  Users,
  CheckSquare,
  DollarSign,
  Truck,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const merchantNav = [
  { href: "/merchant/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/merchant/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/merchant/dashboard/book", label: "Shipping", icon: Package },
  { href: "/merchant/dashboard/shipments", label: "History", icon: History },
];

export function MerchantAppleSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-52 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4">
        <Link href="/merchant/dashboard" className="flex items-center gap-2">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden">
            <Image
              src="/dmxlogo.svg"
              alt="DMX"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          <span className="text-sm font-medium text-zinc-900">
            DMX <span className="text-[#5e1914]">Logistics</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-4">
        {merchantNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/merchant/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900",
                isActive && "text-[#5e1914]"
              )}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-[#5e1914]"
                  aria-hidden
                />
              )}
              <item.icon strokeWidth={1} className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 p-4">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
        >
          <LogOut strokeWidth={1} className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

const adminNav = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/tasks", label: "Task Dispatcher", icon: CheckSquare },
  { href: "/admin/merchants", label: "Merchants", icon: Package },
  { href: "/admin/shipments", label: "Shipments", icon: History },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/pricing", label: "Pricing Engine", icon: DollarSign },
  { href: "/admin/partners", label: "Partners", icon: Truck },
];

export function AdminAppleSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-52 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden">
            <Image
              src="/dmxlogo.svg"
              alt="DMX"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          <span className="text-sm font-medium text-zinc-900">
            DMX <span className="text-[#5e1914]">Logistics</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-4">
        {adminNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900",
                isActive && "text-[#5e1914]"
              )}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-[#5e1914]"
                  aria-hidden
                />
              )}
              <item.icon strokeWidth={1} className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 p-4">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
        >
          <LogOut strokeWidth={1} className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
