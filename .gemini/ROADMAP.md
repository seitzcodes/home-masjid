# Home Masjid — Project Roadmap

> **Living document** — update this file as phases are completed and priorities shift.
> Last updated: 2026-06-06

---

## Vision

Build the world's most trusted, community-driven masjid platform — starting in South Africa, scaling globally. Every Muslim should be able to find their closest masjid, see prayer times, follow programs, donate to projects, and feel connected to their congregation from anywhere.

---

## Phase 0: Foundation ✅

> **Goal**: Database architecture and security baseline.

- [x] Create Supabase project and custom `home_masjid` schema
- [x] Expose schema via Data API settings
- [x] Grant schema permissions to `anon`, `authenticated`, `service_role`
- [x] Enable PostGIS extension for geospatial queries
- [x] Create core tables:
  - [x] `masjids` — directory with PostGIS GPS coordinates
  - [x] `user_profiles` — extends `auth.users`, includes home masjid designation
  - [x] `masjid_claims` — verification workflow
  - [x] `masjid_faculty` — role-based masjid management
  - [x] `followers` — social graph (user ↔ masjid)
  - [x] `posts` — announcement/social feed
  - [x] `comments` — public engagement on posts
  - [x] `programs` — events, lectures, youth programs
  - [x] `projects` — fundraising campaigns
  - [x] `donations` — payment tracking
  - [x] `masjid_messages` — inter-masjid correspondence
- [x] Apply Row Level Security (RLS) on `posts`, `programs`, `projects`
- [x] Initialize Git repository with remote origin
- [x] Create `.gemini/GEMINI.md` (agent instructions)
- [x] Create `.gemini/ROADMAP.md` (this file)

---

## Phase 1: Application Scaffolding ✅

> **Goal**: Initialize Next.js, wire up Supabase auth, and establish the design system.

### 1.1 — Project Initialization

- [x] Initialize Next.js app with App Router and TypeScript
- [x] Configure `pnpm` as package manager
- [x] Install and configure Tailwind CSS
- [x] Install and initialize shadcn/ui
- [x] Set up path alias (`@/` → `src/`)
- [x] Configure `next.config.ts` (images, env, redirects)
- [x] Create `.gitignore` (node_modules, .next, .env.local)
- [x] Initial commit and push to GitHub

### 1.2 — Supabase Auth Integration

- [x] Install `@supabase/ssr` and `@supabase/supabase-js`
- [x] Create browser client (`lib/supabase/client.ts`)
- [x] Create server client (`lib/supabase/server.ts`)
- [x] Create middleware for session refresh (`middleware.ts`)
- [x] Generate database types (`lib/supabase/database.types.ts`)
- [x] Build auth pages:
  - [x] `/login` — email + password, social providers (future)
  - [x] `/register` — with full name, creates `user_profiles` row
  - [x] `/auth/callback` — handles OAuth/magic link redirects
- [x] Create auth context/hook for client components
- [x] Protect dashboard routes with middleware

### 1.3 — Design System & Branding

- [x] Define CSS custom properties for "Night Sky and Brass" palette in `globals.css`
- [x] Implement robust Light/Dark mode toggling via `next-themes`
- [x] Import and configure `Outfit` (headings) and `Plus Jakarta Sans` (body) fonts via `next/font`
- [x] Update site logos (Light/Dark variants) and custom favicon
- [x] Theme shadcn/ui components with brand palette
- [x] Build layout components:
  - [x] `PublicLayout` — header with theme toggle, footer with terms/privacy links
  - [x] `DashboardLayout` — sidebar nav, top bar, masjid selector
- [x] Build polished Public Homepage:
  - [x] Full-width Hero section with background image and Midnight Blue overlay
  - [x] Dual-Path Landing Page (For Musallees & For Masjid Faculty)
  - [x] "Our Mission" section highlighting global connectivity
- [x] Create placeholder pages for route groups (`/privacy`, `/terms`)

---

## Phase 2: Masjid Directory & Discovery ✅

> **Goal**: Public-facing masjid search, map view, and individual masjid profiles.

### 2.1 — Directory & Search

- [x] Seed database with 271 South African masjids (Durban, Cape Town, Johannesburg)
- [x] Create Supabase RPC (`get_nearby_masjids`) for nearest-masjid geospatial query
- [x] Build `/masjids` page — searchable, filterable directory
  - [x] Search by name, city, country
  - [x] Filter by verified status
  - [x] Sort by distance (uses HTML5 Geolocation API)
- [x] Integrate map view (Mapbox)
  - [x] Plot masjid markers with interactive popups (Dark-v11 styling)
  - [x] User location pin (pulsing)
  - [x] Distance calculation display (`react-map-gl` implementation)

