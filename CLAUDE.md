# CLAUDE.md — Project System Prompt

## Project: grandads-100 → Celebration Platform

This project is evolving from a single-family birthday app into a multi-tenant celebration platform. Read this entire document before doing any work. It is your source of truth.

---

## WHAT THIS PROJECT IS

A web platform where anyone can create a celebration (birthday, anniversary, reunion), build their family tree, invite family members, and collect video messages and letters. On the event day, a host can use an AI-powered playground to generate creative responses about family members using the collected data.

**The first customer is the developer themselves** — creating "Grandpa Michael's 100th Birthday" celebration for the Ademiluyi family, with 37 family members across 4 generations. But the architecture must support any number of families running their own celebrations.

---

## WHAT CHANGED (and why)

The app was originally built as a hardcoded single-family experience:
- 35 pre-seeded family tree nodes (Ademiluyi family only)
- Node-claiming registration (pick your name from a list)
- Generated passwords (word-word-123 format)
- 20 structured Q&A questions
- Voice recording with Deepgram transcription
- Answers fed to Gemini LLM for event-day playground

**The new architecture replaces this with:**
- Multi-tenant: any person creates a celebration, builds their tree, invites family
- Role-based permissions: owner, admin, member, viewer — each with different capabilities
- Invite links with embedded role/permissions instead of node-claiming
- Standard email + password registration (no generated passwords)
- Video recording (MediaRecorder API) replaces Q&A questions
- Letters (text tributes) as an alternative to video
- Duration limits on videos based on the user's role
- The LLM playground stays but is NOT connected to video data yet (future sprint)

**Code that is being removed:**
- `questions` table and all Q&A-related code
- `answers` table and all answer submission code
- `voice-recordings` storage bucket
- `src/components/questions/*` — all question/answer components
- `src/lib/stores/question-store.ts`
- Deepgram transcription integration (kept in codebase but unused)
- Pre-seeded family data (`supabase/seed.sql`)
- Node-claiming registration flow
- Password generation utility (`password-gen.ts`)

**Code that stays (possibly modified):**
- Auth system (Supabase Auth) — simplified to standard email + password
- Family tree visualization (horizontal layout, GSAP animations) — scoped to celebration_id
- LLM playground (Gemini integration) — untouched for now
- Profile image upload (rope board, camera capture, settings page)
- Design system (fonts, colors, component styling)
- Supabase client setup (browser, server, admin)

---

## TECH STACK

```
Framework:        Next.js 15 (App Router)
Language:         TypeScript (strict)
Styling:          Tailwind CSS
Database:         Supabase (Postgres + Auth + Storage + Realtime)
Animation:        GSAP + @gsap/react (NOT Framer Motion for new code)
AI:               Google Generative AI SDK (Gemini 2.0 Flash)
Email:            Resend
Package Manager:  Bun (NEVER npm, yarn, or pnpm)
Deployment:       Vercel
```

---

## PACKAGE MANAGER RULE

**Bun only.** Every install: `bun add`. Every script: `bun run`. Every lockfile: `bun.lockb`. If you see npm/yarn/pnpm commands in any documentation you're referencing, translate them to bun equivalents. Never run `npm install`, `yarn add`, or `pnpm add`.

---

## DATABASE SCHEMA (NEW)

### Tables

**`celebrations`** — The root entity. One per event.
```sql
id                UUID PK DEFAULT gen_random_uuid()
name              TEXT NOT NULL               -- "Grandpa Michael's 100th Birthday"
description       TEXT                        -- "Join us in celebrating..."
event_date        DATE                        -- 2026-03-14
owner_id          UUID FK → auth.users        -- who created it
slug              TEXT UNIQUE NOT NULL         -- "ademiluyi-100" (URL-safe)
cover_image_url   TEXT                         -- optional banner image
is_active         BOOLEAN DEFAULT TRUE
created_at        TIMESTAMPTZ DEFAULT NOW()
```

