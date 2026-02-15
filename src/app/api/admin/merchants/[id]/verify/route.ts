import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const verified = !!body.verified;

  await prisma.merchantProfile.update({
    where: { id },
    data: { verified },
  });

  return NextResponse.json({ ok: true });
}
