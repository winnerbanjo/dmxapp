import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          currency: "NGN",
        },
        include: {
          transactions: true,
        },
      });
    }

    return NextResponse.json({
      balance: wallet.balance.toString(),
      currency: wallet.currency,
      transactions: wallet.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount.toString(),
        status: t.status,
        description: t.description,
        reference: t.reference,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[Merchant Wallet API]", err);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
