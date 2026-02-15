"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackagePlus,
  Wallet,
  History,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/customer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/ship", label: "Create Shipment", icon: PackagePlus },
  { href: "/customer/wallet", label: "Wallet", icon: Wallet },
  { href: "/customer/history", label: "History", icon: History },
];

export function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-dmx-border bg-card">
      <div className="p-4 font-semibold text-dmx-red">DMX Logistics</div>
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-none border-l-[3px] px-3 py-2 text-sm transition-colors",
              pathname === href
                ? "border-l-dmx-red bg-dmx-red/10 text-dmx-red"
                : "border-l-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
