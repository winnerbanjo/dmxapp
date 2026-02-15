import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Control Center</h1>
      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
          <CardDescription>View all shipments and update status. Merchants receive a notification when status changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin/shipments">Manage Shipments</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
