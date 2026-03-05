# Интер Стар Џамбо — Smart Store ERP & E-Commerce

**Live Site:** [interstarjumbo.com](https://interstarjumbo.com)

A modern, high-performance E-commerce storefront and internal ERP/POS system built for **Интер Стар Џамбо** in Kumanovo, Macedonia. Designed for speed, reliability, and real-time inventory synchronization between the physical store and the online shop.

## ⚡ Performance
- **Mobile PageSpeed: 97/100** — FCP 0.9s, LCP 2.6s, TBT 0ms, CLS 0
- SSR-first: no client-side spinners, pages render immediately
- All images served via `next/image` (WebP, lazy loading, responsive srcsets)
- Logos compressed 99%+ via Sharp (7.7MB PNG → 57KB WebP)

## 🌟 Key Features

### 🛒 Customer Experience
- **Optimized Catalog:** Searchable, categorized product list with real-time stock levels.
- **Seamless Cart:** Responsive cart sidebar and dedicated cart page for easy quantity management.
- **Smart Checkout:** Fast guest checkout at `/checkout` with intuitive address validation and progress tracking.
- **Atomic Stock Protection:** Prevents overselling via database-level row locks during the checkout process.
- **Localized Notifications:** Automated order confirmation and shipping updates via email (Resend).
- **Accessible:** All interactive elements labelled for screen readers (`aria-label`), all images have `alt` text.

### ⚙️ Internal ERP/POS (Admin Only)
- **AI Product Scanner:** Instantly recognize and list products using **Google Gemini Vision**.
- **Unified Inventory:** Centralized management for stock levels, pricing, and product details.
- **Order Fulfillment:** Streamlined dashboard to process online orders, add tracking numbers, and manage cancellations.
- **Real-time POS:** Quick-sale interface for physical store transactions.
- **Advanced Stats:** Admin-only dashboard for sales performance and data insights.

## 🛠️ Technology Stack
- **Frontend:** Next.js 16 (App Router) + Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL, RLS, Edge Functions)
- **AI:** Google Gemini Vision (generative-ai SDK)
- **Email:** Resend API
- **Deployment:** Vercel

## 🚀 Development & Deployment

### Local Setup
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Configure `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=... # For Admin functions
   RESEND_API_KEY=...
   GEMINI_API_KEY=...
   ```
4. Initialize the database by running `supabase_schema.sql` and all subsequent `migration_*.sql` files in the Supabase SQL Editor.
5. Start development: `npm run dev`.

### Deployment
Pushes to the `main` branch are automatically deployed via Vercel. Ensure all environment variables are configured in the Vercel dashboard.

---
© 2026 Интер Стар Џамбо. All rights reserved.