**`profiles`** — Extends auth.users with platform-level info. NOT celebration-specific.
```sql
id                UUID PK FK → auth.users ON DELETE CASCADE
full_name         TEXT NOT NULL
email             TEXT NOT NULL
avatar_url        TEXT                        -- Supabase Storage path
created_at        TIMESTAMPTZ DEFAULT NOW()
```

**`memberships`** — Links a user to a celebration with a role and permissions.
```sql
id                UUID PK DEFAULT gen_random_uuid()
user_id           UUID FK → auth.users NOT NULL
celebration_id    UUID FK → celebrations NOT NULL
tree_node_id      UUID FK → family_tree_nodes  -- their spot on the tree
role              membership_role NOT NULL       -- ENUM: owner, admin, member, viewer
video_limit_secs  INT DEFAULT 60               -- max recording duration in seconds
can_invite        BOOLEAN DEFAULT FALSE
can_add_to_tree   BOOLEAN DEFAULT FALSE
can_delete        BOOLEAN DEFAULT FALSE
invited_by        UUID FK → memberships         -- who invited this person (NULL for owner)
created_at        TIMESTAMPTZ DEFAULT NOW()

UNIQUE(user_id, celebration_id)
```

**`invitations`** — Invite links with embedded role configuration.
```sql
id                UUID PK DEFAULT gen_random_uuid()
celebration_id    UUID FK → celebrations NOT NULL
created_by        UUID FK → memberships NOT NULL  -- who generated this invite
role              membership_role NOT NULL
video_limit_secs  INT DEFAULT 60
can_invite        BOOLEAN DEFAULT FALSE
can_add_to_tree   BOOLEAN DEFAULT FALSE
can_delete        BOOLEAN DEFAULT FALSE
code              TEXT UNIQUE NOT NULL            -- short code for the URL
target_node_id    UUID FK → family_tree_nodes     -- optional: pre-assign to a tree node
is_used           BOOLEAN DEFAULT FALSE
used_by           UUID FK → auth.users            -- who redeemed it
expires_at        TIMESTAMPTZ                      -- optional expiration
created_at        TIMESTAMPTZ DEFAULT NOW()
```

**`family_tree_nodes`** — Now scoped to a celebration.
```sql
id                UUID PK DEFAULT gen_random_uuid()
celebration_id    UUID FK → celebrations NOT NULL  -- ← NEW FIELD
display_name      TEXT NOT NULL
full_name         TEXT
gender            gender_type DEFAULT 'unknown'
generation        INT NOT NULL
parent_node_id    UUID FK → family_tree_nodes
spouse_node_id    UUID FK → family_tree_nodes
branch            TEXT
is_claimed        BOOLEAN DEFAULT FALSE
claimed_by        UUID FK → auth.users
is_deceased       BOOLEAN DEFAULT FALSE
node_type         node_type DEFAULT 'biological'
created_at        TIMESTAMPTZ DEFAULT NOW()
```

**`videos`** — Recorded video messages.
```sql
id                UUID PK DEFAULT gen_random_uuid()
celebration_id    UUID FK → celebrations NOT NULL
uploader_id       UUID FK → auth.users NOT NULL
membership_id     UUID FK → memberships NOT NULL
tree_node_id      UUID FK → family_tree_nodes     -- who is this video for/about
file_path         TEXT NOT NULL                    -- Supabase Storage path
duration_secs     INT NOT NULL
file_size_bytes   BIGINT
mime_type         TEXT                             -- 'video/webm' or 'video/mp4'
thumbnail_url     TEXT                             -- optional
title             TEXT                             -- optional message title
is_visible        BOOLEAN DEFAULT TRUE             -- owner can hide content
created_at        TIMESTAMPTZ DEFAULT NOW()
```

**`letters`** — Text tributes as an alternative to video.
```sql
id                UUID PK DEFAULT gen_random_uuid()
celebration_id    UUID FK → celebrations NOT NULL
author_id         UUID FK → auth.users NOT NULL
membership_id     UUID FK → memberships NOT NULL
tree_node_id      UUID FK → family_tree_nodes     -- who is this letter to/about
title             TEXT
body              TEXT NOT NULL
is_visible        BOOLEAN DEFAULT TRUE
created_at        TIMESTAMPTZ DEFAULT NOW()
```

