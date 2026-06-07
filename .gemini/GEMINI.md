# Home Masjid — Agent Instructions

> **This file is the single source of truth for any AI agent working on this codebase.**
> Read it fully before making any changes, generating code, or proposing architecture.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Name** | Home Masjid |
| **Tagline** | Your home. Your masjid. Connected. |
| **Repository** | `https://github.com/seitzcodes/home-masjid` |
| **Domain** | TBD (target: `homemasjid.com` or `homemasjid.org`) |
| **License** | TBD |

### What is Home Masjid?

Home Masjid is a global inter-masjid platform that connects Muslim communities to their local masjids and masjids to each other. The name carries layered meaning:

- **The masjid closest to your home** — geospatial discovery of nearby masjids.
- **The platform connecting your home to the masjid** — digital bridge for programs, announcements, and donations.
- **The masjid is the home of Allah** — spiritual significance and reverence.
- **Our homes should be connected with the masjid** — community-first design philosophy.

### Target Audience

1. **Public Users** — Muslims looking for their local masjid, prayer times, programs, and community events.
2. **Masjid Faculty (Verified Admins)** — Imams, committee members, and administrators who manage a masjid's digital presence.
3. **Platform Moderators** — Super-admins who oversee the global directory, verification workflow, and content moderation.

### Geographic Focus

Launch region: **South Africa** (Durban / KwaZulu-Natal first, then national).
Expansion: Global — the architecture must support international masjids from day one.

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Next.js (App Router) | Server components, API routes, SSR/SSG |
| **Language** | TypeScript | Strict mode enabled |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first with accessible component primitives |
| **Database** | Supabase (PostgreSQL) | Custom schema: `home_masjid` |
| **Geospatial** | PostGIS (`extensions` schema) | `geography(POINT, 4326)` for GPS coordinates |
| **Auth** | Supabase Auth (SSR) | `@supabase/ssr` package, cookie-based sessions |
| **Storage** | Supabase Storage | Masjid images, proof documents, flyers |
| **Payments** | Paystack (ZAR primary) | Test + Live keys in `.env.local` |
| **Email** | Resend | Transactional emails, program announcements |
| **Prayer Times** | AlAdhan API | Coordinate-based, multiple calculation methods |
| **Maps** | Mapbox (`react-map-gl`) | Interactive map, custom masjid pins |
| **Hosting** | Vercel | CI/CD from GitHub, edge functions |
| **AI** | Gemini API / OpenRouter | Content assistance, moderation (future) |

### Package Conventions

- Use `pnpm` as the package manager.
- Pin all dependency versions (no `^` or `~`).
- Prefer `@supabase/ssr` over the deprecated `@supabase/auth-helpers-nextjs`.

---

## 3. Supabase Configuration

### Schema

All application tables live in the **`home_masjid`** custom schema (not `public`).
The schema is exposed via the Supabase Data API settings.

### Environment Variables

Stored in `.env.local` (never committed to git):

```
NEXT_PUBLIC_SUPABASE_URL        — Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   — Anonymous public key
SUPABASE_SERVICE_ROLE_KEY       — Server-only full-access key
SUPABASE_ACCESS_TOKEN           — Management API token
SUPABASE_SESSION_POOLER         — Connection pooler string
```

### Supabase Client Initialization

Always create typed Supabase clients that target the `home_masjid` schema:

