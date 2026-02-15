/**
 * Structured address data for Smart Hub Mapping and CSV Pricing Engine.
 * LGAs and States align with CITY_TO_HUB so LGA/State → Hub is consistent.
 */

import { DESTINATION_HUB_OPTIONS } from "./booking-constants";

/** State → Hub (for auto-fill and pricing). Matches our hub coverage. */
export const STATE_TO_HUB: Record<string, string> = {
  Lagos: "Lagos Hub",
  Abuja: "Abuja Hub",
  "FCT": "Abuja Hub",
  "Port Harcourt": "Port Harcourt Hub",
  Rivers: "Port Harcourt Hub",
  Kano: "Kano Hub",
  Oyo: "Lagos Hub",
  Ibadan: "Lagos Hub",
  Edo: "Lagos Hub",
  Benin: "Lagos Hub",
  Enugu: "Enugu Hub",
  Kaduna: "Kano Hub",
  Delta: "Port Harcourt Hub",
  Warri: "Port Harcourt Hub",
  "Cross River": "Port Harcourt Hub",
  Calabar: "Port Harcourt Hub",
  Plateau: "Abuja Hub",
  Jos: "Abuja Hub",
  Borno: "Kano Hub",
  Maiduguri: "Kano Hub",
  Imo: "Port Harcourt Hub",
  Owerri: "Port Harcourt Hub",
  Anambra: "Lagos Hub",
  Onitsha: "Lagos Hub",
  "Akwa Ibom": "Port Harcourt Hub",
  Uyo: "Port Harcourt Hub",
  Kwara: "Lagos Hub",
  Ilorin: "Lagos Hub",
};

/** LGA / Area → Hub (Smart Hub Mapping). Used to verify/suggest hub from address. */
export const LGA_TO_HUB: Record<string, string> = {
  // Abuja / FCT
  Gwarinpa: "Abuja Hub",
  Maitama: "Abuja Hub",
  Wuse: "Abuja Hub",
  "Garki I": "Abuja Hub",
  "Garki II": "Abuja Hub",
  Kubwa: "Abuja Hub",
  Lugbe: "Abuja Hub",
  Karu: "Abuja Hub",
  "Abuja Municipal": "Abuja Hub",
  "Abuja Municipal Area Council": "Abuja Hub",
  // Lagos
  Ikeja: "Lagos Hub",
  Lekki: "Lagos Hub",
  "Lekki Phase 1": "Lagos Hub",
  Surulere: "Lagos Hub",
  "Alimosho": "Lagos Hub",
  "Kosofe": "Lagos Hub",
  "Eti-Osa": "Lagos Hub",
  "Lagos Island": "Lagos Hub",
  "Lagos Mainland": "Lagos Hub",
  Agege: "Lagos Hub",
  Ikorodu: "Lagos Hub",
  Badagry: "Lagos Hub",
  "Ajeromi-Ifelodun": "Lagos Hub",
  Ojo: "Lagos Hub",
  "Amuwo-Odofin": "Lagos Hub",
  Apapa: "Lagos Hub",
  Mushin: "Lagos Hub",
  "Oshodi-Isolo": "Lagos Hub",
  Shomolu: "Lagos Hub",
  // Port Harcourt / Rivers
  "Port Harcourt": "Port Harcourt Hub",
  "Obio-Akpor": "Port Harcourt Hub",
  "Oyigbo": "Port Harcourt Hub",
  "Eleme": "Port Harcourt Hub",
  "Ikwerre": "Port Harcourt Hub",
  // Kano
  "Kano Municipal": "Kano Hub",
  "Nassarawa": "Kano Hub",
  "Fagge": "Kano Hub",
  "Dala": "Kano Hub",
  "Gwale": "Kano Hub",
  // Others (city-style names used as LGA)
  "Enugu North": "Enugu Hub",
  "Enugu South": "Enugu Hub",
  "Enugu East": "Enugu Hub",
  "Kaduna North": "Kano Hub",
  "Kaduna South": "Kano Hub",
  "Warri North": "Port Harcourt Hub",
  "Warri South": "Port Harcourt Hub",
  "Calabar Municipal": "Port Harcourt Hub",
  "Calabar South": "Port Harcourt Hub",
  "Jos North": "Abuja Hub",
  "Jos South": "Abuja Hub",
  "Owerri Municipal": "Port Harcourt Hub",
  "Onitsha North": "Lagos Hub",
  "Onitsha South": "Lagos Hub",
  "Ilorin West": "Lagos Hub",
  "Ilorin East": "Lagos Hub",
  "Ibadan North": "Lagos Hub",
  "Ibadan South": "Lagos Hub",
};

