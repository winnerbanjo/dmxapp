"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface InitializePaymentResult {
  success: boolean;
  authorizationUrl?: string;
  reference?: string;
  error?: string;
}

export async function initializePayment(
  amountInNaira: number
): Promise<InitializePaymentResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  if (!PAYSTACK_SECRET_KEY) {
    console.error("[Paystack] PAYSTACK_SECRET_KEY is not configured");
    return { success: false, error: "Payment service is not configured." };
  }

  // Validate amount: min ₦100, max ₦10,000,000
  if (amountInNaira < 100 || amountInNaira > 10_000_000) {
    return {
      success: false,
      error: "Amount must be between ₦100 and ₦10,000,000.",
    };
  }

  try {
    // Ensure user has a wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          currency: "NGN",
        },
      });
    }

    // Paystack amount is in kobo (smallest currency unit)
    const amountInKobo = Math.round(amountInNaira * 100);

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const callbackUrl = `${baseUrl}/merchant/dashboard/wallet?funded=1`;

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: session.user.email,
        amount: amountInKobo,
        currency: "NGN",
        callback_url: callbackUrl,
        metadata: {
          userId: session.user.id,
          walletId: wallet.id,
        },
      }),
    });

    const data = (await response.json()) as {
      status: boolean;
      message?: string;
      data?: { authorization_url: string; reference: string };
    };

    if (!data.status || !data.data?.authorization_url) {
      console.error("[Paystack] Initialize failed:", data.message);
      return {
        success: false,
        error: data.message ?? "Failed to initialize payment.",
      };
    }

    // Create a PENDING transaction record for tracking
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "DEPOSIT",
        amount: amountInNaira,
        status: "PENDING",
        reference: data.data.reference,
        description: "Wallet funding via Paystack",
        metadata: { source: "paystack", initiatedAt: new Date().toISOString() },
      },
    });

    return {
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    };
  } catch (err) {
    console.error("[Paystack] Initialize error:", err);
    return {
      success: false,
      error: "An error occurred while initializing payment.",
    };
  }
}
