# GreetDay (Birthday Tracker)

A mobile app that reminds you of the birthdays that matter and helps you greet people on time.
Product scope and MVP: [docs/product/ba-brief.md](docs/product/ba-brief.md) (§1 summary, §2 MVP scope,
§4 tech context, §10 developer profile). Design tokens and screen IDs:
[docs/product/design-brief.md](docs/product/design-brief.md). Backlog: [docs/product/mvp-backlog.md](docs/product/mvp-backlog.md).
Do not copy product specs into code comments or CLAUDE.md files; link to them.

**The developer is a React web developer learning backend (Node, SQL, infra) and React Native.**
Explain new ideas by analogy to React on the web (Vite, Next.js, React Router, CSS, context, RTL), never
to native iOS/Android concepts. Whenever you change anything in `apps/api`, `libs/db`, `docker/`, CI,
or React Native/Expo-specific parts of `apps/mobile`, finish with a short plain-language "what I did
and why" and point at the concepts involved. Offer `/explain <topic>` for deeper dives.

## Repo map

| Path                 | What                                                     | Nx project      | Tags                       |
| -------------------- | -------------------------------------------------------- | --------------- | -------------------------- |
| `apps/mobile`        | Expo SDK 58 + React Navigation app                       | `mobile`        | `scope:mobile`, `type:app` |
| `apps/api`           | Fastify 5 API                                            | `api`           | `scope:api`, `type:app`    |
| `libs/contracts`     | Zod schemas + inferred types shared by api and mobile    | `contracts`     | `scope:shared`             |
| `libs/domain`        | Pure business logic (dates, age, Feb 29, greeted window) | `domain`        | `scope:shared`             |
| `libs/db`            | Drizzle schema, migrations, seed, DB client              | `db`            | `scope:db`                 |
| `libs/design-tokens` | Penpot tokens JSON → generated RN theme                  | `design-tokens` | `scope:ui`                 |
| `docs/decisions/`    | ADRs (`NNNN-title.md`), written with `/adr`              |                 |                            |
| `docs/learning/`     | Notes from the `mentor` agent                            |                 |                            |
| `tools/scripts/`     | Repo scripts (token sync, EAS hook)                      |                 |                            |
| `docker/`            | API Dockerfile, Postgres init scripts                    |                 |                            |
| `.claude/`           | Agents, skills, rules, settings, hooks                   |                 |                            |

Each app/lib with its own rules has a nested `CLAUDE.md` (mobile, api, db).

## Boundaries (enforced by `@nx/enforce-module-boundaries` in `eslint.config.mjs`)

- `mobile` → `contracts`, `domain`, `design-tokens`. **Never `db`.**
- `api` → `contracts`, `domain`, `db`.
- `contracts` and `domain` import only each other: no I/O, no framework or app code.
- `db` is imported only by `api`. `design-tokens` imports nothing from the workspace.
- A boundary lint error means the design is wrong; do not silence the rule.

## Commands

Always run tasks through Nx with the workspace's pnpm: `pnpm nx …`, never the underlying tool directly.

```bash
pnpm install                                  # install (pnpm 12, Node 24 from .nvmrc)
docker compose up -d                          # Postgres 18 on 127.0.0.1:5433 (dev + test DBs)
pnpm nx run db:db:migrate                     # apply migrations to the dev DB
pnpm nx serve api                             # API on http://127.0.0.1:3000 (GET /health)
pnpm nx start mobile                          # Expo dev server (scan QR with Expo Go)
pnpm nx affected -t lint typecheck test       # what CI runs; run before finishing any task
pnpm nx run-many -t lint typecheck test       # everything
pnpm nx run db:db:generate                    # schema → new SQL migration
pnpm nx run db:db:studio                      # Drizzle Studio
pnpm nx graph                                 # project graph
```

**Before you say a task is done, run `pnpm nx affected -t lint typecheck test`** (or `/verify`) and report the result.