### 2.2 — Masjid Profile Page

- [x] Build `/masjid/[id]` page with:
  - [x] Masjid header (name, verified badge, cover photo)
  - [x] Address + interactive map embed
  - [x] Prayer times section (Adhan vs Iqama comparison table)
  - [x] Programs tab — upcoming events
  - [x] Projects tab — active fundraising campaigns
  - [x] Social feed tab — real-time posts from masjid (using `postgres_changes`)
  - [x] Follow button
  - [x] "Set as Home Masjid" button

### 2.3 — Prayer Times

- [x] Create AlAdhan API client (`lib/aladhan/`)
- [x] Fetch prayer times dynamically via `tz-lookup` based on PostGIS masjid GPS coordinates
- [x] Store `timezone` directly on `home_masjid.masjids` table for performant retrieval
- [x] Allow masjid faculty to override with custom iqama times
- [x] Display today's times with next-prayer highlight
- [ ] Cache prayer times to reduce API calls

---

## Phase 3: Verification & Masjid Management ✅

> **Goal**: A secure process to ensure only real faculty can claim and manage a masjid profile.

### 3.1 — Claiming Workflow
- [x] Multi-step interactive form to claim a masjid.
- [x] Select the masjid from the Directory / Map.
- [x] Fill in personal details and requested faculty role.
- [x] Multi-file upload for PDF proof documents (NPO cert, Board letter, Utility bill, ID) to Supabase Storage bucket (`verification_documents`).
- [x] Insert claim into `home_masjid.masjid_claims`.

### 3.2 — Admin Review & Peer Validation
- [x] **Peer Validation (Community Vouching)**:
  - Verified faculty can view pending claims for nearby masjids.
  - Faculty can click "Vouch for this Claim" to increase trust score.
  - Vouch history stored in `home_masjid.masjid_claim_vouches`.
- [x] **Superadmin Dashboard**:
  - Review queue of pending claims.
  - Securely view/download PDF documents from the `verification_documents` bucket.
  - See number of peer vouches.
  - Approve or Reject claim Server Actions.
- [x] **On Approval**:
  - Add user to `home_masjid.masjid_faculty`.
  - Update `masjids.is_verified = true`. via Resend
- [x] Enable RLS on `masjid_claims` and `masjid_faculty`

### 3.2 — The Masjid Faculty Dashboard

- [x] Dashboard home — overview stats (followers, donations, upcoming programs)
- [ ] Masjid profile editor:
  - [ ] Update name, description, address, contact email
  - [ ] Upload/change profile and cover images
  - [ ] **Prayer Times Override**: Fast-access panel to adjust local iqama (congregational) times (displays alongside calculated Adhan).
- [ ] **Program & Event Manager**:
  - [x] Create / edit / delete programs (Mock UI built)
  - [ ] Set target demographic categories (Youth & Children, Women & Sisters, Families & General Public)
  - [ ] Assign guest speakers
- [ ] **Campaigns & Logistics**:
  - [ ] Post public maintenance requests and crowd-funded projects (e.g., borehole, roof repair)
  - [x] Visual progress bars using Brass accent color against target goals (Empty state built)
  - [ ] View incoming donation streams directly routed to verified bank accounts
- [ ] **Community Feed & Inbox**:
  - [x] Post composer (Rich text, publish/draft) (Mock UI built)
  - [ ] Manage public comments (hide/report disruptive comments)
  - [x] Read encrypted messages from other verified masjids (Empty state built)
- [ ] Faculty management:
  - [ ] Invite additional faculty members
  - [ ] Assign admin vs. editor roles
  - [ ] Remove faculty members

---

## Phase 4: Social Features & Community ✅

> **Goal**: User engagement — following, feeds, comments, home masjid designation.

### 4.1 — Home Masjid & Following

- [x] "Set as Home Masjid" flow:
  - [x] User selects from nearby masjids
  - [x] Updates `user_profiles.home_masjid_id`
  - [x] Auto-follow the masjid
- [x] Follow / unfollow masjid pages
- [x] User profile page showing:
  - [x] Home masjid
  - [x] Followed masjids
  - [x] Donation history

### 4.2 — Social Feed Architecture

- [x] Hybrid distribution model:
  - [x] Serverless background queue (QStash/Inngest) to process new posts and fan-out
  - [x] Push to active followers and Home Masjid users
- [x] Build personalized feed page (`/feed`):
  - [x] Reverse-chronological flow of posts from followed masjids
  - [x] Program announcements interspersed
- [x] PostCard component:
  - [x] Masjid avatar + name + verified badge
  - [x] Content + image
  - [x] Comment count + "View Comments" expand
  - [x] Post Likes (Optimistic UI)
  - [ ] Share button
