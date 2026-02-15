"use client";

import { useState, useMemo } from "react";
import type { DemoCustomer } from "@/data/demo-customers";

function getCityOptions(customers: DemoCustomer[]): string[] {
  const set = new Set(customers.map((c) => c.city).filter(Boolean));
  return ["All cities", ...Array.from(set).sort()];
}

export function AdminCustomersTable({ customers }: { customers: DemoCustomer[] }) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All cities");

  const cityOptions = useMemo(() => getCityOptions(customers), [customers]);

  const filtered = useMemo(() => {
    let list = customers;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }
    if (city !== "All cities") {
      list = list.filter((c) => c.city === city);
    }
    return list;
  }, [customers, search, city]);

  function clearFilters() {
    setSearch("");
    setCity("All cities");
  }

  const hasActiveFilters = search.trim() !== "" || city !== "All cities";

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-none border border-zinc-200 bg-white p-4">
        <input
          type="search"
          placeholder="Search by Name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 min-w-[200px] flex-1 rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
        />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-10 rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
        >
          {cityOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-none border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Name</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Phone</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">City</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Order Count</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Last Order</th>
              <th className="px-8 py-5 font-medium tracking-tight text-zinc-900">Email</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center text-sm text-zinc-500">
                  No matches found
                </td>
              </tr>
            ) : (
              filtered.map((c, i) => (
                <tr key={i} className="border-b border-zinc-200 last:border-b-0">
                  <td className="px-8 py-5 font-medium text-zinc-900">{c.name}</td>
                  <td className="px-8 py-5 text-zinc-600">{c.phone}</td>
                  <td className="px-8 py-5 text-zinc-600">{c.city}</td>
                  <td className="px-8 py-5 text-zinc-900">{c.orderCount}</td>
                  <td className="px-8 py-5 text-zinc-600">{c.lastOrder ?? "—"}</td>
                  <td className="px-8 py-5 text-zinc-600">{c.email ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
