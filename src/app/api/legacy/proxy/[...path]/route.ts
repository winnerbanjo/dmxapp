import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function legacyApiBaseUrl(): string {
  return (process.env.LEGACY_API_BASE_URL ?? "https://backend.dmxlogistics.com.ng").replace(
    /\/+$/,
    "",
  );
}

function copyHeaders(headers: Headers): Headers {
  const nextHeaders = new Headers();
  headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.has(lower) && lower !== "host") {
      nextHeaders.set(key, value);
    }
  });
  return nextHeaders;
}

async function proxyLegacyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const target = new URL(`${legacyApiBaseUrl()}/${path.map(encodeURIComponent).join("/")}`);
  target.search = req.nextUrl.search;

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const headers = copyHeaders(req.headers);

  const upstream = await fetch(target, {
    method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    cache: "no-store",
  });

  const responseHeaders = copyHeaders(upstream.headers);
  responseHeaders.set("x-dmx-legacy-proxy", "true");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyLegacyRequest;
export const POST = proxyLegacyRequest;
export const PUT = proxyLegacyRequest;
export const PATCH = proxyLegacyRequest;
export const DELETE = proxyLegacyRequest;

