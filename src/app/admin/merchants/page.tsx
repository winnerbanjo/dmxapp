"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useRateCard } from "@/contexts/rate-card-context";
import { getMerchantsWithKycStatus } from "./get-merchants-with-status";
import { KycDocumentsModal } from "./kyc-documents-modal";

const HUB_OPTIONS = ["All", "Lagos", "Abuja", "PH", "Kano"];

type MerchantRow = Awaited<ReturnType<typeof getMerchantsWithKycStatus>>[number];

export default function AdminMerchantsPage() {
  const { merchantsWithCustomPricing } = useRateCard();
  const [search, setSearch] = useState("");
  const [hubFilter, setHubFilter] = useState("All");
  const [merchants, setMerchants] = useState<MerchantRow[]>([]);
  const [merchantsLoading, setMerchantsLoading] = useState(true);
  const [kycModal, setKycModal] = useState<{ merchantId: string; businessName: string } | null>(null);

  useEffect(() => {
    getMerchantsWithKycStatus().then((data) => {
      setMerchants(data);
      setMerchantsLoading(false);
    });
  }, []);

  const customByMerchantId = useMemo(
    () => new Map(merchantsWithCustomPricing.map((m) => [m.merchantId, m.merchantName])),
    [merchantsWithCustomPricing]
  );

  const filtered = useMemo(() => {
    return merchants.filter((m) => {
      const matchesSearch = m.businessName.toLowerCase().includes(search.toLowerCase());
      const matchesHub = hubFilter === "All" || m.hub === hubFilter;
      return matchesSearch && matchesHub;
    });
  }, [merchants, search, hubFilter]);

  return (
    <div className="mx-auto max-w-5xl bg-white px-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Merchants</h1>
      <Card className="mt-6 rounded-none border border-zinc-200">
        <CardHeader>
          <CardTitle className="text-zinc-900">Signups & verification</CardTitle>
          <CardDescription className="text-zinc-500">
            Demo merchant list. Search by name and filter by Hub/City.
          </CardDescription>
          <div className="mt-4 flex flex-wrap gap-4">
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs rounded-none border-zinc-200 bg-white"
            />
            <select
              value={hubFilter}
              onChange={(e) => setHubFilter(e.target.value)}
              className="rounded-none border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900"
            >
              {HUB_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {h === "All" ? "All Hubs" : h}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {merchantsLoading ? (
            <p className="text-zinc-500 font-sans">Loading merchants…</p>
          ) : filtered.length === 0 ? (
            <p className="text-zinc-600 font-sans">No merchants match your filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-200">
                  <TableHead className="text-zinc-900 font-sans">Business</TableHead>
                  <TableHead className="text-zinc-900 font-sans">Hub</TableHead>
                  <TableHead className="text-zinc-900 font-sans">Shipments</TableHead>
                  <TableHead className="text-zinc-900 font-sans">Pricing Tier</TableHead>
                  <TableHead className="text-zinc-900 font-sans">Status</TableHead>
                  <TableHead className="text-zinc-900 font-sans">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => {
                  const customName = customByMerchantId.get(m.id);
                  const tier = customName ? `Custom: ${customName}` : "Standard";
                  return (
                  <TableRow key={m.id} className="border-zinc-200">
                    <TableCell className="font-medium text-zinc-900 font-sans">{m.businessName}</TableCell>
                    <TableCell className="text-zinc-600 font-sans">{m.hub}</TableCell>
                    <TableCell className="text-zinc-600 font-sans">
                      {m.shipments.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          customName
                            ? "inline-block rounded-none border border-[#5e1914] bg-[#5e1914]/10 px-2 py-1 text-xs font-medium text-[#5e1914] font-sans"
                            : "inline-block rounded-none border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 font-sans"
                        }
                      >
                        {tier}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          m.kycStatus === "Approved"
                            ? "inline-block border border-green-600 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 font-sans"
                            : m.kycStatus === "Rejected"
                              ? "inline-block border border-[#5e1914] bg-[#5e1914]/10 px-2 py-1 text-xs font-medium text-[#5e1914] font-sans"
                              : "inline-block border border-amber-600 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 font-sans"
                        }
                      >
                        {m.kycStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setKycModal({ merchantId: m.id, businessName: m.businessName })}
                          className="rounded-none border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 font-sans transition-colors hover:border-[#5e1914] hover:text-[#5e1914]"
                        >
                          KYC Documents
                        </button>
                        <button
                          type="button"
                          className="rounded-none border border-[#5e1914] bg-white px-3 py-1.5 text-xs font-medium text-[#5e1914] font-sans transition-colors hover:bg-[#5e1914]/5"
                        >
                          View
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {kycModal && (
        <KycDocumentsModal
          merchantId={kycModal.merchantId}
          businessName={kycModal.businessName}
          open={!!kycModal}
          onClose={() => setKycModal(null)}
          onStatusChange={() => getMerchantsWithKycStatus().then(setMerchants)}
        />
      )}
    </div>
  );
}
