# GreetDay

Birthday tracker: an Expo mobile app with a Fastify + PostgreSQL API, in an Nx monorepo with a
Claude Code agent layer. Product docs: [docs/product](docs/product/). Architecture decisions:
[docs/decisions](docs/decisions/). Conventions for humans and agents: [CLAUDE.md](CLAUDE.md).

## Prerequisites

| Tool           | Version                       | Notes                                                                                                                     |
| -------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Node.js        | 24 LTS (`.nvmrc`)             | `nvm use`                                                                                                                 |
| pnpm           | 12 (pinned in `package.json`) | `corepack enable pnpm`                                                                                                    |
| Docker Desktop | with Compose v2               | Postgres runs in Docker                                                                                                   |
| Expo Go        | latest, on your phone         | or Xcode / Android Studio for simulators                                                                                  |
| GitHub CLI     | `gh`                          | for `/backlog-to-issues` and PRs. Install the macOS .pkg from cli.github.com (or `brew install gh`), then `gh auth login` |
| Claude Code    | latest                        | `claude` in this folder                                                                                                   |

## First-time setup

```bash
corepack enable pnpm
pnpm install
cp .env.example .env              # local defaults work as-is
docker compose up -d              # Postgres 18 on 127.0.0.1:5433 (+ test DB, read-only role)
pnpm nx run db:db:migrate         # apply migrations to the dev DB
pnpm nx run-many -t lint typecheck test   # everything should pass
```

## Daily commands

```bash
docker compose up -d                       # start Postgres
pnpm nx serve api                          # API → http://127.0.0.1:3000/health
pnpm nx start mobile                       # Expo dev server → scan the QR code with Expo Go
pnpm nx affected -t lint typecheck test    # what CI runs (also: /verify in Claude Code)
pnpm nx run db:db:generate                 # schema change → SQL migration (review it!)
pnpm nx run db:db:migrate                  # apply migrations locally
pnpm nx run db:db:studio                   # browse the DB
pnpm nx graph                              # project graph
docker compose --profile api up -d --build # optional: run the API in a container
```

On a physical phone, set `EXPO_PUBLIC_API_URL` in `.env` to your Mac's LAN IP (e.g. `http://192.168.1.20:3000`)
and start the API with `HOST=0.0.0.0`.

## Working with Claude Code

Everything lives in [`.claude/`](.claude/) and [`.mcp.json`](.mcp.json) and is committed. Personal
overrides go in `.claude/settings.local.json` (git-ignored).

**Agents** (Claude delegates automatically, or ask: "use the backend-developer agent to…"):

| Agent               | Use it to…                                                            |
| ------------------- | --------------------------------------------------------------------- |
| `business-analyst`  | turn the briefs into `docs/product/mvp-backlog.md` and refine stories |
| `product-designer`  | create/update Penpot mocks and export design tokens                   |
| `mobile-developer`  | implement `area:mobile` issues (screens, components, domain logic)    |
| `backend-developer` | implement `area:backend`/`area:db` issues, explaining what it did     |
| `code-reviewer`     | review a branch before merging (read-only)                            |
| `test-writer`       | add tests for a change or reproduce a bug (test files only)           |
| `mentor`            | explain backend/SQL/auth/infra concepts using this code               |

**Skills** (type `/name`; Claude also uses the first five on its own):

| Skill                          | What it does                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `/verify`                      | runs `nx affected -t lint typecheck test` and summarizes failures                        |
| `/api-endpoint`                | contract → route → user scoping → integration test                                       |
| `/db-migration`                | schema → generate → explain SQL → **your approval** → migrate                            |
| `/mobile-screen S-03`          | screen from a design-brief ID with all states, tokens, a11y, tests                       |
| `/adr <title>`                 | records a decision in `docs/decisions/`                                                  |
| `/sync-design-tokens`          | Penpot tokens JSON → typed RN theme (you run it)                                         |
| `/backlog-to-issues [--apply]` | backlog → GitHub labels, milestones, issues, sub-issues (dry run by default; you run it) |
| `/work-on [E3-S2 \| #n]`       | next Ready story → branch → tasks delegated to agents → review → PR (you run it)         |
| `/explain <topic or file>`     | mentor-style explanation (you run it)                                                    |

**Board flow with `/work-on`:** fill in [`.claude/github.json`](.claude/github.json) (owner, repo,
Project number) once the repo and Project exist. The main Claude session is the orchestrator and
follows [the playbook](.claude/skills/work-on/SKILL.md): one branch and one PR per story, one commit
per task, asking before every commit, push, comment, close and PR. Who moves which card:

- **You:** Backlog → Ready (pick what's next), then review and merge the PR.
- **`/work-on`:** story and task → In progress, each task → Done after its commit, story → In review
  when the PR opens; closes epics (and leftover stories) whose sub-issues are all closed, after asking.
- **GitHub:** closes the story and its tasks on merge (`Closes #n`); the Project's built-in
  workflows set Done. Keep the "Auto-close issue" workflow **off**: tasks reach Done before the merge.

**Guard rails:** `.claude/settings.json` asks before commits, pushes, `docker compose up/down`,
migrations and GitHub writes; it denies `.env` access and force pushes. Hooks format edited
files, block non-local database commands, `rm -rf` outside `tmp/`, and edits to committed migrations.

### MCP servers

Claude Code asks you to approve the four project servers on first start (`/mcp` shows their status).

| Server     | Needs                              | Setup                                                                                                                                                                                            |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `nx`       | nothing                            | runs `pnpm nx mcp`                                                                                                                                                                               |
| `github`   | `GITHUB_PAT` in your **shell** env | Fine-grained PAT for this repo only: Issues RW, Pull requests RW, Contents R, Metadata R (Projects RW if used). Add `export GITHUB_PAT=…` to `~/.zshrc`, or `export GITHUB_PAT=$(gh auth token)` |
| `penpot`   | Penpot open in a browser           | Run `npx -y @penpot/mcp@latest` in a terminal, then in Penpot: Plugins → load `http://localhost:4400/manifest.json` → "Connect to MCP server". Keep the plugin open                              |
| `postgres` | Docker + `docker compose up -d`    | Read-only role on the local dev DB; works with the defaults. Override with `READONLY_DATABASE_URL` in your shell env                                                                             |

`.mcp.json` reads variables from your shell environment, not from `.env`.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on pull requests and pushes to `main`:
pnpm install, Postgres 18 service, migrations, `nx sync:check`, then
`nx affected -t lint typecheck test`.

## Troubleshooting

- **Port 5433 in use:** set `POSTGRES_PORT` in `.env` and update the URLs there.
- **Re-run the Postgres init script** (test DB, read-only role): `docker compose down -v && docker compose up -d`.
  This **wipes local data**.
- **Metro can't resolve a package after adding a dependency:** add it inside `apps/mobile` with
  `pnpm exec expo install <pkg>`. As a last resort, try `node-linker=hoisted` in `.npmrc` (and record an ADR).
- **Expo Go says the SDK is unsupported:** run `pnpm exec expo install --check` in `apps/mobile`.
