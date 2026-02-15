import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your shipments and wallet</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Shipment</CardTitle>
            <CardDescription>Send a package locally or internationally</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/customer/ship">New Shipment</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>View balance and top up</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/customer/wallet">Open Wallet</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
