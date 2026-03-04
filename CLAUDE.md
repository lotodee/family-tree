# CLAUDE.md — The Book of the Family

## Project

A mobile-responsive web app for a family gathering. Two phases:
1. **Collection** — family joins a tree, answers fun AI questions about themselves and each other
2. **D-Day** — AI playground where the family queries the AI about each person using all collected data

See docs/ARCHITECTURE.md for full system design.
See docs/AI_PROMPTS.md for all AI prompt templates.
See docs/DATABASE.md for schema and Supabase setup.

## Stack

- Next.js 14+ (App Router) with TypeScript (strict)
- Tailwind CSS (mobile-first)
- Framer Motion for animations
- Supabase (Postgres + Storage + Realtime)
- Google Gemini via Vertex AI (all LLM operations)
- Google Imagen via Vertex AI (image generation)
- Deepgram (voice transcription)
- Deployed on Vercel

## Commands

IMPORTANT: This project uses bun, NOT npm. Never use npm.

```bash
bun install              # install deps
bun dev                  # dev server
bun run build            # production build
bun run lint             # lint
bun run typecheck        # type check
bunx vercel --prod       # deploy
```

## Code Style

- Use ES modules (import/export), never CommonJS (require)
- Destructure imports: `import { useState } from "react"`
- All components are functional with hooks, no class components
- Use `async/await`, never raw `.then()` chains
- All API routes in /app/api/ use Route Handlers (export async function GET/POST)
- All AI calls happen server-side in API routes. NEVER expose API keys to the client.
- Use Supabase client from /lib/supabase.ts (browser) or /lib/supabase-server.ts (server)

## File Conventions

- Components: PascalCase (FamilyTree.tsx)
- Hooks: camelCase with "use" prefix (useFamilyTree.ts)
- Lib/utils: camelCase (supabase.ts, gemini.ts)
- Types: /lib/types.ts for shared interfaces
- API routes: /app/api/[name]/route.ts

## Key Architecture Rules

- Session management: no auth. Store person_id in cookie after /join. Check on every page, redirect to /join if missing.
- One question at a time in /me and /talk pages. Never show a form with multiple questions.
- Voice recording uses browser MediaRecorder API, uploads webm to Supabase Storage, then transcribes via /api/transcribe.
- Supabase Realtime subscriptions for live updates on landing page and /play page.
- App phase controlled by NEXT_PUBLIC_APP_PHASE env var: "collection" or "play".

## Design Rules

- Mobile-first ALWAYS. 90% of users on phones.
- Simple English in all UI text. No jargon. A 7-year-old and a 90-year-old must both understand.
- Warm color palette: golds, deep reds/burgundy, cream, touches of green.
- Large tap targets, large text. Test on small screens.
- Celebratory but elegant — this is a 100th birthday.

## Testing

- Run `bun run typecheck` after any TypeScript changes
- Run `bun run build` before committing to catch build errors
- Test all pages on mobile viewport (375px width minimum)

## Environment Variables

See .env.example for all required variables. Key ones:
- NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GOOGLE_CLOUD_PROJECT_ID / GOOGLE_CLOUD_LOCATION
- DEEPGRAM_API_KEY
- NEXT_PUBLIC_APP_PHASE (collection | play)
