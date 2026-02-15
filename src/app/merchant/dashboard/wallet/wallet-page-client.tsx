"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initializePayment } from "@/app/actions/paystack";
import { Loader2, Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";

type TransactionRow = { id: string; label: string; amount: number; date: string };

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "credit", label: "Credit" },
  { value: "debit", label: "Debit" },
];

export function WalletPageClient({
  initialBalance,
  transactions,
}: {
  initialBalance: number;
  transactions: TransactionRow[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.date.toLowerCase().includes(q)
      );
    }
    if (typeFilter === "credit") list = list.filter((t) => t.amount >= 0);
    if (typeFilter === "debit") list = list.filter((t) => t.amount < 0);
    return list;
  }, [transactions, search, typeFilter]);

  const hasActiveFilters = search.trim() !== "" || typeFilter !== "all";
  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
  }

  async function handleFundWallet(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const numAmount = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount < 100) {
      setError("Minimum amount is ₦100");
      return;
    }
    if (numAmount > 10_000_000) {
      setError("Maximum amount is ₦10,000,000");
      return;
    }
    setFunding(true);
    try {
      const result = await initializePayment(numAmount);
      if (result.success && result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      } else {
        setError(result.error ?? "Failed to initialize payment");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setFunding(false);
    }
  }

  return (
    <>
      {/* Balance Card — pure white, 1px zinc-100 */}
      <div className="mt-12 border border-zinc-100 bg-white p-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border border-zinc-100 bg-zinc-50">
              <Wallet strokeWidth={1} className="h-6 w-6 text-[#5e1914]" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Available balance
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
                ₦{initialBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-12 rounded-none bg-[#5e1914] px-8 text-sm font-medium text-white hover:bg-[#4a130f]"
          >
            Fund wallet
          </Button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="mt-12 border border-zinc-100 bg-white p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Transaction history
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-none border border-zinc-200 bg-white p-4">
          <input
            type="search"
            placeholder="Search by label or date"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 min-w-[200px] flex-1 rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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
        <ul className="mt-4 divide-y divide-zinc-100">
          {filteredTransactions.length === 0 ? (
            <li className="py-8 text-center text-sm text-zinc-500">
              {transactions.length === 0
                ? "No transactions yet. Fund your wallet or create a shipment."
                : "No matches found."}
            </li>
          ) : (
            filteredTransactions.map((row) => (
              <li key={row.id} className="flex items-center justify-between py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center border border-zinc-100 bg-white">
                    {row.amount >= 0 ? (
                      <ArrowDownLeft strokeWidth={1} className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpRight strokeWidth={1} className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{row.label}</p>
                    <p className="text-xs text-zinc-500">{row.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${row.amount >= 0 ? "text-green-600" : "text-zinc-900"}`}>
                  {row.amount >= 0 ? "+" : ""}₦{Math.abs(row.amount).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Fund Wallet modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6"
          onClick={() => !funding && setModalOpen(false)}
        >
          <div
            className="w-full max-w-md border border-zinc-100 bg-white p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Fund wallet
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              You will be redirected to Paystack to complete the payment.
            </p>
            <form onSubmit={handleFundWallet} className="mt-8 space-y-6">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <Label htmlFor="amount" className="text-zinc-700">
                  Amount (₦)
                </Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="mt-3 h-12 rounded-none border-zinc-100"
                  disabled={funding}
                />
                <p className="mt-2 text-xs text-zinc-500">Min ₦100 · Max ₦10,000,000</p>
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-none border-zinc-100"
                  onClick={() => setModalOpen(false)}
                  disabled={funding}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-none bg-[#5e1914] hover:bg-[#4a130f]"
                  disabled={funding}
                >
                  {funding ? (
                    <>
                      <Loader2 strokeWidth={1} className="mr-2 h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    "Continue to Paystack"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
