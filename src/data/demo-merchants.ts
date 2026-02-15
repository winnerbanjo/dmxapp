import { DEMO_MERCHANT_ID_APPROVED, DEMO_MERCHANT_ID_PENDING } from "@/lib/merchant-kyc";

/** Shared demo merchant list for Admin Pricing (custom rate assignment) and Admin Merchants (pricing tier badge). */

export interface DemoMerchant {
  id: string;
  businessName: string;
  hub: string;
  shipments: number;
  status: string;
  /** KYC status for approval flow. Mubarak & Lagos Paparazzi = Approved; New Store = Pending. */
  kycStatus: "Pending Verification" | "Approved" | "Rejected";
}

export const DEMO_MERCHANTS: DemoMerchant[] = [
  { id: DEMO_MERCHANT_ID_APPROVED, businessName: "Mubarak's Store", hub: "Lagos", shipments: 1248, status: "Active", kycStatus: "Approved" },
  { id: "2", businessName: "Greenlife Pharma", hub: "Abuja", shipments: 850, status: "Active", kycStatus: "Approved" },
  { id: "3", businessName: "Alpha Step Links", hub: "PH", shipments: 420, status: "Pending Verification", kycStatus: "Pending Verification" },
  { id: "4", businessName: "Lagos Boutique", hub: "Lagos", shipments: 920, status: "Active", kycStatus: "Approved" },
  { id: "5", businessName: "Abuja Essentials", hub: "Abuja", shipments: 640, status: "Active", kycStatus: "Approved" },
  { id: "6", businessName: "Port Harcourt Goods", hub: "PH", shipments: 380, status: "Active", kycStatus: "Approved" },
  { id: "7", businessName: "Ibadan Market Co.", hub: "Lagos", shipments: 512, status: "Pending Verification", kycStatus: "Pending Verification" },
  { id: "8", businessName: "Kano Traders Ltd", hub: "Kano", shipments: 290, status: "Active", kycStatus: "Approved" },
  { id: "9", businessName: "Calabar Imports", hub: "PH", shipments: 185, status: "Active", kycStatus: "Approved" },
  { id: "10", businessName: "Enugu Supply Chain", hub: "Abuja", shipments: 340, status: "Active", kycStatus: "Approved" },
  { id: "11", businessName: "Benin City Logistics", hub: "Lagos", shipments: 210, status: "Pending Verification", kycStatus: "Pending Verification" },
  { id: "12", businessName: "Jos Distribution Hub", hub: "Abuja", shipments: 155, status: "Active", kycStatus: "Approved" },
  { id: "13", businessName: "The Lagos Paparazzi", hub: "Lagos", shipments: 420, status: "Active", kycStatus: "Approved" },
  { id: DEMO_MERCHANT_ID_PENDING, businessName: "New Store", hub: "Abuja", shipments: 0, status: "Pending Verification", kycStatus: "Pending Verification" },
];
