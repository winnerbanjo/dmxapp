/** CSV template content and download helpers for Admin Pricing.
 * Standardized Zone-Based Cost Engine — matches Pricing Structure.
 */

/** Economy / Express: route-based rate card (domestic). Cost Price = carrier cost; Selling = Cost × (1 + Markup %). */
export const TEMPLATE_ECONOMY_EXPRESS =
  "Origin,Destination,BasePrice,WeightRate,Cost Price,Cost Weight Rate\nLagos,Abuja,2500,180,2000,150\nLagos,Port Harcourt,2200,150,1800,120\nAbuja,Lagos,2500,180,2000,150\nLagos,Kano,3200,200,2600,165\nPort Harcourt,Abuja,2800,165,2300,135";

/** International: zone-based. Columns match Weight (KG), UK (Zone 1), West Africa (Zone 2), Canada & USA (Zone 3), Australia (Zone 4). */
export const TEMPLATE_INTERNATIONAL =
  "Weight (KG),UK (Zone 1),West Africa (Zone 2),Canada & USA (Zone 3),Australia (Zone 4)\n0.5,29372.63,15200,34760.8,31245.2\n1,32500,16800,38500,34800\n1.5,36500,18900,43200,38900\n2,39500,20400,46800,42200\n2.5,41000,21200,48500,43800\n3,44800,23200,53100,47800\n4,51200,26500,60700,54700\n5,57500,29800,68200,61500\n7.5,71200,36800,84400,76100\n10,84800,43900,100500,90600";

/** Movers: van size and base pricing. */
export const TEMPLATE_MOVERS =
  "Van Size,Base Price,Per KM\nMini Van,15000,250\nMid-Size,22000,350\n5-Ton Truck,45000,600";

export type ServiceTemplateType = "economy" | "express" | "international" | "movers";

/** Pricing Structure: Country → Zone mapping for Smart Zone Search. */
export const TEMPLATE_PRICING_STRUCTURE =
  "Country,Zone\nUK,1\nUnited Kingdom,1\nCameroon,2\nGhana,2\nSenegal,2\nCanada,3\nUSA,3\nUnited States,3\nAustralia,4\nNew Zealand,4";

const TEMPLATES: Record<ServiceTemplateType, string> = {
  economy: TEMPLATE_ECONOMY_EXPRESS,
  express: TEMPLATE_ECONOMY_EXPRESS,
  international: TEMPLATE_INTERNATIONAL,
  movers: TEMPLATE_MOVERS,
};

export function getTemplateCsv(service: ServiceTemplateType): string {
  return TEMPLATES[service];
}

export function downloadTemplateCsv(service: ServiceTemplateType): void {
  const csv = getTemplateCsv(service);
  const filename = `dmx-rate-card-${service}.csv`;
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPricingStructureCsv(): void {
  const csv = TEMPLATE_PRICING_STRUCTURE;
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dmx-pricing-structure.csv";
  a.click();
  URL.revokeObjectURL(url);
}
