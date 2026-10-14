import { NextRequest, NextResponse } from "next/server";
import { fetchLiveCarrierRates } from "@/lib/legacy/carrier-rates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      originCountry = "Nigeria",
      originState,
      originCity,
      originPostalCode,
      originAddress,
      destinationCountry = "United Kingdom",
      destinationState,
      destinationCity,
      destinationPostalCode,
      destinationAddress,
      weightKg = 1,
      length = 20,
      width = 20,
      height = 20,
      pickupDate,
    } = body;

    const result = await fetchLiveCarrierRates({
      originCountry,
      originState,
      originCity,
      originPostalCode,
      originAddress,
      destinationCountry,
      destinationState,
      destinationCity,
      destinationPostalCode,
      destinationAddress,
      weightKg: Number(weightKg) || 1,
      length: Number(length) || 20,
      width: Number(width) || 20,
      height: Number(height) || 20,
      pickupDate,
    });

    return NextResponse.json({
      success: true,
      rates: result.rates,
      liveQuote: result.liveQuote,
      isLiveDhl: result.liveQuote !== null,
    });
  } catch (err) {
    console.error("[RateAPI] Error computing rates:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Failed to calculate rates",
      },
      { status: 500 }
    );
  }
}
