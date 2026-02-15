"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export function RoleSwitch() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={role === "MERCHANT" ? "default" : "outline"}
        size="sm"
        onClick={() => router.push("/merchant/dashboard")}
      >
        Merchant
      </Button>
      <Button
        variant={role === "CUSTOMER" ? "default" : "outline"}
        size="sm"
        onClick={() => router.push("/customer/dashboard")}
      >
        Customer
      </Button>
      {role === "ADMIN" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin")}
        >
          Admin
        </Button>
      )}
    </div>
  );
}
