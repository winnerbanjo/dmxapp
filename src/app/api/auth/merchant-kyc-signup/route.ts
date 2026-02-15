import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { connectDB } from "@dmx/lib/mongodb";
import Merchant from "@dmx/lib/models/Merchant";
import { createToken } from "@dmx/lib/auth";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      personalKyc,
      businessKyc,
    } = body as {
      email: string;
      password: string;
      personalKyc: { fullName: string; dateOfBirth: string; idType: string };
      businessKyc: { companyName: string; rcNumber: string; businessAddress: string };
    };

    if (!email?.trim() || !password || (password as string).length < 6) {
      return NextResponse.json({ message: "Email and password (min 6 chars) required." }, { status: 400 });
    }
    if (!businessKyc?.companyName?.trim() || !businessKyc?.businessAddress?.trim()) {
      return NextResponse.json({ message: "Company name and business address required." }, { status: 400 });
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ message: "Database unavailable. Use demo login." }, { status: 503 });
    }

    const existing = await Merchant.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json({ message: "Email already registered." }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);
    const merchant = await Merchant.create({
      email: email.trim().toLowerCase(),
      password: passwordHash,
      businessName: businessKyc.companyName.trim(),
      address: businessKyc.businessAddress.trim(),
      isVerified: false,
      kycStatus: "Pending Verification",
      personalKyc: personalKyc
        ? {
            fullName: personalKyc.fullName ?? "",
            dateOfBirth: personalKyc.dateOfBirth ?? "",
            idType: (personalKyc.idType as "NIN" | "Passport" | "BVN") ?? "NIN",
          }
        : undefined,
      businessKyc: {
        companyName: businessKyc.companyName.trim(),
        rcNumber: businessKyc.rcNumber?.trim() ?? "",
        businessAddress: businessKyc.businessAddress.trim(),
      },
      walletBalance: 0,
    });

    const token = await createToken({
      merchantId: String(merchant._id),
      email: merchant.email,
      isVerified: false,
    });

    const res = NextResponse.json({ ok: true, token });
    res.cookies.set("dmx-merchant-token", token, COOKIE_OPTIONS);
    return res;
  } catch (e) {
    console.error("merchant-kyc-signup error:", e);
    return NextResponse.json({ message: "Sign-up failed." }, { status: 500 });
  }
}