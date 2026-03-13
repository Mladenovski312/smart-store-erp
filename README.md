# Jumbo Store — Full-Stack E-Commerce + ERP Platform

> A production e-commerce storefront with integrated ERP/POS system, AI-powered features, and real-time inventory sync — built for a retail toy store in Macedonia.

**Live:** [interstarjumbo.com](https://interstarjumbo.com) &nbsp;|&nbsp; **Stack:** Next.js 16 · React 19 · Supabase · Gemini AI · Tailwind CSS 4

---

<!--
  SCREENSHOTS: Add 2-3 screenshots to a /docs/screenshots/ folder and uncomment below
  Recommended: storefront, admin dashboard, AI gift finder
-->
<!--
![Storefront](docs/screenshots/storefront.png)
![Admin Dashboard](docs/screenshots/admin-dashboard.png)
![AI Gift Finder](docs/screenshots/gift-finder.png)
-->

## What This Project Demonstrates

This is a **real, deployed application** serving a physical retail business — not a tutorial or template. It covers the full spectrum of modern web development:

| Area | What's Implemented |
|------|-------------------|
| **Frontend** | Server-side rendered catalog, responsive cart system, guest checkout flow, mobile-first UI |
| **Backend** | 7 API routes, 19 database migrations, PostgreSQL RPCs for atomic transactions |
| **AI Integration** | Gemini Vision product scanner, AI gift recommendation engine with live inventory |
| **Security** | Row-Level Security, middleware-protected admin routes, rate limiting, audit logging |
| **DevOps** | Sentry error monitoring, health endpoint, CI/CD via Vercel |
| **Data** | Analytics dashboard with Recharts, Excel/CSV export, inventory turnover metrics |

**Scale:** 51 source files · 7,200+ lines of TypeScript · 19 SQL migrations · 10 specification phases · 27-point security audit completed

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 (App Router)               │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Public Site  │  │  Admin ERP   │  │   API Routes  │  │
│  │  - Catalog    │  │  - Inventory │  │  - Gift Finder│  │
│  │  - Cart       │  │  - POS       │  │  - AI Scanner │  │
│  │  - Checkout   │  │  - Orders    │  │  - Emails     │  │
│  │  - Gift AI    │  │  - Analytics │  │  - Export     │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                   │          │
│         └────────────┬────┴───────────────────┘          │
│                      │                                   │
│              ┌───────▼────────┐                          │
│              │   Middleware   │ Auth + Route Protection   │
│              └───────┬────────┘                          │
└──────────────────────┼──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
   ┌──────▼──────┐ ┌──▼───┐ ┌─────▼─────┐
   │  Supabase   │ │Gemini│ │  Resend   │
   │ PostgreSQL  │ │  AI  │ │  Email    │
   │  + RLS      │ │Vision│ │  API      │
   └─────────────┘ └──────┘ └───────────┘
```

---

## Key Technical Highlights

### Atomic Stock Protection
Checkout uses a single PostgreSQL RPC (`create_order_atomic`) that verifies stock, reads live prices, deducts inventory, and creates the order — all in one transaction. No race conditions, no overselling.

### AI Product Scanner
Admin staff point a camera at any product → Gemini Vision identifies it → auto-fills name, category, brand, suggested price, and age range. Reduces product listing time from minutes to seconds.

### AI Gift Finder
Customers describe who they're shopping for in natural language → Gemini queries the live catalog → returns 3 personalized recommendations with real prices and stock status.

### Bilingual Search
Custom transliteration engine converts between Cyrillic and Latin alphabets in real-time. Customers can search in either script and find products regardless of how they were entered.

### Security-First Architecture
- **Row-Level Security** on all tables — no data leaks even if client code is compromised
- **Middleware auth** protecting all `/admin/*` routes
- **Persistent rate limiting** via PostgreSQL (not in-memory)
- **Audit logging** for all admin actions
- **Server-side price validation** — prices are never trusted from the client
- Full 27-point security audit completed and resolved

### Analytics Dashboard
Revenue tracking, gross margin analysis, inventory turnover ratios, brand scorecards, order fulfillment metrics — all built with Recharts and custom PostgreSQL aggregation queries. Exportable to Excel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database | Supabase (PostgreSQL + Row-Level Security) |
| AI | Google Gemini 2.5 Flash (Vision + Text) |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Email | Resend API |
| Monitoring | Sentry (client + server + edge) |
| Export | SheetJS (XLSX) |
| Deployment | Vercel (CI/CD) |

---

## Project Structure

```
src/
├── app/
│   ├── admin/           # Protected ERP dashboard
│   ├── catalog/          # Product listing page
│   ├── checkout/         # Guest checkout flow
│   ├── produkt/[slug]/   # Product detail pages (SEO-friendly slugs)
│   ├── kosnicka/         # Cart page
│   └── api/
│       ├── gift-finder/  # AI recommendation engine
│       ├── vision/       # Gemini product scanner
│       ├── emails/       # Order confirmation & shipping
│       ├── export/       # Excel report generation
│       └── health/       # Uptime monitoring endpoint
├── components/           # 21 React components (Server + Client split)
├── lib/
│   ├── store.ts          # Data layer (Supabase queries, DB mapping)
│   ├── cart.ts           # Client-side cart with event system
│   └── search.ts         # Cyrillic↔Latin transliteration
└── middleware.ts          # Admin route protection
migrations/                # 19 PostgreSQL migrations (schema + RPCs)
specs/                     # 10 specification documents
```

---

## Performance

| Metric | Score |
|--------|-------|
| Mobile PageSpeed | **97/100** |
| First Contentful Paint | 0.9s |
| Largest Contentful Paint | 2.6s |
| Total Blocking Time | 0ms |
| Cumulative Layout Shift | 0 |

SSR-first rendering, `next/image` optimization, WebP compression (99%+ size reduction on assets).

---

## Local Development

```bash
git clone https://github.com/yourusername/store-app.git
cd store-app
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
GEMINI_API_KEY=your_gemini_key
```

Run migrations in order (001→019) via Supabase SQL Editor, then:
```bash
npm run dev
```

---

## About This Build

This project was built using an **AI-assisted development workflow** — combining hands-on engineering decisions with AI tools (Claude, Gemini) for accelerated development. Every architectural choice, database design, and security measure was intentionally designed and reviewed, not auto-generated.

The result: a production-grade application with the scope of a team project, delivered by one developer.

---

Built by [Filip Mladenovski] · Full-Stack AI Developer