**`llm_sessions`** — Stays as-is for the playground. Add celebration_id later.
```sql
id                UUID PK DEFAULT gen_random_uuid()
prompt            TEXT NOT NULL
response_text     TEXT
image_url         TEXT
subjects          UUID[] DEFAULT '{}'
created_at        TIMESTAMPTZ DEFAULT NOW()
```

### Enums
```sql
CREATE TYPE gender_type AS ENUM ('male', 'female', 'unknown');
CREATE TYPE node_type AS ENUM ('biological', 'spouse');
CREATE TYPE membership_role AS ENUM ('owner', 'admin', 'member', 'viewer');
```

### Enums removed
```sql
-- DELETED: relationship_type, question_type, question_category, answer_status, input_method
```

### Storage buckets
```
KEEP:    avatars           (profile photos, public read)
KEEP:    generated-images  (LLM output, public read)
DELETE:  voice-recordings  (replaced by videos)
NEW:     videos            (video recordings, authenticated read)
NEW:     celebrations      (celebration banners/covers, public read)
```

---

## ROLE PERMISSIONS MATRIX

| Capability            | Owner | Admin | Member | Viewer |
|-----------------------|-------|-------|--------|--------|
| Video duration        | 600s  | 600s  | 300s   | 60s    |
| Can invite others     | ✅    | ✅    | ✅     | ❌     |
| Can add to tree       | ✅    | ✅    | ❌     | ❌     |
| Can delete content    | ✅    | ❌    | ❌     | ❌     |
| Can manage celebration| ✅    | ❌    | ❌     | ❌     |
| Can hide/show content | ✅    | ❌    | ❌     | ❌     |

These are DEFAULT values. The owner can customize permissions per invitation (e.g., give a specific member 7 minutes instead of 5). The `memberships` table stores the actual values per person — the role enum is a label, the booleans and integers are the real permissions.

---

## ROUTE STRUCTURE

```
PUBLIC ROUTES (no auth required):
  /                           → Platform landing page
  /login                      → Login
  /register                   → Standard registration (no invite)
  /invite/[code]              → Invite link landing → register + join celebration

AUTHENTICATED ROUTES:
  /dashboard                  → List of user's celebrations
  /create                     → Create a new celebration
  /settings                   → User settings (photo, password)

CELEBRATION-SCOPED ROUTES (require membership):
  /c/[slug]                   → Celebration home page
  /c/[slug]/tree              → Family tree (GSAP animated)
  /c/[slug]/record            → Record a video
  /c/[slug]/write             → Write a letter
  /c/[slug]/gallery           → Watch videos + read letters
  /c/[slug]/profile/[nodeId]  → Person's profile (videos + letters about them)
  /c/[slug]/manage            → Owner/admin: manage tree, invitations, moderation
  /c/[slug]/playground        → LLM playground (event day)
```

All `/c/[slug]/*` routes must verify:
1. User is authenticated
2. User has a membership for this celebration
3. User's role allows the action they're attempting

---

## AUTH FLOWS

### Flow A — Create a celebration (new user becomes owner)
```
1. User visits /create (or /register first if not logged in)
2. Signs up with email + password (standard Supabase Auth)
3. Profile created in profiles table
4. Enters celebration details (name, date, description)
5. celebrations row created, user is owner_id
6. memberships row created: role=owner, full permissions
7. Redirected to /c/[slug]/manage to build the tree and invite people
```

### Flow B — Join via invite link (most users)
```
1. User receives link: app.com/invite/abc123xyz
2. Opens link → sees celebration name, who invited them
3. If not logged in: registers with email + password
4. If already logged in: just claims the invitation
5. invitations row marked is_used=true, used_by=user.id
6. memberships row created with role + permissions from the invitation
7. If invitation has target_node_id: auto-assign to that tree node
8. If no target_node_id: user picks their node or a new one is created
9. Redirected to /c/[slug] celebration home
```

---

## DESIGN SYSTEM

