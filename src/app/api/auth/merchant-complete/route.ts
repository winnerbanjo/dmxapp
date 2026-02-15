import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  businessName: z.string().min(1),
  businessAddress: z.string().min(1),
  category: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    const { email, businessName, businessAddress, category } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { merchantProfile: true },
    });
    if (!user || user.role !== "MERCHANT") {
      return NextResponse.json({ message: "Merchant account not found." }, { status: 400 });
    }
    if (user.merchantProfile) {
      return NextResponse.json({ message: "Business details already submitted." }, { status: 400 });
    }

    await prisma.merchantProfile.create({
      data: {
        userId: user.id,
        businessName,
        businessAddress,
        category: category ?? null,
        verified: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to save business details." }, { status: 500 });
  }
}
