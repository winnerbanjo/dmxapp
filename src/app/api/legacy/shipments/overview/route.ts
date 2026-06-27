import { NextResponse } from "next/server";
import { getLegacyOverview } from "@/lib/legacy/shipments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getLegacyOverview());
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to fetch legacy overview",
      },
      { status: 503 },
    );
  }
}
