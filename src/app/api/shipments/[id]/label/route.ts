import { NextRequest, NextResponse } from "next/server";
import { getShipmentDocData } from "@/lib/shipment-document";
import { generateShippingLabelPdf } from "@/lib/pdf-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isDownload = request.nextUrl.searchParams.get("download") === "1";
    const data = await getShipmentDocData(id);
    const pdfBuffer = await generateShippingLabelPdf(data);

    const disposition = isDownload ? "attachment" : "inline";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="DMX-Label-${data.trackingNumber}.pdf"`,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("[LabelAPI] Failed to generate shipping label PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate shipping label PDF" },
      { status: 500 }
    );
  }
}
