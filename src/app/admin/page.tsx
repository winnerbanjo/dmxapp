import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHomePage() {
  return (
    <div className="space-y-6 px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Admin Control Center</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-none border-zinc-200">
          <CardHeader>
            <CardTitle>Shipments</CardTitle>
            <CardDescription>View all shipments, override statuses, and manage global operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-none bg-[#5e1914] hover:bg-[#4a130f]">
              <Link href="/admin/shipments">Manage Shipments</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-none border-zinc-200">
          <CardHeader>
            <CardTitle>Pricing & Rules</CardTitle>
            <CardDescription>Editable pricing rules, CSV uploads, markup control, and partner price sources.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-none bg-[#5e1914] hover:bg-[#4a130f]">
              <Link href="/admin/pricing">Open Pricing Engine</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-none border-zinc-200">
          <CardHeader>
            <CardTitle>User Permissions</CardTitle>
            <CardDescription>Manage merchant employees, hub staff groups, notification config, and permission controls.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-none bg-[#5e1914] hover:bg-[#4a130f]">
              <Link href="/admin/users">Open User Control</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-none border-zinc-200">
          <CardHeader>
            <CardTitle>Financial Reporting</CardTitle>
            <CardDescription>Generate hub, merchant, and system-wide reports with export-ready views.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-none bg-[#5e1914] hover:bg-[#4a130f]">
              <Link href="/admin/reports">Open Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
