"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateShipmentStatusAndNotify } from "@/app/actions/admin-shipments";
import { ShipmentStatus } from "@prisma/client";

const STATUS_OPTIONS: ShipmentStatus[] = [
  "PENDING",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export function UpdateStatusDropdown({
  shipmentId,
  currentStatus,
  merchantEmail,
  trackingNumber,
}: {
  shipmentId: string;
  currentStatus: string;
  merchantEmail: string;
  trackingNumber: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setLoading(true);
    await updateShipmentStatusAndNotify({
      shipmentId,
      newStatus: newStatus as ShipmentStatus,
      merchantEmail,
      trackingNumber,
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleChange}
      disabled={loading}
    >
      <SelectTrigger className="h-9 w-full min-w-[140px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((status) => (
          <SelectItem key={status} value={status}>
            {status.replace(/_/g, " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
