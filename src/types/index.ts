/**
 * DMX Logistics - Shared types (Source of Truth aligned with PRD)
 */

export type Role = "MERCHANT" | "CUSTOMER" | "ADMIN" | "AGENT";

export type ShipmentStatus =
  | "PENDING"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type ShipmentType = "LOCAL" | "INTERNATIONAL";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface Shipment {
  id: string;
  userId: string;
  trackingNumber: string;
  type: ShipmentType;
  status: ShipmentStatus;
  weightKg: number;
  priceAmount: number;
  currency: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderCountry: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  recipientCountry: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date | null;
}

export interface PricingRate {
  id: string;
  shipmentType: ShipmentType;
  ratePerKg: number;
  currency: string;
  minWeightKg: number;
  maxWeightKg: number | null;
  isActive: boolean;
}

export interface CreateShipmentInput {
  type: ShipmentType;
  weightKg: number;
  sender: ShipmentAddress;
  recipient: ShipmentAddress;
  notes?: string;
}
