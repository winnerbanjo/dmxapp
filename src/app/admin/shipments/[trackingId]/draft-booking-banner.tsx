"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark, Loader2, Truck } from "lucide-react";

export function DraftBookingBanner({ trackingId }: { trackingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBook() {
    setLoading(true);
    try {
      const res = await fetch(`/api/shipments/${trackingId}/book-carrier`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert("Consignment successfully booked onto carrier!");
        router.refresh();
      } else {
        alert(data.message || "Failed to book onto carrier");
      }
    } catch (err) {
      console.error("Draft promote error:", err);
      alert("Error booking draft onto carrier");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-blue-200 bg-blue-50/80 p-5">
      <div className="flex items-start gap-3">
        <Bookmark className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
        <div>
          <h3 className="text-sm font-bold text-blue-950">
            Consignment Saved as Draft (Wallet Not Yet Funded)
          </h3>
          <p className="mt-0.5 text-xs text-blue-800">
            This shipment is in draft status awaiting customer wallet funding. All cargo and rate details are preserved. Once the wallet is funded, click &quot;Book onto Carrier Now&quot; to dispatch live.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-1.5 border border-blue-300 bg-white px-4 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-50"
        >
          Fund Wallet
        </Link>
        <button
          type="button"
          onClick={handleBook}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-[#5e1914] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#4a130f] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Booking onto Carrier...</span>
            </>
          ) : (
            <>
              <Truck className="h-4 w-4" />
              <span>Book onto Carrier Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
