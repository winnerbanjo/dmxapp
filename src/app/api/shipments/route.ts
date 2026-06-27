import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  type: z.enum(["LOCAL", "INTERNATIONAL"]),
  senderName: z.string(),
  senderPhone: z.string(),
  senderAddress: z.string(),
  senderCity: z.string(),
  senderCountry: z.string(),
  recipientName: z.string(),
  recipientPhone: z.string(),
  recipientAddress: z.string(),
  recipientCity: z.string(),
  recipientCountry: z.string(),
  weightKg: z.number().positive(),
  notes: z.string().optional(),
});

function generateTrackingNumber(): string {
  return `DMX${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid input", errors: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    // Pricing: NGN 500/kg local, 2000/kg international (move to PricingRates table for production)
    const ratePerKg = data.type === "LOCAL" ? 500 : 2000;
    const priceAmount = ratePerKg * data.weightKg;

    const shipment = await prisma.shipment.create({
      data: {
        userId: user.id,
        trackingNumber: generateTrackingNumber(),
        type: data.type,
        weightKg: data.weightKg,
        priceAmount,
        currency: "NGN",
        senderName: data.senderName,
        senderPhone: data.senderPhone,
        senderAddress: data.senderAddress,
        senderCity: data.senderCity,
        senderCountry: data.senderCountry,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        recipientAddress: data.recipientAddress,
        recipientCity: data.recipientCity,
        recipientCountry: data.recipientCountry,
        notes: data.notes ?? null,
      },
    });

    console.log("[Shipments API] Shipment created", {
      id: shipment.id,
      trackingNumber: shipment.trackingNumber,
      userId: shipment.userId,
      type: shipment.type,
    });
    return NextResponse.json(shipment);
  } catch (e) {
    console.error("[Shipments API] Create error:", e);
    return NextResponse.json({ message: "Failed to create shipment" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 401 });

  const shipments = await prisma.shipment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(shipments);
}
