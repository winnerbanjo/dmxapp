"use client";

import { toggleMerchantVerification } from "@/app/admin/merchants/actions";
import { Button } from "@/components/ui/button";
import { formatDemoDateOnly } from "@/lib/demo-date";

type MerchantRow = {
  _id: string;
  businessName: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
};

export function AdminMerchantTable({ merchants }: { merchants: MerchantRow[] }) {
  if (merchants.length === 0) {
    return (
      <div className="px-8 py-16 text-center text-sm text-zinc-500">
        No merchants yet.
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-zinc-100 bg-zinc-50">
          <th className="px-8 py-5 font-medium tracking-tighter text-zinc-900">Business</th>
          <th className="px-8 py-5 font-medium tracking-tighter text-zinc-900">Email</th>
          <th className="px-8 py-5 font-medium tracking-tighter text-zinc-900">Status</th>
          <th className="px-8 py-5 font-medium tracking-tighter text-zinc-900">Joined</th>
          <th className="px-8 py-5 font-medium tracking-tighter text-zinc-900">Actions</th>
        </tr>
      </thead>
      <tbody>
        {merchants.map((m) => (
          <tr key={m._id} className="border-b border-zinc-100 last:border-b-0">
            <td className="px-8 py-5 font-medium text-zinc-900">{m.businessName}</td>
            <td className="px-8 py-5 text-zinc-600">{m.email}</td>
            <td className="px-8 py-5">
              <span
                className={`inline-block border px-2 py-1 text-xs font-medium ${
                  m.isVerified ? "border-green-600 bg-green-50 text-green-700" : "border-zinc-200 bg-zinc-50 text-zinc-700"
                }`}
              >
                {m.isVerified ? "Verified" : "Pending"}
              </span>
            </td>
            <td className="px-8 py-5 text-zinc-500">
              {formatDemoDateOnly(m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt))}
            </td>
            <td className="px-8 py-5">
              <form action={toggleMerchantVerification}>
                <input type="hidden" name="merchantId" value={m._id} />
                <Button
                  type="submit"
                  variant={m.isVerified ? "outline" : "default"}
                  size="sm"
                  className="rounded-none border-zinc-100 text-xs"
                >
                  {m.isVerified ? "Unverify" : "Verify"}
                </Button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
