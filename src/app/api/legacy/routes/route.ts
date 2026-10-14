import { NextResponse } from "next/server";
import { LEGACY_PROXY_PREFIX, LEGACY_ROUTE_GROUPS } from "@/lib/legacy/routes";
import { listLegacyResourceNames } from "@/lib/legacy/resources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    proxyPrefix: LEGACY_PROXY_PREFIX,
    routeGroups: LEGACY_ROUTE_GROUPS,
    resourceEndpoints: listLegacyResourceNames().map((resource) => ({
      resource,
      url: `/api/legacy/resources/${resource}`,
    })),
  });
}

