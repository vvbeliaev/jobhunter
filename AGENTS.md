# Agent Instructions for Telegram Job Parser (svpb-tmpl based)

This document provides context and rules for AI agents working on this repository, specifically tailored for the Telegram Job Parser MVP.

## Project Tech Stack

- **Frontend**: Svelte 5 (using Runes: `$state`, `$derived`, `$effect`), SvelteKit.
- **Backend**: PocketBase (Go version) extended with custom background services.
- **Telegram Protocol**: `github.com/gotd/td` (MTProto client for Go).
- **AI/LLM**: `github.com/sashabaranov/go-openai` (OpenAI compatible client).
- **Styling**: Tailwind CSS 4 + DaisyUI 5.
- **Database/Auth**: PocketBase (SQLite + Built-in Auth).
- **Types**: Auto-generated via `pocketbase-typegen`.

## Codebase Architecture

- `src/lib/shared`: Generic UI components, utils, and PB client.
- `src/lib/apps`: App-specific logic (e.g., `dashboard` for viewing vacancies).
- `pb/`: Go source code for PocketBase.
  - `pb/main.go`: Entry point, hooks initialization.
  - `pb/pkg/parser`: **(New)** Core logic for Telegram client, event listeners, and filtering.
  - `pb/pkg/llm`: **(New)** LLM client wrapper and prompt engineering logic.
  - `pb/migrations`: Database schema changes.
- `src/routes`: SvelteKit routes.
- `session.json`: Telegram session file (Generated at runtime, **must be gitignored**).

## Development Rules

1. **Svelte 5**: Always use Svelte 5 Runes. State management for the job feed should use `.svelte.ts` classes.
2. **Go Concurrency**: The Telegram client must run in a separate goroutine initiated via the `OnBeforeServe` hook in `pb/main.go`. Ensure graceful shutdown and panic recovery.
3. **Telegram Safety (Critical)**:
   - Never commit `api_id`, `api_hash`, or `session.json`. Use environment variables or local config.
   - Implement `FLOOD_WAIT` handling (handled by `gotd` but verify configuration).
   - Use `DeviceConfig` in `gotd` to mimic a legitimate Desktop client.
4. **LLM Cost Optimization**:
   - **Pre-filtering**: Before sending text to LLM, apply a strict Go-based keyword filter (whitelist/blacklist) to drop irrelevant messages.
   - **Structure**: Always request JSON output from the LLM to map directly to Go structs.
5. **PocketBase Data Ingestion**:
   - Use `app.Dao()` for high-performance writes within the Go backend.
   - Vacancies should be deduplicated (e.g., hash the text or check existing URL) before saving.
6. **Logging**: Use structured logging (`go.uber.org/zap` is preferred or PB's default logger) for the parser, as it runs in the background and has no UI feedback.

## Key Files to Watch

- `pb/main.go`: Orchestration of the PB server and the Telegram background worker.
- `pb/pkg/parser/client.go`: `gotd` configuration and auth flow.
- `pb/pkg/parser/handler.go`: Logic for `OnNewMessage` and filtering.
- `pb/pkg/llm/analyzer.go`: Prompt definitions and OpenAI calls.
- `src/lib/apps/jobs/jobs.svelte.ts`: Frontend store for real-time vacancy updates.

## Common Tasks

- **Updating the LLM Prompt**: Modify `pb/pkg/llm` to change how JSON data is extracted or to add new fields (e.g., `remote`, `grade`).
- **Adding new Channels**: Currently done via manual account joining (or `folder` logic). The parser listens to _all_ dialogs or a specific whitelist defined in Go.
- **Auth Flow**: The first run requires console interaction for the Telegram code. Agents should be aware that `session.json` persistence is required for Docker deployments (volumes).
- **New UI Component**: Create visualization for parsed data (e.g., Salary Range chart) in `src/lib/apps/jobs/ui/`.

## Environment Variables

- `TG_API_ID`: Telegram App ID.
- `TG_API_HASH`: Telegram App Hash.
- `OPENAI_API_KEY`: Key for LLM extraction.
- Standard PocketBase envs.