```typescript
// lib/supabase/client.ts (browser)
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: 'home_masjid' } }
  )

// lib/supabase/server.ts (server components / route handlers)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'home_masjid' },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### Server Actions Security

When verifying authentication within a Next.js Server Action, **always** use `supabase.auth.getUser()` rather than `getSession()`. This ensures the session is validated directly against the Supabase Auth server, preventing cookie spoofing vulnerabilities.

### Database Types

Generate TypeScript types from the database using:

```bash
npx supabase gen types typescript --project-id mwxcokklqsrxjlcrendq --schema home_masjid > lib/supabase/database.types.ts
```

Always regenerate types after schema migrations.

---

## 4. Database Architecture

### Schema Permissions (Applied)

```sql
GRANT USAGE ON SCHEMA home_masjid TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA home_masjid TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA home_masjid TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA home_masjid GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA home_masjid GRANT SELECT ON TABLES TO anon;
```

### Tables

| Table | Purpose |
|---|---|
| `masjids` | Core directory — name, address, GPS (PostGIS), verified status |
| `user_profiles` | Extends `auth.users` — full name, username, privacy toggles, designated home masjid |
| `masjid_claims` | Verification workflow — pending/approved/rejected with proof docs |
| `masjid_faculty` | Role mapping — which users are admin/editor for which masjid |
| `followers` | Social graph — users following masjid pages |
| `posts` | Announcements/social feed — text + optional image per masjid |
| `post_likes` | Social interactions — users liking specific posts |
| `comments` | Public engagement on posts |
| `programs` | Events — title, speaker, time, audience (general/youth/sisters/brothers) |
| `projects` | Fundraising — goal amount, current amount, active status |
| `donations` | Payment tracking — amount, status, user_id (SET NULL on delete) |
| `masjid_connections` | Networking — pending/accepted connection requests between masjids |
| `masjid_messages` | Inter-masjid correspondence — subject, body, read status, event invites |
| `masjid_followers` | Analytics and Social — tracks which users follow which masjids |

### Row Level Security (Applied)

RLS is actively enabled across the domain: `posts`, `programs`, `projects`, `donations`, `masjid_connections`, `masjid_messages`, `masjid_followers`.

- **Public Data (SELECT)**: Anyone can read masjids, programs, posts, and projects.
- **Protected Data**: Connections, messages, and followers are restricted to their participants.
- **Faculty Mutations (INSERT / UPDATE / DELETE)**: Restricted to users who exist in `masjid_faculty` for the row's `masjid_id`. Auth check uses custom helper `home_masjid.is_faculty_member(masjid_id, user_id)`.

### Key Geospatial Pattern

Finding the nearest masjids to a user:

```sql
SELECT id, name, city,
  ST_Distance(gps_location, ST_MakePoint($lng, $lat)::geography) AS distance_meters
FROM home_masjid.masjids
ORDER BY gps_location <-> ST_MakePoint($lng, $lat)::geography
LIMIT 10;
```

Wrap this in a Supabase RPC function for client use.

### Timezone Calculation
Timezones are stored directly on the `masjids` table. During creation, the `tz-lookup` library is used in combination with the GPS coordinates to statically save the standard IANA timezone string on the row. This prevents the need for dynamic timezone resolution during API fetches.

### Auth Trigger
A Postgres trigger `on_auth_user_created` automatically listens to `auth.users` inserts and creates a synchronized row in `home_masjid.user_profiles`. Never manually insert into `user_profiles` during the sign-up flow, rely on the trigger.

### Storage Buckets
Documents for verifying masjids are stored in the `verification_documents` bucket. The bucket relies on RLS to ensure only authenticated users can upload.

---

## 5. Design System

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#0F172A` | Midnight Blue — headers, primary buttons, verified badges |
| `--color-primary-light` | `#1E293B` | Hover states, active links |
| `--color-primary-dark` | `#020617` | Pressed states, focus rings |
| `--color-secondary` | `#64748B` | Slate Grey — secondary text, borders, metadata |
| `--color-accent` | `#D4AF37` | Warm Gold / Brass — donation progress, premium badges, CTAs |
| `--color-background` | `#FFFFFF` | Crisp White — light mode page background |
| `--color-surface` | `#F8FAFC` | Card/panel background |
| `--color-text-primary` | `#0F172A` | Midnight — primary body text |
| `--color-text-secondary` | `#64748B` | Slate — secondary/helper text |
| `--color-danger` | `#DC2626` | Error states, destructive actions |
| `--color-success` | `#16A34A` | Success toasts, verified checkmarks |

*Note: The platform features a robust Dark Mode ("Night Sky" aesthetic) controlled via `next-themes` and custom explicit CSS visibility classes for logos.*