/** States we support (for dropdown). Order: major hubs first. */
export const ADDRESS_STATES = [
  "Lagos",
  "Abuja",
  "FCT",
  "Rivers",
  "Port Harcourt",
  "Kano",
  "Oyo",
  "Edo",
  "Enugu",
  "Kaduna",
  "Delta",
  "Cross River",
  "Plateau",
  "Borno",
  "Imo",
  "Anambra",
  "Akwa Ibom",
  "Kwara",
] as const;

/** LGAs by state (for dropdown when state is selected). */
export const LGA_BY_STATE: Record<string, string[]> = {
  Lagos: ["Ikeja", "Lekki", "Lekki Phase 1", "Surulere", "Alimosho", "Kosofe", "Eti-Osa", "Lagos Island", "Lagos Mainland", "Agege", "Ikorodu", "Badagry", "Ajeromi-Ifelodun", "Ojo", "Amuwo-Odofin", "Apapa", "Mushin", "Oshodi-Isolo", "Shomolu"],
  Abuja: ["Gwarinpa", "Maitama", "Wuse", "Garki I", "Garki II", "Kubwa", "Lugbe", "Karu", "Abuja Municipal"],
  FCT: ["Gwarinpa", "Maitama", "Wuse", "Garki I", "Garki II", "Kubwa", "Lugbe", "Karu", "Abuja Municipal", "Abuja Municipal Area Council"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Oyigbo", "Eleme", "Ikwerre"],
  "Port Harcourt": ["Port Harcourt", "Obio-Akpor", "Oyigbo", "Eleme", "Ikwerre"],
  Kano: ["Kano Municipal", "Nassarawa", "Fagge", "Dala", "Gwale"],
  Oyo: ["Ibadan North", "Ibadan South", "Ibadan North East", "Akinyele", "Lagelu"],
  Edo: ["Benin City", "Oredo", "Ikpoba-Okha", "Ovia North East", "Ovia South West"],
  Enugu: ["Enugu North", "Enugu South", "Enugu East", "Nkanu East", "Nkanu West"],
  Kaduna: ["Kaduna North", "Kaduna South", "Chikun", "Igabi", "Zaria"],
  Delta: ["Warri North", "Warri South", "Warri South West", "Uvwie", "Udu"],
  "Cross River": ["Calabar Municipal", "Calabar South", "Odukpani", "Akamkpa", "Biase"],
  Plateau: ["Jos North", "Jos South", "Jos East", "Bassa", "Riyom"],
  Borno: ["Maiduguri", "Jere", "Konduga", "Mafa", "Dikwa"],
  Imo: ["Owerri Municipal", "Owerri North", "Owerri West", "Orlu", "Orsu"],
  Anambra: ["Onitsha North", "Onitsha South", "Awka North", "Awka South", "Nnewi North"],
  "Akwa Ibom": ["Uyo", "Itu", "Uruan", "Nsit-Ibom", "Etinan"],
  Kwara: ["Ilorin West", "Ilorin East", "Ilorin South", "Asa", "Moro"],
};

/** Get suggested hub from LGA or State (Smart Hub Mapping). */
export function getHubFromAddress(lgaOrArea: string, state: string): string | null {
  const trimmedLga = lgaOrArea?.trim();
  const trimmedState = state?.trim();
  if (trimmedLga && LGA_TO_HUB[trimmedLga]) return LGA_TO_HUB[trimmedLga];
  if (trimmedState && STATE_TO_HUB[trimmedState]) return STATE_TO_HUB[trimmedState];
  return null;
}

/** All unique LGAs for a single flat list (e.g. when state not yet selected). */
export const ALL_LGAS = (() => {
  const set = new Set<string>();
  Object.values(LGA_BY_STATE).flat().forEach((lga) => set.add(lga));
  return Array.from(set).sort();
})();

/** For pricing/CSV: use state or LGA to resolve city name for getQuoteForRoute. */
export function getPricingCityFromAddress(state: string, lga: string): string {
  const s = state?.trim();
  const l = lga?.trim();
  if (s && ["Lagos", "Abuja", "FCT", "Port Harcourt", "Rivers", "Kano"].includes(s)) {
    if (s === "FCT") return "Abuja";
    if (s === "Rivers") return "Port Harcourt";
    return s;
  }
  if (l && LGA_TO_HUB[l]) {
    const hub = LGA_TO_HUB[l];
    if (hub === "Lagos Hub") return "Lagos";
    if (hub === "Abuja Hub") return "Abuja";
    if (hub === "Port Harcourt Hub") return "Port Harcourt";
    if (hub === "Kano Hub") return "Kano";
    if (hub === "Enugu Hub") return "Enugu";
  }
  return "Lagos";
}
