"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type DateFilterPeriod = "today" | "yesterday" | "last7" | "custom";

export type DateFilterState = {
  period: DateFilterPeriod;
  customFrom?: string;
  customTo?: string;
};

const PRESETS: { value: DateFilterPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 Days" },
  { value: "custom", label: "Custom" },
];

type DateFilterProps = {
  value: DateFilterState;
  onChange: (state: DateFilterState) => void;
  className?: string;
};

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const [showCustom, setShowCustom] = useState(value.period === "custom");

  const handlePreset = (period: DateFilterPeriod) => {
    if (period === "custom") {
      setShowCustom(true);
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);
      onChange({
        period: "custom",
        customFrom: weekAgo.toISOString().slice(0, 10),
        customTo: today.toISOString().slice(0, 10),
      });
    } else {
      setShowCustom(false);
      onChange({ period });
    }
  };

  const handleCustomRange = (from: string, to: string) => {
    onChange({ period: "custom", customFrom: from, customTo: to });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
        <Calendar className="h-4 w-4 text-zinc-400" />
        <span>Date Filter</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => handlePreset(preset.value)}
            className={cn(
              "h-12 min-h-[3rem] rounded-none border px-3 py-2 text-sm font-medium transition-colors sm:h-auto sm:min-h-0",
              value.period === preset.value
                ? "border-[#5e1914] bg-[#5e1914] text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
      {showCustom && (value.period === "custom" || value.customFrom) && (
        <div className="flex flex-wrap items-center gap-2 border-l border-zinc-200 pl-3">
          <input
            type="date"
            value={value.customFrom ?? ""}
            onChange={(e) =>
              handleCustomRange(e.target.value, value.customTo ?? value.customFrom ?? "")
            }
            className="h-9 rounded-none border border-zinc-200 bg-white px-2 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-0"
          />
          <span className="text-zinc-400">→</span>
          <input
            type="date"
            value={value.customTo ?? ""}
            onChange={(e) =>
              handleCustomRange(value.customFrom ?? "", e.target.value)
            }
            className="h-9 rounded-none border border-zinc-200 bg-white px-2 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-0"
          />
        </div>
      )}
    </div>
  );
}
