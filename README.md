# ShopLens — Store Analytics Dashboard

A real-time analytics dashboard for the Shoplens multi-tenant eCommerce platform. Built with **Next.js 16**, **NestJS 11**, **PostgreSQL**, and **Drizzle ORM**.

## Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL running locally

### 1. Clone and install

```bash
git clone <repo-url>
cd shoplens

# Backend
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
pnpm install

# Frontend
cd ../frontend
cp .env.example .env
pnpm install
```

### 2. Database setup

```bash
cd backend
pnpm db:push
```

### 3. Run the app

```bash
# Backend (port 3001)
cd backend && pnpm start:dev

# Frontend (port 3000)
cd frontend && pnpm dev
```

### 4. Create an account & seed demo data

Open `http://localhost:3000/register`, create an account, then copy your **Store ID** from the navbar.

Seed 30 days of demo data:

```bash
./seed.sh <your_store_id>
```

The dashboard will auto-refresh with the seeded data.

### 5. Stream real-time events

Continuously send random events every 5 seconds to simulate live traffic:

```bash
./real-time.sh <your_store_id>
```

Customize the interval (default is 5s):

```bash
INTERVAL=2 ./real-time.sh <your_store_id>
```

Press `Ctrl+C` to stop — it will print a summary of total events sent.

## Architecture Decisions

### Data Aggregation Strategy

- **Decision:** Pre-aggregation at write time using two summary tables — `store_daily_summary` and `store_product_summary`.
- **Why:** With ~10K events/minute, querying raw events with GROUP BY on every dashboard load would be too slow. Instead, summary counters are incremented in the same transaction as the raw event insert using `INSERT ... ON CONFLICT DO UPDATE` (SQL upsert with arithmetic like `total_revenue = total_revenue + new_amount`). This makes all analytics reads simple SELECTs from summary tables O(1) regardless of event volume.
- **Trade-offs:** Extra write per event (incrementing summary rows). But since it's in the same transaction, it's atomic and the overhead is minimal compared to the query-time benefit. Summary rows use `SELECT ... FOR UPDATE` to prevent race conditions on concurrent writes.

### Real-time vs. Batch Processing

- **Decision:** Hybrid approach — pre-computed summaries for historical metrics, polling for near-real-time display.
- **Why:** True real-time (WebSockets/SSE) adds significant complexity. Polling with short intervals (5-15s) gives a "live" feel while keeping the architecture simple. The summary tables ensure even the polled queries are fast.
- **Trade-offs:** Data shown is up to 5-15 seconds stale. Acceptable for analytics dashboards where exact real-time isn't critical.

### Frontend Data Fetching

- **Decision:** TanStack React Query with auto-refetching intervals. Each API endpoint has its own hook (`useOverview`, `useTopProducts`, `useRecentActivity`). Axios client with JWT interceptor and 401 auto-redirect.
- **Why:** TanStack handles deduplication, stale-while-revalidate, and background updates, the dashboard refreshes silently without loading flicker. Overview and top products refresh every 15s, recent activity every 5s.

### Performance Optimizations

- **Pre-aggregated summary tables** eliminate expensive GROUP BY queries at read time
- **Composite indexes** on `(store_id, timestamp)` and `(store_id, event_type, timestamp)` for the events table
- **Index on `(store_id, total_revenue)`** for the product summary table
- **TanStack Query staleTime (30s)** prevents redundant API calls across components
- **ULID-based prefixed IDs** are time-sortable and human-readable without additional lookups

## Tech Stack

| Layer      | Technology                                                   |
| ---------- | ------------------------------------------------------------ |
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Charts     | Recharts 3                                                   |
| State/Data | TanStack React Query v5, Axios                               |
| Backend    | NestJS 11, TypeScript, Drizzle ORM                           |
| Database   | PostgreSQL                                                   |
| Auth       | JWT (bcrypt + @nestjs/jwt)                                   |

## API Endpoints

| Method | Endpoint                            | Auth | Description                            |
| ------ | ----------------------------------- | ---- | -------------------------------------- |
| POST   | `/api/v1/auth/register`             | No   | Register user + auto-create store      |
| POST   | `/api/v1/auth/login`                | No   | Login, returns JWT + storeId           |
| POST   | `/api/v1/events`                    | Yes  | Ingest an event                        |
| GET    | `/api/v1/analytics/overview`        | Yes  | Revenue, conversion rate, event counts |
| GET    | `/api/v1/analytics/top-products`    | Yes  | Top 10 products by revenue             |
| GET    | `/api/v1/analytics/recent-activity` | Yes  | Last 20 events                         |

## Features

- Dashboard with 4 key metric cards (revenue today/week/month, conversion rate)
- Event funnel visualization (donut chart + funnel bars)
- Top products ranked by revenue with proportional progress bars
- Recent activity table with color-coded event badges
- Auto-refresh (15s for metrics, 5s for activity)
- Dark mode (system preference + manual toggle)
- Fully responsive (mobile-friendly)
- Multi-tenant security (JWT-scoped to store)
- Loading skeletons and error states
- Seed script for 30 days of demo data
- Real-time event streaming script

## Known Limitations

- **No date range filtering** — overview always computes from the current month
- **Token stored in localStorage** — vulnerable to XSS (would use httpOnly cookies in production)
- **Overview filtering is in-memory** — queries the full month's summaries and filters in JS rather than SQL date filters (acceptable trade-off for speed of development; ~30 rows/month has negligible performance impact)

## What I'd Improve With More Time

1. **Server-Sent Events** for real-time updates instead of polling — had the architecture planned with RxJS Subjects and NestJS `@Sse()`, but the EventSource auth limitation (no custom headers) needs a secure token-in-query-param approach
2. **Date range filtering** — custom date pickers for the overview metrics with SQL-level date filtering
3. **Database-level constraints** — unique constraint on `stores.user_id` to enforce the 1:1 user-store relationship
4. **httpOnly cookie-based auth** — more secure than localStorage JWT
5. **Caching layer** (Redis) for frequently accessed summary data

## Time Spent

~3.8 hours

## Video Walkthrough

[Link to video]
