# CLAUDE.md — InterStar Jumbo Project Context

## What This Is
E-commerce storefront + internal ERP/POS for a physical toy store ("Интер Стар Џамбо") in Kumanovo, Macedonia. Two sides:
1. **Public storefront** — customers browse toys, add to cart, checkout as guest with COD payment
2. **Admin dashboard** — employees manage inventory, scan new products with AI, run POS sales, process online orders

## Project Evolution
Built in phases: POS dashboard (inventory + scanner + sales) → public storefront → cart & checkout → Supabase migration (localStorage → cloud) → email notifications (Resend) → auth & roles → stock management → security hardening. Spanning ~29 iterations.

## Tech Stack
- **Framework:** Next.js 14 (App Router), deployed on Vercel
- **Database/Auth:** Supabase (PostgreSQL + RLS + Magic Link Auth)
- **Emails:** Resend (from `naracki@interstarjumbo.com`)
- **AI:** Google Gemini Vision API (product recognition from photos)
- **Styling:** Tailwind CSS + Lucide icons
- **Domain:** interstarjumbo.com (SSL, SPF, DKIM, MX configured)
- **Repo:** github.com/Mladenovski312/smart-store-erp

## Key Architecture Decisions
- **No customer accounts.** Checkout is always guest. Customer data saved by unique email in `customers` table for repeat buyer tracking.
- **Immediate stock deduction** on checkout via atomic Supabase RPC (`process_checkout_stock`). Uses `FOR UPDATE` row locks to prevent overselling.
- **Stock restore on cancellation** via `restore_order_stock` RPC. Guarded against double-restore (checks `order.status !== 'cancelled'`).
- **Cart is client-side only** (localStorage). `cart-updated` event syncs UI. `cart-item-added` event auto-opens CartSidebar.
- **Auth is client-side gated** in `admin/page.tsx` via `useAuth()`. No middleware — RLS protects data at DB level.
- **Order IDs generated client-side** (`crypto.randomUUID()`) to bypass Supabase RLS SELECT restriction on newly inserted rows.
- **COD only** — no online payment. Employees verify totals manually at delivery.

## Complete File Map

### Pages (7)
| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Public storefront homepage — featured products, categories, hero |
| `/catalog` | `src/app/catalog/page.tsx` | Product catalog with search, filters, sorting |
| `/kosnicka` | `src/app/kosnicka/page.tsx` | Full cart page with quantity controls |
| `/checkout` | `src/app/checkout/page.tsx` | Guest checkout — stock RPC → order insert → email |
| `/uslovi-za-isporaka` | `src/app/uslovi-za-isporaka/page.tsx` | Delivery terms, pricing table, coverage areas |
| `/lokacija` | `src/app/lokacija/page.tsx` | Store location page |
| `/admin` | `src/app/admin/page.tsx` | Admin dashboard — auth gated, role-based tabs |

### Components (10)
| Component | Purpose |
|---|---|
| `OrdersPanel.tsx` | Admin order management — status changes, tracking numbers, stock restore on cancel |
| `InventoryList.tsx` | Product grid — search, filter, stock levels, sell modal, delete |
| `Scanner.tsx` | AI product entry — photo upload → Gemini Vision → manual edit → save |
| `EmployeePOS.tsx` | Quick POS sales — searchable product list with instant checkout |
| `CartSidebar.tsx` | Slide-in cart drawer (right side) with quantity controls |
| `SettingsPanel.tsx` | Admin settings — invite/deactivate employees, manage roles |
| `LoginPage.tsx` | Email/password login for admin/employees |
| `AuthProvider.tsx` | React Context for auth state — Supabase session, roles, display name |
| `Footer.tsx` | Store info footer — address, phone, hours (Mon-Sat 09-21), Google Maps |
| `ErrorBoundary.tsx` | React error boundary wrapper |

