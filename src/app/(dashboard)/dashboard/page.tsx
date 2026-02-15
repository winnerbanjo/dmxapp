import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Wallet, Truck, CheckCircle } from "lucide-react";

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        Your account is not linked to a profile. Please sign in with a registered email or complete registration.
      </div>
    );
  }

  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, currency: "NGN" },
    });
  }
  const [totalSpent, pendingCount, deliveredCount] = await Promise.all([
    prisma.transaction
      .aggregate({
        where: {
          wallet: { userId },
          type: "SHIPMENT_PAYMENT",
        },
        _sum: { amount: true },
      })
      .then((r) => Math.abs(Number(r._sum.amount ?? 0))),
    prisma.shipment.count({
      where: {
        userId,
        status: { in: ["PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"] },
      },
    }),
    prisma.shipment.count({
      where: { userId, status: "DELIVERED" },
    }),
  ]);
  const balance = Number(wallet.balance);

  const cards = [
    {
      title: "Wallet Balance",
      value: `₦${balance.toLocaleString()}`,
      description: "Available for shipments",
      icon: Wallet,
      href: "/dashboard",
    },
    {
      title: "Total Spent",
      value: `₦${totalSpent.toLocaleString()}`,
      description: "On shipments",
      icon: Package,
    },
    {
      title: "Pending Pickups",
      value: String(pendingCount),
      description: "In progress",
      icon: Truck,
      href: "/dashboard/shipments",
    },
    {
      title: "Successful Deliveries",
      value: String(deliveredCount),
      description: "Completed",
      icon: CheckCircle,
      href: "/dashboard/shipments",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-500">Overview of your logistics activity</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ title, value, description, icon: Icon, href }) => (
          <Card key={title} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
              <Icon className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{description}</p>
              {href && (
                <Button asChild variant="link" className="mt-2 h-auto p-0 text-[#1e40af]">
                  <Link href={href}>View</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Book a new shipment or top up your wallet</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link href="/dashboard/book-shipment">Book Shipment</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/top-up">Top up Wallet</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
