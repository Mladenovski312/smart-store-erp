# CLAUDE.md — InterStar Jumbo Project Context

## What This Is
E-commerce storefront + internal ERP for a physical toy store in Kumanovo, Macedonia. Customers buy toys online (guest checkout, COD payment). Employees manage inventory, process orders, and run a POS system from the admin panel.

## Tech Stack
- **Framework:** Next.js 14 (App Router), deployed on Vercel
- **Database/Auth:** Supabase (PostgreSQL + RLS + Auth)
- **Emails:** Resend (from `naracki@interstarjumbo.com` — domain email via Resend)
- **Styling:** Tailwind CSS + Lucide icons
- **Repo:** github.com/Mladenovski312/smart-store-erp

## Key Architecture Decisions
- **No user accounts for customers.** Checkout is always guest. Customer data is saved by unique email in the `customers` table for repeat buyer tracking.
- **Immediate stock deduction** on checkout via atomic Supabase RPC (`process_checkout_stock`). Uses `FOR UPDATE` row locks to prevent race conditions.
- **Stock restore on cancellation** via `restore_order_stock` RPC. Only fires if the order wasn't already cancelled (prevents double-restore).
- **Cart is client-side only** (localStorage). The `cart-updated` event syncs UI across components. `cart-item-added` event auto-opens the CartSidebar.
- **Auth is client-side gated** in `admin/page.tsx` via `useAuth()`. No Next.js middleware — RLS protects data at the DB level.
- **Order IDs are generated client-side** (`crypto.randomUUID()`) to bypass a Supabase RLS issue where the frontend couldn't SELECT newly inserted rows.

## Critical File Map
| File | Purpose |
|---|---|
| `src/app/checkout/page.tsx` | Guest checkout form. Stock RPC → order insert → email. |
| `src/components/OrdersPanel.tsx` | Admin order management. Status changes, tracking numbers, stock restore on cancel. |
| `src/components/CartSidebar.tsx` | Slide-in cart drawer (right side). |
| `src/lib/cart.ts` | localStorage cart with event system. |
| `src/lib/supabase.ts` | Supabase client factory. |
| `src/app/api/emails/order-confirmation/route.ts` | Order confirmation email (Resend). |
| `src/app/api/emails/order-shipped/route.ts` | Shipped email with optional tracking number. |
| `src/app/api/invite/route.ts` | Admin-only employee invite (service role key). |
| `src/app/admin/page.tsx` | Admin dashboard shell — auth gated, role-based tabs. |

## Supabase RPC Functions (Run as SQL Migrations)
- `process_checkout_stock(items JSONB)` — atomic stock deduction with row locks
- `restore_order_stock(items JSONB)` — atomic stock restoration for cancellations

## Database Tables
- `products` — stock_quantity, selling_price, purchase_price, barcode, etc. RLS: public can only SELECT where stock > 0.
- `orders` — items as JSONB, status (pending/shipped/delivered/cancelled), tracking_number (optional).
- `customers` — unique by email, upserted during checkout.
- `user_roles` — maps Supabase auth users to admin/employee roles.

## Order Statuses
`pending` → `shipped` (sends email) → `delivered` → `cancelled` (restores stock)

## Email Templates
All emails use inline HTML (no template library). User-controlled values are escaped with `esc()` to prevent HTML injection. Emails are localized in Macedonian.

## Known Architectural Notes
- **Checkout race window:** Stock deduction and order insert are two separate Supabase calls (not one transaction). If stock deducts but order insert fails, stock is lost without an order. This is extremely unlikely but not impossible. A future improvement would be a single RPC that does both atomically.
- **Cart prices are client-side:** The order stores prices from the client cart, not re-fetched from the DB. Since payment is COD (cash on delivery), employees verify totals manually. For future online payment, prices MUST be validated server-side.
- **No middleware.ts:** Route protection relies on client-side auth checks + Supabase RLS. This is sufficient because RLS blocks unauthorized data access at the DB level regardless of frontend state.

## Commands
- `npm run dev` — local development
- `npm run build` — production build
- Git push to `main` triggers Vercel auto-deploy

## Workflow for Adding Features
1. If a new DB column or function is needed, create a `migration_*.sql` file
2. User must run the migration in Supabase SQL Editor before frontend changes go live
3. Frontend changes are committed and pushed to main for Vercel deploy
