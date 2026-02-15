import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { shipments: { take: 10, orderBy: { createdAt: "desc" } } },
  });

  if (!user) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Shipments</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Shipments</CardTitle>
          <Button asChild size="sm">
            <Link href="/merchant/dashboard/book">Book a Shipment</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {user.shipments.length === 0 ? (
            <p className="text-sm text-slate-500">No shipments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 pr-4">Tracking #</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {user.shipments.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium">{s.trackingNumber}</td>
                      <td className="py-2 pr-4">{s.status}</td>
                      <td className="py-2 pr-4">{s.type}</td>
                      <td className="py-2">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
