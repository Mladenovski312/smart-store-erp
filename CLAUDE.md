# CLAUDE.md — InterStar Jumbo Project Context

## Overview
E-commerce storefront + internal ERP/POS for **Интер Стар Џамбо** (toy store in Kumanovo, Macedonia).
- **Public:** Guest checkout, COD only, real-time stock.
- **Admin:** Inventory management, AI scanner (Gemini), POS, order fulfillment.
- **Domain:** [interstarjumbo.com](https://interstarjumbo.com)

## Tech Stack
- **Framework:** Next.js 16 (App Router), deployed on Vercel.
- **Database/Auth:** Supabase (PostgreSQL + RLS + Magic Link).
- **Emails:** Resend (`naracki@interstarjumbo.com`).
- **AI:** Google Gemini Vision API (product photos).
- **Styling:** Tailwind CSS 4.

## Key Architecture & Token Savings
- **Guest-Only Checkout:** No customer accounts. Repeat buyers tracked via unique email in `customers` table.
- **Atomic Stock:** Deducted via Supabase RPC `process_checkout_stock` at checkout; restored via `restore_order_stock` on cancellation. Saves tokens: *Do not reinvent stock logic.*
- **Cart Sync:** Client-side only (`localStorage`). Uses `src/lib/cart.ts` event system for UI updates.
- **Security:** RLS protects data at DB level. No `middleware.ts` needed.
- **Email:** Triggered via internal `/api/emails` routes.

## Critical File Map
- `src/app/checkout/page.tsx`: Core checkout flow + validation.
- `src/components/OrdersPanel.tsx`: Admin order processing + email triggers.
- `src/lib/store.ts`: Supabase CRUD layer.
- `src/lib/cart.ts`: Event-driven cart logic.
- `supabase_schema.sql` + `migration_*.sql`: Database source of truth.

## Commands
- `npm run dev`: Local development.
- `npm run build`: Production verification.
- `npm run lint`: Code quality check.

## Operational Status: STABLE
The project is currently in a "Compacted" state. All core features (Checkout, Stock, AI Scanner, Emails) are functional. Focus future work on ROI-positive features (Marketing, Real-time alerts, etc.).
