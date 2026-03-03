# InterStar Jumbo — Smart Store ERP & E-Commerce

E-commerce storefront and internal ERP/POS system for InterStar Jumbo toy store in Kumanovo, Macedonia.

## Tech Stack
*   **Framework:** Next.js 14 (App Router)
*   **Styling:** Tailwind CSS + Lucide React Icons
*   **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Magic Link Auth)
*   **Emails:** Resend
*   **AI:** Google Gemini Vision (product recognition)
*   **Deployment:** Vercel

## Features

### Public Storefront
*   Product catalog with search, category filters, and sorting
*   Cart sidebar (auto-opens on add) + dedicated cart page
*   Guest checkout with COD payment
*   Atomic stock deduction at checkout (prevents overselling via row locks)
*   Order confirmation and shipping notification emails (Macedonian)
*   Delivery terms and store location pages

### Admin Dashboard (`/admin`)
| Tab | Description |
|---|---|
| Залиха (Inventory) | Product grid with search/filter, stock levels, sell modal, delete |
| Скенер (Scanner) | Photo upload → Gemini AI recognition → manual edit → save to inventory |
| Продажба (POS) | Quick in-store sales with searchable product list |
| Нарачки (Orders) | Online order processing — status workflow, tracking numbers, stock restore on cancel |
| Статистика (Stats) | Dashboard stats and sales overview (admin only) |
| Подесувања (Settings) | Employee invites, role management, deactivation (admin only) |

## Authentication & Roles
*   **Admin:** Full access to all tabs and settings, can invite employees
*   **Employee:** Inventory, Scanner, POS, and Orders only
*   **Public:** No accounts — guest checkout only

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── catalog/page.tsx      # Product catalog
│   ├── kosnicka/page.tsx     # Cart page
│   ├── checkout/page.tsx     # Guest checkout
│   ├── admin/page.tsx        # Admin dashboard
│   ├── uslovi-za-isporaka/   # Delivery terms
│   ├── lokacija/             # Store location
│   └── api/
│       ├── vision/           # Gemini AI product recognition
│       ├── invite/           # Admin employee invite
│       └── emails/           # Order confirmation & shipped emails
├── components/               # 10 React components (see CLAUDE.md for full list)
└── lib/                      # Supabase client, data layer, types, cart, cities
```

## Database & RLS (Supabase)
All interactions governed by Postgres Row Level Security. Tables: `products`, `orders`, `customers`, `user_roles`, `sales`. See `supabase_schema.sql` for base configuration.

### SQL Migrations
Run in order in Supabase SQL Editor when setting up or updating:
1. `supabase_schema.sql` — base schema
2. `migration_checkout.sql` — customers table, orders FK
3. `migration_auth_fix.sql` — user_roles fixes
4. `migration_roles_fix.sql` — role policy corrections
5. `migration_employee_orders.sql` — employee order access
6. `migration_security_fixes.sql` — security hardening
7. `migration_checkout_stock.sql` — atomic stock deduction RPC
8. `migration_restore_stock.sql` — stock restoration RPC
9. `migration_tracking_number.sql` — tracking number column

## Email System
*   Powered by Resend (`RESEND_API_KEY` in `.env.local`).
*   **Order Confirmation:** Sent at checkout after successful order creation.
*   **Order Shipped:** Sent when employee marks order as shipped (includes optional tracking number).
*   All emails localized in Macedonian with HTML escaping for security.

---

## Local Development
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env.local` file based on `.env.example`:
   *   `NEXT_PUBLIC_SUPABASE_URL`
   *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   *   `SUPABASE_SERVICE_ROLE_KEY` (Needed for Admin invite API)
   *   `RESEND_API_KEY`
   *   `GEMINI_API_KEY` (Needed for AI product scanner)
4. Run all SQL migrations in Supabase SQL Editor.
5. Run `npm run dev` to start the local server.
