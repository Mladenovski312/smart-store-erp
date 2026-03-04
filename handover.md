# Handoff Guide — Интер Стар Џамбо

This document serves as a "Source of Truth" for the current session's end and a guide for the next AI agent to pick up work efficiently with minimal token overhead.

## 🏁 Session Summary (March 4, 2026)
We have successfully finalized the core e-commerce engine. The project is stable, deployed, and verified.
- **Key Deliverable:** Guest checkout with atomic stock management and automated Resend email notifications.
- **Admin Tools:** AI Product Scanner (Gemini) and POS are operational.
- **Documentation:** `CLAUDE.md` and `README.md` have been compacted and polished.

## 💡 Token-Saving Insights (Read this first!)
To avoid wasting tokens rediscovering established patterns, keep these in mind:
1. **Stock Logic:** Do NOT modify `src/app/checkout/page.tsx` stock logic without checking the Supabase RPC `process_checkout_stock`. It handles row locks.
2. **Cart Events:** The cart uses a custom event system in `src/lib/cart.ts`. Listen for `cart-updated` to sync UI components.
3. **Database RLS:** Security is handled purely at the database level. If a query fails, it's likely an RLS policy issue, not a frontend bug.
4. **Resend Emails:** Email templates are inline HTML in `src/app/api/emails/`. No external template library is used.

## 🗺️ Roadmap: What's Next?
1. **Real-time Order Alerts:** Add a Supabase Realtime listener to the Admin panel to notify employees immediately when a `pending` order is created.
2. **User Preferences:** Allow customers to save their details (address, phone) in `localStorage` across sessions (partially implemented in `/checkout`).
3. **Marketing Analytics:** Track which categories or products are viewed most using a simple `views` counter in the `products` table.
4. **Stripe Integration:** Transition from COD-only to online payments when business requirements allow.

## 🛠️ Maintenance Check
- **Build Status:** Verify with `npm run build`.
- **Database:** All migrations are in the root directory (`migration_*.sql`). Use them in sequence if resetting the environment.

---
*Signed, Antigravity Agent (March 2026)*
