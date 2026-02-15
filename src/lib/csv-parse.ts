/**
 * Lightweight CSV parser for rate card uploads.
 * Handles header row and data rows; normalizes header keys for matching.
 */

export interface ParseCsvResult {
  headers: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
}

/** Split a single CSV line by commas, respecting double-quoted fields. */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/** Normalize header for matching: lowercase, replace spaces/underscores with nothing. */
export function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .replace(/[\s_]/g, "");
}

export function parseCsv(csvText: string): ParseCsvResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [], rawRows: [] };
  }
  const headerLine = lines[0];
  const headers = splitCsvLine(headerLine).map((h) => h.trim());
  const rawRows: string[][] = [];
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    rawRows.push(cells);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = cells[idx]?.trim() ?? "";
    });
    rows.push(row);
  }

  return { headers, rows, rawRows };
}

/** Required rate card columns (normalized). Accept Origin, origin, Base Price, BasePrice, base_price, etc. */
export const RATE_CARD_REQUIRED = ["origin", "destination", "baseprice", "weightrate"] as const;

const HEADER_ALIASES: Record<string, string> = {
  origin: "origin",
  destination: "destination",
  baseprice: "baseprice",
  base_price: "baseprice",
  "base price": "baseprice",
  weightrate: "weightrate",
  weight_rate: "weightrate",
  "weight rate": "weightrate",
  perkg: "weightrate",
  per_kg: "weightrate",
  "per kg": "weightrate",
  costprice: "costprice",
  cost_price: "costprice",
  "cost price": "costprice",
  costweightrate: "costweightrate",
  cost_weight_rate: "costweightrate",
  "cost weight rate": "costweightrate",
};

/** Validate that CSV has required columns. Returns first missing normalized name or null. */
export function validateRateCardHeaders(headers: string[]): string | null {
  const normalized = new Set(headers.map((h) => HEADER_ALIASES[normalizeHeader(h)] ?? normalizeHeader(h)));
  for (const req of RATE_CARD_REQUIRED) {
    if (!normalized.has(req)) return req;
  }
  return null;
}

/** Map a row to rate with optional cost fields (cost price = carrier cost; selling = cost × (1 + markup %)). */
export function mapRowToRate(
  row: Record<string, string>,
  headerToNormal: Record<string, string>
): {
  origin: string;
  destination: string;
  basePrice: number;
  weightRate: number;
  costBasePrice?: number;
  costWeightRate?: number;
} {
  const get = (norm: string): string => {
    const orig = Object.keys(headerToNormal).find((h) => (HEADER_ALIASES[normalizeHeader(h)] ?? normalizeHeader(h)) === norm);
    return orig ? (row[orig] ?? "") : "";
  };
  const basePrice = Math.max(0, parseFloat(get("baseprice")) || 0);
  const weightRate = Math.max(0, parseFloat(get("weightrate")) || 0);
  const costPriceRaw = parseFloat(get("costprice"));
  const costWeightRateRaw = parseFloat(get("costweightrate"));
  const costBasePrice = costPriceRaw > 0 ? costPriceRaw : undefined;
  const costWeightRate = costWeightRateRaw > 0 ? costWeightRateRaw : undefined;
  return {
    origin: get("origin").trim(),
    destination: get("destination").trim(),
    basePrice,
    weightRate,
    ...(costBasePrice != null && { costBasePrice }),
    ...(costWeightRate != null && { costWeightRate }),
  };
}

/** Parse CSV and map to rate rows. Validates headers; throws on invalid format. */
export function parseRateCardCsv(csvText: string): {
  rows: { origin: string; destination: string; basePrice: number; weightRate: number }[];
  headers: string[];
} {
  const { headers, rows } = parseCsv(csvText);
  const missing = validateRateCardHeaders(headers);
  if (missing) {
    throw new Error("Invalid CSV Format. Please ensure column headers match.");
  }
  const headerToNormal: Record<string, string> = {};
  headers.forEach((h) => {
    const n = HEADER_ALIASES[normalizeHeader(h)] ?? normalizeHeader(h);
    headerToNormal[h] = n;
  });
  const mapped = rows
    .map((row) => mapRowToRate(row, headerToNormal))
    .filter((r) => r.origin || r.destination);
  return { rows: mapped, headers };
}

/** International CSV: Weight (KG), UK (Zone 1), West Africa (Zone 2), Canada & USA (Zone 3), Australia (Zone 4). */
function normInt(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ").replace(/&/g, " ");
}

export function parseInternationalRateCsv(csvText: string): {
  rows: { weightKg: number; zone1Amount: number; zone2Amount: number; zone3Amount: number; zone4Amount: number; zone?: string }[];
  headers: string[];
} {
  const { headers, rows } = parseCsv(csvText);
  const iWeight = headers.findIndex((h) => /weight|kg/i.test(normInt(h)));
  const iUk = headers.findIndex((h) => /^uk|uk\s*\(/i.test(normInt(h)));
  const iZone2 = headers.findIndex((h) => /west\s*africa|zone\s*2/i.test(normInt(h)));
  const iUsa = headers.findIndex((h) => /usa|canada/i.test(normInt(h)));
  const iAustralia = headers.findIndex((h) => /australia/i.test(normInt(h)));
  if (iWeight < 0 || iUk < 0 || iUsa < 0 || iAustralia < 0) {
    throw new Error("Invalid CSV Format. Required: Weight (KG), UK (Zone 1), West Africa (Zone 2), Canada & USA (Zone 3), Australia (Zone 4).");
  }
  const mapped = rows
    .map((row) => ({
      weightKg: Math.max(0, parseFloat(String(row[headers[iWeight]] ?? "")) || 0),
      zone1Amount: Math.max(0, parseFloat(String(row[headers[iUk]] ?? "")) || 0),
      zone2Amount: iZone2 >= 0 ? Math.max(0, parseFloat(String(row[headers[iZone2]] ?? "")) || 0) : 0,
      zone3Amount: Math.max(0, parseFloat(String(row[headers[iUsa]] ?? "")) || 0),
      zone4Amount: Math.max(0, parseFloat(String(row[headers[iAustralia]] ?? "")) || 0),
      zone: "A",
    }))
    .filter((r) => r.weightKg > 0 || r.zone1Amount > 0 || r.zone3Amount > 0 || r.zone4Amount > 0);
  return { rows: mapped, headers };
}

/** Movers CSV: Van Size, Base Price, Per KM. */
export function parseMoversRateCsv(csvText: string): {
  rows: { vanSize: string; basePrice: number; perKm: number }[];
  headers: string[];
} {
  const { headers, rows } = parseCsv(csvText);
  const n = (h: string) => normalizeHeader(h);
  const iVan = headers.findIndex((h) => /van|size/i.test(n(h)));
  const iBase = headers.findIndex((h) => /base|price/i.test(n(h)));
  const iPerKm = headers.findIndex((h) => /per|km/i.test(n(h)));
  if (iVan < 0 || iBase < 0 || iPerKm < 0) {
    throw new Error("Invalid CSV Format. Please ensure column headers match.");
  }
  const mapped = rows
    .map((row) => ({
      vanSize: String(row[headers[iVan]] ?? "").trim() || "Mini Van",
      basePrice: Math.max(0, parseFloat(String(row[headers[iBase]] ?? "")) || 0),
      perKm: Math.max(0, parseFloat(String(row[headers[iPerKm]] ?? "")) || 0),
    }))
    .filter((r) => r.vanSize || r.basePrice > 0);
  return { rows: mapped, headers };
}
