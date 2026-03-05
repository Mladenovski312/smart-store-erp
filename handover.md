# Handoff Guide — Интер Стар Џамбо

This document serves as a "Source of Truth" for the current session's end and a guide for the next AI agent to pick up work efficiently with minimal token overhead.

## 🏁 Session Summary (March 5, 2026) — Phase 1: Performance & Accessibility
Phase 1 is **complete and deployed**. All changes are live on Vercel via `main` branch.

### Performance (PageSpeed Mobile: 97/100)
- **Removed `mounted` guards** from all pages (`page.tsx`, `checkout`, `kosnicka`, `produkt/[id]`). These caused a full-screen spinner before every render — blocking SSR and killing LCP/FCP.
- **Replaced all raw `<img>` tags** with `next/image` — automatic WebP conversion, lazy loading, responsive `srcset`.
- **Compressed images** with Sharp: `hd_logo.png` 7.7MB → `hd_logo.webp` 57KB, `fhd_logo.png` 7.5MB → 73KB, `pawpatrol.png` 132KB → 22KB.
- **Configured `next.config.ts`** with Supabase `remotePatterns` so product images from Supabase Storage are optimized by Next.js.
- **Updated JSON-LD structured data** to reference `.webp` logo.
- **Result:** FCP 0.9s, LCP 2.6s, TBT 0ms, CLS 0, Score **97/100 mobile**.

### Accessibility (~84 → target 95+)
Added `aria-label` to every icon-only interactive element across all public pages:
- **`src/components/CartSidebar.tsx`** — close button, minus/plus quantity, remove (Trash2)
- **`src/components/Footer.tsx`** — Facebook link
- **`src/app/page.tsx`** — cart navbar button
- **`src/app/catalog/page.tsx`** — cart navbar button
- **`src/app/kosnicka/page.tsx`** — minus/plus quantity, remove (Trash2)
- **`src/app/produkt/[id]/page.tsx`** — cart navbar button, minus/plus quantity, heart/wishlist, social share links, copy-link button

All product images and brand logos already had proper `alt` text via `next/image`.

---

## 💡 Token-Saving Insights (Read this first!)
1. **Stock Logic:** Do NOT modify `src/app/checkout/page.tsx` stock logic without checking the Supabase RPC `process_checkout_stock`. It handles row locks.
2. **Cart Events:** The cart uses a custom event system in `src/lib/cart.ts`. Listen for `cart-updated` to sync UI components.
3. **Database RLS:** Security is handled purely at the database level. If a query fails, it's likely an RLS policy issue, not a frontend bug.
4. **Resend Emails:** Email templates are inline HTML in `src/app/api/emails/`. No external template library is used.
5. **No `mounted` pattern:** Pages render immediately via SSR. Do NOT reintroduce `useState(false)` + `useEffect(setMounted)` guards — they kill performance.
6. **Images:** Always use `next/image` with `alt`, `sizes`, and either `fill` (for aspect-ratio containers) or explicit `width`/`height`. Never raw `<img>`.

## 👥 Employee Management
- Admin creates employee accounts directly in **Поставки** (Settings) with email + password.
- No invite emails — admin tells the employee their credentials in person.
- API: `POST /api/invite` uses `supabase.auth.admin.createUser()` with `email_confirm: true`.
- Roles (`admin`/`employee`) and status (`active`/`inactive`) managed in `user_roles` table.

## 🗺️ Roadmap: What's Next? (Phase 2)
1. **Real-time Order Alerts:** Supabase Realtime listener in Admin panel — notify employees instantly on new `pending` orders.
2. **Marketing Analytics:** Simple `views` counter in `products` table to track most-viewed items.
3. **Stripe Integration:** Online payments when COD is no longer sufficient.
4. **Employee Password Change:** Allow employees to update their own password from the admin UI.
5. **SEO Content:** Add more FAQ items to homepage, product-level meta descriptions pulled from `product.description`.

## 🛠️ Maintenance Check
- **Build Status:** `npm run build`
- **Database:** Migrations in root directory (`migration_*.sql`). Run in sequence if resetting.
- **Deploy:** Push to `main` → Vercel auto-deploys. No manual step needed.

---
*Signed, Claude Sonnet 4.6 (March 5, 2026)*
