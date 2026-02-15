"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUp, Download } from "lucide-react";

const TEMPLATE_CSV = `type,senderName,senderPhone,senderAddress,senderCity,senderCountry,recipientName,recipientPhone,recipientAddress,recipientCity,recipientCountry,weightKg,notes
LOCAL,John Doe,+234800000001,123 Sender St,Lagos,Nigeria,Jane Doe,+234800000002,456 Recipient Ave,Abuja,Nigeria,2.5,Sample
INTERNATIONAL,Acme Co,+234800000003,789 Export Rd,Lagos,Nigeria,Partner Inc,+1234567890,100 Import Blvd,New York,USA,5,Bulk order`;

export function BulkUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; failed: number; errors: string[] } | null>(null);

  const downloadTemplate = useCallback(() => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dmx-bulk-shipments-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/shipments/bulk", { method: "POST", body: formData });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setResult({
        created: data.created ?? 0,
        failed: data.failed ?? 0,
        errors: data.errors ?? [],
      });
      setFile(null);
      router.refresh();
    } else {
      setResult({
        created: 0,
        failed: 1,
        errors: [data.message ?? "Upload failed"],
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>CSV Template</Label>
        <p className="mt-1 text-sm text-slate-500">
          Columns: type, senderName, senderPhone, senderAddress, senderCity, senderCountry,
          recipientName, recipientPhone, recipientAddress, recipientCity, recipientCountry,
          weightKg, notes
        </p>
        <Button type="button" variant="outline" className="mt-2 gap-2" onClick={downloadTemplate}>
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv">Choose CSV file</Label>
          <input
            id="csv"
            type="file"
            accept=".csv"
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-[#dbeafe] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#1e40af]"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button type="submit" disabled={!file || loading} className="gap-2">
          <FileUp className="h-4 w-4" />
          {loading ? "Uploading..." : "Upload & Book Shipments"}
        </Button>
      </form>
      {result && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="font-medium text-slate-900">
            Created: {result.created} — Failed: {result.failed}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-sm text-red-600">
              {result.errors.slice(0, 10).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {result.errors.length > 10 && (
                <li>... and {result.errors.length - 10} more errors</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
