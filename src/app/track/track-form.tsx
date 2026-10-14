"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function TrackForm({
  className = "",
}: {
  className?: string;
  onMockResult?: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const id = value.trim().toUpperCase();
    if (!id) {
      setError("Please enter a tracking number or waybill.");
      return;
    }
    router.push(`/track/${encodeURIComponent(id)}`);
  }

  function handleQuickTrack(sampleId: string) {
    setValue(sampleId);
    router.push(`/track/${encodeURIComponent(sampleId)}`);
  }

  return (
    <div className={`w-full max-w-lg space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="e.g. 132721, DMX-XXXX, or DHL AWB"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            className="w-full rounded-none border border-zinc-300 bg-white px-4 py-3.5 text-base font-medium text-zinc-900 placeholder-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-0"
            aria-label="Tracking ID or DHL Waybill"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-none bg-[#5e1914] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4a130f]"
        >
          <Search className="h-4 w-4" />
          <span>Track</span>
        </button>
      </form>
      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Suggested Quick Lookups */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-500">
        <span>Recent bookings:</span>
        {["132721", "132718", "DMX-1001"].map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => handleQuickTrack(sample)}
            className="border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
          >
            {sample}
          </button>
        ))}
      </div>
    </div>
  );
}
