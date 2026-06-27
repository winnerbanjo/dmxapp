import { NextResponse } from "next/server";
import { connectLegacyDB } from "@/lib/legacy/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conn = await connectLegacyDB();
    if (!conn) {
      return NextResponse.json(
        { ok: false, message: "LEGACY_MONGO_URI is not configured" },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      database: conn.name,
      readyState: conn.readyState,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Legacy database unavailable",
      },
      { status: 503 },
    );
  }
}
