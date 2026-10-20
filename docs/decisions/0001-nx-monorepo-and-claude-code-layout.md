# 0001. Nx monorepo and Claude Code layout

- **Status:** Accepted
- **Date:** 2026-10-18
- **Deciders:** Igor Kazakov (drafted by Claude Code during repository setup)
- **Related:** repository setup brief v1.0 (`birthday-tracker-setup-prompt.md`, kept outside this repo).
  The Expo Router choice below is superseded by [ADR 0002](0002-react-navigation-instead-of-expo-router.md).

## Context

GreetDay is a mobile app (Expo) with a small API (Fastify + PostgreSQL), built by one developer who
is strong in React on the web and learning backend and React Native. Most implementation work will be done with Claude Code
agents, so the repo has to make boundaries, commands and conventions machine-readable, and has to
keep agents away from anything destructive. Contracts must be shared between the app and the API.

## Options considered

### Option A: Nx monorepo, pnpm, AI layer in-repo (`.claude/`, `.mcp.json`)

- Pros: one PR can change contract + API + screen; `nx affected` keeps CI fast; module-boundary
  lint rule enforces the architecture; agents, skills, rules and MCP config are versioned with the code.
- Cons: Nx + Expo + pnpm has rough edges; more config than separate repos.

### Option B: Two repositories (mobile, api) plus a published contracts package

- Pros: simpler tooling per repo.
- Cons: contract changes need a publish and two PRs; agents lose cross-repo context; more overhead for a solo developer.

### Option C: Turborepo or plain pnpm workspaces

- Pros: lighter weight.
- Cons: no generators, no module-boundary enforcement, no first-party Expo plugin, no Nx MCP project graph for agents.

## Decision

Option A, with these specifics (deviations from the setup brief noted in **bold**):

- Nx 23, pnpm 12 (isolated installs; **no `node-linker=hoisted`**, since Expo SDK 58 + Metro work
  without it), Node 24 LTS, TypeScript 6 (TS 7 isn't supported by typescript-eslint yet).
- Libraries are non-buildable TS sources resolved with `moduleResolution: bundler`; the API is
  bundled to ESM by esbuild (workspace libs inlined, npm packages external).
- Tags `scope:{mobile,api,shared,db,ui}` + `type:{app,lib}` enforce: mobile → contracts/domain/design-tokens;
  api → contracts/domain/db; db only from api.
- **Expo SDK 58** (Nx's generator pinned SDK 56, which current Expo Go can't open), Expo Router with
  screens outside `src/app/`.
- Vitest for libs/api; Jest (jest-expo) + React Native Testing Library for mobile.
- **ESLint 9**, not 10: `eslint-plugin-react`, `jsx-a11y` and `import` don't support ESLint 10 yet.
- Drizzle ORM **0.45 stable** (1.0 is still a release candidate), `node-postgres` driver.
- Postgres 18 in Docker Compose on **port 5433** (5432 is used by another local project), with a
  test DB and a SELECT-only role created by an init script.
- AI layer: root + nested CLAUDE.md (Nx's generated agent instructions merged into the root file;
  Nx's skills copied into `.claude/skills/` instead of the Nx Claude plugin), path-scoped rules,
  7 subagents with minimum tools, 8 project skills, hooks for formatting and safety.
- MCP: Nx (`nx mcp`), GitHub remote server (PAT from shell env), Penpot local server
  (`localhost:4401`, no token), and **`crystaldba/postgres-mcp`** in restricted mode instead of the
  deprecated `@modelcontextprotocol/server-postgres`. The read-only DB role is the real boundary.

## Consequences

- Positive: one command (`nx affected -t lint typecheck test`) verifies any change locally and in CI;
  architecture violations fail lint; agents have explicit lanes and guard rails.
- Negative: two test runners; Nx/Expo upgrades need care (run `expo install --check` after any
  Expo bump); hooks and permission rules are guard rails, not a sandbox.
- Follow-ups: revisit ESLint 10 and Drizzle 1.0 once their ecosystems catch up; postgres-mcp image
  hasn't been updated since May 2025, so re-evaluate if it breaks or a maintained alternative appears.
