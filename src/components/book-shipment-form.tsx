"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BookShipmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "LOCAL",
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    senderCity: "",
    senderCountry: "Nigeria",
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
    recipientCity: "",
    recipientCountry: "Nigeria",
    weightKg: "",
    notes: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        senderName: form.senderName,
        senderPhone: form.senderPhone,
        senderAddress: form.senderAddress,
        senderCity: form.senderCity,
        senderCountry: form.senderCountry,
        recipientName: form.recipientName,
        recipientPhone: form.recipientPhone,
        recipientAddress: form.recipientAddress,
        recipientCity: form.recipientCity,
        recipientCountry: form.recipientCountry,
        weightKg: parseFloat(form.weightKg) || 1,
        notes: form.notes || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Failed to create shipment.");
      return;
    }
    router.push("/merchant/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <p className="rounded-md bg-red-50 p-2 text-sm text-red-600">{error}</p>
      )}
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOCAL">Local</SelectItem>
            <SelectItem value="INTERNATIONAL">International</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Sender Name</Label>
          <Input
            value={form.senderName}
            onChange={(e) => setForm((f) => ({ ...f, senderName: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Sender Phone</Label>
          <Input
            value={form.senderPhone}
            onChange={(e) => setForm((f) => ({ ...f, senderPhone: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Sender Address</Label>
        <Input
          value={form.senderAddress}
          onChange={(e) => setForm((f) => ({ ...f, senderAddress: e.target.value }))}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Sender City</Label>
          <Input
            value={form.senderCity}
            onChange={(e) => setForm((f) => ({ ...f, senderCity: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Sender Country</Label>
          <Input
            value={form.senderCountry}
            onChange={(e) => setForm((f) => ({ ...f, senderCountry: e.target.value }))}
            required
          />
        </div>
      </div>
      <hr className="border-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Recipient Name</Label>
          <Input
            value={form.recipientName}
            onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Recipient Phone</Label>
          <Input
            value={form.recipientPhone}
            onChange={(e) => setForm((f) => ({ ...f, recipientPhone: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Recipient Address</Label>
        <Input
          value={form.recipientAddress}
          onChange={(e) => setForm((f) => ({ ...f, recipientAddress: e.target.value }))}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Recipient City</Label>
          <Input
            value={form.recipientCity}
            onChange={(e) => setForm((f) => ({ ...f, recipientCity: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Recipient Country</Label>
          <Input
            value={form.recipientCountry}
            onChange={(e) => setForm((f) => ({ ...f, recipientCountry: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Weight (kg)</Label>
        <Input
          type="number"
          min="0.1"
          step="0.1"
          value={form.weightKg}
          onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Input
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Booking..." : "Book Shipment"}
      </Button>
    </form>
  );
}