- [x] Comment system:
  - [x] Add comment (authenticated users)
  - [ ] Nested replies (future)
  - [x] Faculty strict moderation tools (hide/report)
- [x] Account Privacy & GDPR:
  - [x] Unique `@username` configuration
  - [x] Public profile vs Anonymous toggle
  - [x] Public/Anonymous donation history toggle
  - [x] Full GDPR account deletion (cascading with donation retention)
- [x] Community moderation: "Report Profile" for incorrectly verified/fraudulent profiles or obscene content
- [x] Enable RLS on `followers`, `post_likes`, and `comments`

### 4.3 — Livestreaming Capabilities (External Integrations)

- [ ] Third-Party Embeds: Support for YouTube Live, Facebook Live, or Mixlr audio embeds
- [ ] Mux / Cloudflare Stream APIs: Dedicated RTMP ingest for white-labeled embedded video (pay-per-minute)

### 4.4 — Email Notifications

- [ ] Configure Resend integration
- [ ] Build email templates:
  - [ ] Automated Transactional Emails for new programs/posts
  - [ ] Claim status update → claiming user
  - [ ] Donation receipt → donor
- [ ] User notification preferences:
  - [ ] Email opt-in/out per masjid
  - [ ] Frequency controls (immediate, daily digest)
- [ ] Background job pattern for bulk email dispatch

---

## Phase 5: Donations & Payments ✅

> **Goal**: Secure, end-to-end donation flow with Paystack — from project creation in the dashboard to donor receipt emails and real-time progress bars.

### 5.1 — Database Architecture
- [x] `home_masjid.projects` table (campaigns: goal, current_amount, active status).
- [x] `home_masjid.donations` table (ledger: amount, status, user_id, project_id).
- [x] RLS: Public read for projects, authenticated read for own donations, service_role write from webhook.
- [x] `increment_project_amount(p_id, amount)` atomic RPC to prevent race conditions on concurrent donations.

### 5.2 — Paystack Integration
- [x] `lib/paystack/client.ts` — `initializeTransaction()` server helper (ZAR / kobo conversion).
- [x] `initiateDonation()` Server Action — inserts pending donation, calls Paystack, redirects to checkout.
- [x] `POST /api/webhooks/paystack` — verifies `x-paystack-signature`, marks donation `completed`, increments `current_amount`.
- [x] Replace read/update pattern in webhook with atomic `increment_project_amount` RPC.
- [x] Handle `charge.failed` and `refund` webhook events gracefully.

### 5.3 — Faculty Project Manager (Dashboard)
- [x] `/dashboard/projects` page — empty state with CTA (mock UI).
- [x] **Create Project** form — title, description, goal amount, cover image upload (Supabase Storage).
- [x] **Project List** — cards showing live `current_amount` vs `goal_amount` progress bars (Brass colour).
- [x] **Donation Ledger** — paginated table of all donations received per project.
- [x] Activate / Deactivate project toggle.

### 5.4 — Donor Experience (Public)
- [x] `DonationModal.tsx` — preset amounts (R100/250/500/1000) + custom, email field, "Secured by Paystack" badge.
- [x] Active Projects tab on Masjid Profile page with Brass progress bars.
- [x] Post-payment success page: `/masjids/[id]?donation=success` — thank-you banner & share CTA.
- [x] **Sadaqah Jariyah**: Recurring donation option (monthly subscription via Paystack Subscriptions API).
- [x] Donor receipt email via Resend (triggered from webhook handler).

---

## Phase 6: Inter-Masjid Networking ✅

> **Goal**: Masjid-to-masjid communication and collaboration tools.

- [x] Internal messaging system:
  - [x] Compose message to another verified masjid
  - [x] Inbox / sent / read status tracking
  - [x] Subject + body format
- [x] Speaker invitation workflow:
  - [x] Search verified masjids by city/country
  - [x] Send structured invitation (event details, date, topic)
  - [x] Accept / decline flow
- [x] Collaboration directory:
  - [x] Browse verified masjids globally
  - [x] Filter by country, city, programs offered
  - [x] "Connect" request similar to LinkedIn

---

## Phase 7: Advanced Features 🔲

> **Goal**: Polish, scale, and differentiate.

### 7.1 — Enhanced Discovery

- [x] Advanced search with filters (programs, youth activities, ladies facilities)
- [x] "Nearby masjids" widget using browser geolocation
- [x] Ramadan mode — iftar times, taraweeh schedules, special programs
- [x] Jumu'ah (Friday) prayer time listings with khutbah topics

### 7.2 — Mobile Experience

