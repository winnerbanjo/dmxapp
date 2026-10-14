import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_MAPBOX_TOKEN =
  process.env.MAPBOX_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  Buffer.from(
    "cGsuZXlKMUlqb2lkR1ZqYUc1cGJHVXdJaXdpWVNJNkltTnRjMlJoYVhKME9URXlZbTR5ZW5NMWJEWjRhMkU1YmpFaWZRLkIyOWZfdjlEOXFxQjBvZ2lSZjJ2VHc=",
    "base64"
  ).toString("utf-8");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: true, features: [] });
    }

    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query.trim()
    )}.json?access_token=${DEFAULT_MAPBOX_TOKEN}&limit=5`;

    const res = await fetch(mapboxUrl, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "Mapbox lookup failed", features: [] },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      features: data.features || [],
    });
  } catch (error) {
    console.error("[Places Autocomplete] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", features: [] },
      { status: 500 }
    );
  }
}
