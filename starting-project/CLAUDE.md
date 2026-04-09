# CLAUDE.md

We are building the app described in @SPEC.md file. Read that file for general architecture tasks or to double check the exact database structure, tech stack or application architecture.

Keep yous replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to
ensure that you're working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A note-taking web app where authenticated users can create, edit, delete, and publicly share rich-text notes. Built with Next.js App Router, Bun runtime, SQLite, TipTap editor, and better-auth.

## Commands

- **Dev server:** `bun run dev`
- **Build:** `bun run build`
- **Lint:** `bun run lint`
- **Start production:** `bun run start`
- **Auth migrations:** `bunx --bun auth@latest migrate`
- **Auth codegen:** `bunx --bun auth@latest generate`

> The `notes` table and indexes are auto-created by `lib/db.ts` on first import — no separate migration step needed.

Always use `bunx --bun` (not plain `bunx`) for better-auth CLI commands to avoid `bun:sqlite` type errors.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Runtime:** Bun
- **Styling:** TailwindCSS v4 (via `@tailwindcss/postcss`)
- **Rich text:** TipTap (StarterKit + Code + CodeBlock extensions)
- **Auth:** better-auth (email/password)
- **Database:** SQLite via Bun's built-in `bun:sqlite` client, raw SQL queries
- **Validation:** Zod v4

## Architecture

- **Database:** Single SQLite file at `data/app.db`. better-auth manages its own tables (`user`, `session`, `account`, `verification`). App manages the `notes` table.
- **DB access layer:** `lib/db.ts` — singleton connection, helper wrappers (`query`, `get`, `run`)
- **Note repository:** `lib/notes.ts` — CRUD functions that enforce `user_id` scoping in all queries
- **API routes:** REST endpoints under `app/api/notes/` (CRUD + `/:id/share` for toggling public access). Public note endpoint at `app/api/public-notes/:slug/`
- **Pages:** `/` (landing), `/dashboard` (note list), `/notes/[id]` (editor), `/p/[slug]` (public read-only view)
- **Auth pattern:** Server helper (`getCurrentUser()`/`getSession()`) checked in API handlers; returns 401 if unauthenticated

## Key Design Decisions

- TipTap content is stored as stringified JSON (`content_json` column), not HTML
- Public note sharing uses a random slug (`public_slug` column); toggling off nullifies the slug
- Path alias `@/*` maps to project root (configured in tsconfig)
- Fonts: Geist Sans and Geist Mono loaded via `next/font`

## Environment Variables

See `.env.example`:

- `BETTER_AUTH_SECRET` — must be 32+ characters
- `DB_PATH` — path to SQLite file (default: `data/app.db`)
