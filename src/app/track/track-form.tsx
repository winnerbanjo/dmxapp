"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const MOCK_IDS = ["DMX-123", "DMX-782-NG"];

export function TrackForm({
  className = "",
  onMockResult,
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
      setError("Enter a tracking ID.");
      return;
    }
    if (MOCK_IDS.includes(id)) {
      onMockResult?.();
      return;
    }
    router.push(`/track/${encodeURIComponent(id)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-md space-y-5 ${className}`}>
      <div>
        <input
          type="text"
          placeholder="e.g. DMX-123 or DMX-782-NG"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 placeholder-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-0"
          aria-label="Tracking ID"
        />
        {error && (
          <p className="mt-2 text-sm text-zinc-600" role="alert">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="rounded-none bg-[#5e1914] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4a130f]"
      >
        Track
      </button>
    </form>
  );
}
