/** Service types for Dynamic Service Flows (Merchant + Hub). */

export type ServiceType = "local" | "nationwide" | "international" | "movers";

export const SERVICE_LABELS: Record<ServiceType, string> = {
  local: "Local Delivery",
  nationwide: "Nationwide",
  international: "International (Import/Export)",
  movers: "DMX Movers / Heavy Van",
};

export const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
  local: "Same-city bike/van",
  nationwide: "Inter-state hub-to-hub",
  international: "Cross-border shipping",
  movers: "Heavy van, laborers, and packaging. Moving made simple.",
};

/** City → assigned hub for Smart Destination Mapping. Merchant can override. */
export const CITY_TO_HUB: Record<string, string> = {
  Abuja: "Abuja Hub",
  Lagos: "Lagos Hub",
  "Port Harcourt": "Port Harcourt Hub",
  PH: "Port Harcourt Hub",
  Kano: "Kano Hub",
  Ibadan: "Lagos Hub",
  Benin: "Lagos Hub",
  Enugu: "Enugu Hub",
  Kaduna: "Kano Hub",
  Warri: "Port Harcourt Hub",
  Calabar: "Port Harcourt Hub",
  Jos: "Abuja Hub",
  Maiduguri: "Kano Hub",
  Owerri: "Port Harcourt Hub",
  Onitsha: "Lagos Hub",
  Uyo: "Port Harcourt Hub",
  Ilorin: "Lagos Hub",
};

export const DESTINATION_HUB_OPTIONS = [
  { value: "Lagos Hub", label: "Lagos Hub" },
  { value: "Abuja Hub", label: "Abuja Hub" },
  { value: "Port Harcourt Hub", label: "Port Harcourt Hub" },
  { value: "Kano Hub", label: "Kano Hub" },
  { value: "Enugu Hub", label: "Enugu Hub" },
];

/** Terms & Conditions footer per service for the booking slip. */
export const TERMS_BY_SERVICE: Record<ServiceType, string> = {
  local: "Same-day delivery within city. Standard liability applies.",
  nationwide: "Hub-to-hub transit. Insurance optional. See waybill for limits.",
  international: "Insurance included for International. Customs and duties are recipient's responsibility.",
  movers: "Van hire, laborers, and packaging as selected. Cancellation policy applies.",
};