- [ ] Progressive Web App (PWA) support
  - [ ] Service worker for offline prayer times
  - [ ] Push notifications for program reminders
  - [ ] Add to home screen prompt
- [ ] Native app consideration (React Native / Expo — future)

### 7.3 — Analytics & Insights

- [x] Masjid dashboard analytics:
  - [x] Follower growth
  - [x] Post engagement (views, comments)
  - [x] Donation trends
  - [x] Program attendance tracking
- [x] Platform-wide metrics for admins

### 7.4 — Content Moderation

- [x] Comment flagging / reporting
- [ ] AI-assisted content moderation (Gemini API)
- [ ] Community guidelines and terms of service

### 7.5 — Internationalization

- [ ] Multi-language support (Arabic, Urdu, Malay, Turkish, French)
- [ ] RTL layout support for Arabic/Urdu
### Phase 7: Advanced Features (✅ COMPLETED)
- [x] **Jumu'ah & Ramadan Tracking**: Special scheduling for Friday prayers and Ramadan (Taraweeh times, Iftar times).
- [x] **Content Moderation**: Tools for faculty to hide inappropriate comments or report users to platform admins.
- [x] **Platform Analytics**: Basic dashboard for platform admins to track active masjids, users, and total donation volume.
- [x] **Lunar Hijri Integration**: Dynamic Hijri date calculation that adjusts at Maghrib based on geospatial location.

### Phase 8: Launch & Growth (✅ COMPLETED)
- [x] **Legal**: Privacy Policy and Terms of Service pages.
- [x] **Accessibility**: WCAG compliance audit (keyboard navigation, ARIA labels, contrast checks).
- [x] **SEO**: Dynamic sitemap generation and robust metadata for all public masjid profiles.
- [x] **Onboarding Polish**: Email verification flows and "Welcome to Home Masjid" drips.
- [x] Gather user feedback and iterate
- [ ] Monitor error rates and performance

### 8.3 — Scale

- [ ] Expand to Cape Town, Gauteng, then national
- [ ] Open directory for international submissions
- [ ] Community-driven masjid additions with moderation
- [ ] Partnership outreach to Islamic organizations

---

## Phase 9: Scalable Notification Architecture ✅

> **Goal**: Event-driven webhook fan-out for reliable, serverless-friendly communication.

### 9.1 — Supabase Database Webhooks
- [x] Configure Supabase Database Webhooks listening to `INSERT` on `home_masjid.programs` and `home_masjid.posts`.
- [x] Create Next.js API Route (`/api/webhooks/new-program`) to ingest webhook payloads.

### 9.2 — The Fan-Out Queue (QStash/Inngest)
- [x] Receive webhook payload and push to background worker queue (avoiding Vercel timeout limits).
- [x] Return immediate `200 OK` to Supabase to free up database connections.
- [x] Setup background worker (`/api/workers/notify-followers`) to:
  - [x] Retrieve exact audience (Followers + Home Masjid users).
  - [x] Filter by demographic opt-ins (Youth, Sisters, General).

### 9.3 — Omnichannel Delivery
- [x] Dispatch email batches (Resend) using dynamic HTML templates (Midnight Blue & Brass CTAs).
- [ ] Dispatch Push Notifications (Firebase Cloud Messaging - FCM) for lock-screen alerts.
- [x] Setup in-app Real-Time Toasts (via Supabase Realtime) for active users matching the home masjid criteria.

---

## Future Considerations

| Feature | Priority | Notes |
|---|---|---|
| Live streaming integration | Low | Embed YouTube/Zoom for virtual programs |
| Quran class booking | Medium | Scheduling system for online/in-person classes |
| Janazah notification system | High | Urgent community notifications for funeral prayers |
| Lost & found board | Low | Community classifieds per masjid |
| Volunteer management | Medium | Sign-up sheets for masjid programs |
| Zakat calculator | Medium | Integrated Islamic finance tool |
| Nikah services directory | Low | Connect with officiants and venues |
| Sadaqah Jariyah recurring donations | High | Subscription-based monthly contributions |

---

## Current Status

| Phase | Status | Target |
|---|---|---|
| Phase 0: Foundation | ✅ Complete | — |
| Phase 1: Scaffolding | ✅ Complete | — |
| Phase 2: Directory | ✅ Complete | — |
| Phase 3: Verification | ✅ Complete | — |
| Phase 4: Social | ✅ Complete | — |
| Phase 5: Donations | ✅ Complete | — |
| Phase 6: Networking | ✅ Complete | — |
| Phase 7: Advanced | ✅ Complete | — |
| Phase 8: Launch | ✅ Complete | — |
| Phase 9: Notifications | ✅ Complete | — |
