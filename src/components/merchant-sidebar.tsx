"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Upload,
  Wallet,
  Settings,
  LogOut,
  PackageSearch,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/merchant/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/merchant/dashboard/booking", label: "Book Shipment", icon: Package },
  { href: "/merchant/dashboard/shipments", label: "Shipments", icon: PackageSearch },
  { href: "/merchant/dashboard/bulk", label: "Bulk Upload", icon: Upload },
  { href: "/merchant/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/merchant/dashboard/settings", label: "Settings", icon: Settings },
];

export function MerchantSidebar() {
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);

  return (
    <aside className="flex h-full w-56 flex-col border-r border-zinc-100 bg-white">
      <div className="flex h-14 items-center border-b border-zinc-100 px-4 py-3">
        <Link href="/merchant/dashboard" className="flex h-10 items-center gap-2">
          {!logoError ? (
            <Image
              src="/dmxlogo.svg"
              alt="DMX"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="font-semibold tracking-tight text-[#5e1914]">DMX</span>
          )}
          <span className="font-semibold tracking-tight text-zinc-900">Merchant</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-none border-l-[3px] px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-l-[#5e1914] bg-[#5e1914]/10 text-[#5e1914]"
                  : "border-l-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-100 p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-none text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
