"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Package, Users, Wallet, Settings, LogOut } from "lucide-react";
import { logoutMerchant } from "@/app/auth/logout/actions";

const nav = [
  { href: "/merchant/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/merchant/booking", label: "Booking", icon: Package },
  { href: "/merchant/dashboard/shipments", label: "Shipments", icon: Package },
  { href: "/merchant/dashboard/customers", label: "Customers", icon: Users },
  { href: "/merchant/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/merchant/dashboard/settings", label: "Settings", icon: Settings },
];

export function MerchantMobileNav({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile header bar — visible only when sidebar is hidden */}
      <header className="flex h-14 min-h-[3.5rem] items-center justify-between border-b border-zinc-100 bg-white px-4 md:hidden">
        <Link href="/merchant/dashboard" className="text-lg font-bold tracking-[0.2em] text-[#5e1914]">
          DMX
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 min-h-[3rem] w-12 min-w-[3rem] items-center justify-center rounded-none text-zinc-600 hover:bg-zinc-50"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile overlay menu */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-100 bg-zinc-50 md:hidden">
            <div className="flex h-14 items-center justify-between border-b border-zinc-100 px-4">
              <span className="text-lg font-bold tracking-[0.2em] text-[#5e1914]">DMX</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-12 min-h-[3rem] w-12 min-w-[3rem] items-center justify-center text-zinc-600 hover:bg-zinc-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-auto p-4">
              {nav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex h-12 min-h-[3rem] items-center gap-4 rounded-none px-4 text-sm font-medium transition-colors ${
                      isActive ? "bg-white text-[#5e1914]" : "text-zinc-600 hover:bg-white/80"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  href="/admin/merchants"
                  onClick={() => setOpen(false)}
                  className="flex h-12 min-h-[3rem] items-center gap-4 rounded-none px-4 text-sm font-medium text-amber-700 hover:bg-white/80"
                >
                  Admin
                </Link>
              )}
            </nav>
            <div className="border-t border-zinc-100 p-4">
              <p className="truncate px-2 text-xs text-zinc-500">{email}</p>
              <form action={logoutMerchant} className="mt-2">
                <button
                  type="submit"
                  className="flex h-12 min-h-[3rem] w-full items-center gap-4 rounded-none px-4 text-left text-sm font-medium text-zinc-600 hover:bg-white/80"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </form>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
