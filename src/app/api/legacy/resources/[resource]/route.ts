import { NextResponse, type NextRequest } from "next/server";
import {
  getLegacyResourcePage,
  isLegacyResourceName,
  listLegacyResourceNames,
} from "@/lib/legacy/resources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { resource: string } },
) {
  const resource = params.resource;

  if (!isLegacyResourceName(resource)) {
    return NextResponse.json(
      {
        message: "Unknown legacy resource",
        availableResources: listLegacyResourceNames(),
      },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 25);
  const page = Number(searchParams.get("page") ?? 1);
  const search = searchParams.get("search") ?? undefined;

  try {
    const payload = await getLegacyResourcePage(resource, { limit, page, search });
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to fetch legacy resource",
      },
      { status: 503 },
    );
  }
}

