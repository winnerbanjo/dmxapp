import { NextRequest, NextResponse } from "next/server";
import { getLegacyShipments } from "@/lib/legacy/shipments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit") ?? "25");
  const page = Number(searchParams.get("page") ?? "1");
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  try {
    const data = await getLegacyShipments({
      limit: Number.isFinite(limit) ? limit : 25,
      page: Number.isFinite(page) ? page : 1,
      status,
      search,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to fetch legacy shipments",
      },
      { status: 503 },
    );
  }
}
