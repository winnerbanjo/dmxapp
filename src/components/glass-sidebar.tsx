"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  Package,
  History,
  LayoutGrid,
  Users,
  Percent,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const merchantNav = [
  { href: "/merchant", label: "Dashboard", icon: LayoutDashboard },
  { href: "/merchant/shipments", label: "Shipments", icon: Package },
  { href: "/merchant/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/merchant/dashboard/book", label: "Book Shipment", icon: Package },
  { href: "/merchant/dashboard", label: "History", icon: History },
];

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/pricing", label: "Global Rates", icon: Percent },
];

type Role = "MERCHANT" | "ADMIN";

interface GlassSidebarProps {
  role: Role;
  title?: string;
}

export function GlassSidebar({ role, title }: GlassSidebarProps) {
  const pathname = usePathname();
  const nav = role === "ADMIN" ? adminNav : merchantNav;

  return (
    <aside
      className="flex h-full w-56 flex-col border-r border-white/10"
      style={{
        background: "rgba(26, 26, 26, 0.65)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        <Link
          href={role === "ADMIN" ? "/admin" : "/merchant"}
          className="font-semibold text-dmx-red"
        >
          {title ?? (role === "ADMIN" ? "DMX Admin" : "DMX Merchant")}
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {nav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/merchant" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors",
                "rounded-none",
                isActive
                  ? "border-l-dmx-red bg-dmx-red/20 text-white"
                  : "border-l-transparent text-slate-200 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-none text-slate-300 hover:bg-white/10 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
