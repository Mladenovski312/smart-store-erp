# CLAUDE.md — InterStar Jumbo Project Context

## Overview
E-commerce storefront + internal ERP/POS for **Интер Стар Џамбо** (toy store in Kumanovo, Macedonia).
- **Public:** Guest checkout, COD only, real-time stock, AI Gift Finder.
- **Admin:** Inventory management, AI scanner (Gemini), Analytics dashboard, POS, order fulfillment.
- **Domain:** [interstarjumbo.com](https://interstarjumbo.com)

## Tech Stack
- **Framework:** Next.js 16 (App Router), React 19.
- **Database/Auth:** Supabase (PostgreSQL + RLS).
- **AI:** Google Gemini (Flash 2.5) for AI Scanner and Gift Finder.
- **Charts:** Recharts for analytics dashboard.
- **Styling:** Tailwind CSS 4.
- **Exports:** XLSX (SheetJS) for reports.
- **Monitoring:** Sentry for error tracking, `/api/health` for uptime.

## Architecture
- **Guest-Only Checkout:** No customer accounts. COD only.
- **Atomic Stock:** Deducted via Supabase RPC `create_order_atomic` (single transaction: verify stock → read prices → deduct → insert order).
- **Cart Sync:** Client-side event system (`src/lib/cart.ts`).
- **Security:** RLS-first. Middleware protects `/admin/*` routes (`src/middleware.ts`). Admin actions logged to `admin_audit_log` table.
- **Rate Limiting:** Persistent via Supabase `check_rate_limit` RPC (replaces in-memory Map).
- **Server/Client Split:** Page files are async Server Components (data fetching). Interactive UI in `src/components/*Client.tsx`.
- **Product URLs:** Use slugs (`/produkt/[slug]`), not UUIDs. `getProductBySlug()` in `store.ts`.
- **Search:** Bidirectional Cyrillic↔Latin transliteration (`src/lib/search.ts`). Latin input matches Cyrillic product names and vice versa.

## Development Roadmap (The 10 Specs) — ALL DONE
All 10 spec phases complete and deployed.

## Technical Audit — ALL DONE
All 27 findings from the March 2026 audit resolved across 4 sprints.

## Shared Modules
- **AI:** `src/lib/ai.ts` — shared Gemini init (used by gift-finder + vision routes).
- **Email:** `src/lib/email.ts` — shared templates and utilities for order emails.
- **Atomic RPCs:** `create_order_atomic` (checkout), `record_sale_atomic` (POS) — both SECURITY DEFINER.

## Commands
- `npm run dev`: Local development.
- `npm run build`: Production verification.
- `npm run lint`: Code quality check.

## Performance & Accessibility
- **No `mounted` guards:** Block SSR; render components immediately.
- **`next/image` only:** Never use raw `<img>`.
- **Aria-labels:** All icon buttons must have Macedonian labels.
- **WebP:** Use for all logos and optimized assets.
