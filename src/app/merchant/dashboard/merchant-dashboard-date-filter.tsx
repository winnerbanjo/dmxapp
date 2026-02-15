"use client";

import { useState } from "react";
import { DateFilter, type DateFilterState } from "@/components/date-filter";

export function MerchantDashboardDateFilter() {
  const [dateState, setDateState] = useState<DateFilterState>({ period: "today" });
  return (
    <section className="border-b border-zinc-100 pb-6">
      <DateFilter value={dateState} onChange={setDateState} />
    </section>
  );
}
