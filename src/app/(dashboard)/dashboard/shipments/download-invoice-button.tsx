"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

/**
 * Mock PDF download: triggers a blob download with invoice-style text.
 */
export function DownloadInvoiceButton({
  shipmentId,
  trackingNumber,
}: {
  shipmentId: string;
  trackingNumber: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    const content = `DMX Logistics - Invoice\nTracking: ${trackingNumber}\nShipment ID: ${shipmentId}\nGenerated: ${new Date().toISOString()}\n\nThank you for shipping with us.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${trackingNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      className="gap-1"
    >
      <Download className="h-3.5 w-3.5" />
      {loading ? "..." : "Invoice"}
    </Button>
  );
}
