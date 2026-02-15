/**
 * Countries for Quick Quote dropdown — mapped to export/import zones.
 * Values must match getZoneFromCountry (lowercased) in zone-pricing.ts.
 */
export const QUICK_QUOTE_COUNTRIES: { value: string; label: string }[] = [
  { value: "United Kingdom", label: "United Kingdom (Zone 1)" },
  { value: "Ireland", label: "Ireland (Zone 1)" },
  { value: "Ghana", label: "Ghana (Zone 2)" },
  { value: "Cameroon", label: "Cameroon (Zone 2)" },
  { value: "Senegal", label: "Senegal (Zone 2)" },
  { value: "USA", label: "USA (Zone 3)" },
  { value: "Canada", label: "Canada (Zone 3)" },
  { value: "Mexico", label: "Mexico (Zone 3)" },
  { value: "Australia", label: "Australia (Zone 4)" },
  { value: "New Zealand", label: "New Zealand (Zone 4)" },
];
