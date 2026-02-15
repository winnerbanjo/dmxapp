"use client";

import { MapPin, Truck, Globe, Package } from "lucide-react";
import type { ServiceType } from "@/data/booking-constants";
import { SERVICE_LABELS, SERVICE_DESCRIPTIONS } from "@/data/booking-constants";
import { cn } from "@/lib/utils";

const ICONS: Record<ServiceType, typeof MapPin> = {
  local: MapPin,
  nationwide: Truck,
  international: Globe,
  movers: Package,
};

type ServiceTypeSelectorProps = {
  value: ServiceType | null;
  onSelect: (type: ServiceType) => void;
  className?: string;
};

export function ServiceTypeSelector({ value, onSelect, className }: ServiceTypeSelectorProps) {
  const types: ServiceType[] = ["local", "nationwide", "international", "movers"];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {types.map((type) => {
        const Icon = ICONS[type];
        const selected = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={cn(
              "flex flex-col items-start rounded-none border bg-white p-6 text-left transition-colors",
              selected
                ? "border-[#5e1914] ring-1 ring-[#5e1914]"
                : "border-zinc-100 hover:border-zinc-200"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center border border-zinc-100 bg-white">
              <Icon className="h-6 w-6 text-[#5e1914]" strokeWidth={1.5} />
            </div>
            <p className="mt-4 font-sans text-base font-semibold tracking-tighter text-zinc-900">
              {SERVICE_LABELS[type]}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {SERVICE_DESCRIPTIONS[type]}
            </p>
          </button>
        );
      })}
    </div>
  );
}
