"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Package,
  Users,
  LogOut,
  FileEdit,
} from "lucide-react";

const nav = [
  { href: "/hub/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hub/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/hub/booking", label: "Booking", icon: FileEdit },
  { href: "/hub/inventory", label: "Branch Inventory", icon: Package },
  { href: "/hub/customers", label: "Customer Directory", icon: Users },
];

export function HubSidebar() {
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);

  function handleSignOut() {
    document.cookie = "dmx-hub-token=; path=/; max-age=0";
    window.location.href = "/auth/login";
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r border-zinc-100 bg-white">
      <div className="flex h-14 items-center border-b border-zinc-100 px-4 py-3">
        <Link href="/hub/dashboard" className="flex h-10 items-center gap-2">
          {!logoError ? (
            <Image
              src="/dmxlogo.svg"
              alt="DMX"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              onError={() => setLogoError(true)}
              unoptimized
            />
          ) : (
            <span className="font-sans font-semibold tracking-tighter text-[#5e1914]">DMX</span>
          )}
          <span className="font-sans font-semibold tracking-tighter text-zinc-900">Hub</span>
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
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
