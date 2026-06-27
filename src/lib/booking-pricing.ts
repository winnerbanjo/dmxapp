/**
 * Enterprise booking pricing — re-exports from @/lib/logic for consistency.
 * Base + fuel 10% + insurance 1.5% of declared value + fragile ₦500 + VAT 7.5%.
 */
export {
  calculateBookingPrice,
  type BookingPriceBreakdown,
} from "@/lib/logic/booking-price";
