import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Copy, FileText, PackageCheck, RefreshCw, Save, ShieldCheck, Truck } from "lucide-react";
import { ADMIN_DEMO_SHIPMENTS } from "@/data/demo-shipments";

type PageProps = {
  params: Promise<{ trackingId: string }>;
};

function money(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("delivered")) return "bg-emerald-50 text-emerald-700";
  if (normalized.includes("pending") || normalized.includes("draft")) return "bg-amber-50 text-amber-700";
  return "bg-[#f7f1ef] text-[#5e1914]";
}

export default async function AdminShipmentDetailPage({ params }: PageProps) {
  const { trackingId } = await params;
  const decodedTrackingId = decodeURIComponent(trackingId).replace("-COPY", "");
  const shipment = ADMIN_DEMO_SHIPMENTS.find((item) => item.trackingId === decodedTrackingId);

  if (!shipment) notFound();

  const profit = shipment.amount - shipment.partnerCost;
  const margin = shipment.amount > 0 ? Math.round((profit / shipment.amount) * 100) : 0;
  const apiPayload = {
    trackingId: shipment.trackingId,
    merchant: shipment.merchant,
    origin: shipment.origin,
    destination: shipment.destination,
    weightKg: shipment.weightKg,
    status: shipment.status,
    sellingPrice: shipment.amount,
    carrierCost: shipment.partnerCost,
    netProfit: profit,
  };

  return (
    <div className="mx-auto max-w-6xl bg-white px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <Link href="/admin/shipments" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-[#5e1914]">
            <ArrowLeft className="h-4 w-4" />
            Back to shipments
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">{shipment.trackingId}</h1>
          <p className="mt-1 text-sm text-zinc-500">{shipment.merchant} · {shipment.origin} to {shipment.destination}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/booking?duplicate=${encodeURIComponent(shipment.trackingId)}`} className="inline-flex items-center gap-2 border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">
            <Copy className="h-4 w-4" />
            Duplicate
          </Link>
          <button type="button" className="inline-flex items-center gap-2 border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">
            <Save className="h-4 w-4" />
            Save draft
          </button>
          <Link href={`/track/${encodeURIComponent(shipment.trackingId)}`} className="inline-flex items-center gap-2 bg-[#5e1914] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a130f]">
            <Truck className="h-4 w-4" />
            Public tracking
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric label="Status" value={shipment.status} icon={<PackageCheck className="h-5 w-5" />} badge />
        <Metric label="Weight" value={`${shipment.weightKg} kg`} icon={<FileText className="h-5 w-5" />} />
        <Metric label="Selling price" value={money(shipment.amount)} icon={<ShieldCheck className="h-5 w-5" />} />
        <Metric label="Net profit" value={money(profit)} icon={<RefreshCw className="h-5 w-5" />} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Shipment information</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Info label="Merchant" value={shipment.merchant} />
            <Info label="Tracking ID" value={shipment.trackingId} mono />
            <Info label="Origin" value={shipment.origin} />
            <Info label="Destination" value={shipment.destination} />
            <Info label="Courier" value="DMX Express / Partner selectable" />
            <Info label="API status key" value={shipment.status.toLowerCase().replaceAll(" ", "_")} mono />
          </div>
        </section>

        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Financial controls</h2>
          <div className="mt-5 space-y-3 text-sm">
            <Line label="Selling price" value={money(shipment.amount)} />
            <Line label="Carrier cost" value={money(shipment.partnerCost)} />
            <Line label="Net profit" value={money(profit)} strong />
            <Line label="Margin" value={`${margin}%`} strong />
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Operational timeline</h2>
          <div className="mt-5 space-y-4">
            {["Draft created", "Courier selected", "Package received", shipment.status].map((item, index) => (
              <div key={`${item}-${index}`} className="flex gap-3">
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${index === 3 ? "bg-[#5e1914]" : "bg-zinc-300"}`} />
                <div>
                  <p className="text-sm font-medium text-zinc-900">{item}</p>
                  <p className="mt-1 text-xs text-zinc-500">{index === 3 ? "Current state" : "Ready for API timestamp mapping"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-zinc-100 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">API integration payload</h2>
          <p className="mt-1 text-sm text-zinc-500">Stable shape for connecting this detail page to a shipment API.</p>
          <pre className="mt-5 overflow-auto bg-zinc-950 p-5 text-xs leading-6 text-zinc-100">
            {JSON.stringify(apiPayload, null, 2)}
          </pre>
        </section>
      </div>

      <section className="mt-8 border border-zinc-100 bg-white p-6">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Admin actions</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {["Update status", "Assign courier", "Edit financials", "Generate invoice"].map((action) => (
            <button key={action} type="button" className="border border-zinc-200 px-4 py-3 text-left text-sm font-semibold text-zinc-700 hover:border-[#5e1914] hover:text-[#5e1914]">
              {action}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, icon, badge = false }: { label: string; value: string; icon: ReactNode; badge?: boolean }) {
  return (
    <div className="border border-zinc-100 bg-white p-5">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center bg-[#f7f1ef] text-[#5e1914]">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      {badge ? <span className={`mt-2 inline-block px-2 py-1 text-sm font-semibold ${statusClass(value)}`}>{value}</span> : <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>}
    </div>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border border-zinc-100 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className={`mt-2 text-sm font-medium text-zinc-900 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 pb-3 last:border-b-0">
      <span className="text-zinc-500">{label}</span>
      <span className={strong ? "font-semibold text-[#5e1914]" : "font-medium text-zinc-900"}>{value}</span>
    </div>
  );
}
