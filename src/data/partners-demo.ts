/** DMX Partner/3PL Management — demo data for logistics partners. */

export type ServiceType = "domestic" | "international";

export interface Partner {
  id: string;
  name: string;
  contact: string;
  apiKey?: string;
  serviceType: ServiceType;
  trackingUrl?: string;
  isInternal: boolean;
}

/** Demo partners — DHL, GIG, FedEx, Internal Fleet */
export const DEMO_PARTNERS: Partner[] = [
  {
    id: "dmx-internal",
    name: "DMX Internal Fleet",
    contact: "fleet@dmx.ng",
    serviceType: "domestic",
    isInternal: true,
  },
  {
    id: "dhl",
    name: "DHL",
    contact: "partners@dhl.com",
    apiKey: "dhl_***",
    serviceType: "international",
    trackingUrl: "https://www.dhl.com/en/express/tracking.html?AWB=",
    isInternal: false,
  },
  {
    id: "gig",
    name: "GIG Logistics",
    contact: "partners@giglogistics.com",
    serviceType: "domestic",
    trackingUrl: "https://giglogistics.com/track/",
    isInternal: false,
  },
  {
    id: "fedex",
    name: "FedEx",
    contact: "partners@fedex.com",
    apiKey: "fedex_***",
    serviceType: "international",
    trackingUrl: "https://www.fedex.com/fedextrack/?trknbr=",
    isInternal: false,
  },
];

export function getPartnerById(id: string): Partner | undefined {
  return DEMO_PARTNERS.find((p) => p.id === id);
}

export function getTrackViaPartnerUrl(partner: Partner, trackingId: string): string | null {
  if (!partner.trackingUrl || partner.isInternal) return null;
  return partner.trackingUrl + encodeURIComponent(trackingId);
}
