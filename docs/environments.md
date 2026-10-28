# Environments and secrets

GreetDay has two environments: **development** (your machine, CI) and **production** (the hosted API
and store builds). There is no staging. This page lists every variable, where its value lives in
each place, and whether it is a secret.

## Where values live

| Place               | Source of values                                                                                                                                  | Committed?                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Local               | `.env` at the repo root (copy of `.env.example`). Nx and docker compose read it.                                                                  | No (git-ignored)          |
| Local, MCP servers  | Your **shell** environment (`~/.zshrc`). `.mcp.json` does not read `.env`.                                                                        | No                        |
| CI (GitHub Actions) | `env:` in `.github/workflows/ci.yml` for throwaway values; repository secrets (Settings → Secrets and variables → Actions) for real secrets       | Values in `ci.yml` only   |
| Production API      | The hosting provider's secret store / environment settings (chosen in SP-3, filled in E9)                                                         | No                        |
| EAS builds (mobile) | `env` per build profile in `apps/mobile/eas.json` for public values; EAS environment variables on expo.dev for secrets used only during the build | Values in `eas.json` only |

## Variables

"Secret" means: anyone who sees the value can read or change data, or act as you.

### API and database

| Variable            | Used by                       | Local (`.env`)                                  | CI (`ci.yml`)                          | Production                                                        | Secret                                                   |
| ------------------- | ----------------------------- | ----------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| `DATABASE_URL`      | api, db scripts               | local dev DB                                    | service container (throwaway password) | host secret store                                                 | **Yes** in prod (contains the DB password)               |
| `TEST_DATABASE_URL` | api integration tests         | local test DB                                   | service container                      | not used                                                          | No (local only)                                          |
| `NODE_ENV`          | api                           | `development`                                   | set by the test helper (`test`)        | `production`                                                      | No                                                       |
| `HOST`              | api                           | `127.0.0.1` (`0.0.0.0` for a phone on your LAN) | not used (tests skip the server)       | `0.0.0.0` (host may require it)                                   | No                                                       |
| `PORT`              | api                           | `3000`                                          | not used (tests skip the server)       | set by the host or `3000`                                         | No                                                       |
| `LOG_LEVEL`         | api                           | `info`                                          | set by the test helper (`silent`)      | `info`                                                            | No                                                       |
| `ALLOW_REMOTE_DB`   | `db:migrate`, `db:seed` guard | never set                                       | never set                              | only for a deliberate one-off production migration, in that shell | No, but dangerous: it disables the "local DB only" guard |

The API validates its variables at startup (`apps/api/src/env.ts`) and exits with a list of the bad
ones. Add every new API variable to that schema so it keeps failing fast.

### Local Postgres (docker compose)

Only used to create the local database container and its init script (`docker/postgres/init`).
All have working defaults; none exist in CI or production.

| Variable                     | Local default             | Secret                                        |
| ---------------------------- | ------------------------- | --------------------------------------------- |
| `POSTGRES_USER`              | `greetday`                | No                                            |
| `POSTGRES_PASSWORD`          | `greetday_local`          | No (local only; never reuse it anywhere else) |
| `POSTGRES_DB`                | `greetday_dev`            | No                                            |
| `POSTGRES_PORT`              | `5433`                    | No                                            |
| `POSTGRES_TEST_DB`           | `greetday_test`           | No                                            |
| `POSTGRES_READONLY_USER`     | `greetday_readonly`       | No                                            |
| `POSTGRES_READONLY_PASSWORD` | `greetday_readonly_local` | No (local only)                               |

CI starts its own Postgres service with `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` set inline
in `ci.yml`. That database lives only for one job, so its password is not a secret.

### Mobile

| Variable              | Used by                | Local                                          | EAS `development`                  | EAS `preview`                                                     | EAS `production`                                                  | Secret    |
| --------------------- | ---------------------- | ---------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | --------- |
| `EXPO_PUBLIC_API_URL` | mobile (API client)    | `.env`: `http://localhost:3000` or your LAN IP | from your local `.env` (see below) | `eas.json`: `https://api.greetday.invalid` (placeholder until E9) | `eas.json`: `https://api.greetday.invalid` (placeholder until E9) | **Never** |
| `EXPO_PUBLIC_APP_ENV` | mobile (config helper) | `.env`: `development` (default when unset)     | `eas.json`: `development`          | `eas.json`: `preview`                                             | `eas.json`: `production`                                          | No        |

A `development` build is a custom Expo Go: it loads JavaScript from the dev server on your machine
(`pnpm nx start mobile`), so it uses your local `.env`. `preview` and `production` builds bundle the
JavaScript on EAS, so they use the `env` of their profile in `eas.json`.

`https://api.greetday.invalid` is a placeholder: the `.invalid` TLD never resolves, so a preview or
production build fails loudly instead of quietly talking to the wrong server. E9 replaces it with the
real URL in `eas.json`.

The app reads both variables in one place, `apps/mobile/src/config/env.ts`, and throws a readable
error at startup when `EXPO_PUBLIC_API_URL` is missing or not an http(s) URL, when
`EXPO_PUBLIC_APP_ENV` is not one of the three names, or when a preview/production build points at
localhost. The environment name is exported as `appEnv` so a later Settings screen can show it next
to the app version.

### Tooling

| Variable                | Used by                         | Where                                       | Secret                    |
| ----------------------- | ------------------------------- | ------------------------------------------- | ------------------------- |
| `GITHUB_PAT`            | GitHub MCP server (`.mcp.json`) | your shell (`export GITHUB_PAT=…`)          | **Yes**                   |
| `READONLY_DATABASE_URL` | Postgres MCP server             | your shell, only if you change the defaults | No (local read-only role) |
| `NX_NO_CLOUD`           | Nx in CI                        | `ci.yml`                                    | No                        |

## Public vs secret: the rule of thumb

`EXPO_PUBLIC_*` works like `VITE_*` or `NEXT_PUBLIC_*` on the web: the value is pasted into the
JavaScript bundle at build time. Anyone who installs the app can read it. So:

- `EXPO_PUBLIC_*` holds only values you would happily print on a billboard: the API URL, feature
  flags, public keys meant for clients.
- Anything that grants access (database passwords, API tokens, signing keys) stays on the server
  (the API's environment) or in a platform secret store, and the app gets at it through the API.
- The API reads its variables at runtime from the process environment, like a Next.js server
  component reading `process.env`: nothing is baked in, so you can change a value and restart.

## Rotating a secret

Rotate when a value may have leaked (pasted in chat, committed, shown in a screenshot or log) or a
person with access leaves.

1. **Create the new value first** (new database password with `ALTER ROLE … PASSWORD`, new GitHub
   token, new EAS variable), so there is no gap.
2. **Update every place it lives** from the tables above (host secret store, GitHub Actions secret,
   EAS variable, your shell).
3. **Restart or redeploy** what reads it: the API reads env at startup; EAS values only reach the
   next build.
4. **Revoke the old value** and check that things still work (`GET /health`, a CI run).

If a secret was committed to git, rotate it: deleting the commit does not help, because clones and
forks keep the history. If a secret ever lands in an `EXPO_PUBLIC_*` variable, rotate it
immediately: shipped app bundles cannot be recalled.

## Adding a variable

1. Add it to `.env.example` with a comment (never edit or commit `.env`).
2. Add a row to the right table above, with every environment filled in.
3. API variable: add it to the schema in `apps/api/src/env.ts`.
4. Needed in CI or production: add it to `ci.yml` (or as an Actions secret) and to the host's settings.
