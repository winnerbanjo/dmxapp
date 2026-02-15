"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function ShipmentsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const update = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    router.push(`/dashboard/shipments?${params.toString()}`);
  }, [value, router, searchParams]);

  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Search className="h-4 w-4 text-slate-400" />
      <Input
        placeholder="Search by tracking, sender, recipient..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && update()}
        className="h-9"
      />
      <button
        type="button"
        onClick={update}
        className="rounded-md bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300"
      >
        Search
      </button>
    </div>
  );
}
