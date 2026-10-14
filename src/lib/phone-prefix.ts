import allCountriesData from "@/data/countries.json";

export interface PhonePrefixOption {
  country: string;
  code: string;
  prefix: string;
}

// Built directly from the verified 240+ countries list in countries.json
export const COUNTRY_PHONE_PREFIXES: PhonePrefixOption[] = (allCountriesData as any[])
  .filter((c) => c && c.Name && c.TelephoneCode)
  .map((c) => {
    let prefix = String(c.TelephoneCode).trim();
    if (!prefix.startsWith("+")) prefix = `+${prefix}`;
    return {
      country: c.Name,
      code: c.Code || "",
      prefix,
    };
  })
  .sort((a, b) => {
    // Put popular ones first
    const popular = ["Nigeria", "United Kingdom", "United States", "Canada", "Ghana", "South Africa"];
    const aIdx = popular.indexOf(a.country);
    const bIdx = popular.indexOf(b.country);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.country.localeCompare(b.country);
  });

/**
 * Gets dialing prefix for a given country name (defaults to +234 for Nigeria)
 */
export function getPrefixForCountry(countryName?: string): string {
  if (!countryName) return "+234";
  const normalized = countryName.trim().toLowerCase();
  
  if (normalized === "nigeria" || normalized === "ng") return "+234";
  if (normalized.includes("kingdom") || normalized === "uk" || normalized === "gb") return "+44";
  if (normalized === "united states" || normalized === "usa" || normalized === "us") return "+1";
  if (normalized === "canada" || normalized === "ca") return "+1";
  if (normalized === "ghana" || normalized === "gh") return "+233";

  const match = COUNTRY_PHONE_PREFIXES.find(
    (p) => p.country.toLowerCase() === normalized || p.code.toLowerCase() === normalized
  );
  return match ? match.prefix : "+234";
}

/**
 * Splits an existing full phone string into prefix and national number
 */
export function splitPhoneNumber(fullPhone: string, fallbackCountry?: string): { prefix: string; localNumber: string } {
  if (!fullPhone) {
    return { prefix: getPrefixForCountry(fallbackCountry), localNumber: "" };
  }

  const cleaned = fullPhone.trim();

  // If starts with +, try matching known prefix
  if (cleaned.startsWith("+")) {
    for (const item of COUNTRY_PHONE_PREFIXES) {
      if (cleaned.startsWith(item.prefix)) {
        const local = cleaned.slice(item.prefix.length).trim().replace(/^0+/, "");
        return { prefix: item.prefix, localNumber: local };
      }
    }
  }

  // If starts with 0 (Nigerian format e.g. 08012345678)
  const defaultPrefix = getPrefixForCountry(fallbackCountry);
  const local = cleaned.replace(/^0+/, "");
  return { prefix: defaultPrefix, localNumber: local };
}

/**
 * Formats prefix and national number into standard international format
 */
export function formatFullPhone(prefix: string, localNumber: string): string {
  const cleanLocal = localNumber.replace(/[^\d]/g, "").replace(/^0+/, "");
  if (!cleanLocal) return "";
  return `${prefix.trim()} ${cleanLocal}`;
}
