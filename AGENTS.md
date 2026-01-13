# Agent Instructions for svpb-tmpl

This document provides context and rules for AI agents working on this repository.

## Project Tech Stack

- **Frontend**: Svelte 5 (using Runes: `$state`, `$derived`, `$effect`), SvelteKit.
- **Backend**: PocketBase (Go version) with custom extensions in `pb/main.go`.
- **Styling**: Tailwind CSS 4 + DaisyUI 5.
- **Database/Auth**: PocketBase.
- **Types**: Auto-generated via `pocketbase-typegen`.
- **Analytics/Payments**: PostHog, Stripe.

## Codebase Architecture

- `src/lib/shared`: Generic UI components, utils, and PB client.
- `src/lib/apps`: App-specific logic and stores (e.g., `user` app).
- `pb/`: Go source code for PocketBase, migrations, and database data.
- `src/routes`: SvelteKit routes. SPA mode is prioritized (PocketBase serves `index.html` as fallback).

## Development Rules

1. **Svelte 5**: Always use Svelte 5 Runes. Avoid legacy Svelte 4 syntax unless strictly necessary.
2. **PocketBase Types**: When modifying the database schema via migrations or the PB admin UI, remind the user to run `pnpm gen:types`.
3. **Go Extensions**: If business logic requires high performance or secure operations (e.g., payment processing, complex DB transactions), suggest implementing it in `pb/main.go` or a sub-package in Go.
4. **Styling**: Use Tailwind 4 utility classes. Prefer DaisyUI components for common UI elements (buttons, modals, cards).
5. **State Management**: Use Svelte 5 classes for stores (see `src/lib/apps/user/user.svelte.ts`) instead of traditional Svelte stores (`writable`, `readable`).

## Key Files to Watch

- `pb/main.go`: Entry point for backend logic.
- `src/lib/shared/pb/pb.ts`: PocketBase client initialization.
- `src/lib/apps/user/user.svelte.ts`: Global user state.

## Common Tasks

- **Adding a new collection**: Create a migration in `pb/migrations/` (or use admin UI), then run `pnpm gen:types`.
- **New UI Component**: Place in `src/lib/shared/ui/` if generic, or `src/lib/apps/[app]/ui/` if specific.
- **Environment Variables**: Managed via `.env` at the root. Dynamic public envs used in SvelteKit.
