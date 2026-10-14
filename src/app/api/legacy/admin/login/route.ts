import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyLegacyAdminCredentials } from "@/lib/legacy/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().min(1).optional(),
  EmailAddress: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  Password: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const email = parsed.data.email ?? parsed.data.EmailAddress;
  const password = parsed.data.password ?? parsed.data.Password;

  if (!email || !password) {
    return NextResponse.json({ message: "Fill in all fields" }, { status: 400 });
  }

  try {
    const session = await verifyLegacyAdminCredentials(email, password);
    if (!session) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 404 });
    }

    const response = NextResponse.json({
      status: "success",
      message: "Login successful",
      data: session,
    });
    response.cookies.set("dmx-legacy-admin-token", session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to verify legacy admin credentials",
      },
      { status: 503 },
    );
  }
}