### Typography

- **Heading Font**: `Outfit` (Google Fonts) — applied globally to all `h1`-`h6` elements for a modern geometric feel.
- **Primary Body Font**: `Plus Jakarta Sans` (Google Fonts) — body text and UI elements for high legibility.
- **Heading Scale**: Use Tailwind's default type scale (`text-sm` through `text-4xl`)
- **Prayer Times**: Use tabular numerals (`font-variant-numeric: tabular-nums`) for alignment

### Component Library

Use **shadcn/ui** components installed locally (not as a dependency):

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog input label tabs avatar badge
```

Theme shadcn components using the brand color tokens above.

### Layout Architecture

| Audience | Layout | Pattern |
|---|---|---|
| Public users | Mobile-first feed | Card-based scroll, bottom nav on mobile |
| Masjid faculty | Dashboard | Sidebar nav, top header with masjid selector |
| Platform admins | Admin panel | Table-driven views, verification queue |

### Iconography

Use `lucide-react` (ships with shadcn/ui). Consistent 20px–24px sizing.

---

## 6. Project Structure (Target)

```
home-masjid/
├── .env.local                    # Secrets (gitignored)
├── .gemini/
│   ├── GEMINI.md                 # This file — agent instructions
│   └── ROADMAP.md                # Project roadmap and phase tracking
├── public/
│   └── assets/                   # Static images, favicon, OG images
├── src/
│   ├── app/
│   │   ├── (auth)/               # Auth routes: /login, /register, /callback
│   │   ├── (public)/             # Public routes: /, /masjids, /masjid/[id]
│   │   ├── (dashboard)/          # Faculty dashboard: /dashboard/*
│   │   ├── (admin)/              # Platform admin: /admin/*
│   │   ├── api/                  # API routes
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Tailwind + CSS custom properties
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── layout/               # Header, Footer, Sidebar, Nav
│   │   ├── masjids/              # MasjidCard, MasjidProfile, PrayerTimes, DirectoryClientLayout
│   │   ├── feed/                 # PostCard, FeedEmpty
│   │   └── donation/             # DonationModal, ProjectCard, ProjectProgress
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser Supabase client
│   │   │   ├── server.ts         # Server Supabase client
│   │   │   ├── middleware.ts     # Auth session refresh
│   │   │   └── database.types.ts # Generated types
│   │   ├── paystack/             # Payment integration helpers
│   │   ├── aladhan/              # Prayer time API client
│   │   └── utils.ts              # Shared utilities
│   ├── hooks/                    # Custom React hooks
│   └── types/                    # Shared TypeScript types
├── supabase/
│   ├── migrations/               # SQL migration files
│   └── seed.sql                  # Test data for development
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 7. Development Conventions

### Code Style

- **Components**: PascalCase, one component per file, co-locate styles.
- **Utilities/hooks**: camelCase.
- **Database columns**: snake_case (PostgreSQL convention).
- **TypeScript**: Strict mode. No `any`. Prefer interfaces over type aliases for object shapes.
- **Imports**: Use `@/` path alias mapped to `src/`.

### API Routes

- Use Next.js Route Handlers (`app/api/*/route.ts`).
- Always validate input with `zod`.
- Always create a server-side Supabase client per request.
- Return consistent JSON: `{ data, error, message }`.

### Error Handling

- Use Supabase's built-in error responses for database operations.
- Wrap Paystack/external API calls in try-catch.
- Log errors server-side; show user-friendly messages client-side.

### Git Conventions

