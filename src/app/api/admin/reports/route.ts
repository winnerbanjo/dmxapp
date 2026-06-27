import { NextResponse } from 'next/server';

// Sample static data – replace with real DB query when available
const ADMIN_REPORT_ROWS = [
  { name: 'Lagos Hub', kind: 'hub', shipments: 224, revenue: 1420000, margin: 26 },
  { name: 'Abuja Hub', kind: 'hub', shipments: 180, revenue: 1080000, margin: 23 },
  { name: 'Mubarak Ventures', kind: 'merchant', shipments: 92, revenue: 620000, margin: 21 },
  { name: 'GreenLife Pharma', kind: 'merchant', shipments: 74, revenue: 560000, margin: 24 },
];

export async function GET() {
  return NextResponse.json(ADMIN_REPORT_ROWS);
}
