# family-tree 🌳

A multi-tenant **family-tree platform** where members claim their place in a shared tree, build a personal profile by answering prompts (typed or spoken), and use an AI playground that generates portraits and scenes of family members from natural-language prompts grounded in those profiles.

## What it does

- **Interactive family tree** — an explorable multi-generation tree with relationships rendered from the data, including spouse links, branches, and generations.
- **Claim & profile** — members claim their node and answer a set of prompts about themselves; answers become the context the AI draws on.
- **Voice or text answers** — responses can be typed or spoken; speech is transcribed automatically.
- **AI playground** — describe a scene in natural language and generate an image of one or more family members, with prompts automatically enriched from each subject's profile context.
- **Relationship inference** — a rules engine derives relationships (siblings, aunts/uncles, cousins, in-laws) from the underlying tree structure.
- **Auth & multi-tenancy** — accounts and per-family data isolation backed by Postgres row-level security.

## Tech stack

**Front end:** TypeScript, Next.js (App Router), React, Tailwind CSS, d3-hierarchy (tree layout), Framer Motion / GSAP
**Backend / data:** Supabase (Postgres + Auth + Storage + row-level security)
**AI:** Google Gemini + Imagen (via Vertex AI) for text and image generation, with structured prompt context
**Voice:** speech-to-text transcription for spoken answers
**Email:** Resend

## Architecture

```
src/app/          Next.js routes — tree, playground, profile, auth
src/components/    Tree rendering, playground UI, shared UI
src/lib/gemini/    AI context-building + image/text generation
src/lib/utils/     Relationship-inference engine + tree layout
supabase/          Postgres schema, migrations, and demo seed data
```

The AI layer builds a per-subject context object from a member's profile answers and tree position, then passes it to the image/text model so generated results reflect who the person actually is in the tree.

## Getting started

```bash
npm install
cp .env.example .env.local   # add your Supabase + Gemini/Vertex + email keys
npm run dev
```

The `supabase/migrations` folder contains the schema and a small set of **fictional demo seed data** for local testing.

## Status

A working prototype. The tree, profiles, voice answers, relationship inference, and AI playground are functional; seed data is fictional placeholder data for demos.
