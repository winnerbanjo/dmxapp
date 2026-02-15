import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTrackingId(): string {
  const prefix = "DMX";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Shipping cost: base rate + per kg rate; Express = 1.5x
const BASE_RATE = 500;
const PER_KG_RATE = 150;
export const EXPRESS_MULTIPLIER = 1.5;

export function calculateShippingCost(weightKg: number, express = false): number {
  const base = BASE_RATE + weightKg * PER_KG_RATE;
  return Math.round(express ? base * EXPRESS_MULTIPLIER : base);
}