### Colors (CSS variables in globals.css)
```css
--color-gold: #C4973B;
--color-gold-light: #E8D5A3;
--color-burgundy: #6B1D2A;
--color-burgundy-light: #8B3A4A;
--color-cream: #FFF8F0;
--color-ivory: #FFFDF7;
--color-text-primary: #2D1810;
--color-text-secondary: #6B5B4E;
--color-success: #2D6A4F;
--color-error: #C1292E;
```

### Typography (Google Fonts via next/font)
```
Display / Headings:  Playfair Display  (var(--font-display))
Body text:           DM Sans           (var(--font-body))
```

### Animation library
**GSAP** for all new animations. The project may still have some Framer Motion code from earlier sprints — migrate to GSAP when touching those components.

GSAP central config: `src/lib/gsap/config.ts` — all plugins registered there, all components import from there.

Key GSAP rules:
- `"use client"` on every animated component
- `useGSAP()` hook, never `useEffect()` for animations
- `contextSafe()` for event handler animations
- `scope` ref for scoped selector queries
- `overwrite: "auto"` on interaction tweens

---

## FOLDER STRUCTURE

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── invite/[code]/page.tsx
│   │
│   ├── (main)/
│   │   ├── layout.tsx                    → authenticated layout (top nav, bottom nav)
│   │   ├── dashboard/page.tsx            → list of user's celebrations
│   │   ├── create/page.tsx               → create new celebration
│   │   └── settings/page.tsx             → user settings
│   │
│   ├── c/[slug]/
│   │   ├── layout.tsx                    → celebration-scoped layout (verifies membership)
│   │   ├── page.tsx                      → celebration home
│   │   ├── tree/page.tsx                 → family tree
│   │   ├── record/page.tsx               → record video
│   │   ├── write/page.tsx                → write letter
│   │   ├── gallery/page.tsx              → view all videos + letters
│   │   ├── profile/[nodeId]/page.tsx     → person's profile
│   │   ├── manage/page.tsx               → owner/admin management
│   │   └── playground/page.tsx           → LLM playground
│   │
│   ├── api/
│   │   ├── auth/register/route.ts
│   │   ├── celebrations/route.ts         → CRUD celebrations
│   │   ├── invitations/route.ts          → generate + redeem invite codes
│   │   ├── memberships/route.ts          → manage memberships
│   │   ├── tree/route.ts                 → CRUD tree nodes
│   │   ├── videos/route.ts              → upload metadata
│   │   ├── videos/upload/route.ts        → handle video file upload
│   │   ├── letters/route.ts              → CRUD letters
│   │   ├── profile/avatar/route.ts       → avatar upload
│   │   ├── llm/generate/route.ts         → LLM text streaming
│   │   ├── llm/image/route.ts            → LLM image generation
│   │   └── playground/prefetch/route.ts  → prefetch family data
│   │
│   ├── layout.tsx                        → root layout (fonts, toaster)
│   └── page.tsx                          → platform landing
│
├── components/
│   ├── tree/                             → family tree components (GSAP animated)
│   ├── video/                            → video recording + playback
│   ├── letters/                          → letter writing + display
│   ├── gallery/                          → gallery components
│   ├── playground/                       → LLM playground components
│   ├── manage/                           → tree builder, invitation management
│   └── ui/                               → shared UI (button, input, modal, avatar, rope-board, etc.)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     → browser client
│   │   ├── server.ts                     → server client (cookies)
│   │   └── admin.ts                      → admin client (service role)
│   │
│   ├── gsap/
│   │   └── config.ts                     → central GSAP plugin registration
│   │
│   ├── gemini/
│   │   ├── client.ts                     → Gemini model setup
│   │   ├── prompts.ts                    → prompt templates + system instruction
│   │   └── context.ts                    → context builder for LLM
│   │
│   ├── email/
│   │   └── send-invite.ts               → send invitation emails (V2, future)
│   │
│   ├── stores/                           → Zustand stores
│   │   ├── auth-store.ts
│   │   └── tree-store.ts
│   │
│   └── utils/
│       ├── horizontal-tree-layout.ts     → tree position computation
│       └── avatar.ts                     → avatar URL helper
│
├── types/
│   └── index.ts                          → all TypeScript types
│
└── middleware.ts                          → auth + route protection
```

---

## SUPABASE CLIENT USAGE

**Three clients, three contexts:**

| Client | File | When to use |
|--------|------|-------------|
| Browser | `lib/supabase/client.ts` | Client components (`"use client"`) |
| Server | `lib/supabase/server.ts` | Server components, server actions |
| Admin | `lib/supabase/admin.ts` | API routes that need elevated access (bypass RLS) |

Never import the admin client in client components. Never expose the service role key to the browser.

---

## KEY CONVENTIONS

1. **Celebration scoping.** Every database query for celebration-specific data MUST filter by `celebration_id`. Never mix data across celebrations.

2. **Permission checking.** Every mutation (create, update, delete) in a celebration context must verify the user's membership and role. Read the `memberships` row, check the relevant boolean (`can_invite`, `can_add_to_tree`, `can_delete`), and reject with 403 if unauthorized.

3. **Middleware layers.** The `/c/[slug]` layout should fetch the celebration by slug and the user's membership. If no membership exists, redirect to an "Access denied" or "Request access" page. Pass celebration + membership data to child pages via context or props.

4. **Video duration enforcement.** Check duration BEFORE upload (client-side via video element metadata) AND after upload (verify file duration matches claim). The `video_limit_secs` from the user's membership is the hard cap.

5. **Invite code format.** Short, URL-safe, unique. Use `crypto.randomUUID().slice(0, 12)` or a nanoid-style generator. Codes go in URLs: `/invite/a1b2c3d4e5f6`.

6. **Slug format.** URL-safe, lowercase, hyphens only. Generated from the celebration name: "Grandpa Michael's 100th" → "grandpa-michaels-100th". Must be unique across the platform.

7. **Error handling.** All API routes return JSON with consistent shape: `{ success: true, data: ... }` or `{ error: "message" }` with appropriate HTTP status codes. Use try/catch on every route. Log errors server-side, show friendly messages client-side.

8. **Toast notifications.** Use `sonner` for all user-facing feedback. Success: green. Error: red. Info: default. Import `toast` from `sonner`.

---

## SPRINT PLAN

| Sprint | Focus | Key Deliverables |
|--------|-------|------------------|
| 0 | New schema + migration | All new tables, enums, RLS, storage. Drop old tables. Updated types. |
| 1 | Platform auth + celebrations | Landing page, signup, login, create celebration, dashboard. |
| 2 | Tree management | Owner adds/edits/removes tree nodes. Visual tree builder. |
| 3 | Invitation system | Generate invite links, register via invite, role assignment. |
| 4 | Video recording + storage | MediaRecorder, duration limits, upload, playback. |
| 5 | Letters + gallery | Write letters, gallery page with videos + letters. |
| 6 | Family tree page (GSAP) | Horizontal animated tree, scoped to celebration. |
| 7 | Profile, settings, image upload | Rope board, camera capture, settings page, header dropdown. |
| 8 | Permissions + celebration home | Enforce roles everywhere, owner moderation, celebration home page. |
| 9 | Polish + deploy + first celebration | Create Ademiluyi celebration, invite family, go live. |
| 10 | LLM playground integration | Connect video transcriptions to context builder (post-launch). |

---

## WHAT NOT TO DO

- Do NOT use Framer Motion for new animations. Use GSAP.
- Do NOT pre-seed family tree data. Trees are built by owners.
- Do NOT hardcode anything Ademiluyi-specific. Everything is celebration-scoped.
- Do NOT use generated passwords. Standard email + password registration.
- Do NOT use `useEffect()` for GSAP animations. Use `useGSAP()`.
- Do NOT import GSAP in server components. Only `"use client"` components.
- Do NOT query family_tree_nodes without filtering by celebration_id.
- Do NOT skip permission checks on mutations. Always verify membership + role.
- Do NOT use npm, yarn, or pnpm. Bun only.