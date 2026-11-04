# WARAN ZONE — Implementation Plan

Premium jewelry & fashion accessories e-commerce store. Real, functional application — not a mockup.

## 1. Existing repository

The repository contained only `README.md` (branch `appjet`). There is no existing application code,
so the project is built from scratch with a clean, documented structure.

## 2. Technology stack (free & open source)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript | Server rendering, server actions, one deployment |
| Styling | Tailwind CSS 3 + custom design tokens | Fast, responsive, no paid tooling |
| Local database | SQLite (`better-sqlite3`) | Zero-cost, transactional, works offline |
| Cloud database + auth | Supabase (Postgres + GoTrue) | Enabled automatically when env vars are configured |
| Auth (local mode) | `scrypt` password hashing + signed HttpOnly session cookie | No third-party paid service, no secrets in code |
| Images | Locally generated SVG artwork | No external CDN, no licensing fees, fast |
| Currency | BDT (৳) | Bangladeshi storefront |

Runtime database selection:

- If `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are set
  → **Supabase provider** for data and authentication.
- Otherwise → **SQLite provider** with a seeded catalog, so the store runs immediately for local
  development and evaluation. No database credentials are invented anywhere.

## 3. Design direction

- Ivory (`#FBF7F0`) canvas, champagne gold (`#C6A15B`) accents, beige (`#EDE3D3`) surfaces,
  dark brown (`#3B2A20`) ink.
- Editorial serif display type, generous white space, thin gold rules, subtle hover reveals.
- Mobile-first responsive layout: sticky header with drawer navigation, 2-up product grid on phones,
  3–4-up on desktop, fluid hero typography.

## 4. Information architecture

```
/                       Home: hero, category rail, featured edit, brand story, COD trust strip
/shop                   Product listing: category filter, search, sort, stock state
/product/[slug]         Product detail: gallery art, price, description, specs, add-to-cart
/cart                   Cart with quantity controls, remove, delivery fee, totals
/checkout               Auth-gated COD checkout: BD phone validation + delivery address
/orders                 Customer order history
/orders/[id]            Order confirmation / detail (owner-only)
/login, /register       Customer authentication
/account                Account overview + recent orders
/admin                  Admin dashboard: revenue, orders, stock alerts
/admin/products         Product list, stock + inventory editing, delete
/admin/products/new     Create product
/admin/products/[id]    Edit product
/admin/orders           All orders, status workflow, customer + delivery details
```

## 5. Data model

`users(id, name, email UNIQUE, phone, password_hash, role, created_at)`
`products(id, slug UNIQUE, name, category, price, compare_at_price, description, material,
          stock, image, featured, created_at, updated_at)`
`orders(id, order_number UNIQUE, user_id, customer_name, phone, division, district, area,
        address, note, payment_method, subtotal, delivery_fee, total, status, created_at)`
`order_items(id, order_id, product_id, name, price, quantity, line_total)`

Order statuses: `pending → confirmed → shipped → delivered`, plus `cancelled`.

Server rules enforced in one place (`src/lib/`):

- Prices, names and delivery fee are **recalculated from the database** at checkout; client prices are ignored.
- Stock is decremented atomically; out-of-stock or insufficient quantity rejects the order.
- Phone numbers must match Bangladeshi mobile format `01[3-9]xxxxxxxx`.
- Mutating data endpoints require an authenticated session; admin routes require `role = 'admin'`.
- Admin access is granted through the `ADMIN_EMAILS` env var (and Supabase `profiles.role`).

## 6. Required setup

### A. Run locally (SQLite, no accounts needed)

```bash
npm install
npm run dev      # http://localhost:3000
```

The catalog seeds itself into `.data/waran-zone.db` on first request.

Admin account (local): set these before starting the server, then register/login with that email:

```env
ADMIN_EMAILS=you@example.com
ADMIN_PASSWORD=choose-a-strong-password   # optional: seeds the account automatically
SESSION_SECRET=long-random-string         # optional; generated and stored in .data/ otherwise
```

### B. Enable Supabase (database + authentication)

1. Create a free project at https://supabase.com.
2. Open **SQL Editor**, run `supabase/schema.sql` (tables, RLS policies, order RPC, seed-ready).
3. Copy **Project URL**, **anon key** and **service_role key** into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-only, never exposed to the browser
ADMIN_EMAILS=owner@waranzone.com
SESSION_SECRET=<long-random-string>
```

4. Promote your account: `update public.profiles set role = 'admin' where email = 'owner@waranzone.com';`
   (or list the email in `ADMIN_EMAILS`).
5. Restart. Dashboard messages show which provider is active.

Only the anon key is ever sent to the browser. The service-role key is read exclusively in server code
and never included in client bundles or committed to Git.

## 7. Verification plan

- Typecheck + production build.
- API/HTTP checks for catalog, auth redirects, admin guard.
- Browser journey: browse category → open product → add to cart → adjust quantity → register →
  checkout with BD phone → order confirmation → order history → admin add/edit/delete product →
  admin advance order status → non-admin blocked from `/admin`.
- Dependency security scan and review of any findings.
- Deploy and re-verify the live journey.