### Libraries (5)
| File | Purpose |
|---|---|
| `src/lib/store.ts` | Supabase data layer — CRUD for products, sales, dashboard stats |
| `src/lib/types.ts` | TypeScript interfaces — Product, SaleRecord, DashboardStats, categories |
| `src/lib/cart.ts` | localStorage cart with event system (add, remove, update, clear, count) |
| `src/lib/supabase.ts` | Supabase client factory |
| `src/lib/cities.ts` | Macedonian cities list for checkout address autocomplete |

### API Routes (4)
| Route | Purpose |
|---|---|
| `/api/vision` | Gemini Vision — processes product photos for AI recognition |
| `/api/invite` | Admin-only employee invite via Supabase service role key |
| `/api/emails/order-confirmation` | Order confirmation email (Resend) |
| `/api/emails/order-shipped` | Shipped notification email with optional tracking number |

## Admin Panel Tabs (by Role)
| Tab | Admin | Employee | Description |
|---|---|---|---|
| Залиха (Inventory) | Yes | Yes | Product grid, stock management, sell/delete |
| Скенер (Scanner) | Yes | Yes | AI-assisted product entry via photo |
| Продажба (POS) | Yes | Yes | Quick in-store sales |
| Нарачки (Orders) | Yes | Yes | Online order processing with status workflow |
| Статистика (Stats) | Yes | No | Dashboard stats, sales charts |
| Подесувања (Settings) | Yes | No | Employee management, invites |

## Database Tables
- `products` — stock_quantity, selling_price, purchase_price, barcode, image_url, category, notes. RLS: public SELECT only where stock > 0.
- `orders` — items (JSONB), status, tracking_number, customer info. RLS: anon INSERT, authenticated SELECT/UPDATE.
- `customers` — unique by email, upserted during checkout.
- `user_roles` — maps Supabase auth users to admin/employee roles. Has `is_active` for soft-delete.
- `sales` — POS sale records (product, quantity, price, profit, timestamp).

## Supabase RPC Functions
- `process_checkout_stock(items JSONB)` — atomic stock deduction with row locks
- `restore_order_stock(items JSONB)` — atomic stock restoration for cancellations

## Order Status Flow
`pending` → `shipped` (sends email, optional tracking number) → `delivered` → `cancelled` (restores stock)

## SQL Migrations (run in Supabase SQL Editor)
| File | Purpose |
|---|---|
| `migration_checkout.sql` | customers table, orders table updates (customer_id FK, name fields) |
| `migration_auth_fix.sql` | user_roles table fixes |
| `migration_roles_fix.sql` | Role policy corrections |
| `migration_employee_orders.sql` | RLS so employees can view/process orders |
| `migration_security_fixes.sql` | Security policy hardening |
| `migration_checkout_stock.sql` | `process_checkout_stock` RPC function |
| `migration_restore_stock.sql` | `restore_order_stock` RPC function |
| `migration_tracking_number.sql` | `tracking_number` column on orders |

## Email Templates
Inline HTML, no template library. All user-controlled values escaped with `esc()` helper. Fully localized in Macedonian. Sent via Resend.

## Known Architectural Notes
- **Checkout race window:** Stock deduction and order insert are two separate Supabase calls. If stock deducts but order insert fails, stock is lost without an order. Extremely unlikely. Future fix: single RPC that does both.
- **Cart prices are client-side:** Order stores prices from the cart, not re-fetched from DB. Safe for COD (employees verify). MUST validate server-side before adding online payments.
- **No middleware.ts:** RLS protects data at DB level regardless of frontend state.

## Deferred / Future Items
- Card payment integration (Stripe)
- Employee notifications for new online orders (realtime listener or push notifications)
- Finalize README.md (done now)

## Commands
- `npm run dev` — local development
- `npm run build` — production build
- Git push to `main` → Vercel auto-deploy

## Workflow for Adding Features
1. If a new DB column or function is needed, create a `migration_*.sql` file
2. User runs the migration in Supabase SQL Editor before frontend changes go live
3. Frontend changes committed and pushed to main for Vercel deploy