## Environment

- `.env` at the repo root (copy `.env.example`). Nx loads it for every task; docker compose reads it too.
- Per-environment values and which variables are secret: [docs/environments.md](docs/environments.md).
- Never read, print or edit `.env` files. Add new variables to `.env.example` with a comment instead.
- Integration tests use `TEST_DATABASE_URL` (local test DB, migrated automatically by the test setup).

## Gotchas

- **pnpm 12** blocks dependency build scripts; trusted ones are listed under `allowBuilds` in
  `pnpm-workspace.yaml`. Expo works with pnpm's default isolated layout (no `node-linker=hoisted`
  needed). If Metro or autolinking breaks after a dependency change, try hoisting before anything
  else and record it in an ADR.
- **Mobile deps** go in `apps/mobile/package.json` via `pnpm exec expo install <pkg>` (run inside
  `apps/mobile`) so versions match the Expo SDK. Never add React Native packages at the root.
- **API runtime deps**: the API is bundled with workspace libs inlined but npm packages external,
  so any npm package a lib uses at runtime (e.g. `pg`, `drizzle-orm`) must also be in `apps/api/package.json`.
- **ESLint is pinned to v9**: `eslint-plugin-react`, `jsx-a11y` and `import` don't support v10 yet.
- **TypeScript project references** are maintained by Nx (`nx sync`, auto-applied). CI runs `nx sync:check`.
- Local Postgres runs on **5433** so it doesn't clash with other projects' Postgres on 5432.
- Libraries are not buildable; consumers compile their TS sources (`moduleResolution: bundler`).

## Conventions

- **Branches:** `feat/<issue-number>-short-slug`, `fix/…`, `chore/…`. One issue per branch.
- **Commits:** Conventional Commits (`feat(api): …`, `fix(mobile): …`, `chore: …`, `docs: …`, `ci: …`),
  scope = Nx project name. Reference the issue (`Closes #12`) in the PR, not every commit.
- **Contracts first:** any API shape change starts in `libs/contracts`, then api, then mobile.
- **Tests:** Vitest for libs and api, Jest (jest-expo) + React Native Testing Library for mobile.
  See `.claude/rules/testing.md`.
- **Decisions:** record spike results and non-obvious choices with `/adr` in `docs/decisions/`.
  Read existing ADRs before proposing a change that contradicts one.
- Ask before adding a dependency; prefer what is already in the workspace.

## AI layer

- Agents in `.claude/agents/`: `business-analyst`, `product-designer`, `mobile-developer`,
  `backend-developer`, `code-reviewer`, `test-writer`, `mentor`. Stay in your lane and hand off.
- Skills in `.claude/skills/`: `verify`, `api-endpoint`, `db-migration`, `mobile-screen`,
  `sync-design-tokens`, `backlog-to-issues`, `work-on`, `adr`, `explain`, plus Nx's `nx-workspace`,
  `nx-generate`, `nx-run-tasks`, `nx-plugins`, `link-workspace-packages`.
- The main session is the orchestrator; `/work-on` is its playbook for taking a story from the GitHub
  Project board to a PR (one branch and PR per story, one commit per task, cards moved as it goes).
  Repo and Project ids live in `.claude/github.json`.
- MCP servers in `.mcp.json`: `nx`, `github`, `penpot`, `postgres` (read-only role, local dev DB only).

## Working with Nx (merged from `nx configure-ai-agents`)

- To explore projects, targets and dependencies, use the `nx-workspace` skill or the Nx MCP tools.
- For scaffolding (new apps/libs/generators), use the `nx-generate` skill first and always pass
  `--no-interactive`. Add tags to every new project and update the boundary rules if needed.
- For plugin specifics, check `node_modules/@nx/<plugin>/PLUGIN.md` when it exists.
- Never guess CLI flags: check `pnpm nx <cmd> --help` or the Nx docs (MCP `nx_docs`).
