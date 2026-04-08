# Copilot Instructions

A note-taking web app where authenticated users can create, edit, delete, and publicly share rich-text notes.

## Commands

```bash
bun run dev          # Development server
bun run build        # Production build
bun run lint         # ESLint
bun run format       # oxfmt formatter
bun run test         # Vitest (watch mode)
bun run test:run     # Vitest (single run)
```

**better-auth CLI** — always use `bunx --bun` (not plain `bunx`) to avoid `bun:sqlite` type errors:

```bash
bunx --bun auth@latest migrate   # Create/update auth tables
bunx --bun auth@latest generate  # Regenerate auth types
```

## Architecture

**Tech stack:** Next.js 16 App Router · Bun runtime · TypeScript · TailwindCSS v4 · TipTap v3 · better-auth · SQLite (`bun:sqlite`) · Zod v4

**Layers:**

- `lib/db.ts` — singleton Bun SQLite connection, auto-creates `notes` table on startup, exports `query<T>`, `get<T>`, `run` helpers
- `lib/auth.ts` — better-auth server instance (used in API routes and server components)
- `lib/auth-client.ts` — client-side auth (`useSession`, `signIn`, `signUp`, `signOut`)
- `lib/notes.ts` — note CRUD functions; all queries are scoped to `user_id`
- `app/api/notes/` — REST handlers for notes CRUD
- `app/api/notes/[id]/share/` — toggle public sharing
- `app/api/public-notes/[slug]/` — unauthenticated read-only access

**Pages:** `/` (landing) · `/auth` (login/register) · `/dashboard` (note list) · `/notes/[id]` (editor) · `/notes/new` (create) · `/p/[slug]` (public read-only)

## Key Conventions

**Auth in server components and API routes:**

```ts
const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/auth"); // or return 401
```

**DB field naming:** SQLite columns use `snake_case` (`user_id`, `content_json`, `is_public`, `public_slug`). The `Note` type in `lib/notes.ts` mirrors these directly (not camelCase).

**SQLite timestamps:** Stored without timezone (`datetime('now')`). When parsing dates client-side, append `"Z"` to treat as UTC: `new Date(note.updated_at + "Z")`.

**TipTap content:** Always stored as `JSON.stringify(editor.getJSON())` in `content_json`. Parse with `JSON.parse` before passing as `content` prop. Use `immediatelyRender: false` to avoid SSR hydration mismatch.

**SQL parameters:** Use named `$param` syntax with Bun SQLite: `{ $id: id, $userId: userId }`.

**Path alias:** `@/*` maps to project root (e.g., `@/lib/auth`, `@/components/note-editor`).

**Public sharing:** `POST /api/notes/:id/share` with `{ isPublic: true }` generates a `public_slug` via `crypto.randomUUID()` (or nanoid). Setting `isPublic: false` nullifies the slug.

**Formatting:** Uses `oxfmt` (not Prettier). Run `bun run format` to format.

## Environment Variables

```
BETTER_AUTH_SECRET=<32+ character secret>
DB_PATH=data/app.db   # optional, this is the default
```
