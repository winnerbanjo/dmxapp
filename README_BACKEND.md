# DMX Logistics — Backend Engineer Handoff

This document lists all environment variables and backend architecture for the Render deployment.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string. Format: `postgresql://user:password@host:5432/dmx?schema=public` |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `https://dmx-logistics.onrender.com`). Must match deployment URL. |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing. Generate: `openssl rand -base64 32` |
| `MONGODB_URI` | Yes* | MongoDB Atlas connection string for Merchant module. Format: `mongodb+srv://user:pass@cluster.mongodb.net/dmx` |
| `JWT_SECRET` | Yes | Secret for merchant JWT auth. Use same as NEXTAUTH_SECRET or a separate 32+ char string. |
| `ADMIN_EMAIL` | No | Email that grants Admin role. If set, user with this email can access `/admin/*`. |
| `PAYSTACK_SECRET_KEY` | Yes* | Paystack secret key for wallet funding webhook. Get from [Paystack Dashboard](https://dashboard.paystack.com). |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL for links (track, waybill). Defaults to `http://localhost:3000`. |
| `SMTP_HOST` | No | SMTP host for email (shipment booked, etc.). |
| `SMTP_PORT` | No | SMTP port (default 587). |
| `SMTP_USER` | No | SMTP username. |
| `SMTP_PASS` | No | SMTP password. |
| `SMTP_FROM` | No | From address for emails. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | Google Maps API key for address autocomplete. |

### Future / Optional Integrations

| Variable | Description |
|----------|-------------|
| `DOJAH_KEY` | Dojah API key for KYC verification (if integrating). |
| `TERMII_API` | Termii API key for SMS OTP (if integrating). |

## Database Architecture

- **PostgreSQL (Prisma)**: User, Shipment, Wallet, Transaction, MerchantProfile, PricingRates.
- **MongoDB**: Merchant module (Mongoose models: Merchant, Shipment) — used for merchant dashboard, booking, KYC.

**Note:** The app uses both databases. A future migration to unify on PostgreSQL is recommended.

## API Routes Security

- `/api/shipments` — Session required (getServerSession).
- `/api/shipments/bulk` — Session required.
- `/api/merchant/wallet` — Session required.
- `/api/merchant/api-key` — Session + MerchantProfile required.
- `/api/merchant/shipments/[id]/waybill` — Merchant session (getSession from @dmx/lib/auth).
- `/api/admin/merchants/[id]/verify` — Admin role required.
- `/api/track/[id]` — Public (no auth).
- `/api/auth/register` — Public.
- `/api/auth/merchant-kyc-signup` — Public.
- `/api/auth/merchant-complete` — Public (completion flow).
- `/api/webhooks/paystack` — No session; verified via `x-paystack-signature` HMAC.

## Business Logic Location

- `src/lib/logic/pricing.ts` — Zone pricing, markup, Quick Quote math.
- `src/lib/logic/booking-price.ts` — Booking price breakdown (base, fuel, insurance, VAT).
- `src/data/zone-pricing.ts` — UI-facing zone mapping (re-exports from logic).
- `src/data/pricing-demo.ts` — Manual rates, `getQuoteForRoute`.

## Logging

Critical paths log to stdout for Render:

- Shipment creation: `[Shipments API]` or `[Booking]`
- Payment success: `[Paystack Webhook]`
- Errors: `console.error` with component prefix

## Demo Mode

- Auth login supports demo users (Merchant Demo, Admin Demo). These create/use real Prisma users when DB is available.
- Demo merchant IDs (`000000000000000000000001`, `000000000000000000000002`) are used when MongoDB is unavailable.
- **Production:** Disable or gate demo flows via env (e.g. `DISABLE_DEMO=true`).
