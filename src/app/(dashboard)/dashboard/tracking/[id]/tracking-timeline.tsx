"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  status: string;
  label: string;
  done: boolean;
  current: boolean;
}

export function TrackingTimeline({ steps }: { steps: Step[] }) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
      <ul className="space-y-6">
        {steps.map((step, i) => (
          <li key={step.status} className="relative flex items-start gap-4">
            <div
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                step.done
                  ? "border-[#1e40af] bg-[#1e40af] text-white"
                  : "border-slate-200 text-slate-400"
              )}
            >
              {step.done ? (
                <Check className="h-5 w-5" />
              ) : (
                <Circle className={cn("h-4 w-4", step.current && "fill-[#1e40af] text-[#1e40af]")} />
              )}
            </div>
            <div className="pt-1">
              <p
                className={cn(
                  "font-medium",
                  step.done ? "text-slate-900" : step.current ? "text-[#1e40af]" : "text-slate-500"
                )}
              >
                {step.label}
              </p>
              {step.current && (
                <p className="text-xs text-slate-500">Current status</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
