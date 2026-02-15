"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Merchant = {
  id: string;
  businessName: string;
  businessAddress: string;
  category: string | null;
  verified: boolean;
  createdAt: Date;
  user: { id: string; email: string; name: string | null; phone: string | null };
};

export function MerchantApprovalsTable({
  pending,
  verified,
}: {
  pending: Merchant[];
  verified: Merchant[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function approve(profileId: string) {
    setLoadingId(profileId);
    await fetch(`/api/admin/merchants/${profileId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: true }),
    });
    setLoadingId(null);
    router.refresh();
  }

  async function reject(profileId: string) {
    setLoadingId(profileId);
    await fetch(`/api/admin/merchants/${profileId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: false }),
    });
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.businessName}</TableCell>
                  <TableCell>{m.user.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{m.businessAddress}</TableCell>
                  <TableCell>{m.category ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="gap-1"
                        disabled={loadingId === m.id}
                        onClick={() => approve(m.id)}
                      >
                        <Check className="h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        disabled={loadingId === m.id}
                        onClick={() => reject(m.id)}
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {pending.length === 0 && (
        <p className="text-sm text-slate-500">No pending merchant approvals.</p>
      )}

      {verified.length > 0 && (
        <>
          <h3 className="text-lg font-medium text-slate-900">Verified merchants</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verified.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.businessName}</TableCell>
                    <TableCell>{m.user.email}</TableCell>
                    <TableCell>{m.category ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
