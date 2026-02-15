"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initializePayment } from "@/app/actions/paystack";

export default function TopUpPage() {
  const { data: session, status } = useSession();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountNum = Math.round(parseFloat(amount)) || 0; // Naira

  const handleTopUp = async () => {
    setError(null);
    if (amountNum < 100) {
      setError("Minimum amount is ₦100");
      return;
    }
    setLoading(true);
    const result = await initializePayment(amountNum);
    setLoading(false);
    if (result.success && result.authorizationUrl) {
      window.location.href = result.authorizationUrl;
      return;
    }
    setError(result.error ?? "Something went wrong.");
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">← Dashboard</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top up Wallet</CardTitle>
          <CardDescription>
            Add funds via Paystack. You will be redirected to complete payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Amount (₦)</Label>
            <Input
              type="number"
              min="100"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>
          )}
          <Button
            className="w-full"
            onClick={handleTopUp}
            disabled={loading || !amountNum || status !== "authenticated"}
          >
            {loading ? "Redirecting to Paystack..." : "Pay with Paystack"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
