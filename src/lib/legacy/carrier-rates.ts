import crypto from "crypto";
import https from "https";
import dns from "dns";

const BACKEND_HOST = "backend.dmxlogistics.com.ng";
const BACKEND_BASE_URL = (
  process.env.LEGACY_API_BASE_URL ?? `https://${BACKEND_HOST}`
).replace(/\/+$/, "");

const JWT_SECRET = (process.env.JWT_SECRET || "").replace(/^["']|["']$/g, "").trim();

// Active admin ID used in production
const DEFAULT_ADMIN_ID = "652d4dd12437062da15c5551";

import countriesData from "@/data/countries.json";

export interface CountryItem {
  _id: string;
  Name: string;
  Code: string;
  TelephoneCode?: string;
  DHLZone?: number;
  DHLProfitMargin?: number;
}

export const ALL_COUNTRIES: CountryItem[] = countriesData as CountryItem[];

const COUNTRY_LOOKUP = new Map<string, string>();

for (const c of ALL_COUNTRIES) {
  COUNTRY_LOOKUP.set(c._id.toLowerCase(), c._id);
  COUNTRY_LOOKUP.set(c.Name.toLowerCase().trim(), c._id);
  if (c.Code) {
    COUNTRY_LOOKUP.set(c.Code.toLowerCase().trim(), c._id);
  }
}

// Aliases
COUNTRY_LOOKUP.set("uk", "652d3bbccb00999fcfe79b99");
COUNTRY_LOOKUP.set("usa", "652d3bbccb00999fcfe79bb1");
COUNTRY_LOOKUP.set("u.s.a.", "652d3bbccb00999fcfe79bb1");
COUNTRY_LOOKUP.set("united states", "652d3bbccb00999fcfe79bb1");
COUNTRY_LOOKUP.set("united states of america", "652d3bbccb00999fcfe79bb1");
COUNTRY_LOOKUP.set("u.k.", "652d3bbccb00999fcfe79b99");
COUNTRY_LOOKUP.set("great britain", "652d3bbccb00999fcfe79b99");

export function resolveCountryId(countryNameOrCode?: string): string {
  if (!countryNameOrCode) return "652d3bbccb00999fcfe79b95"; // Nigeria
  const clean = countryNameOrCode.trim();
  if (/^[a-f\d]{24}$/i.test(clean)) return clean;
  const lower = clean.toLowerCase();
  const direct = COUNTRY_LOOKUP.get(lower);
  if (direct) return direct;

  const found = ALL_COUNTRIES.find((c) =>
    c.Name.toLowerCase().includes(lower) || lower.includes(c.Name.toLowerCase())
  );
  return found ? found._id : "652d3bbccb00999fcfe79b95";
}

export function generateAdminBackendToken(): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    adminId: DEFAULT_ADMIN_ID,
    iat: now,
    exp: now + 3600 * 24,
  };

  const b64 = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const encHeader = b64(header);
  const encPayload = b64(payload);
  const sig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encHeader}.${encPayload}`)
    .digest("base64url");

  return `${encHeader}.${encPayload}.${sig}`;
}

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignored if not permitted
}

async function callBackendApi(
  path: string,
  method: string,
  body: unknown,
  token: string
): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: BACKEND_HOST,
        path,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
        },
        timeout: 12000,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode ?? 500, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode ?? 500, data: raw });
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Backend request timeout"));
    });

    if (postData) req.write(postData);
    req.end();
  });
}

export interface RateRequestPayload {
  originCountry: string;
  originState?: string;
  originCity?: string;
  originPostalCode?: string;
  originAddress?: string;
  destinationCountry: string;
  destinationState?: string;
  destinationCity?: string;
  destinationPostalCode?: string;
  destinationAddress?: string;
  weightKg: number;
  length?: number;
  width?: number;
  height?: number;
  pickupDate?: string;
}

export interface CalculatedRate {
  id: string;
  name: string;
  carrierCode: string;
  service: string;
  pickup: string;
  delivery: string;
  amount: number;
  tags: string[];
  recommended?: boolean;
  isLive?: boolean;
}

export async function fetchLiveCarrierRates(
  params: RateRequestPayload
): Promise<{ rates: CalculatedRate[]; liveQuote: number | null }> {
  const {
    originCountry,
    originState = "Lagos",
    originCity = "Lekki",
    originPostalCode = "106104",
    originAddress = "3 Oriwu Street, Lekki",
    destinationCountry,
    destinationState = "Aberdeen",
    destinationCity = "Aberdeen",
    destinationPostalCode = "M1 1AQ",
    destinationAddress = "Manchester, UK",
    weightKg,
    length = 20,
    width = 20,
    height = 20,
    pickupDate = new Date().toISOString().split("T")[0],
  } = params;

  const originCountryId = resolveCountryId(originCountry);
  const destCountryId = resolveCountryId(destinationCountry);

  const volumetricWeight = Math.round(((length * width * height) / 5000) * 100) / 100;
  const chargeableWeight = Math.max(weightKg, volumetricWeight, 0.5);

  const dhlCarrierId = "652d3bc3cb00999fcfe79d57";
  const token = generateAdminBackendToken();

  let dhlLiveRate: number | null = null;

  try {
    const rateReqBody = {
      pickupDate,
      shipper: {
        Country: originCountryId,
        State: originState,
        City: originCity,
        PostalCode: originPostalCode,
        Address: originAddress,
      },
      receiver: {
        Country: destCountryId,
        State: destinationState,
        City: destinationCity,
        PostalCode: destinationPostalCode,
        Address: destinationAddress,
      },
      cargos: [
        {
          Weight: chargeableWeight,
          Quantity: 1,
          Length: length,
          Breadth: width,
          Height: height,
        },
      ],
    };

    const res = await callBackendApi(
      `/shipments/rate/${dhlCarrierId}`,
      "POST",
      rateReqBody,
      token
    );

    const data = res.data as { status?: string; data?: { rate?: number } };
    console.log("[CarrierRates] Backend response:", res.status, data);
    if (res.status === 200 && data?.status === "success" && typeof data?.data?.rate === "number") {
      dhlLiveRate = Math.round(data.data.rate * 100) / 100;
    }
  } catch (err) {
    console.error("[CarrierRates] Live DHL fetch error, using calibrated fallback:", err);
  }

  const isInternational =
    originCountry.trim().toLowerCase() !== destinationCountry.trim().toLowerCase() &&
    destinationCountry.trim().toLowerCase() !== "nigeria";

  const baselineDhlRate =
    dhlLiveRate ??
    (isInternational
      ? Math.round((75000 + chargeableWeight * 45000) * 100) / 100
      : Math.round((3500 + chargeableWeight * 1200) * 100) / 100);

  const rates: CalculatedRate[] = [
    {
      id: "dhl",
      name: "DHL Express",
      carrierCode: "DHL",
      service: isInternational ? "Express Worldwide" : "Express Domestic",
      pickup: "Within 1 business day",
      delivery: isInternational ? "Within 2 business days" : "Next business day",
      amount: baselineDhlRate,
      tags: ["Pickup", "Dropoff"],
      recommended: true,
      isLive: dhlLiveRate !== null,
    },
    {
      id: "ups",
      name: "United Parcel Services",
      carrierCode: "UPS",
      service: "Express Saver",
      pickup: "Within 3 business days",
      delivery: "Within 5 business days",
      amount: Math.round(baselineDhlRate * 0.88 * 100) / 100,
      tags: ["Pickup"],
      isLive: false,
    },
    {
      id: "fedex-priority",
      name: "FedEx",
      carrierCode: "TAF",
      service: isInternational ? "International Priority" : "Priority Overnight",
      pickup: "Within 2 business days",
      delivery: "Within 3 business days",
      amount: Math.round(baselineDhlRate * 0.92 * 100) / 100,
      tags: ["Pickup", "Dropoff"],
      isLive: false,
    },
    {
      id: "ship-naija",
      name: "Ship to Naija",
      carrierCode: "STN",
      service: "Economy Air",
      pickup: "Drop-off only",
      delivery: "Within 5-7 business days",
      amount: Math.round(baselineDhlRate * 0.76 * 100) / 100,
      tags: ["Dropoff"],
      isLive: false,
    },
    {
      id: "aramax",
      name: "Aramex",
      carrierCode: "ARAMEX",
      service: "Standard Express",
      pickup: "Within 2 business days",
      delivery: "Within 4 business days",
      amount: Math.round(baselineDhlRate * 0.82 * 100) / 100,
      tags: ["Dropoff"],
      isLive: false,
    },
    {
      id: "dmx-express",
      name: "DMX Express",
      carrierCode: "DMX-LA",
      service: "Standard Dispatch",
      pickup: "Within 1 business day",
      delivery: "Within 2 business days",
      amount: Math.round(baselineDhlRate * 0.85 * 100) / 100,
      tags: ["Pickup"],
      isLive: false,
    },
  ];

  return { rates, liveQuote: dhlLiveRate };
}
