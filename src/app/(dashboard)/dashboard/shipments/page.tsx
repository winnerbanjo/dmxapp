import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ShipmentsSearch } from "./shipments-search";
import { DownloadInvoiceButton } from "./download-invoice-button";

export default async function DashboardShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        Sign in with a registered account to view shipments.
      </div>
    );
  }

  const { q } = await searchParams;
  const shipments = await prisma.shipment.findMany({
    where: {
      userId,
      ...(q
        ? {
            OR: [
              { trackingNumber: { contains: q, mode: "insensitive" } },
              { recipientName: { contains: q, mode: "insensitive" } },
              { senderName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Shipment History</h1>
        <p className="mt-1 text-slate-500">Search and download invoices</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>All shipments</CardTitle>
            <CardDescription>Click a row to track or download invoice</CardDescription>
          </div>
          <ShipmentsSearch />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    No shipments found. <Link href="/dashboard/book-shipment" className="text-[#1e40af] underline">Book one</Link>.
                  </TableCell>
                </TableRow>
              ) : (
                shipments.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">
                      <Link
                        href={`/dashboard/tracking/${s.trackingNumber}`}
                        className="text-[#1e40af] hover:underline"
                      >
                        {s.trackingNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{s.type}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : s.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {s.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>{s.recipientName}</TableCell>
                    <TableCell>₦{Number(s.priceAmount).toLocaleString()}</TableCell>
                    <TableCell>
                      <DownloadInvoiceButton shipmentId={s.id} trackingNumber={s.trackingNumber} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