- **Branch naming**: `feature/`, `fix/`, `chore/` prefixes.
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`).
- **User**: `seitzcodes` / `seitz.codes@gmail.com`.
- **Never commit**: `.env.local`, `node_modules/`, `.next/`.

### Testing

- Unit tests: Vitest for utility functions.
- Component tests: React Testing Library.
- E2E tests: Playwright (future phase).

---

## 8. External API Integration Patterns

### AlAdhan (Prayer Times)

```
GET https://api.aladhan.com/v1/timings/{timestamp}?latitude={lat}&longitude={lng}&method={method}
```

Cache prayer times per masjid per day. Allow masjid faculty to override with manually set times.

### Paystack (Donations)

- Initialize transactions server-side via `POST https://api.paystack.co/transaction/initialize`.
- Verify via webhook (`POST /api/webhooks/paystack`).
- Use `PAYSTACK_SECRET_KEY` for server calls, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` for inline JS.
- All amounts in **kobo** (ZAR cents × 100).

### Resend (Email)

- Triggered from background jobs or API routes.
- Templates: welcome email, program announcement, donation receipt, verification status.

---

## 9. Security Checklist

- [ ] RLS enabled on all `home_masjid` tables.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed to client-side code.
- [ ] Paystack webhooks verified with signature hash.
- [ ] File uploads validated for type and size.
- [ ] Input sanitized against XSS (especially post/comment content).
- [ ] Rate limiting on auth endpoints and donation API.
- [ ] CORS configured for production domain only.

---

## 10. Key Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| Custom schema | `home_masjid` | Isolates app tables from Supabase internals |
| Payment provider | Paystack | Native ZAR support for South Africa launch market |
| Component library | shadcn/ui | Full code ownership, accessible, themeable |
| Email provider | Resend | Modern DX, good deliverability, Next.js native |
| Prayer API | AlAdhan | Free, coordinate-based, supports all calculation methods |
| Maps provider | Mapbox | Native support for React with `react-map-gl` |
| CSS framework | Tailwind CSS | Pairs with shadcn/ui, utility-first, Vercel-optimized |
| Dark Mode | `next-themes` | Reliable class-based toggling avoiding Tailwind v4 media-query conflicts |
| Package manager | pnpm | Fast, disk-efficient, strict dependency resolution |
| Data Seeding | postgres.js | Bypasses PostgREST REST limits for custom schema writes |

---

## 11. Important Notes for Agents

1. **Always target the `home_masjid` schema** when writing Supabase queries. Never use `public`.
2. **Always regenerate database types** after any migration.
3. **Never hardcode Supabase URLs or keys** — always read from `process.env`.
4. **Mobile-first** — design for 375px viewport first, scale up.
5. **Respect RLS** — never bypass with `service_role` unless explicitly required for admin operations.
6. **South African context** — currency is ZAR, default prayer calculation method is Egyptian General Authority (method 5), time zone is `Africa/Johannesburg` (UTC+2).
7. **Inclusive language** — the platform serves all Muslims. Avoid sectarian terminology.
8. **Refer to ROADMAP.md** for current development phase and priorities.

### Current Focus: Phase 8 (Launch & Growth)
We have completed Phase 7 (Advanced Features including Jumu'ah schedules, Ramadan tracking, Content Moderation, and Admin Analytics). Our next priority is **Phase 8**, which involves legal compliance (Privacy/Terms), accessibility audits, and final pre-launch checks.
- **Prayer Times Override**: Quick-access panel to adjust local iqama (congregational) times (alongside AlAdhan API baseline).
- **Program & Event Manager**: Scheduler to create and target specific community events.
- **Campaigns & Logistics**: Post maintenance requests, view incoming donation streams, and track goals with Brass progress bars. Donations route directly to verified bank accounts.
- **Community Feed & Inbox**: Post official updates, manage public comments, read encrypted messages from other verified masjids.

---

## 12. Core Feature Architectures

### The Masjid Faculty Dashboard
The dashboard serves as a central command center for verified masjid officials. It features a structured dark sidebar navigation against a clear, high-contrast workspace (Night Sky and Brass design language). Key modules:
- **Prayer Times Override**: Quick-access panel to adjust local iqama (congregational) times (alongside AlAdhan API baseline).
- **Program & Event Manager**: Scheduler to create and target specific community events.
- **Campaigns & Logistics**: Post maintenance requests, view incoming donation streams, and track goals with Brass progress bars. Donations route directly to verified bank accounts.
- **Community Feed & Inbox**: Post official updates, manage public comments, read encrypted messages from other verified masjids.

### Dual-Path Landing Page & Onboarding
The public homepage serves as a unified landing page that strictly steers incoming traffic into one of two funnels:
1. **For Musallees (Users)**: Emphasizes finding local masjids, engaging with programs, and supporting projects. Routes to the standard user registration flow (`/register`).
2. **For Masjid Faculty**: Highlights digital presence management, fundraising tools, and inter-masjid networking. Routes to a targeted faculty onboarding flow (`/register?type=faculty`).

### Demographic Categories for Programs
Programs are highly structured to target specific audiences:
- **Youth & Children**: Robotics workshops, Quran memorization, sports leagues, coding camps.
- **Women & Sisters**: Jurisprudence classes, professional networking, mothers' support groups.
- **Families & General Public**: Weekly spiritual lectures, community dinners, financial literacy.

### Social Feed & Notification Architecture
Operates on a highly scalable, event-driven distribution model to avoid serverless timeouts:
1. **The Catalyst**: `Faculty Dashboard Post` -> `Database Insert (programs/posts)`.
2. **Database Webhook**: Supabase triggers a POST request to a Next.js API route (`/api/webhooks/new-program`).
3. **The Fan-Out Queue**: The API route immediately pushes the payload to a serverless background queue (QStash or Inngest) and returns 200 OK to free up connections.
4. **Omnichannel Delivery**: The background worker (`/api/workers/notify-followers`) retrieves the exact audience (filtering by demographic preferences like Youth or Sisters) and dispatches:
   - Batched transactional emails via Resend.
   - Push notifications via Firebase Cloud Messaging (FCM).
5. **Real-Time Toasts**: Active users browsing the app receive instant, non-intrusive toast notifications via Supabase Realtime listeners wrapped high in the layout tree.
6. **Personalised Feed Page (`/feed`)**: The `get_user_feed(user_id)` Postgres RPC returns a reverse-chronological stream of posts from the user's Home Masjid and all followed masjids. Rendered via `PostCard.tsx` with Night Sky/Brass design.

Faculty maintain strict moderation tools to hide or report disruptive comments.

### Donations & Payments Architecture
Paystack is the primary payment provider for ZAR transactions:
1. **Initiation**: User selects amount in `DonationModal.tsx` -> `initiateDonation()` Server Action inserts a `pending` donation row and calls `POST https://api.paystack.co/transaction/initialize`.
2. **Checkout**: User is redirected to Paystack-hosted checkout page. On success, Paystack redirects back to `callback_url` (`/masjids/[id]?donation=success`).
3. **Webhook Verification**: Paystack sends `charge.success` to `/api/webhooks/paystack`. The HMAC-SHA512 signature is verified against `PAYSTACK_SECRET_KEY` before any database mutation occurs.
4. **Atomic Update**: On verified success, the donation row is marked `completed` and `projects.current_amount` is incremented. Use the `increment_project_amount(p_id, amount)` RPC to ensure atomicity under concurrent donations.
5. **Receipt**: Resend dispatches a branded donation receipt email to the donor's address.

**Key env vars**: `PAYSTACK_SECRET_KEY` (server-only), `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (inline JS), `NEXT_PUBLIC_SITE_URL` (for callback URL construction).

### Livestreaming Capabilities
To keep infrastructure lightweight, the platform does not process live video natively:
- **Third-Party Embeds**: YouTube Live, Facebook Live, or Mixlr directly embedded.
- **Mux / Cloudflare Stream APIs**: For white-labeled RTMP streaming into embedded players.

### Verification Strictness
To protect platform integrity and prevent fraudulent campaigns:
- **Document Submission**: Claimants must upload ID and official docs (NPO/NGO certificate, utility bill, or board letter).
- **Manual Verification**: Platform admins cross-reference data or perform verification calls.
- **Peer-Validation (Community Vouching)**: Existing verified faculty from neighboring masjids can "vouch" for new claims to accelerate approval.
