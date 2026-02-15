"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { calculateShipmentPrice } from "@/lib/pricing";
import type { ShipmentType } from "@/types";

const steps: { id: number; title: string }[] = [
  { id: 1, title: "Type & weight" },
  { id: 2, title: "Sender" },
  { id: 3, title: "Recipient" },
  { id: 4, title: "Review" },
];

const step1Schema = z.object({
  type: z.enum(["LOCAL", "INTERNATIONAL"]),
  weightKg: z.coerce.number().min(0.1, "Min 0.1 kg").max(500, "Max 500 kg"),
});

type Step1Values = z.infer<typeof step1Schema>;

export default function CreateShipmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [type, setType] = useState<ShipmentType>("LOCAL");
  const [weightKg, setWeightKg] = useState<number>(1);
  const [sender, setSender] = useState({ name: "", phone: "", address: "", city: "", country: "" });
  const [recipient, setRecipient] = useState({ name: "", phone: "", address: "", city: "", country: "" });
  const [notes, setNotes] = useState("");

  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { type: "LOCAL", weightKg: 1 },
  });

  const watchedType = step1Form.watch("type") as ShipmentType | undefined;
  const watchedWeight = step1Form.watch("weightKg");
  const effectiveType = currentStep === 1 ? (watchedType ?? type) : type;
  const effectiveWeight = currentStep === 1 ? (Number.isFinite(watchedWeight) ? watchedWeight : weightKg) : weightKg;
  const { amount, currency, ratePerKg } = calculateShipmentPrice(effectiveWeight, effectiveType ?? "LOCAL");

  const senderForm = useForm({
    defaultValues: sender,
  });
  const recipientForm = useForm({
    defaultValues: recipient,
  });

  function onStep1Submit(data: Step1Values) {
    setType(data.type as ShipmentType);
    setWeightKg(data.weightKg);
    setCurrentStep(2);
  }

  function onSenderSubmit(data: typeof sender) {
    setSender(data);
    setCurrentStep(3);
  }

  function onRecipientSubmit(data: typeof recipient) {
    setRecipient(data);
    setCurrentStep(4);
  }

  function handleCreateShipment() {
    // In production: POST to API, create shipment and transaction
    console.log({
      type,
      weightKg,
      sender,
      recipient,
      notes,
      amount,
      currency,
    });
    alert(`Shipment quote: ${currency} ${amount.toLocaleString()}. Connect API to create.`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Shipment</h1>
        <p className="text-muted-foreground">Multi-step form with dynamic pricing</p>
      </div>

      <div className="flex gap-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
              currentStep === step.id ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            <span>{step.id}</span>
            <span className="hidden sm:inline">{step.title}</span>
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Type & weight</CardTitle>
            <CardDescription>Select shipment type and weight (kg). Price updates automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Shipment type</Label>
                <Select
                  value={step1Form.watch("type")}
                  onValueChange={(v) => step1Form.setValue("type", v as "LOCAL" | "INTERNATIONAL")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOCAL">Local</SelectItem>
                    <SelectItem value="INTERNATIONAL">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step={0.1}
                  min={0.1}
                  max={500}
                  {...step1Form.register("weightKg", { valueAsNumber: true })}
                />
                {step1Form.formState.errors.weightKg && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.weightKg.message}
                  </p>
                )}
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium">Estimated price</p>
                <p className="text-2xl font-bold">
                  {currency} {amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ratePerKg} per kg × {weightKg} kg
                </p>
              </div>
              <Button type="submit">Next: Sender details</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Sender details</CardTitle>
            <CardDescription>Who is sending the package?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={senderForm.handleSubmit(onSenderSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Name</Label>
                  <Input id="senderName" {...senderForm.register("name")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderPhone">Phone</Label>
                  <Input id="senderPhone" {...senderForm.register("phone")} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderAddress">Address</Label>
                <Input id="senderAddress" {...senderForm.register("address")} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="senderCity">City</Label>
                  <Input id="senderCity" {...senderForm.register("city")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderCountry">Country</Label>
                  <Input id="senderCountry" {...senderForm.register("country")} required />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button type="submit">Next: Recipient</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Recipient details</CardTitle>
            <CardDescription>Who is receiving the package?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={recipientForm.handleSubmit(onRecipientSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Name</Label>
                  <Input id="recipientName" {...recipientForm.register("name")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">Phone</Label>
                  <Input id="recipientPhone" {...recipientForm.register("phone")} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Address</Label>
                <Input id="recipientAddress" {...recipientForm.register("address")} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipientCity">City</Label>
                  <Input id="recipientCity" {...recipientForm.register("city")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientCountry">Country</Label>
                  <Input id="recipientCountry" {...recipientForm.register("country")} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button type="submit">Next: Review</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & pay</CardTitle>
            <CardDescription>Confirm details and create shipment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-muted-foreground">Type & weight</p>
              <p className="font-medium">
                {type} · {weightKg} kg
              </p>
            </div>
            <Separator />
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-muted-foreground">Sender</p>
              <p className="font-medium">{sender.name}</p>
              <p className="text-sm text-muted-foreground">
                {sender.address}, {sender.city}, {sender.country} · {sender.phone}
              </p>
            </div>
            <Separator />
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-muted-foreground">Recipient</p>
              <p className="font-medium">{recipient.name}</p>
              <p className="text-sm text-muted-foreground">
                {recipient.address}, {recipient.city}, {recipient.country} · {recipient.phone}
              </p>
            </div>
            {notes && (
              <>
                <Separator />
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm">{notes}</p>
                </div>
              </>
            )}
            <div className="rounded-lg border bg-primary/10 p-4">
              <p className="text-sm font-medium">Total</p>
              <p className="text-2xl font-bold">
                {currency} {amount.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button onClick={handleCreateShipment}>Create shipment</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
