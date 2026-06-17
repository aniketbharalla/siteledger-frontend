# SiteLedger — Project Context & Architecture Reference

> **Purpose:** This document provides a complete, authoritative reference for the SiteLedger codebase. Intended to onboard developers quickly and maintain architectural consistency across future changes.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Layout](#2-repository-layout)
3. [Tech Stack](#3-tech-stack)
4. [Backend — siteledger-backend](#4-backend--siteledger-backend)
   - [Entry Point](#41-entry-point)
   - [Database](#42-database)
   - [Models (Mongoose Schemas)](#43-models-mongoose-schemas)
   - [Routes (REST API)](#44-routes-rest-api)
   - [Middleware](#45-middleware)
   - [Environment Variables](#46-environment-variables)
   - [Deployment](#47-deployment-render)
5. [Frontend — siteledger-frontend](#5-frontend--siteledger-frontend)
   - [Entry Point & App Shell](#51-entry-point--app-shell)
   - [Routing & Pages](#52-routing--pages)
   - [State Management](#53-state-management)
   - [Auth Flow](#54-auth-flow)
   - [API Layer](#55-api-layer)
   - [Components](#56-components)
   - [Design System](#57-design-system)
   - [Environment Variables](#58-environment-variables)
   - [Deployment](#59-deployment-vercel)
6. [Data Model Relationships](#6-data-model-relationships)
7. [Role-Based Access Control (RBAC)](#7-role-based-access-control-rbac)
8. [API Reference](#8-api-reference)
9. [Local Development Setup](#9-local-development-setup)
10. [Key Patterns & Conventions](#10-key-patterns--conventions)
11. [Known Gaps & Future Work](#11-known-gaps--future-work)

---

## 1. Project Overview

**SiteLedger** is a construction financial dashboard that lets organisations:

- Track **construction sites** (code, location, budget, status)
- Manage **expenses** per site (material / labour / misc)
- Record **investor capital** and compute per-investor profit shares
- Log **client payments** (milestones)
- View **KPI analytics** across any combination of sites
- Manage **team members** with role-scoped access (owner → admin → member)

The product is a full-stack web app: a **React SPA** (Vite) on the frontend and a **Node/Express REST API** backed by **MongoDB** on the backend. Both are deployed separately — the backend on **Render**, the frontend on **Vercel**.

Currency is implicitly **Indian Rupees (₹)**.

---

## 2. Repository Layout

```
/Project
├── siteledger-frontend/       # React SPA (Vite + TailwindCSS)
│   ├── src/
│   │   ├── api/               # Axios client + all API call helpers
│   │   ├── components/        # Reusable UI components (21 files)
│   │   ├── context/           # React contexts (AuthContext)
│   │   ├── hooks/             # Custom hooks (useStats)
│   │   ├── pages/             # Page-level components (9 pages)
│   │   ├── utils/             # (empty — reserved)
│   │   ├── App.jsx            # App shell, routing, data fetching
│   │   ├── main.jsx           # React root + provider wiring
│   │   ├── index.css          # Global CSS + design tokens
│   │   └── App.css            # Additional app-level styles
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json            # SPA rewrite rule
│   └── .env.example
│
└── siteledger-backend/        # Express REST API
    ├── index.js               # Server entry, route mounting, error handler
    ├── src/
    │   ├── config/
    │   │   └── db.js          # Mongoose connection
    │   ├── middleware/
    │   │   └── auth.js        # JWT protect + restrictTo helpers
    │   ├── models/
    │   │   ├── User.js
    │   │   ├── Organisation.js
    │   │   ├── Site.js
    │   │   ├── Expense.js
    │   │   ├── Investor.js
    │   │   └── Payment.js
    │   ├── routes/
    │   │   ├── auth.js        # /api/auth/*
    │   │   ├── sites.js       # /api/sites/*
    │   │   ├── investors.js   # /api/investors/*
    │   │   ├── expenses.js    # /api/expenses/*
    │   │   ├── payments.js    # /api/payments/*
    │   │   ├── stats.js       # /api/stats
    │   │   └── seed.js        # /api/seed (dev seeding)
    │   └── seed/              # Seed data scripts
    └── render.yaml            # Render deployment config
```

---

## 3. Tech Stack

### Backend
| Layer | Choice | Version |
|---|---|---|
| Runtime | Node.js | ≥ 18.0.0 |
| Framework | Express | ^4.19 |
| Database | MongoDB via Mongoose | Mongoose ^8.23 |
| Auth | JWT (`jsonwebtoken`) | ^9.0 |
| Password hashing | bcryptjs | ^2.4 |
| Validation | express-validator | ^7.1 |
| Dev server | nodemon | ^3.1 |
| Deployment | Render (Node web service) | — |

### Frontend
| Layer | Choice | Version |
|---|---|---|
| Build tool | Vite | ^8.0 |
| UI library | React | ^19.2 |
| Routing | react-router-dom | ^7.14 |
| Data fetching | @tanstack/react-query | ^5.99 |
| HTTP client | Axios | ^1.15 |
| Styling | TailwindCSS v3 + Vanilla CSS | ^3.4 |
| CSS preprocessor | PostCSS + Autoprefixer | — |
| Typography | Plus Jakarta Sans, JetBrains Mono (Google Fonts) | — |
| Deployment | Vercel (SPA) | — |

---

## 4. Backend — `siteledger-backend`

### 4.1 Entry Point

**`index.js`** — Server bootstrap:

1. Load `.env` via `dotenv`
2. Apply CORS (reads `CORS_ORIGIN` env var; supports comma-separated origins)
3. `express.json({ limit: '10kb' })` body parsing
4. Mount routes under `/api/*`
5. `GET /health` — unauthenticated health check
6. Global error handler with special cases for Mongoose `ValidationError`, `CastError`, and duplicate-key `11000`
7. Async IIFE: `connectDB()` → `app.listen(PORT)`

### 4.2 Database

**`src/config/db.js`**

- Uses `MONGODB_URI` env var (required — throws if missing)
- Mongoose 8 (no deprecated option flags needed)
- Connection event listeners for `error` and `disconnected`

### 4.3 Models (Mongoose Schemas)

#### `User`
| Field | Type | Notes |
|---|---|---|
| `name` | String | max 80 chars |
| `email` | String | unique, lowercase, validated regex |
| `password` | String | select: false (never returned); hashed with bcrypt salt 12 |
| `orgId` | ObjectId → Organisation | nullable |
| `role` | String enum | `'owner'` / `'admin'` / `'member'` (default: `'member'`) |
| `createdAt`, `updatedAt` | Date | timestamps |

**Methods:**
- `comparePassword(candidatePassword)` — bcrypt comparison
- `toJSON()` — strips `password` from serialised output

**Pre-save hook:** Auto-hashes password on modification.

---

#### `Organisation`
| Field | Type | Notes |
|---|---|---|
| `name` | String | max 120 chars |
| `inviteCode` | String | unique; auto-generated 6-char hex (e.g. `A3F9C2`) |
| `createdAt`, `updatedAt` | Date | timestamps |

---

#### `Site`
| Field | Type | Notes |
|---|---|---|
| `code` | String | unique, uppercase, max 10 chars |
| `name` | String | max 120 chars |
| `location` | String | required |
| `status` | String enum | `'active'` / `'completed'` (default: `'active'`) |
| `startDate` | Date | required |
| `totalBudget` | Number | ≥ 0 |
| `cover` | String | CSS color/gradient string (default: oklch blue-ish) |
| `orgId` | ObjectId → Organisation | required, indexed |

**Indexes:** `{ status: 1 }`

---

#### `Expense`
| Field | Type | Notes |
|---|---|---|
| `siteId` | ObjectId → Site | required |
| `name` | String | max 200 chars |
| `vendor` | String | max 120 chars |
| `category` | String enum | `'material'` / `'labor'` / `'misc'` |
| `amount` | Number | ≥ 0 |
| `date` | Date | defaults to `Date.now` |
| `status` | String enum | `'paid'` / `'pending'` (default: `'pending'`) |
| `orgId` | ObjectId → Organisation | required, indexed |

**Indexes:** `siteId`, `(siteId, category)`, `(siteId, status)`, `date DESC`

---

#### `Investor`
| Field | Type | Notes |
|---|---|---|
| `siteId` | ObjectId → Site | required |
| `name` | String | max 120 chars |
| `amount` | Number | ≥ 0 (capital invested) |
| `share` | Number | 0–100 (% profit share) |
| `date` | Date | defaults to `Date.now` |
| `orgId` | ObjectId → Organisation | required, indexed |

**Indexes:** `siteId`, `(siteId, name)`

---

#### `Payment`
| Field | Type | Notes |
|---|---|---|
| `siteId` | ObjectId → Site | required |
| `clientName` | String | max 120 chars |
| `amount` | Number | ≥ 0 |
| `date` | Date | required, defaults to `Date.now` |
| `milestone` | String | max 200 chars |
| `orgId` | ObjectId → Organisation | required, indexed |

**Indexes:** `siteId`, `(siteId, date DESC)`

---

### 4.4 Routes (REST API)

All routes except `/health` and auth registration are behind the `protect` middleware (JWT verification).

#### Auth — `/api/auth`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/register/org` | ❌ | — | Create new Organisation + owner account |
| POST | `/register/admin` | ❌ | — | Join org via `inviteCode`; role = admin |
| POST | `/login` | ❌ | — | Returns JWT + user object |
| GET | `/me` | ✅ | any | Returns current user + org details |
| POST | `/members` | ✅ | owner/admin | Create a member account |
| GET | `/members` | ✅ | owner/admin | List all members in org |
| DELETE | `/members/:id` | ✅ | owner/admin | Remove a member |

**JWT Response shape:**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "...", "name": "...", "email": "...",
    "role": "owner|admin|member",
    "orgId": "...", "orgName": "...", "inviteCode": "..."
  }
}
```

---

#### Sites — `/api/sites`

> Members are **blocked** from all site endpoints.

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all sites for org (sorted by `startDate DESC`) |
| POST | `/` | Create site (auto-generates code as `SITE-{timestamp}` if not provided) |
| GET | `/:id` | Get single site |
| PUT | `/:id` | Update site (allowed fields: code, name, location, status, startDate, totalBudget, cover) |
| DELETE | `/:id` | Delete site |

All routes are org-scoped: `{ orgId: req.user.orgId }` filter applied.

---

#### Expenses — `/api/expenses`

> Members can GET and POST but **cannot** PUT or DELETE.

| Method | Path | Query Params | Description |
|---|---|---|---|
| GET | `/` | `siteId`, `category`, `status` | List expenses; populates `siteId` with `(code, name, cover)` |
| POST | `/` | — | Create expense; verifies site belongs to org |
| PUT | `/:id` | — | Update expense |
| DELETE | `/:id` | — | Delete expense |

---

#### Investors — `/api/investors`

| Method | Path | Query Params | Description |
|---|---|---|---|
| GET | `/` | `siteId` | List investors |
| POST | `/` | — | Create investor |
| PUT | `/:id` | — | Update investor |
| DELETE | `/:id` | — | Delete investor |

---

#### Payments — `/api/payments`

| Method | Path | Query Params | Description |
|---|---|---|---|
| GET | `/` | `siteId` | List payments |
| POST | `/` | — | Create payment |
| PUT | `/:id` | — | Update payment |
| DELETE | `/:id` | — | Delete payment |

---

#### Stats — `/api/stats`

| Method | Path | Query Params | Description |
|---|---|---|---|
| GET | `/` | `siteIds` (comma-separated ObjectIds) | Aggregated KPIs |

**Implementation:**
- Resolves site list (all or filtered)
- Runs 3 parallel `aggregate()` calls: investors, expenses (by site+category), payments
- Returns per-site summaries + global totals

**Response shape:**
```json
{
  "data": {
    "totalInvestment": 0,
    "totalExpenses": 0,
    "totalReceived": 0,
    "profit": 0,
    "byCat": { "material": 0, "labor": 0, "misc": 0 },
    "sites": [
      {
        "site": { ... },
        "investment": 0, "investorCount": 0,
        "expenses": 0, "expensesByCat": { ... },
        "received": 0, "paymentCount": 0,
        "profit": 0
      }
    ]
  }
}
```

---

#### Seed — `/api/seed`

- Protected by `x-seed-secret` header (must match `SEED_SECRET` env var)
- Used only in development to populate demo data

---

### 4.5 Middleware

**`src/middleware/auth.js`**

```javascript
protect   // Verifies Bearer JWT, attaches req.user (full User document minus password)
restrictTo(...roles)  // Must run AFTER protect; returns 403 if role not in list
```

**Error handling in `protect`:**
- No/malformed token → 401
- `TokenExpiredError` → 401 with specific message
- User deleted after token issued → 401

---

### 4.6 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | 5000 | HTTP port |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | JWT lifetime |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origin(s); comma-separated for multiple |
| `SEED_SECRET` | No | — | Header secret for seed endpoint |

---

### 4.7 Deployment (Render)

- **Service type:** Web (Node.js)
- **Build command:** `npm install`
- **Start command:** `node index.js`
- `JWT_SECRET` and `SEED_SECRET` are auto-generated by Render
- `MONGODB_URI` and `CORS_ORIGIN` must be set manually in the Render dashboard

---

## 5. Frontend — `siteledger-frontend`

### 5.1 Entry Point & App Shell

**`src/main.jsx`** — Provider tree:
```
React.StrictMode
  └── AuthProvider          (token/user state, login/logout/register)
        └── QueryClientProvider  (TanStack Query; retry: 1, no window-focus refetch)
              └── App
```

**`src/App.jsx`** — The single-page shell:
- Checks `isAuthenticated` from `AuthContext` → renders `<AuthGate>` (login/signup) or the main app
- Role-awareness: `isMember = user?.role === 'member'`
- Manages all top-level state in a single component:

| State | localStorage key | Default |
|---|---|---|
| `page` | `sl_page` | `'dashboard'` |
| `selectedIds` | `sl_sites` | `[]` |
| `range` | `sl_range` | `'30D'` |
| `donutView` | `sl_donut` | `'pl'` |
| `tweaks` | `sl_tweaks` | `{ hideSidebar, compactCards, monoMode }` |

- Data fetching via `useQuery` for `sites`, `investors`, `expenses`, `payments` (staleTime: 60s / 30s)
- Client-side aggregation via `useStats` hook (no separate stats API call used in main shell)
- Responsive: `isMobile = window.innerWidth < 1024`

**Layout:**
- Desktop: `<Sidebar>` + `<Topbar>` + `<main>` + FAB (tweaks)
- Mobile: `<Topbar>` + `<main>` + `<BottomNav>` + slide-in `<Drawer>` (sidebar)

---

### 5.2 Routing & Pages

SiteLedger uses **client-side page switching** (no react-router — navigation is state-based via `page` string). The Vercel `vercel.json` handles SPA deep-link fallback.

| `page` value | Component | Access |
|---|---|---|
| `'dashboard'` | `DashboardPage` | owner, admin |
| `'sites'` | `SitesPage` | owner, admin |
| `'investors'` | `InvestorsPage` | owner, admin |
| `'expenses'` | `ExpensesPage` | **all roles** |
| `'payments'` | `PaymentsPage` | owner, admin |
| `'reports'` | `ReportsPage` | owner, admin |
| `'members'` | `MembersPage` | owner, admin |

**Members** always land on `'expenses'` and only see the Expenses tab in `<BottomNav>`.

---

### 5.3 State Management

**No global store (Redux/Zustand/etc.).** State flows from `App.jsx` down via props.

**Pattern:**
1. `useQuery` fetches raw arrays from API and caches them
2. `useStats` (`src/hooks/useStats.js`) computes all derived KPIs via `useMemo`
3. Computed `stats` object is prop-drilled to each page/component

**`useStats` outputs:**
```javascript
{
  totalInvestment, totalExpenses, totalPayments, netProfit,
  profitPct, expDelta, byCategory,
  siteMetrics,          // per-site: spent, received, invested, profit, burnRate
  recentPayments,       // last 5 by date
  recentExpenses,       // last 8 by date
  filteredSites, filteredExpenses, filteredInvestors, filteredPayments,
  investorProfits,      // each investor + profitShare + ROI
  largestCat,           // 'material' | 'labor' | 'misc'
}
```

---

### 5.4 Auth Flow

**`src/context/AuthContext.jsx`**

- Token and user stored in `localStorage` as `sl_token` / `sl_user`
- Hydrated from localStorage on first render (survives page refresh)
- Methods exposed via context: `login`, `registerOrg`, `registerAdmin`, `logout`
- `isAuthenticated = !!token`

**Login flow (pages):**
1. `LoginPage` → `PortalSelect` (Admin/Org or Member)
2. Admin path: standard email/password form → `POST /api/auth/login`
3. Member path: same form but no self-registration link

**Signup flow:**
- `SignupPage` offers two registration types:
  - **Create Organisation** → `POST /api/auth/register/org` (owner role)
  - **Join with Invite Code** → `POST /api/auth/register/admin` (admin role)
- Members are never self-registered; only owner/admin can create members via `MembersPage`

**API 401 auto-logout:**
The Axios response interceptor in `src/api/index.js` clears `sl_token`/`sl_user` and calls `window.location.reload()` on any 401 response.

---

### 5.5 API Layer

**`src/api/index.js`**

```javascript
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

Axios instance with:
- 15-second timeout
- Request interceptor: attaches `Authorization: Bearer <sl_token>`
- Response interceptor: normalises errors; 401 → auto-logout + reload

**Exported functions:**

| Category | Functions |
|---|---|
| Auth | `loginUser`, `registerUser` |
| Sites | `getSites`, `createSite`, `updateSite`, `deleteSite` |
| Investors | `getInvestors(siteId?)`, `createInvestor`, `updateInvestor`, `deleteInvestor` |
| Expenses | `getExpenses(params?)`, `createExpense`, `updateExpense`, `deleteExpense` |
| Payments | `getPayments(params?)`, `createPayment`, `updatePayment`, `deletePayment` |
| Members | `getMembers`, `addMember`, `deleteMember` |
| Stats | `getStats` (not used in main shell; reserved) |

> **Note:** `AuthContext` calls `api.post(...)` directly (not through named exports) for auth operations. The named `loginUser`/`registerUser` exports in `api/index.js` are partially misaligned (they use `/auth/register` which doesn't exist — the correct paths are `/auth/register/org` and `/auth/register/admin`).

---

### 5.6 Components

All components are in `src/components/`. None use TailwindCSS utility classes directly — they use CSS custom properties from the design system and component classes from `index.css`.

| Component | Purpose |
|---|---|
| `Sidebar.jsx` | Desktop left nav; shows site switcher + nav items; collapses for mobile drawer |
| `Topbar.jsx` | Header bar; shows page title, site filter, date range selector, add button |
| `SiteSwitcher.jsx` | Multi-select site filter dropdown |
| `KPIStrip.jsx` | Row of KPI cards (investment, expenses, payments, profit) |
| `Donut.jsx` | SVG donut chart for expense category breakdown (material/labor/misc) or P&L |
| `ExpenseTable.jsx` | Sortable, filterable table of expenses |
| `InvestorsPanel.jsx` | List of investors with amounts and shares |
| `InvestorProfitPanel.jsx` | Per-investor profit share breakdown |
| `PaymentsPanel.jsx` | List of client payments |
| `SiteHealth.jsx` | Per-site burn rate progress bars |
| `AddExpenseModal.jsx` | Form modal to add a new expense |
| `EditExpenseModal.jsx` | Form modal to edit an expense |
| `AddInvestorModal.jsx` | Form modal to add a new investor |
| `EditInvestorModal.jsx` | Form modal to edit an investor |
| `AddPaymentModal.jsx` | Form modal to add a new payment |
| `EditPaymentModal.jsx` | Form modal to edit a payment |
| `AddSiteModal.jsx` | Form modal to add a new site |
| `EditSiteModal.jsx` | Form modal to edit a site |
| `ConfirmDeleteModal.jsx` | Reusable confirm-before-delete dialog |
| `TweaksPanel.jsx` | Settings panel (hide sidebar, compact cards, mono mode) |
| `icons.jsx` | All SVG icon components (Icon*) |

---

### 5.7 Design System

Defined in `src/index.css`. TailwindCSS v3 is configured but the main styling relies on **CSS custom properties** and **@layer components** class utilities.

#### Color Tokens (`:root`)
| Token | Value | Usage |
|---|---|---|
| `--bg-0` | `#0B1537` | Deepest background |
| `--bg-1` | `#0F1B43` | Page background |
| `--bg-2` | `#111C44` | Panel/drawer |
| `--bg-3` | `#1A204A` | Elevated surfaces |
| `--ink` | `#FFFFFF` | Primary text |
| `--ink-2` | `#A0AEC0` | Secondary text |
| `--ink-3` | `#718096` | Muted/label text |
| `--line` | `rgba(255,255,255,0.08)` | Borders |
| `--line-2` | `rgba(255,255,255,0.14)` | Hover borders |
| `--accent-cyan` | `#01B5EC` | Links, highlights |
| `--accent-blue` | `#0075FF` | Primary action |
| `--accent-purple` | `#582CFF` | Gradient end |
| `--accent-pink` | `#FF0080` | Danger / alerts |
| `--accent-green` | `#01B574` | Success / profit |
| `--accent-red` | `#E31A1A` | Error states |
| `--accent-amber` | `#FFB547` | Warnings |

#### Gradients
| Token | Description |
|---|---|
| `--grad-primary` | Blue → Purple (main CTA) |
| `--grad-pink` | Pink → Dark purple |
| `--grad-green` | Green → Cyan |
| `--grad-amber` | Amber → Pink |
| `--grad-card` | Dark card background |
| `--grad-page` | Radial page background |

#### Component Classes
| Class | Description |
|---|---|
| `.card` | Glassmorphism card (backdrop-filter: blur 20px) |
| `.card-inner` | Inner card / nested panel |
| `.chip`, `.chip-*` | Status badge pills (green/amber/pink/blue/purple/red/gray) |
| `.btn-primary` | Gradient primary button |
| `.btn-ghost` | Ghost/secondary button |
| `.input-dark` | Dark-themed text input |
| `.select-dark` | Dark-themed select dropdown |
| `.nav-item` | Sidebar navigation item |
| `.progress-bar` / `.progress-fill` | Horizontal progress bars |
| `.table-row` | Table row with hover state |
| `.range-btn` | Date-range toggle button |
| `.pill-toggle` | Segmented control (e.g., P&L / Donut toggle) |
| `.icon-tile` | Square icon container (40×40) |

#### Typography
- **Body:** `Plus Jakarta Sans` (Google Font, with system-ui fallback)
- **Numbers/code:** `JetBrains Mono` (applied via `.num` class)
- Base font size: `14px`

---

### 5.8 Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `https://siteledger-backend-2npj.onrender.com/api`) |

Default fallback: `http://localhost:3001/api`

---

### 5.9 Deployment (Vercel)

- `vercel.json` rewrites all routes to `/index.html` (SPA fallback)
- `npm run build` → `vite build` → `dist/` folder served by Vercel

---

## 6. Data Model Relationships

```
Organisation
    │
    ├── User (orgId) → role: owner | admin | member
    │
    ├── Site (orgId)
    │     │
    │     ├── Expense (siteId, orgId)   ← category: material | labor | misc
    │     │                              ← status: paid | pending
    │     ├── Investor (siteId, orgId)  ← amount + share%
    │     └── Payment (siteId, orgId)   ← clientName + milestone
```

**All data is org-scoped.** Every query filters by `orgId: req.user.orgId` so organisations are fully isolated.

---

## 7. Role-Based Access Control (RBAC)

| Permission | owner | admin | member |
|---|:---:|:---:|:---:|
| Create organisation | ✅ | — | — |
| Manage sites (CRUD) | ✅ | ✅ | ❌ |
| Manage investors (CRUD) | ✅ | ✅ | ❌ |
| Manage payments (CRUD) | ✅ | ✅ | ❌ |
| View expenses | ✅ | ✅ | ✅ |
| Add expenses (POST) | ✅ | ✅ | ✅ |
| Edit/delete expenses | ✅ | ✅ | ❌ |
| View dashboard / reports | ✅ | ✅ | ❌ |
| Manage members (add/delete) | ✅ | ✅ | ❌ |
| View stats API | ✅ | ✅ | ❌ |
| Self-register | ✅ (new org) | ✅ (invite code) | ❌ |

**Frontend enforcement:** `App.jsx` gates pages by `isMember` flag. Members only see the Expenses page.

**Backend enforcement:**
- `protect` middleware validates JWT on all protected routes
- Routes check `req.user.role` inline or use `restrictTo()`
- `sites.js` blocks all member access at the router level
- `expenses.js` blocks PUT/DELETE for members at the router level

---

## 8. API Reference

**Base URL:** `https://siteledger-backend-2npj.onrender.com/api`

**Auth header** (all protected routes): `Authorization: Bearer <token>`

### Error Response Format
```json
{ "success": false, "message": "Human-readable error" }
// or for validation errors:
{ "success": false, "errors": [{ "msg": "...", "path": "..." }] }
```

### Success Response Format
```json
{ "success": true, "data": { ... } }
// or for lists:
{ "success": true, "count": N, "data": [ ... ] }
```

### Status Codes Used
| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthenticated |
| 403 | Forbidden (role mismatch) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 422 | Validation error |
| 500 | Server error |

---

## 9. Local Development Setup

### Backend

```bash
cd siteledger-backend
npm install

# Create .env from example
cp .env.example .env
# Fill in MONGODB_URI (local: mongodb://127.0.0.1:27017/siteledger)

npm run dev        # nodemon index.js → http://localhost:5000
```

### Frontend

```bash
cd siteledger-frontend
npm install

# Create .env from example
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api

npm run dev        # Vite → http://localhost:5173
```

### Health Check
```
GET http://localhost:5000/health
→ { "success": true, "status": "ok", "service": "SiteLedger API" }
```

---

## 10. Key Patterns & Conventions

### Backend Patterns

1. **Org-scoping:** Every DB query includes `orgId: req.user.orgId`. Never omit this filter.
2. **findOneAndUpdate over findById + save:** Used for atomicity and to return the updated document.
3. **Populate on read:** `expenses.js` and `investors.js`/`payments.js` populate `siteId` to return embedded `(code, name, cover)` — avoids additional frontend lookups.
4. **Validation at route level:** `express-validator` chains on every mutating route.
5. **No controllers folder:** Route handlers are inline within each route file (flat structure for simplicity).
6. **Lean queries for aggregation:** `Site.find().lean()` used in stats for performance.

### Frontend Patterns

1. **No react-router:** Navigation is page-state based (`const [page, setPage] = useState(...)`).
2. **Prop drilling from App.jsx:** `stats`, `sites`, `selectedIds` are passed down explicitly — no context for data.
3. **LocalStorage persistence:** Key app state (`sl_page`, `sl_sites`, `sl_range`, etc.) persisted to localStorage via `useEffect`.
4. **Query invalidation on save:** After mutations, relevant `useQuery` keys are invalidated via `queryClient.invalidateQueries(...)`.
5. **Mobile breakpoint:** `1024px` is the desktop/mobile split; `window.innerWidth < 1024` tracked in state with resize listener.
6. **Modals as conditionally rendered overlays:** All modals use the `.modal-overlay` class and are rendered at App.jsx level or within their respective pages.
7. **`mobileAddTick`:** An integer tick counter passed to pages; pages watch it to trigger their internal "Add" modal on mobile (triggered by the Topbar's `+` button).

---

## 11. Known Gaps & Future Work

| Area | Issue / Gap |
|---|---|
| **API named exports** | `loginUser` and `registerUser` in `api/index.js` call non-existent paths (`/auth/register`). `AuthContext` bypasses these and calls the API directly. |
| **Stats API usage** | `getStats()` is exported but not used in the main shell — stats are computed client-side by `useStats`. The backend `/api/stats` endpoint is feature-complete but unused by the frontend. |
| **Date range filter** | `range` state (`30D`, etc.) exists in UI but no filtering logic is wired to it — all data is fetched unfiltered. |
| **`utils/` folder** | Empty — reserved for helpers. |
| **No tests** | Zero unit/integration/e2e tests. |
| **No refresh token** | JWT expires in 7 days with no refresh mechanism. Users must log in again. |
| **Seed route security** | `/api/seed` relies on a header secret — not disabled in production by code; must be managed via secret rotation. |
| **Cover field** | `Site.cover` stores an arbitrary CSS color string — no validation or UI color picker (inferred from frontend code). |
| **Profit calculation** | Net profit = `totalPayments - totalExpenses`. Investment is tracked separately and not deducted from profit — it's a capital input metric only. |

---

*Last updated: June 2026 · Covers siteledger-frontend@0.0.0 + siteledger-backend@1.0.0*
