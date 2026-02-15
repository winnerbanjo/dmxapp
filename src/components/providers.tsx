"use client";

import { SessionProvider } from "next-auth/react";
import { RateCardProvider } from "@/contexts/rate-card-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RateCardProvider>{children}</RateCardProvider>
    </SessionProvider>
  );
}
