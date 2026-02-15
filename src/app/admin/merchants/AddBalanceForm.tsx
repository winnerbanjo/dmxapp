"use client";

import { addWalletBalance } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddBalanceForm({ merchantId }: { merchantId: string }) {
  return (
    <form action={addWalletBalance} className="flex items-center gap-2">
      <input type="hidden" name="merchantId" value={merchantId} />
      <Input
        type="number"
        name="amount"
        min="1"
        step="100"
        placeholder="Amount"
        className="h-8 w-24"
      />
      <Button type="submit" size="sm">
        Top up
      </Button>
    </form>
  );
}
