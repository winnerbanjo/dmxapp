import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerWalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">Balance and transactions</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Balance</CardTitle>
          <CardDescription>Available balance (NGN)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">₦0.00</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your database to see real balance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
