import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER", "MERCHANT"]),
  // Step 2 merchant fields
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  category: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { email, password, name, phone, role, businessName, businessAddress, category } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Email already registered." }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
        phone: phone ?? null,
        role,
      },
    });

    if (role === "MERCHANT" && businessName && businessAddress) {
      await prisma.merchantProfile.create({
        data: {
          userId: user.id,
          businessName,
          businessAddress,
          category: category ?? null,
          verified: false,
        },
      });
    }

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Registration failed." }, { status: 500 });
  }
}
