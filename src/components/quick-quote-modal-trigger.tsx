"use client";

import { useState, useEffect } from "react";
import { Calculator, X } from "lucide-react";
import { QuickQuoteCard } from "@/components/quick-quote-card";
import { cn } from "@/lib/utils";

export function QuickQuoteModalTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* FAB — bottom right */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 min-h-[3rem] items-center gap-2 rounded-none border border-[#5e1914] bg-[#5e1914] px-4 py-3 font-sans text-sm font-medium text-white shadow-lg transition-colors hover:bg-[#4a130f] md:bottom-8 md:right-8 md:px-5"
        aria-label="Check rates"
      >
        <Calculator className="h-5 w-5 shrink-0" />
        <span className="hidden sm:inline">Check Rates</span>
      </button>

      {/* Modal — full-screen on mobile, centered on desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-quote-modal-title"
          onClick={() => setIsOpen(false)}
        >
          <div
            className={cn(
              "flex min-h-screen w-full max-w-full flex-col overflow-hidden bg-white md:min-h-0 md:max-h-[90vh] md:w-full md:max-w-md md:rounded-none md:border md:border-zinc-100 md:shadow-lg"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close */}
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h2 id="quick-quote-modal-title" className="font-sans text-lg font-semibold tracking-tight text-zinc-900">
                Quick Quote
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-12 min-h-[3rem] w-12 min-w-[3rem] items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 sm:h-8 sm:min-h-0 sm:w-8 sm:min-w-0"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Quote card — keeps wine red buttons and Export/Import toggle. Full screen on mobile for easy tap/type */}
            <div className="flex-1 overflow-auto p-6 pb-8">
              <QuickQuoteCard className="border-0 p-0 shadow-none" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
