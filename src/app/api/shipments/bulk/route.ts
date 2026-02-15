import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateTrackingNumber(): string {
  return `DMX${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = values[j] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file || !file.name.endsWith(".csv")) {
    return NextResponse.json({ message: "CSV file required" }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCsv(text);
  const errors: string[] = [];
  let created = 0;

  const required = [
    "type",
    "senderName",
    "senderPhone",
    "senderAddress",
    "senderCity",
    "senderCountry",
    "recipientName",
    "recipientPhone",
    "recipientAddress",
    "recipientCity",
    "recipientCountry",
    "weightKg",
  ];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const missing = required.filter((k) => !row[k]?.trim());
    if (missing.length) {
      errors.push(`Row ${i + 2}: missing ${missing.join(", ")}`);
      continue;
    }
    const type = row.type!.toUpperCase() === "INTERNATIONAL" ? "INTERNATIONAL" : "LOCAL";
    const weightKg = parseFloat(row.weightKg!);
    if (isNaN(weightKg) || weightKg <= 0) {
      errors.push(`Row ${i + 2}: invalid weightKg`);
      continue;
    }
    const ratePerKg = type === "LOCAL" ? 500 : 2000;
    const priceAmount = ratePerKg * weightKg;

    try {
      await prisma.shipment.create({
        data: {
          userId: user.id,
          trackingNumber: generateTrackingNumber(),
          type,
          weightKg,
          priceAmount,
          currency: "NGN",
          senderName: row.senderName!,
          senderPhone: row.senderPhone!,
          senderAddress: row.senderAddress!,
          senderCity: row.senderCity!,
          senderCountry: row.senderCountry!,
          recipientName: row.recipientName!,
          recipientPhone: row.recipientPhone!,
          recipientAddress: row.recipientAddress!,
          recipientCity: row.recipientCity!,
          recipientCountry: row.recipientCountry!,
          notes: row.notes?.trim() || null,
        },
      });
      created++;
    } catch (e) {
      errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : "Failed"}`);
    }
  }

  return NextResponse.json({
    created,
    failed: rows.length - created,
    errors,
  });
}
