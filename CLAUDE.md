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

## Architecture
- **Guest-Only Checkout:** No customer accounts. COD only.
- **Atomic Stock:** Deducted via Supabase RPC `process_checkout_stock`.
- **Cart Sync:** Client-side event system (`src/lib/cart.ts`).
- **Security:** RLS-first. No middleware needed for core protection.
- **Server/Client Split:** Page files are async Server Components (data fetching). Interactive UI in `src/components/*Client.tsx`.
- **Product URLs:** Use slugs (`/produkt/[slug]`), not UUIDs. `getProductBySlug()` in `store.ts`.
- **Search:** Bidirectional Cyrillic↔Latin transliteration (`src/lib/search.ts`). Latin input matches Cyrillic product names and vice versa.

## Development Roadmap (The 10 Specs)
Reference `/specs` folder for detailed implementation rules:
1. `01-quick-fixes`: /admin removal, phone validation, ghost categories. **DONE.**
2. `02-seo-aeo`: sitemap, robots, llms.txt, Schema markup, SSR, generateMetadata, slugs. **DONE.**
3. `03-ux-improvements`: Nav search, price range slider, related products, FAQ accordion, returns policy. **DONE.**
4. `04-search-normalization`: Dual-script transliteration. **DONE** (merged into Phase 3 — `src/lib/search.ts`).
5. `05-ai-gift-finder`: Public Gemini-powered recommendation widget. **DONE.**
6. `06-analytics-dashboard`: Full admin business intelligence suite. **DONE.**
7. `07-excel-export`: Sales ledger and inventory reporting. **DONE.**
8. `08-repo-cleanup`: Migrations folder organization. **DONE.**
9. `09-schema-changes`: Database prerequisites for AI/Analytics. **DONE.**
10. `10-roadmap`: Precise implementation phasing. **DONE.**

## Commands
- `npm run dev`: Local development.
- `npm run build`: Production verification.
- `npm run lint`: Code quality check.

## Performance & Accessibility
- **No `mounted` guards:** Block SSR; render components immediately.
- **`next/image` only:** Never use raw `<img>`.
- **Aria-labels:** All icon buttons must have Macedonian labels.
- **WebP:** Use for all logos and optimized assets.
