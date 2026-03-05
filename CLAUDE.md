# CLAUDE.md — InterStar Jumbo Project Context

## Overview
E-commerce storefront + internal ERP/POS for **Интер Стар Џамбо** (toy store in Kumanovo, Macedonia).
- **Public:** Guest checkout, COD only, real-time stock.
- **Admin:** Inventory management, AI scanner (Gemini), POS, order fulfillment.
- **Domain:** [interstarjumbo.com](https://interstarjumbo.com)

## Tech Stack
- **Framework:** Next.js 16 (App Router), deployed on Vercel.
- **Database/Auth:** Supabase (PostgreSQL + RLS). Admin creates employee accounts with passwords directly (no invite emails).
- **Emails:** Resend (`naracki@interstarjumbo.com`).
- **AI:** Google Gemini Vision API (product photos).
- **Styling:** Tailwind CSS 4.

## Key Architecture & Token Savings
- **Guest-Only Checkout:** No customer accounts. Repeat buyers tracked via unique email in `customers` table.
- **Atomic Stock:** Deducted via Supabase RPC `process_checkout_stock` at checkout; restored via `restore_order_stock` on cancellation. Saves tokens: *Do not reinvent stock logic.*
- **Cart Sync:** Client-side only (`localStorage`). Uses `src/lib/cart.ts` event system for UI updates.
- **Security:** RLS protects data at DB level. No `middleware.ts` needed.
- **Employee Auth:** Admin creates employees via `/api/invite` using `supabase.auth.admin.createUser()` with a password. Roles stored in `user_roles` table (admin/employee).
- **Email:** Triggered via internal `/api/emails` routes.

## Critical File Map
- `src/app/checkout/page.tsx`: Core checkout flow + validation.
- `src/components/OrdersPanel.tsx`: Admin order processing + email triggers.
- `src/lib/store.ts`: Supabase CRUD layer.
- `src/lib/cart.ts`: Event-driven cart logic.
- `src/components/SettingsPanel.tsx`: Admin employee management (create accounts, toggle roles/status).
- `src/app/api/invite/route.ts`: Employee creation API (uses Supabase admin.createUser).
- `supabase_schema.sql` + `migration_*.sql`: Database source of truth.

## Commands
- `npm run dev`: Local development.
- `npm run build`: Production verification.
- `npm run lint`: Code quality check.

## Performance Rules (DO NOT BREAK)
- **No `mounted` guards:** Never add `useState(false)` + `useEffect(setMounted)` patterns. They block SSR and kill LCP/FCP. Pages render immediately.
- **Always `next/image`:** Never use raw `<img>`. Use `fill` + `sizes` for fluid containers, explicit `width`/`height` for fixed-size thumbnails. Always include `alt`.
- **WebP logos:** `public/hd_logo.webp` and `public/fhd_logo.webp` (compressed from PNG via Sharp). Reference these in JSON-LD and anywhere the logo appears.
- **Supabase images:** `next.config.ts` has `remotePatterns` for `*.supabase.co` — do not remove.

## Accessibility Rules
- All icon-only `<button>` and `<a>` elements must have `aria-label` in Macedonian.
- All `next/image` components must have meaningful `alt` text.

## Operational Status: STABLE — Phase 1 Complete
Core features and Phase 1 (Performance + Accessibility) are done and deployed.
- **Mobile PageSpeed: 97/100** (FCP 0.9s, TBT 0ms, CLS 0)
- **Accessibility:** All icon-only interactive elements labelled with `aria-label`
- Focus next work on Phase 2: Real-time order alerts, analytics, Stripe.
