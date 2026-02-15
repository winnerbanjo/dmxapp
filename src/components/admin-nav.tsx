"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DollarSign, Package, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/admin", label: "Revenue Overview", icon: DollarSign },
  { href: "/admin/shipments", label: "Shipment Management", icon: Package },
  { href: "/admin/pricing", label: "Pricing Control", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b bg-card">
      <div className="flex h-14 items-center gap-6 px-6">
        <span className="font-semibold">DMX Admin</span>
        <nav className="flex gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
