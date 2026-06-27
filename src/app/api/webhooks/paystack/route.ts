import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    metadata?: {
      userId?: string;
      walletId?: string;
    };
  };
}

function verifyPaystackSignature(payload: string, signature: string): boolean {
  if (!PAYSTACK_SECRET_KEY) return false;
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    console.error("[Paystack Webhook] PAYSTACK_SECRET_KEY is not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("x-paystack-signature");
  if (!signature) {
    console.warn("[Paystack Webhook] Missing x-paystack-signature header");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    console.error("[Paystack Webhook] Failed to read body:", err);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (!verifyPaystackSignature(rawBody, signature)) {
    console.warn("[Paystack Webhook] Invalid signature - possible forgery attempt");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  let event: PaystackWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch (err) {
    console.error("[Paystack Webhook] Invalid JSON payload:", err);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const { reference, amount, status, metadata } = event.data;

  if (status !== "success") {
    console.warn("[Paystack Webhook] Ignoring non-success event:", { reference, status });
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const userId = metadata?.userId;
  const walletId = metadata?.walletId;

  if (!userId || !walletId) {
    console.error("[Paystack Webhook] Missing userId or walletId in metadata:", {
      reference,
      metadata,
    });
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const amountInNaira = amount / 100;

  try {
    await prisma.$transaction(async (tx) => {
      const existingTxn = await tx.transaction.findUnique({
        where: { reference },
      });

      if (existingTxn?.status === "SUCCESS") {
        console.info("[Paystack Webhook] Duplicate event, already processed:", reference);
        return;
      }

      const wallet = await tx.wallet.findUnique({
        where: { id: walletId, userId },
      });

      if (!wallet) {
        throw new Error(`Wallet not found: ${walletId} for user ${userId}`);
      }

      const currentBalance = new Decimal(wallet.balance.toString());
      const newBalance = currentBalance.plus(amountInNaira);

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      });

      await tx.transaction.upsert({
        where: { reference },
        create: {
          walletId,
          type: "DEPOSIT",
          amount: amountInNaira,
          status: "SUCCESS",
          reference,
          description: "Wallet funding via Paystack",
          metadata: {
            source: "paystack",
            event: "charge.success",
            completedAt: new Date().toISOString(),
          },
        },
        update: { status: "SUCCESS" },
      });
    });
    console.log("[Paystack Webhook] Payment success", {
      reference,
      amount: amountInNaira,
      userId,
      walletId,
    });
  } catch (err) {
    console.error("[Paystack Webhook] Processing error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
