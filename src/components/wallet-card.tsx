"use client";

import Link from "next/link";

interface WalletCardProps {
  balance: number;
}

export function WalletCard({ balance }: WalletCardProps) {
  return (
    <div className="rounded-none border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Wallet Balance</p>
          <p className="mt-1 text-2xl font-semibold text-[#18181b]">
            ₦{balance.toLocaleString()}
          </p>
        </div>
        <Link
          href="/merchant/dashboard/wallet"
          className="rounded-none bg-[#5e1914] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a130f]"
        >
          Top Up
        </Link>
      </div>
    </div>
  );
}
