# Handoff Guide — Интер Стар Џамбо

This document serves as the high-level roadmap and technical baseline for the current state of the project.

## Current State: Phase 1 Complete, Phase 2 Complete

### Phase 1 (Quick Fixes) — DONE
Removed admin links from footer, implemented strictly validated `+389` phone input in checkout, added placeholder cards for empty/ghost categories on the homepage.

### Phase 2 (SEO & AEO) — DONE
**Baseline:** Generated `robots.txt`, dynamic `sitemap.ts`, `llms.txt`, JSON-LD schemas (`ToyStore`, `WebSite`, `FAQPage`), expanded FAQ section in Macedonian.

**Advanced (this session):**
1. **Server-Side Rendering:** Refactored `page.tsx`, `catalog/page.tsx`, and `produkt/[slug]/page.tsx` from `"use client"` + `useEffect` data fetching to true Next.js Server Components. Data is fetched server-side and passed as props to Client Components (`HomePageClient`, `CatalogClient`, `ProductDetailClient`). AI bots now receive fully populated HTML.
2. **Dynamic OpenGraph & Meta:** Product page exports `generateMetadata` with per-product title, description, image for Facebook/Viber link previews.
3. **metadataBase & Title Template:** `layout.tsx` now has `metadataBase: new URL("https://interstarjumbo.com")` and `title: { template: "%s | Интер Стар Џамбо" }`.
4. **SEO-Friendly URLs (Slugs):** Route changed from `/produkt/[id]` to `/produkt/[slug]`. Added `slug` column to products table, `getProductBySlug()` in store.ts, updated all links and sitemap. **Requires running `migrations/add_slug_column.sql` in Supabase before deploy.**

## Architecture Notes (Post Phase 2)
- **Server/Client split:** Page files (`page.tsx`) are async Server Components that fetch data. Interactive UI lives in `src/components/*Client.tsx` files.
- **Slug generation:** New products get auto-generated slugs via `saveProduct()` in `store.ts`. Existing products get slugs from the SQL migration.
- **Homepage:** `export const dynamic = 'force-dynamic'` ensures fresh product data on every request.

## The Roadmap (10 Technical Specs)
1. **Quick Fixes** (`01-quick-fixes.md`): DONE.
2. **SEO & AEO** (`02-seo-aeo.md`): DONE.
3. **UX Improvements** (`03-ux-improvements.md`): Homepage search, price range filters, related products.
4. **Search Normalization** (`04-search-normalization.md`): Handle Cyrillic/Latin script switching.
5. **AI Gift Finder** (`05-ai-gift-finder.md`): Google Gemini conversational widget.
6. **Analytics Dashboard** (`06-analytics-dashboard.md`): 7 modules of deep business intelligence.
7. **Excel Export** (`07-excel-export.md`): XLSX reporting for inventory and sales.
8. **Repo Cleanup** (`08-repo-cleanup.md`): Restructure migrations into `/migrations`.
9. **Schema Changes** (`09-schema-changes.md`): Required DB columns for Analytics/AI.
10. **Roadmap** (`10-roadmap.md`): Detailed phasing and implementation order.

## Technical Baseline & Constraints
1. **Stock RPC:** `process_checkout_stock` handles deductions; `restore_order_stock` handles cancellations.
2. **Security:** RLS is the single source of truth for access.
3. **Cart:** Custom event system in `src/lib/cart.ts`.
4. **AI:** Google Gemini 1.5/2.5 Flash is already integrated. Reuse existing SDK setup and API keys.
5. **No `mounted` patterns:** High performance requires immediate SSR.
6. **Migrations:** SQL files in `/migrations` folder and loose in root (legacy). Spec 08 will consolidate.

---
*Updated March 6, 2026*
