import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMockApiKey } from "@/lib/utils";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { merchantProfile: true },
    });

    if (!user?.merchantProfile) {
      return NextResponse.json({ message: "Merchant profile required" }, { status: 403 });
    }

    const apiKey = generateMockApiKey();
    await prisma.merchantProfile.update({
      where: { userId: user.id },
      data: { apiKey },
    });

    return NextResponse.json({ apiKey });
  } catch (e) {
    console.error("[Merchant API Key]", e);
    return NextResponse.json({ message: "Failed to generate API key" }, { status: 500 });
  }
}
