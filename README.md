# DMX Logistics

Next.js 14+ (App Router) application for DMX Logistics — shipment creation, wallet, and admin controls.

## Tech stack

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- **Shadcn/UI** (Button, Card, Data Tables, Forms)
- **Prisma** (PostgreSQL) — User, Wallet, Transaction, Shipment, PricingRates
- **Next-Auth** — placeholder auth with role-based redirects (CUSTOMER, ADMIN, AGENT)

## Setup

1. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` — PostgreSQL connection string
   - `NEXTAUTH_URL` — e.g. `http://localhost:3000`
   - `NEXTAUTH_SECRET` — e.g. `openssl rand -base64 32`

3. **Database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   - Home: http://localhost:3000  
   - Sign in (any email/password, choose role): http://localhost:3000/auth/signin  
   - Customer: http://localhost:3000/customer (Dashboard, Create Shipment, Wallet, History)  
   - Admin: http://localhost:3000/admin (Revenue, Shipments, Pricing)

## Structure

- `prisma/schema.prisma` — User, Wallet, Transaction, Shipment, PricingRates
- `src/types/` — shared Shipment, User, Wallet types
- `src/lib/auth.ts` — Next-Auth config (credentials + role in JWT)
- `src/lib/pricing.ts` — dynamic price from weight + type (Local / International)
- `src/app/(customer)/` — customer layout + sidebar; `customer/ship` = Create Shipment multi-step form
- `src/app/(admin)/` — admin layout + Revenue, Shipments, Pricing
- `src/middleware.ts` — protects `/customer` and `/admin`, redirects by role

## Create Shipment

Multi-step form at **Customer → Create Shipment**:

1. **Type & weight** — Local or International, weight (kg). Price updates live (₦500/kg local, ₦2,000/kg international).
2. **Sender** — name, phone, address, city, country.
3. **Recipient** — same fields + optional notes.
4. **Review** — summary and total; “Create shipment” (wire to API when backend is ready).

Pricing is computed in `src/lib/pricing.ts`; replace with DB lookup from `PricingRates` when needed.
