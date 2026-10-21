# GreetDay MVP backlog

Written by the `business-analyst` agent on 2026-10-20 from [ba-brief.md](ba-brief.md) and
[design-brief.md](design-brief.md), in the format of ba-brief §8–§9. Updated the same day after the
product owner's review: every open question of the first version was answered (see "Resolved
decisions" at the end), design moved first (milestone **M0 Design**, epic E10) and the public store
release was added (milestone **M5 Public release**, epic E11). Each `### [ID] Title` section becomes
one GitHub issue via `/backlog-to-issues` (parser rules: `.claude/skills/backlog-to-issues/format.md`).
Everything else in this file is ignored by the script.

Conventions used in this file:

- References like "design-brief F4 / S-06" point at the design brief feature section and screen;
  "D5" points at ba-brief §3 (D13–D25 are the product owner's answers of 2026-10-20); "§6 Security"
  points at ba-brief §6; "resolved Q14" points at the "Resolved decisions" table below.
- `area:shared` covers `libs/contracts` and `libs/domain`; `area:backend` is `apps/api` only. Every
  task still has exactly one `area:` label, so a change that touches contracts and the API is two tasks.
- **Design first:** no development work starts before the design handoff (E10-S11). Every M1–M5 issue
  that has no other blocker lists `E10-S11` under `Blocked by`; everything else reaches it through a chain.
- IDs from the first version are unchanged. E9-S7 and E9-S7-T1 (store listing) were removed and moved
  to E11-S1; new issues got new IDs.
- Backend and db details are **Proposed**: the developer agents finalize tables, columns and endpoints.
- Cross-layer stories are split contracts → db → api → mobile, with `Blocked by` between tasks.
- Sizes: XS ≤ 2 h, S ≤ ½ day, M ≤ 1 day, L ≤ 2 days (§8). Story size is the sum of its tasks; when
  that is above L the story shows `—` with the total in a comment.

## Already in place

Verified in the repo on 2026-10-20 (root `CLAUDE.md`, `apps/`, `libs/`, `.github/workflows/`,
`docker/`, `tools/scripts/`). No issues are written for these; the traceability check points here as "AIP".

| #      | What exists                                                                                                             | Where                                                        |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| AIP-1  | Nx monorepo, pnpm, TypeScript project references, ESLint + Prettier, module-boundary rules                              | root, `eslint.config.mjs`, ADR 0001                          |
| AIP-2  | CI: lint, typecheck, test (`nx affected`) and `nx sync:check` on every pull request, with Postgres                      | `.github/workflows/ci.yml`                                   |
| AIP-3  | Docker Compose Postgres 18 (dev + test DB + read-only role), optional API container profile                             | `docker-compose.yml`, `docker/`                              |
| AIP-4  | Drizzle setup, migration pipeline (`db:generate`, `db:migrate`), local-only guard, seed stub                            | `libs/db`                                                    |
| AIP-5  | Fastify API: `GET /health`, Zod env validation, `ErrorResponse` error handler, DB plugin, integration-test helpers      | `apps/api`, `libs/contracts/src/error.ts`                    |
| AIP-6  | Structured JSON logging (pino via Fastify) with `authorization`/`cookie` redaction                                      | `apps/api/src/app.ts`                                        |
| AIP-7  | Expo SDK 58 app with React Navigation 7 root stack and one placeholder screen                                           | `apps/mobile`, ADR 0002                                      |
| AIP-8  | Design-token sync: Penpot DTCG JSON → RN theme, `ThemeProvider` / `useTheme()` (tokens.json is still a **placeholder**) | `tools/scripts/sync-design-tokens.mjs`, `libs/design-tokens` |
| AIP-9  | Mobile API client (`apiGet` + contract validation, `ApiError`), `EXPO_PUBLIC_API_URL`                                   | `apps/mobile/src/api/client.ts`                              |
| AIP-10 | `eas.json` with development / preview / production profiles, EAS post-install hook, app scheme `greetday`               | `apps/mobile/eas.json`, `apps/mobile/app.json`               |

Still missing (covered by E0 issues below): environment and secrets conventions for prod, a shared
error-code catalogue and full API client, offline caching, development builds for native modules,
and error tracking. Hosting, production DB and release builds are in E9; the 5-tab shell is in E1.

## 1. Summary

Ordered by milestone: M0 design first, then the spikes and E0–E9 as in the first version, then E11.
Story sizes above L show the total in days.

| ID         | Type  | Title                                                         | Parent  | Milestone | Priority | Size   | Area                           |
| ---------- | ----- | ------------------------------------------------------------- | ------- | --------- | -------- | ------ | ------------------------------ |
| E10        | epic  | Design                                                        | —       | M0        | p0       | —      | design                         |
| E10-S1     | story | Design tokens in Penpot                                       | E10     | M0        | p0       | 3 d    | design                         |
| E10-S1-T1  | task  | Token sets, themes and core scales                            | E10-S1  | M0        | p0       | S      | design                         |
| E10-S1-T2  | task  | Semantic color and avatar color tokens                        | E10-S1  | M0        | p0       | M      | design                         |
| E10-S1-T3  | task  | Typography and elevation tokens                               | E10-S1  | M0        | p0       | S      | design                         |
| E10-S1-T4  | task  | Tokens page                                                   | E10-S1  | M0        | p0       | S      | design                         |
| E10-S1-T5  | task  | Export the tokens JSON for engineering                        | E10-S1  | M0        | p0       | S      | design                         |
| E10-S2     | story | Shared component library                                      | E10     | M0        | p0       | 4.5 d  | design                         |
| E10-S2-T1  | task  | Icons, font and buttons                                       | E10-S2  | M0        | p0       | M      | design                         |
| E10-S2-T2  | task  | Avatar, badge, list rows and section header                   | E10-S2  | M0        | p0       | M      | design                         |
| E10-S2-T3  | task  | Form components                                               | E10-S2  | M0        | p0       | M      | design                         |
| E10-S2-T4  | task  | Feedback and overlay components                               | E10-S2  | M0        | p0       | M      | design                         |
| E10-S2-T5  | task  | Tab bar, headers and library publish                          | E10-S2  | M0        | p0       | S      | design                         |
| E10-S3     | story | Sign In and first-run designs (F1)                            | E10     | M0        | p0       | L      | design                         |
| E10-S3-T1  | task  | S-01 Sign In boards                                           | E10-S3  | M0        | p0       | M      | design                         |
| E10-S3-T2  | task  | S-02 Notification priming board                               | E10-S3  | M0        | p0       | S      | design                         |
| E10-S4     | story | Upcoming and Calendar designs (F2, F3)                        | E10     | M0        | p0       | L      | design                         |
| E10-S4-T1  | task  | S-03 Upcoming boards                                          | E10-S4  | M0        | p0       | M      | design                         |
| E10-S4-T2  | task  | S-04 Calendar boards                                          | E10-S4  | M0        | p0       | M      | design                         |
| E10-S5     | story | Friends designs (F4)                                          | E10     | M0        | p0       | 3 d    | design                         |
| E10-S5-T1  | task  | S-05 Friends list boards                                      | E10-S5  | M0        | p0       | M      | design                         |
| E10-S5-T2  | task  | S-06 Add / Edit Friend boards                                 | E10-S5  | M0        | p0       | M      | design                         |
| E10-S5-T3  | task  | S-07 Friend Profile boards                                    | E10-S5  | M0        | p0       | M      | design                         |
| E10-S6     | story | Compose and Telegram designs (F5)                             | E10     | M0        | p0       | L      | design                         |
| E10-S6-T1  | task  | S-08 Compose boards                                           | E10-S6  | M0        | p0       | M      | design                         |
| E10-S6-T2  | task  | S-09 sheet, toasts and the save-failed state                  | E10-S6  | M0        | p0       | S      | design                         |
| E10-S7     | story | History designs (F6)                                          | E10     | M0        | p0       | L      | design                         |
| E10-S7-T1  | task  | S-10 History boards                                           | E10-S7  | M0        | p0       | M      | design                         |
| E10-S7-T2  | task  | S-11 Greeting Detail and S-12 Friend's greetings boards       | E10-S7  | M0        | p0       | S      | design                         |
| E10-S8     | story | Settings, reminders and notification designs (F7, F8)         | E10     | M0        | p0       | L      | design                         |
| E10-S8-T1  | task  | S-13 Settings boards                                          | E10-S8  | M0        | p0       | M      | design                         |
| E10-S8-T2  | task  | S-14 Reminder Settings boards                                 | E10-S8  | M0        | p0       | S      | design                         |
| E10-S8-T3  | task  | S-15 notification examples                                    | E10-S8  | M0        | p0       | S      | design                         |
| E10-S9     | story | Offline states                                                | E10     | M0        | p0       | L      | design                         |
| E10-S9-T1  | task  | Offline pattern                                               | E10-S9  | M0        | p0       | S      | design                         |
| E10-S9-T2  | task  | Offline boards                                                | E10-S9  | M0        | p0       | M      | design                         |
| E10-S10    | story | App icon and splash artwork                                   | E10     | M0        | p0       | L      | design                         |
| E10-S10-T1 | task  | App icon                                                      | E10-S10 | M0        | p0       | M      | design                         |
| E10-S10-T2 | task  | Splash screen                                                 | E10-S10 | M0        | p0       | S      | design                         |
| E10-S11    | story | Prototype flows, small-screen check and handoff               | E10     | M0        | p0       | L      | design                         |
| E10-S11-T1 | task  | Six prototype flows                                           | E10-S11 | M0        | p0       | M      | design                         |
| E10-S11-T2 | task  | Small-screen check at 375 × 667                               | E10-S11 | M0        | p0       | S      | design                         |
| E10-S11-T3 | task  | Handoff link and review                                       | E10-S11 | M0        | p0       | S      | design                         |
| SP-1       | spike | Telegram deep link to a specific chat with pre-filled text    | E5      | M2        | p0       | S      | mobile                         |
| SP-2       | spike | Reminder delivery: server push vs local notifications         | E7      | M2        | p0       | M      | backend, mobile                |
| SP-3       | spike | Hosting: VPS with Docker Compose vs PaaS                      | E9      | M4        | p0       | M      | infra                          |
| SP-4       | spike | Data model and migrations for the MVP entities                | —       | M1        | p0       | M      | db                             |
| SP-5       | spike | Token strategy: lifetimes, rotation, device storage, revoke   | E2      | M1        | p0       | M      | backend, mobile                |
| E0         | epic  | Foundations                                                   | —       | M1        | p0       | —      | infra, shared, backend, mobile |
| E0-S1      | story | Separate dev and prod environments with safe secrets          | E0      | M1        | p0       | M      | infra, mobile                  |
| E0-S1-T1   | task  | Document environments and secrets handling                    | E0-S1   | M1        | p0       | S      | infra                          |
| E0-S1-T2   | task  | API base URL per EAS build profile                            | E0-S1   | M1        | p0       | S      | mobile                         |
| E0-S2      | story | Shared error-handling conventions for API and app             | E0      | M1        | p0       | L      | shared, backend, mobile        |
| E0-S2-T1   | task  | Error code catalogue in contracts                             | E0-S2   | M1        | p0       | S      | shared                         |
| E0-S2-T2   | task  | API client: all methods, network errors, user-facing messages | E0-S2   | M1        | p0       | S      | mobile                         |
| E0-S2-T3   | task  | Use the error codes in the API error handler                  | E0-S2   | M1        | p0       | XS     | backend                        |
| E0-S3      | story | Last loaded data stays visible offline                        | E0      | M1        | p1       | L      | mobile                         |
| E0-S3-T1   | task  | Server-state cache for API reads                              | E0-S3   | M1        | p1       | S      | mobile                         |
| E0-S3-T2   | task  | Persist the cache and detect offline                          | E0-S3   | M1        | p1       | S      | mobile                         |
| E0-S3-T3   | task  | Offline pattern in the app                                    | E0-S3   | M1        | p1       | S      | mobile                         |
| E0-S4      | story | Development builds for native modules                         | E0      | M1        | p0       | M      | infra                          |
| E0-S4-T1   | task  | Set up expo-dev-client and EAS development builds             | E0-S4   | M1        | p0       | M      | infra                          |
| E0-S5      | story | Error tracking on the API and the app                         | E0      | M3        | p1       | L      | infra, backend, mobile         |
| E0-S5-T1   | task  | Choose the error-tracking tool                                | E0-S5   | M3        | p1       | S      | infra                          |
| E0-S5-T2   | task  | Report API errors to error tracking                           | E0-S5   | M3        | p1       | S      | backend                        |
| E0-S5-T3   | task  | Report app crashes and errors to error tracking               | E0-S5   | M3        | p1       | M      | mobile                         |
| E1         | epic  | Design system                                                 | —       | M1        | p0       | —      | design, mobile                 |
| E1-S1      | story | App theme generated from the Penpot tokens                    | E1      | M1        | p0       | L      | design, mobile                 |
| E1-S1-T1   | task  | Import the Penpot tokens export                               | E1-S1   | M1        | p0       | S      | design                         |
| E1-S1-T2   | task  | Sync typography and elevation tokens                          | E1-S1   | M1        | p0       | M      | design                         |
| E1-S1-T3   | task  | Text styles and font loading                                  | E1-S1   | M1        | p0       | S      | mobile                         |
| E1-S2      | story | Navigation shell with five tabs                               | E1      | M1        | p0       | L      | mobile                         |
| E1-S2-T1   | task  | Bottom tab navigator with placeholder screens                 | E1-S2   | M1        | p0       | M      | mobile                         |
| E1-S2-T2   | task  | Stack screens and the global "+" add-friend action            | E1-S2   | M1        | p0       | S      | mobile                         |
| E1-S3      | story | Core components for the first-run screens                     | E1      | M1        | p0       | M      | mobile                         |
| E1-S3-T1   | task  | Button component                                              | E1-S3   | M1        | p0       | S      | mobile                         |
| E1-S3-T2   | task  | Empty state block and section header                          | E1-S3   | M1        | p0       | S      | mobile                         |
| E1-S4      | story | Components for lists, forms and feedback                      | E1      | M2        | p0       | 4 d    | mobile                         |
| E1-S4-T1   | task  | Avatar and badge                                              | E1-S4   | M2        | p0       | S      | mobile                         |
| E1-S4-T2   | task  | Birthday row                                                  | E1-S4   | M2        | p0       | S      | mobile                         |
| E1-S4-T3   | task  | Text field and multiline text area                            | E1-S4   | M2        | p0       | M      | mobile                         |
| E1-S4-T4   | task  | Chip, segmented control and toggle row                        | E1-S4   | M2        | p0       | M      | mobile                         |
| E1-S4-T5   | task  | Toast and confirmation dialog                                 | E1-S4   | M2        | p0       | S      | mobile                         |
| E1-S4-T6   | task  | Bottom sheet                                                  | E1-S4   | M2        | p0       | S      | mobile                         |
| E2         | epic  | Authentication                                                | —       | M1        | p0       | —      | mobile, shared, backend, db    |
| E2-S1      | story | Account created on first sign-in                              | E2      | M1        | p0       | 3.5 d  | shared, backend, db            |
| E2-S1-T1   | task  | Users and auth identities tables                              | E2-S1   | M1        | p0       | S      | db                             |
| E2-S1-T2   | task  | Auth contracts                                                | E2-S1   | M1        | p0       | XS     | shared                         |
| E2-S1-T3   | task  | Verify Google ID tokens                                       | E2-S1   | M1        | p0       | S      | backend                        |
| E2-S1-T4   | task  | Verify Apple ID tokens                                        | E2-S1   | M1        | p0       | S      | backend                        |
| E2-S1-T5   | task  | Sign-in endpoint: find or create the user                     | E2-S1   | M1        | p0       | M      | backend                        |
| E2-S1-T6   | task  | Rate limiting, CORS and security headers                      | E2-S1   | M1        | p0       | S      | backend                        |
| E2-S2      | story | Stay signed in: refresh and sign out on the server            | E2      | M1        | p0       | 2.5 d  | backend, db                    |
| E2-S2-T1   | task  | Refresh sessions table                                        | E2-S2   | M1        | p0       | S      | db                             |
| E2-S2-T2   | task  | Auth plugin and GET /me                                       | E2-S2   | M1        | p0       | S      | backend                        |
| E2-S2-T3   | task  | Refresh endpoint with token rotation                          | E2-S2   | M1        | p0       | M      | backend                        |
| E2-S2-T4   | task  | Sign-out endpoint                                             | E2-S2   | M1        | p0       | XS     | backend                        |
| E2-S3      | story | Sign in with Apple or Google                                  | E2      | M1        | p0       | 4 d    | mobile                         |
| E2-S3-T1   | task  | Secure token storage and auth state                           | E2-S3   | M1        | p0       | S      | mobile                         |
| E2-S3-T2   | task  | Attach the access token and refresh on 401                    | E2-S3   | M1        | p0       | S      | mobile                         |
| E2-S3-T3   | task  | Sign In screen S-01                                           | E2-S3   | M1        | p0       | S      | mobile                         |
| E2-S3-T4   | task  | Google sign-in flow                                           | E2-S3   | M1        | p0       | M      | mobile                         |
| E2-S3-T5   | task  | Apple sign-in flow                                            | E2-S3   | M1        | p0       | M      | mobile                         |
| E2-S3-T6   | task  | Signed-in and signed-out navigation                           | E2-S3   | M1        | p0       | S      | mobile                         |
| E2-S4      | story | Notification permission priming on first run                  | E2      | M1        | p1       | S      | mobile                         |
| E2-S4-T1   | task  | Priming screen S-02                                           | E2-S4   | M1        | p1       | S      | mobile                         |
| E3         | epic  | Friends                                                       | —       | M2        | p0       | —      | mobile, shared, backend, db    |
| E3-S1      | story | Friends saved to my account                                   | E3      | M2        | p0       | 3.5 d  | shared, backend, db            |
| E3-S1-T1   | task  | Birthday, Telegram contact and duplicate rules in domain      | E3-S1   | M2        | p0       | S      | shared                         |
| E3-S1-T2   | task  | Friend contracts                                              | E3-S1   | M2        | p0       | S      | shared                         |
| E3-S1-T3   | task  | Friends table                                                 | E3-S1   | M2        | p0       | S      | db                             |
| E3-S1-T4   | task  | List and read friends endpoints                               | E3-S1   | M2        | p0       | S      | backend                        |
| E3-S1-T5   | task  | Create friend endpoint                                        | E3-S1   | M2        | p0       | S      | backend                        |
| E3-S1-T6   | task  | Update and delete friend endpoints                            | E3-S1   | M2        | p0       | S      | backend                        |
| E3-S1-T7   | task  | Seed sample friends                                           | E3-S1   | M2        | p1       | S      | db                             |
| E3-S2      | story | Friends list with search                                      | E3      | M2        | p0       | L      | mobile                         |
| E3-S2-T1   | task  | Friends list screen with A–Z sections and search              | E3-S2   | M2        | p0       | M      | mobile                         |
| E3-S2-T2   | task  | Swipe to delete a friend                                      | E3-S2   | M2        | p0       | S      | mobile                         |
| E3-S3      | story | Add a friend                                                  | E3      | M2        | p0       | 2.5 d  | mobile                         |
| E3-S3-T1   | task  | Basics section and Save                                       | E3-S3   | M2        | p0       | M      | mobile                         |
| E3-S3-T2   | task  | About section                                                 | E3-S3   | M2        | p0       | S      | mobile                         |
| E3-S3-T3   | task  | Telegram section                                              | E3-S3   | M2        | p0       | S      | mobile                         |
| E3-S3-T4   | task  | Duplicate warning and discard dialog                          | E3-S3   | M2        | p0       | S      | mobile                         |
| E3-S4      | story | Edit and delete a friend                                      | E3      | M2        | p0       | M      | mobile                         |
| E3-S4-T1   | task  | Edit mode                                                     | E3-S4   | M2        | p0       | S      | mobile                         |
| E3-S4-T2   | task  | Delete friend from the form                                   | E3-S4   | M2        | p0       | S      | mobile                         |
| E3-S5      | story | Friend profile                                                | E3      | M2        | p0       | M      | mobile                         |
| E3-S5-T1   | task  | Profile header and Write greeting action                      | E3-S5   | M2        | p0       | S      | mobile                         |
| E3-S5-T2   | task  | About and Telegram sections                                   | E3-S5   | M2        | p0       | S      | mobile                         |
| E4         | epic  | Upcoming & Calendar                                           | —       | M2        | p0       | —      | mobile, shared                 |
| E4-S1      | story | Birthday date rules                                           | E4      | M2        | p0       | L      | shared                         |
| E4-S1-T1   | task  | Next birthday date with Feb 29                                | E4-S1   | M2        | p0       | S      | shared                         |
| E4-S1-T2   | task  | Age at the next birthday                                      | E4-S1   | M2        | p0       | XS     | shared                         |
| E4-S1-T3   | task  | Greeted window                                                | E4-S1   | M2        | p0       | S      | shared                         |
| E4-S1-T4   | task  | Upcoming sections and relative labels                         | E4-S1   | M2        | p0       | S      | shared                         |
| E4-S1-T5   | task  | Birthdays per day for a calendar month                        | E4-S1   | M2        | p0       | XS     | shared                         |
| E4-S2      | story | Upcoming list                                                 | E4      | M2        | p0       | L      | mobile                         |
| E4-S2-T1   | task  | Upcoming sections and rows                                    | E4-S2   | M2        | p0       | M      | mobile                         |
| E4-S2-T2   | task  | Loading, empty, error and refresh states                      | E4-S2   | M2        | p0       | S      | mobile                         |
| E4-S2-T3   | task  | Today block                                                   | E4-S2   | M2        | p0       | S      | mobile                         |
| E4-S3      | story | See who I already greeted                                     | E4      | M2        | p0       | S      | mobile                         |
| E4-S3-T1   | task  | Greeted badge and "Write another"                             | E4-S3   | M2        | p0       | S      | mobile                         |
| E4-S4      | story | Calendar month view                                           | E4      | M2        | p1       | L      | mobile                         |
| E4-S4-T1   | task  | Month grid with birthday markers                              | E4-S4   | M2        | p1       | M      | mobile                         |
| E4-S4-T2   | task  | Month navigation and Today                                    | E4-S4   | M2        | p1       | S      | mobile                         |
| E4-S4-T3   | task  | Selected day list and empty states                            | E4-S4   | M2        | p1       | S      | mobile                         |
| E5         | epic  | Compose & Telegram                                            | —       | M2        | p0       | —      | mobile, shared, backend, db    |
| E5-S1      | story | Greetings saved on the server                                 | E5      | M2        | p0       | 2.5 d  | shared, backend, db            |
| E5-S1-T1   | task  | Greeting contracts                                            | E5-S1   | M2        | p0       | XS     | shared                         |
| E5-S1-T2   | task  | Greetings table                                               | E5-S1   | M2        | p0       | S      | db                             |
| E5-S1-T3   | task  | Save greeting endpoint                                        | E5-S1   | M2        | p0       | S      | backend                        |
| E5-S1-T4   | task  | List a friend's greetings endpoint                            | E5-S1   | M2        | p0       | S      | backend                        |
| E5-S1-T5   | task  | Last greeted date in the friends list                         | E5-S1   | M2        | p0       | S      | backend                        |
| E5-S2      | story | Compose a greeting with the friend's context                  | E5      | M2        | p0       | L      | mobile                         |
| E5-S2-T1   | task  | Compose screen with recipient strip and text area             | E5-S2   | M2        | p0       | M      | mobile                         |
| E5-S2-T2   | task  | Context panel with the last greeting                          | E5-S2   | M2        | p0       | S      | mobile                         |
| E5-S2-T3   | task  | Cancel and "Discard greeting?"                                | E5-S2   | M2        | p0       | XS     | mobile                         |
| E5-S2-T4   | task  | Open Compose from the Today card and Friend Profile           | E5-S2   | M2        | p0       | XS     | mobile                         |
| E5-S3      | story | Hand off the greeting to Telegram                             | E5      | M2        | p0       | 3 d    | mobile                         |
| E5-S3-T1   | task  | Telegram link builder                                         | E5-S3   | M2        | p0       | S      | mobile                         |
| E5-S3-T2   | task  | Telegram button saves, then opens Telegram                    | E5-S3   | M2        | p0       | M      | mobile                         |
| E5-S3-T3   | task  | Back in the app: close Compose and show the toast             | E5-S3   | M2        | p0       | S      | mobile                         |
| E5-S3-T4   | task  | Copy text                                                     | E5-S3   | M2        | p0       | XS     | mobile                         |
| E5-S3-T5   | task  | Telegram unavailable sheet S-09                               | E5-S3   | M2        | p0       | S      | mobile                         |
| E6         | epic  | Greeting history                                              | —       | M3        | p0       | —      | mobile, shared, backend        |
| E6-S1      | story | Browse and delete greetings on the server                     | E6      | M3        | p0       | L      | shared, backend                |
| E6-S1-T1   | task  | History contracts                                             | E6-S1   | M3        | p0       | XS     | shared                         |
| E6-S1-T2   | task  | List greetings with search and friend filter                  | E6-S1   | M3        | p0       | M      | backend                        |
| E6-S1-T3   | task  | Read and delete one greeting                                  | E6-S1   | M3        | p0       | S      | backend                        |
| E6-S2      | story | History list                                                  | E6      | M3        | p0       | L      | mobile                         |
| E6-S2-T1   | task  | History screen grouped by month                               | E6-S2   | M3        | p0       | M      | mobile                         |
| E6-S2-T2   | task  | Search and friend filter                                      | E6-S2   | M3        | p0       | S      | mobile                         |
| E6-S2-T3   | task  | Swipe to delete a greeting                                    | E6-S2   | M3        | p0       | S      | mobile                         |
| E6-S3      | story | Greeting detail                                               | E6      | M3        | p0       | M      | mobile                         |
| E6-S3-T1   | task  | Greeting detail with copy and delete                          | E6-S3   | M3        | p0       | S      | mobile                         |
| E6-S3-T2   | task  | Send again                                                    | E6-S3   | M3        | p0       | XS     | mobile                         |
| E6-S4      | story | A friend's greetings                                          | E6      | M3        | p1       | M      | mobile                         |
| E6-S4-T1   | task  | Greetings section on Friend Profile                           | E6-S4   | M3        | p1       | S      | mobile                         |
| E6-S4-T2   | task  | Friend's greetings screen S-12                                | E6-S4   | M3        | p1       | S      | mobile                         |
| E7         | epic  | Reminders                                                     | —       | M3        | p0       | —      | mobile, shared, backend, db    |
| E7-S1      | story | Reminder settings saved per user                              | E7      | M3        | p0       | L      | shared, backend, db            |
| E7-S1-T1   | task  | Reminder settings table                                       | E7-S1   | M3        | p0       | S      | db                             |
| E7-S1-T2   | task  | Reminder settings contracts                                   | E7-S1   | M3        | p0       | XS     | shared                         |
| E7-S1-T3   | task  | Read and update reminder settings endpoints                   | E7-S1   | M3        | p0       | S      | backend                        |
| E7-S2      | story | Reminder settings screen                                      | E7      | M3        | p0       | L      | mobile                         |
| E7-S2-T1   | task  | Reminder controls with defaults                               | E7-S2   | M3        | p0       | M      | mobile                         |
| E7-S2-T2   | task  | Notifications-off state                                       | E7-S2   | M3        | p0       | S      | mobile                         |
| E7-S3      | story | Register the device for push                                  | E7      | M3        | p0       | L      | mobile, backend, db            |
| E7-S3-T1   | task  | Push tokens table                                             | E7-S3   | M3        | p0       | S      | db                             |
| E7-S3-T2   | task  | Register and remove push token endpoints                      | E7-S3   | M3        | p0       | S      | backend                        |
| E7-S3-T3   | task  | Register the Expo push token from the app                     | E7-S3   | M3        | p0       | S      | mobile                         |
| E7-S4      | story | Reminders arrive on the right day and time                    | E7      | M3        | p0       | M+     | shared, backend, mobile        |
| E7-S4-T1   | task  | Due reminders calculation                                     | E7-S4   | M3        | p0       | S      | shared                         |
| E7-S4-T2   | task  | Notification texts from S-15                                  | E7-S4   | M3        | p0       | S      | shared                         |
| E7-S5      | story | Notification tap opens the right screen                       | E7      | M3        | p0       | M      | mobile                         |
| E7-S5-T1   | task  | Deep-link config and notification tap handling                | E7-S5   | M3        | p0       | M      | mobile                         |
| E8         | epic  | Settings & account                                            | —       | M3        | p0       | —      | mobile, backend, db            |
| E8-S1      | story | Settings screen                                               | E8      | M3        | p0       | S      | mobile                         |
| E8-S1-T1   | task  | Settings screen S-13                                          | E8-S1   | M3        | p0       | S      | mobile                         |
| E8-S2      | story | Sign out                                                      | E8      | M3        | p0       | S      | mobile                         |
| E8-S2-T1   | task  | Sign out with confirmation                                    | E8-S2   | M3        | p0       | S      | mobile                         |
| E8-S3      | story | Delete my account                                             | E8      | M3        | p0       | 3.25 d | backend, db, mobile            |
| E8-S3-T1   | task  | Delete account endpoint                                       | E8-S3   | M3        | p0       | M      | backend                        |
| E8-S3-T2   | task  | Delete account in the app                                     | E8-S3   | M3        | p0       | S      | mobile                         |
| E8-S3-T3   | task  | Store the Apple refresh token                                 | E8-S3   | M3        | p0       | XS     | db                             |
| E8-S3-T4   | task  | Exchange the Apple authorization code at sign-in              | E8-S3   | M3        | p0       | M      | backend                        |
| E8-S3-T5   | task  | Revoke Apple tokens when the account is deleted               | E8-S3   | M3        | p0       | S      | backend                        |
| E9         | epic  | Release                                                       | —       | M4        | p0       | —      | infra, mobile                  |
| E9-S1      | story | Production database with backups                              | E9      | M4        | p0       | M      | infra                          |
| E9-S1-T1   | task  | Provision the production database                             | E9-S1   | M4        | p0       | S      | infra                          |
| E9-S1-T2   | task  | Automated backups and a restore drill                         | E9-S1   | M4        | p0       | S      | infra                          |
| E9-S2      | story | API deployed to production over HTTPS                         | E9      | M4        | p0       | 3 d    | infra                          |
| E9-S2-T1   | task  | Production config and secrets on the host                     | E9-S2   | M4        | p0       | S      | infra                          |
| E9-S2-T2   | task  | Domain and HTTPS                                              | E9-S2   | M4        | p0       | S      | infra                          |
| E9-S2-T3   | task  | Deploy pipeline from main                                     | E9-S2   | M4        | p0       | M      | infra                          |
| E9-S2-T4   | task  | Migrations run automatically on deploy                        | E9-S2   | M4        | p0       | S      | infra                          |
| E9-S2-T5   | task  | Production logs and uptime check                              | E9-S2   | M4        | p1       | S      | infra                          |
| E9-S3      | story | Privacy policy and terms pages                                | E9      | M4        | p0       | L      | infra, mobile                  |
| E9-S3-T1   | task  | Publish the privacy policy and terms pages                    | E9-S3   | M4        | p0       | S      | infra                          |
| E9-S3-T2   | task  | Link the pages from S-01 and S-13                             | E9-S3   | M4        | p0       | XS     | mobile                         |
| E9-S3-T3   | task  | Draft the privacy policy and terms from a template            | E9-S3   | M4        | p0       | S      | infra                          |
| E9-S4      | story | App icon and splash screen                                    | E9      | M4        | p0       | S      | mobile                         |
| E9-S4-T1   | task  | Set the app icon and splash screen                            | E9-S4   | M4        | p0       | S      | mobile                         |
| E9-S5      | story | Production builds with sign-in and push credentials           | E9      | M4        | p0       | L      | infra                          |
| E9-S5-T1   | task  | Production sign-in credentials for Apple and Google           | E9-S5   | M4        | p0       | S      | infra                          |
| E9-S5-T2   | task  | Push notification credentials                                 | E9-S5   | M4        | p0       | S      | infra                          |
| E9-S5-T3   | task  | EAS production build profile                                  | E9-S5   | M4        | p0       | M      | infra                          |
| E9-S6      | story | TestFlight and Play internal testing                          | E9      | M4        | p0       | M      | infra                          |
| E9-S6-T1   | task  | Submit to TestFlight                                          | E9-S6   | M4        | p0       | S      | infra                          |
| E9-S6-T2   | task  | Release to Google Play internal testing                       | E9-S6   | M4        | p0       | S      | infra                          |
| E11        | epic  | Public release                                                | —       | M5        | p0       | —      | infra                          |
| E11-S1     | story | Store listings and privacy disclosures                        | E11     | M5        | p0       | 2.5 d  | infra                          |
| E11-S1-T1  | task  | App Store listing texts and screenshots                       | E11-S1  | M5        | p0       | M      | infra                          |
| E11-S1-T2  | task  | Google Play listing texts and graphics                        | E11-S1  | M5        | p0       | M      | infra                          |
| E11-S1-T3  | task  | App Privacy and Data safety forms                             | E11-S1  | M5        | p0       | S      | infra                          |
| E11-S2     | story | App Store review and release                                  | E11     | M5        | p0       | M      | infra                          |
| E11-S2-T1  | task  | Submit the app for App Store review                           | E11-S2  | M5        | p0       | S      | infra                          |
| E11-S2-T2  | task  | Release on the App Store                                      | E11-S2  | M5        | p0       | XS     | infra                          |
| E11-S3     | story | Google Play production rollout                                | E11     | M5        | p0       | M      | infra                          |
| E11-S3-T1  | task  | Closed test for Play production access                        | E11-S3  | M5        | p0       | S      | infra                          |
| E11-S3-T2  | task  | Production release with a staged rollout                      | E11-S3  | M5        | p0       | S      | infra                          |
| E11-S4     | story | Launch checklist                                              | E11     | M5        | p0       | S      | infra                          |
| E11-S4-T1  | task  | Write and run the launch checklist                            | E11-S4  | M5        | p0       | S      | infra                          |

Totals: 12 epics, 58 stories, 168 tasks, 5 spikes (243 issues). Compared with the first version (10
epics, 44 stories, 124 tasks, 5 spikes): +2 epics (E10, E11); +15 stories (11 in E10, 4 in E11) and −1
(E9-S7, moved to E11-S1); +45 tasks (31 in E10, 8 in E11, and E0-S2-T3, E0-S3-T3, E8-S3-T3…T5,
E9-S3-T3) and −1 (E9-S7-T1). About 75 existing issues were edited (labels, blockers, acceptance criteria).

## 2. Issues

### [E10] Design

- Type: epic
- Labels: type:epic, area:design, priority:p0
- Milestone: M0
- Size: —

## Goal

Every MVP screen, state, shared component and key flow is designed in Penpot from semantic tokens
and handed off **before any development starts** (design first, ba-brief §7 M0), so the developer
builds from finished mocks and a real tokens export instead of guessing.

## Scope

- Design-brief §10 deliverables 1–6: Tokens page and tokens JSON export, Components page (shared
  library), every screen S-01…S-15 with every listed state, the six prototype flows, the small-screen
  check and the handoff view-mode link
- Gaps closed by the product owner on 2026-10-20: avatar color tokens (resolved Q14), offline states
  (resolved Q15), app icon and splash (resolved Q16); design-brief §10 items 7–9
- Copy from the resolved decisions that shows in mocks: Upcoming sections (D14), "Tomorrow" (D17),
  Apple button on iOS only (D20), reminders summary "Off" (D19), 4,096-character cap (D22)
- Work is done by the `product-designer` agent through the Penpot MCP plugin (Penpot open, plugin
  connected); the developer reviews each task in Penpot and closes it

## Out of scope

- Dark theme values and dark screens (the `dark` set stays empty, ba-brief §2)
- Tablet, web, landscape; the future "Generate with AI" action (space is reserved only, design-brief §1)
- Store screenshots and listing graphics (E11)
- Any code: `libs/design-tokens/src/theme.ts`, app components and screens (E1 onward)

## Screens

S-01, S-02, S-03, S-04, S-05, S-06, S-07, S-08, S-09, S-10, S-11, S-12, S-13, S-14, S-15

## Stories

(sub-issues)

## Done when

- The Penpot file has the Tokens, Components, Screens and Flows pages from design-brief §10, plus the
  offline boards, the app icon and the splash.
- Every board is named `S-XX / State` (design-brief §2.3), uses component copies and tokens only, and
  shows design-brief §7 sample data.
- The tokens JSON export is in the repo for E1-S1, and the developer has accepted the handoff
  (E10-S11). Every M1–M5 issue waits for that handoff.

### [E10-S1] Design tokens in Penpot

- Type: story
- Parent: E10
- Labels: type:story, area:design, priority:p0
- Milestone: M0
- Size: — (≈3 days of tasks)
- Blocked by: —

## User story

As the developer, I want GreetDay's design tokens defined in Penpot and exported as JSON, so that the
app theme is generated from the same values the mocks use.

## Context

Design-brief §2.1 (token sets `core` / `light` / `dark`, theme group `mode`, token names) and §10.1
(Tokens page and JSON export); D9, D11. Avatar background colors were missing from §2.1 and are added
here (resolved Q14, design-brief A17). The export feeds E1-S1.

## Acceptance criteria

- [ ] Given Penpot's tokens panel, then the sets `core`, `light` and `dark` exist and the theme group `mode` has Light (`core` + `light`) and Dark (`core` + `dark`).
- [ ] Given design-brief §2.1, then every listed color, typography, spacing, radius and elevation name exists; semantic colors in `light` reference `core` values, and `dark` has the same names, empty or mirroring light.
- [ ] Given initials avatars (D9), then a small set of avatar background color tokens exists in `light` (names also in `dark`), each passing WCAG AA with the initials text color.
- [ ] Given any text token on the backgrounds it's used on, then contrast is at least 4.5:1 (3:1 for large text).
- [ ] Given a token type the Penpot version can't store (e.g. typography or shadow), then it exists as a library asset with the same name and the Tokens page says so.
- [ ] Given the Tokens page, then it shows color swatches, type scale, spacing, radius and elevation, Light filled and Dark empty.
- [ ] Given the JSON export (W3C DTCG), then it's saved next to the Penpot file and in the repo for E1-S1.

## Business rules

- D9, D11, D12.

## Non-functional

- §6 Accessibility (WCAG AA contrast).

## Dependencies

Blocked by: —

## Assumptions / open questions

- Assumption: the font comes from Penpot's built-in Google Fonts list (design-brief §2.3), so the app can load the same font files.

## Tasks

(sub-issues)

### [E10-S1-T1] Token sets, themes and core scales

- Type: task
- Parent: E10-S1
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: —

## What

Owner: `product-designer` agent. Create the token sets `core`, `light` and `dark` and the theme group
`mode` (Light, Dark), then fill `core` with the raw palette (e.g. `palette.coral.500`) and the
non-color scales `space.4` … `space.48` and `radius.sm` … `radius.full` (design-brief §2.1).

## Details

- Confirm the target Penpot file and page with the developer before creating anything (product-designer rules).
- Palette mood: calm and warm, not childish; Telegram's blue is not the brand color (design-brief §1, §2).

## Done when

- [ ] Sets, themes and `core` scales visible in Penpot's tokens panel, with names exactly as in design-brief §2.1.

### [E10-S1-T2] Semantic color and avatar color tokens

- Type: task
- Parent: E10-S1
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S1-T1

## What

Fill `light` with every semantic color from design-brief §2.1 (`bg.default` … `celebration`),
referencing `core`, plus avatar background colors for initials avatars (resolved Q14). Add the same
names to `dark`, empty or mirroring light.

## Details

- Avatar colors: Proposed 6–8 tokens in one group (e.g. `avatar.1` … `avatar.8`); the designer picks
  count and names. The app picks one per friend from the name, so the same name always gets the same
  color (D9, E1-S4-T1).
- Check every text/background pair the mocks will use for WCAG AA, including initials on each avatar
  color and `text.on-accent` on `accent.default`.

## Done when

- [ ] All semantic and avatar tokens exist in `light` and `dark`; contrast results noted for the Tokens page (E10-S1-T4).

### [E10-S1-T3] Typography and elevation tokens

- Type: task
- Parent: E10-S1
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S1-T1

## What

Define `type.display`, `type.title-l`, `type.title-m`, `type.body`, `type.body-strong`,
`type.caption`, `type.label` (family, size, line height, weight) and `elevation.none`,
`elevation.card`, `elevation.sheet`.

## Details

- If the Penpot version can't store typography or shadow tokens, create library Typographies and
  shadow styles with the same names (design-brief §2.1).
- Sizes must stay readable and not clip with larger system fonts (§6 Accessibility).

## Done when

- [ ] Every name exists as a token or as a same-named library asset.

### [E10-S1-T4] Tokens page

- Type: task
- Parent: E10-S1
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S1-T2, E10-S1-T3

## What

The Tokens page from design-brief §10.1: color swatches with names (Light filled, Dark empty), avatar
colors, type scale, spacing, radius and elevation, plus notes on asset-based tokens and contrast checks.

## Done when

- [ ] Page exists; every swatch and sample applies the token itself, not a copied value.

### [E10-S1-T5] Export the tokens JSON for engineering

- Type: task
- Parent: E10-S1
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S1-T2, E10-S1-T3

## What

Export the tokens with Penpot's design tokens export (W3C DTCG) and save the file next to the Penpot
file and in the repo for E1-S1 (the developer commits it).

## Details

- Proposed repo path: `libs/design-tokens/penpot-export.json`. Don't replace
  `libs/design-tokens/tokens.json` in this task: renaming the placeholder tokens breaks app code until
  E1-S1-T1 lands, and the sync script rejects `$type`s it doesn't support yet (typography, shadow)
  until E1-S1-T2 adds them.
- List which tokens exist only as library assets so E1-S1 can map them.

## Done when

- [ ] Export file in the repo; the developer confirms E1-S1 has everything it needs.

### [E10-S2] Shared component library

- Type: story
- Parent: E10
- Labels: type:story, area:design, priority:p0
- Milestone: M0
- Size: — (≈4.5 days of tasks)
- Blocked by: E10-S1

## User story

As the developer, I want every shared component designed once with its variants, so that the screens
are consistent and I can build one React Native component per Penpot component.

## Context

Design-brief §2.2 (component list), §2.3 (variants, component copies, Flex layout, icons, fonts) and
§10.2; the product-designer rules (a component for anything used on more than one screen). Built from
the E10-S1 tokens; implemented in E1-S3 and E1-S4.

## Acceptance criteria

- [ ] Given design-brief §2.2, then every listed component exists as a main component on the Components page with its sizes, variants and states (e.g. `Button` with `type=primary|secondary|destructive|text` × `state=default|pressed|disabled|loading`; slash-named components if variants aren't available).
- [ ] Given any component, then colors, type, spacing, radius and elevation come from tokens, and Flex layout lets text grow.
- [ ] Given interactive components, then tap targets are at least 44 × 44 pt and status never relies on color alone (badges have text or an icon).
- [ ] Given the Avatar, then it shows initials on an avatar color token in sizes S, M and L (D9).
- [ ] Given icons, then they come from one open-source set, imported as 24 × 24 components.
- [ ] Given the file, then it's published as a shared library.

## Business rules

- D9, D11, D12.

## Non-functional

- §6 Accessibility (contrast, tap targets, larger fonts, no color-only status).

## Dependencies

Blocked by: E10-S1

## Assumptions / open questions

- Assumption: patterns reused on several screens but not listed in §2.2 (the greeting row on S-07, S-10 and S-12, header variants, the search field, skeleton rows) are components too, per the product-designer rules.

## Tasks

(sub-issues)

### [E10-S2-T1] Icons, font and buttons

- Type: task
- Parent: E10-S2
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S1-T2, E10-S1-T3

## What

Import one open-source icon set (e.g. Lucide or Phosphor) as 24 × 24 components (tab icons, "+",
send / paper plane for Telegram, search, chevrons, check, copy, trash, bell), apply the font, and build
`Button` with `type` × `state` variants including the loading spinner.

## Details

- Telegram actions use a generic send icon plus the label "Telegram" (design-brief §2 Telegram branding).
- Leave about 30% slack in button labels (design-brief §2 Language).

## Done when

- [ ] Icons and all `Button` variants on the Components page, built from tokens.

### [E10-S2-T2] Avatar, badge, list rows and section header

- Type: task
- Parent: E10-S2
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T1

## What

`Avatar` (S/M/L, initials on avatar color tokens), `Badge` ("Today", "Greeted"), `Birthday row`,
`Section header`, and a greeting row for S-07, S-10 and S-12.

## Details

- Birthday row: avatar (M), name, date, optional "turns N", trailing relative label "Today" /
  "Tomorrow" / "in N days" (D17), optional "Greeted" badge; Friends-list variant with the closeness
  label instead of the relative label.
- Greeting row: avatar (S), friend name, date sent, 2-line preview, small "via Telegram" label.
- Show long names truncating, and the row as one accessible element.

## Done when

- [ ] Variants with and without age, greeted, Friends-list and long-name examples exist.

### [E10-S2-T3] Form components

- Type: task
- Parent: E10-S2
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T1

## What

`Text field` (default, focused, error with message, disabled; optional counter) and a search-field
variant, `Multiline text area` (auto-grow, counter, `status.warning` above 3,500, stops at 4,096 per
D22), `Chip` (static, removable), `Segmented control` (including nothing selected) and `Toggle row`
(on, off, disabled).

## Done when

- [ ] Every state on the Components page.

### [E10-S2-T4] Feedback and overlay components

- Type: task
- Parent: E10-S2
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T1

## What

`Toast`, `Confirmation dialog` (default and destructive confirm), `Bottom sheet` (title, content,
actions, close), `Empty state block` (illustration slot, title, text, optional primary action) and
skeleton rows for loading states.

## Done when

- [ ] Every variant on the Components page; the destructive confirm uses `status.danger`.

### [E10-S2-T5] Tab bar, headers and library publish

- Type: task
- Parent: E10-S2
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S2-T2, E10-S2-T3, E10-S2-T4

## What

`Bottom tab bar` with Upcoming, Calendar, Friends, History, Settings (each selected state; D1,
design-brief §3), header variants (large title with "+", "Cancel / Title / Save", back with "Edit"),
then publish the file as a shared library.

## Done when

- [ ] Tab bar and headers exist; the library is published and usable from another Penpot file.

### [E10-S3] Sign In and first-run designs (F1)

- Type: story
- Parent: E10
- Labels: type:story, area:design, priority:p0
- Milestone: M0
- Size: L
- Blocked by: E10-S2

## User story

As the developer, I want every Sign In and first-run state designed, so that I can build F1 without
guessing layout or copy.

## Context

Design-brief F1 / S-01, S-02 and flow 1; D19 (S-02 once per installation), D20 (Apple sign-in on iOS
only). Built in E2-S3 and E2-S4.

## Acceptance criteria

- [ ] Given each listed state, then there is one 393 × 852 board named `S-XX / State`, built from component copies and tokens, with design-brief §7 sample data.
- [ ] Given S-01, then `Default`, `Loading`, `Error` and `Cancelled` boards show "Continue with Apple" and "Continue with Google" equal in size and stacked (provider button guidelines), the value proposition and the Terms / Privacy footer.
- [ ] Given Android (D20), then a `S-01 / Default (Android)` board shows only "Continue with Google".
- [ ] Given S-02, then one board shows the illustration, "Never miss a birthday", the explanation, "Turn on reminders" and "Not now".
- [ ] Given text and controls, then contrast and 44 pt targets meet §6 Accessibility.

## Business rules

- F1, D12, D19, D20.

## Non-functional

- §6 Accessibility.

## Dependencies

Blocked by: E10-S2

## Assumptions / open questions

- Assumption: `S-01 / Cancelled` is the Default board with a note, since the brief says it returns to default silently.

## Tasks

(sub-issues)

### [E10-S3-T1] S-01 Sign In boards

- Type: task
- Parent: E10-S3
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T5

## What

Boards `S-01 / Default`, `S-01 / Loading` (tapped button spinner, both disabled), `S-01 / Error`
("Sign-in failed. Please try again." under the buttons), `S-01 / Cancelled` and
`S-01 / Default (Android)` (Google only, D20).

## Done when

- [ ] Five boards exist; provider buttons follow Apple's and Google's button guidelines.

### [E10-S3-T2] S-02 Notification priming board

- Type: task
- Parent: E10-S3
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S2-T5

## What

Board `S-02 / Default` with illustration, title, explanation, "Turn on reminders" and "Not now".

## Done when

- [ ] Board exists with the design-brief copy.

### [E10-S4] Upcoming and Calendar designs (F2, F3)

- Type: story
- Parent: E10
- Labels: type:story, area:design, priority:p0
- Milestone: M0
- Size: L
- Blocked by: E10-S2

## User story

As the developer, I want every Upcoming and Calendar state designed with the resolved section and
copy rules, so that I can build S-03 and S-04 exactly.

## Context

Design-brief F2 / S-03, F3 / S-04, flows 1 and 2; D13 (greeted window), D14 (sections), D16 (Feb 29
display), D17 ("Today" / "Tomorrow" / "in N days"). Built in E4-S2, E4-S3 and E4-S4.

## Acceptance criteria

- [ ] Given each listed state, then there is one 393 × 852 board named `S-XX / State`, built from component copies and tokens, with design-brief §7 sample data and "today" = Saturday, Oct 17, 2026 unless stated.
- [ ] Given `S-03 / Default`, then the Today block shows Anna ("Turns 30 today", "Write greeting") and Mark ("Birthday today", "Greeted ✓" and "Write another"); "This week" is hidden because only Sunday Oct 18 is left and nobody has a birthday then (D14); "This month" lists Sofia (Tue, Oct 20, "in 3 days") and Daniel (Thu, Oct 29, "in 12 days"); "Later" lists Elena, Tom and Laura (printed "Feb 29", positioned on Feb 28, 2027, D16).
- [ ] Given `S-03 / No birthdays today` with "today" = Monday, Oct 19, 2026, then there's no Today block and "This week" shows Sofia with "Tomorrow" (D17).
- [ ] Given S-03, then `Empty`, `Loading` (skeleton rows), `Error` (inline message with "Try again") and `One friend` (for flow 1) boards exist.
- [ ] Given S-04, then `Month with birthdays`, `Selected day multiple` (Oct 17: Anna and Mark with "Today"), `Selected day empty` and `Empty` boards exist, with today marked, a dot or count badge for 2+, and a Monday-first grid.
- [ ] Given text and controls, then contrast and 44 pt targets meet §6 Accessibility.

## Business rules

- D1, D4, D5, D13, D14, D16, D17.

## Non-functional

- §6 Accessibility.

## Dependencies

Blocked by: E10-S2

## Assumptions / open questions

- Assumption: `S-03 / No birthdays today` uses Mon, Oct 19, 2026 as "today" so the §7 sample data can show "Tomorrow"; all other boards use Oct 17.
- Assumption: the calendar grid starts on Monday, consistent with the Monday–Sunday week (D14).
- Assumption: rows print "Feb 29" without a weekday in non-leap years (Open question 33).
- Note: the design-brief row example "Mon, Oct 20" is a format example; Oct 20, 2026 is a Tuesday.

## Tasks

(sub-issues)

### [E10-S4-T1] S-03 Upcoming boards

- Type: task
- Parent: E10-S4
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T5

## What

Boards `S-03 / Default`, `S-03 / No birthdays today`, `S-03 / Empty`, `S-03 / Loading`,
`S-03 / Error` and `S-03 / One friend`, per the story's acceptance criteria and D14.

## Details

- Section rule (D14): Today block for today; This week = from tomorrow through Sunday; This month =
  rest of the calendar month after this Sunday; Later = beyond, within 12 months. Empty sections are hidden.

## Done when

- [ ] Six boards exist; section contents match D14 for the stated "today".

### [E10-S4-T2] S-04 Calendar boards

- Type: task
- Parent: E10-S4
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T5

## What

Boards `S-04 / Month with birthdays`, `S-04 / Selected day multiple`, `S-04 / Selected day empty` and
`S-04 / Empty` with a Grid-layout month (Monday first), header arrows, "Today" text button and "+".

## Done when

- [ ] Four boards exist; day cells are at least 44 pt and labelled in the annotations (e.g. "October 17, 2 birthdays").

### [E10-S5] Friends designs (F4)

- Type: story
- Parent: E10
- Labels: type:story, area:design, priority:p0
- Milestone: M0
- Size: — (≈3 days of tasks)
- Blocked by: E10-S2

## User story

As the developer, I want every Friends list, form and profile state designed, so that I can build F4
without guessing layout, validation messages or dialogs.

## Context

Design-brief F4 / S-05, S-06, S-07 (data fields table), flow 4; D15 (year rules), D16 (Feb 29
display), D23 (duplicates, search by name). Built in E3-S2 … E3-S5 and E6-S4.

## Acceptance criteria

- [ ] Given each listed state, then there is one 393 × 852 board named `S-XX / State`, built from component copies and tokens, with design-brief §7 sample data.
- [ ] Given S-05, then `Default` (A–Z sections, closeness label, Laura as "Feb 29"), `Searching`, `No results` ("No friends match "xyz""), `Empty` and `Swipe delete` (with the S-06 delete confirmation) boards exist; search matches names only (D23).
- [ ] Given S-06, then `Empty form`, `Filled`, `Validation errors` (missing name, invalid Telegram username, Feb 29 with a non-leap year), `Duplicate warning`, `Saving` and `Edit` (with "Delete friend") boards exist, plus the `Discard changes` and `Delete friend` dialogs.
- [ ] Given the S-06 year picker, then it offers 1900 to the current year (D15).
- [ ] Given S-07, then `Full`, `Minimal` and `Birthday today` (celebration header) boards show About, Telegram ("Not linked" + "Add") and Greetings ("See all (n)" or "No greetings yet") sections.
- [ ] Given text and controls, then contrast and 44 pt targets meet §6 Accessibility.

## Business rules

- D4, D7, D8, D9, D10, D15, D16, D23.

## Non-functional

- §6 Accessibility.

## Dependencies

Blocked by: E10-S2

## Assumptions / open questions

- Assumption: suggested sample friends: `S-07 / Birthday today` = Anna (with her two past greetings), `S-07 / Full` = Sofia, `S-07 / Minimal` = Tom; Daniel shows "Not linked".
- Assumption: the designer proposes the validation messages (the brief names the errors, not the copy) and gets them approved at handoff (E10-S11-T3).

## Tasks

(sub-issues)

### [E10-S5-T1] S-05 Friends list boards

- Type: task
- Parent: E10-S5
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T5

## What

Boards `S-05 / Default`, `S-05 / Searching`, `S-05 / No results`, `S-05 / Empty` and
`S-05 / Swipe delete` (swipe action and confirmation dialog).

## Done when

- [ ] Five boards exist per the story's acceptance criteria.

### [E10-S5-T2] S-06 Add / Edit Friend boards

- Type: task
- Parent: E10-S5
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T5

## What

Boards `S-06 / Empty form`, `S-06 / Filled`, `S-06 / Validation errors`, `S-06 / Duplicate warning`,
`S-06 / Saving`, `S-06 / Edit`, `S-06 / Discard changes` and `S-06 / Delete friend`.

## Details

- Sections Basics, About, Telegram with the helper text from the brief; "Include year" toggle reveals
  the year picker (1900 – current year, D15).
- Duplicate banner copy from the brief; duplicate = same trimmed, case-insensitive name and same day and month (D23).

## Done when

- [ ] Eight boards exist; proposed validation messages listed for the handoff note.

### [E10-S5-T3] S-07 Friend Profile boards

- Type: task
- Parent: E10-S5
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T5

## What

Boards `S-07 / Full`, `S-07 / Minimal` and `S-07 / Birthday today` with header, "Write greeting",
About, Telegram and Greetings sections.

## Done when

- [ ] Three boards exist per the story's acceptance criteria.

### [E10-S6] Compose and Telegram designs (F5)

- Type: story
- Parent: E10
- Labels: type:story, area:design, priority:p0
- Milestone: M0
- Size: L
- Blocked by: E10-S2

## User story

As the developer, I want every Compose and Telegram hand-off state designed, so that I can build the
core loop's last step without guessing.

## Context

Design-brief F5 / S-08, S-09 (including the "copied" toast variant from the F5 note), flows 2, 3, 5;
D2, D22 (save failure, fallback channel, 4,096 cap). Built in E5-S2 and E5-S3.

## Acceptance criteria

- [ ] Given each listed state, then there is one 393 × 852 board named `S-XX / State`, built from component copies and tokens, with design-brief §7 sample data.
- [ ] Given S-08, then `Empty`, `Typing` (keyboard open), `With context`, `No context`, `Near limit` (counter in `status.warning` above 3,500; input stops at 4,096, D22), `No Telegram linked` ("Share via Telegram" and the link hint) and `Discard greeting` boards exist, with space near the text area left free for a future "Generate" action (not drawn).
- [ ] Given `S-08 / Save failed`, then saving on the Telegram tap failed, Telegram doesn't open, and an error with retry is shown (D22).
- [ ] Given S-09, then the bottom sheet board shows the title, text, "Copy text", "Get Telegram" and "Cancel".
- [ ] Given toasts, then "Greeting saved to history", "Greeting copied — paste it in Telegram" and "Copied" exist.
- [ ] Given text and controls, then contrast and 44 pt targets meet §6 Accessibility.

## Business rules

- D2, D8, D22.

## Non-functional

- §6 Accessibility.

## Dependencies

Blocked by: E10-S2

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E10-S6-T1] S-08 Compose boards

- Type: task
- Parent: E10-S6
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T5

## What

Boards `S-08 / Empty`, `S-08 / Typing`, `S-08 / With context`, `S-08 / No context`,
`S-08 / Near limit`, `S-08 / No Telegram linked` and `S-08 / Discard greeting`.

## Done when

- [ ] Seven boards exist per the story's acceptance criteria; actions sit above the keyboard.

### [E10-S6-T2] S-09 sheet, toasts and the save-failed state

- Type: task
- Parent: E10-S6
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S6-T1

## What

Boards `S-09 / Default` and `S-08 / Save failed`, and the three toasts as overlay boards for the flows.

## Done when

- [ ] Boards and toasts exist; the save-failed error offers retry and doesn't mention Telegram having opened.

### [E10-S7] History designs (F6)

- Type: story
- Parent: E10
- Labels: type:story, area:design, priority:p0
- Milestone: M0
- Size: L
- Blocked by: E10-S2

## User story

As the developer, I want every History, Greeting Detail and Friend's greetings state designed, so that
I can build F6 without guessing.

## Context

Design-brief F6 / S-10, S-11, S-12, flow 5; D23 (swipe-to-delete confirms with the S-11 dialog).
Built in E6-S2, E6-S3 and E6-S4.

## Acceptance criteria

- [ ] Given each listed state, then there is one 393 × 852 board named `S-XX / State`, built from component copies and tokens, with design-brief §7 sample data.
- [ ] Given S-10, then `Default` (grouped by month), `Filtered` (Anna), `No results`, `Empty`, `Friend picker` (bottom sheet) and `Swipe delete` (with "Delete this greeting from history?", D23) boards exist.
- [ ] Given S-11, then `Default` (friend, date and time, channel, full text, "Copy text", "Send again", "Delete") and `Delete dialog` boards exist.
- [ ] Given S-12, then a `Default` board shows Anna's greetings grouped by year.
- [ ] Given text and controls, then contrast and 44 pt targets meet §6 Accessibility.

## Business rules

- D2, D23.

## Non-functional

- §6 Accessibility.

## Dependencies

Blocked by: E10-S2

## Assumptions / open questions

- Assumption: History also shows a greeting to Mark dated Oct 17, 2026 (Mark is greeted today, design-brief §7); the designer writes its text.
- Assumption: the no-results copy follows S-05 ("No greetings match "xyz"").

## Tasks

(sub-issues)

### [E10-S7-T1] S-10 History boards

- Type: task
- Parent: E10-S7
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T5

## What

Boards `S-10 / Default`, `S-10 / Filtered`, `S-10 / No results`, `S-10 / Empty`,
`S-10 / Friend picker` and `S-10 / Swipe delete`.

## Done when

- [ ] Six boards exist per the story's acceptance criteria.

### [E10-S7-T2] S-11 Greeting Detail and S-12 Friend's greetings boards

- Type: task
- Parent: E10-S7
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S7-T1

## What

Boards `S-11 / Default`, `S-11 / Delete dialog` and `S-12 / Default`.

## Done when

- [ ] Three boards exist; S-12 reuses the S-10 row pattern.

### [E10-S8] Settings, reminders and notification designs (F7, F8)

- Type: story
- Parent: E10
- Labels: type:story, area:design, priority:p0
- Milestone: M0
- Size: L
- Blocked by: E10-S2

## User story

As the developer, I want every Settings, Reminder Settings and notification state designed, so that I
can build F7 and F8 without guessing copy or states.

## Context

Design-brief F7 / S-13, F8 / S-14, S-15, flows 2 and 6; D3, D18 (master on by default), D19 (banner
whenever permission isn't granted, summary "Off"), D20 (Apple account display). Built in E7-S2,
E7-S4, E8-S1 … E8-S3.

## Acceptance criteria

- [ ] Given each listed state, then there is one 393 × 852 board named `S-XX / State`, built from component copies and tokens, with design-brief §7 sample data.
- [ ] Given S-13, then `Default` (Google account, "On the day & 3 days before · 9:00"), `Apple account` (name if available, otherwise the private-relay email, plus "Signed in with Apple", D20), `Reminders off` (summary "Off", D19), `Sign out dialog`, `Delete account dialog` and `Deleting` boards exist.
- [ ] Given S-14, then `Default` (D3 defaults, master on, D18), `Permission denied` (banner "Notifications are turned off for this app." with "Open phone settings", controls disabled), `Permission not asked` (same banner; the button asks for permission, D19) and `Master off` boards exist.
- [ ] Given S-15, then the four lock-screen notifications from the design-brief table exist with gender-neutral bodies ("Turning 30. Tap to write a greeting.").
- [ ] Given text and controls, then contrast and 44 pt targets meet §6 Accessibility.

## Business rules

- D3, D18, D19, D20.

## Non-functional

- §6 Accessibility.

## Dependencies

Blocked by: E10-S2

## Assumptions / open questions

- Assumption: the designer proposes the sign-out dialog copy and the `Permission not asked` button label (the brief has neither) and gets them approved at handoff.

## Tasks

(sub-issues)

### [E10-S8-T1] S-13 Settings boards

- Type: task
- Parent: E10-S8
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S2-T5

## What

Boards `S-13 / Default`, `S-13 / Apple account`, `S-13 / Reminders off`, `S-13 / Sign out dialog`,
`S-13 / Delete account dialog` and `S-13 / Deleting`.

## Done when

- [ ] Six boards exist per the story's acceptance criteria.

### [E10-S8-T2] S-14 Reminder Settings boards

- Type: task
- Parent: E10-S8
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S2-T5

## What

Boards `S-14 / Default`, `S-14 / Permission denied`, `S-14 / Permission not asked` and
`S-14 / Master off`, with the helper text "Reminders use your phone's time zone."

## Done when

- [ ] Four boards exist; disabled controls are recognisable without relying on color alone.

### [E10-S8-T3] S-15 notification examples

- Type: task
- Parent: E10-S8
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S2-T5

## What

Lock-screen boards `S-15 / Birthday today`, `S-15 / Birthday today (no year)`, `S-15 / Several today`
and `S-15 / In advance` with the design-brief titles and gender-neutral bodies.

## Done when

- [ ] Four boards exist; the "today" board is the starting board of flow 2.

### [E10-S9] Offline states

- Type: story
- Parent: E10
- Labels: type:story, area:design, priority:p0
- Milestone: M0
- Size: L
- Blocked by: E10-S2

## User story

As a user without a connection, I want to see that I'm offline while still reading my data, so that I
understand why an action failed and what still works.

## Context

ba-brief §6 Offline behavior (last loaded data visible; actions that need the server show a clear
error with retry). The design brief has no offline states (resolved Q15, design-brief A16): the
designer decides the pattern, e.g. a banner, a read-only treatment of actions, or both. Built in E0-S3
and used by every screen story.

## Acceptance criteria

- [ ] Given the chosen pattern, then it's a component on the Components page with a short rule for when it shows.
- [ ] Given screens that show cached data (at least S-03, S-05, S-07, S-10, S-13), then each has an `Offline` board.
- [ ] Given actions that need the server (at least Save on S-06, Delete on S-11, a change on S-14), then each has an offline-failure board with a clear message and retry.
- [ ] Given the pattern, then it doesn't rely on color alone and the annotation says what screen readers announce.

## Business rules

- §6 Offline behavior.

## Non-functional

- §6 Accessibility, §6 Offline.

## Dependencies

Blocked by: E10-S2

## Assumptions / open questions

- Assumption: offline is read-only; there are no offline writes or sync queue in the MVP (same as E0-S3).

## Tasks

(sub-issues)

### [E10-S9-T1] Offline pattern

- Type: task
- Parent: E10-S9
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S2-T5

## What

Decide the offline pattern (banner, read-only actions, or both) and how a server action fails offline,
build it as a component, and write the rule on the Components page.

## Done when

- [ ] Component and rule exist; the decision is summarized for the handoff note.

### [E10-S9-T2] Offline boards

- Type: task
- Parent: E10-S9
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S9-T1, E10-S4-T1, E10-S5-T1, E10-S5-T2, E10-S5-T3, E10-S7-T1, E10-S7-T2, E10-S8-T1, E10-S8-T2

## What

Boards `S-03 / Offline`, `S-05 / Offline`, `S-07 / Offline`, `S-10 / Offline`, `S-13 / Offline`,
`S-06 / Save failed offline`, `S-11 / Delete failed offline` and `S-14 / Save failed offline`.

## Done when

- [ ] Eight boards exist and use the E10-S9-T1 component.

### [E10-S10] App icon and splash artwork

- Type: story
- Parent: E10
- Labels: type:story, area:design, priority:p0
- Milestone: M0
- Size: L
- Blocked by: E10-S1

## User story

As a user, I want a recognizable app icon and a clean launch screen, so that I can find GreetDay on my
phone and it feels finished.

## Context

ba-brief §7 E9 "app icons/splash"; not in design-brief §10 originally (resolved Q16, design-brief
A18). Designed in M0 by the product-designer agent; E9-S4 wires the assets into the app. An icon is
also required for TestFlight uploads and the store listings (E11).

## Acceptance criteria

- [ ] Given the icon, then it reads well at small sizes on light and dark home screens and doesn't use Telegram's blue as the brand color.
- [ ] Given iOS, then a 1024 × 1024 icon without transparency exists; given Android, then an adaptive-icon foreground inside the safe zone and a background color exist.
- [ ] Given the splash, then it shows the logo on a background color taken from the tokens (D11).
- [ ] Given the handoff, then the PNG exports and color values E9-S4 needs are available to the developer.

## Business rules

- D11, D12.

## Non-functional

- None.

## Dependencies

Blocked by: E10-S1

## Assumptions / open questions

- Assumption: sizes follow the current Expo docs for app icons and the splash screen (SDK 58); E9-S4 confirms them.
- Assumption: if the Penpot MCP plugin can't export images, the developer exports the boards from Penpot's Export panel.

## Tasks

(sub-issues)

### [E10-S10-T1] App icon

- Type: task
- Parent: E10-S10
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S1-T2

## What

Boards `Icon / iOS` (1024 × 1024, no transparency) and `Icon / Android adaptive` (foreground layer and
background color), plus a small-size preview, then export the PNGs.

## Done when

- [ ] Both boards and exports exist; the icon is legible at 40 × 40.

### [E10-S10-T2] Splash screen

- Type: task
- Parent: E10-S10
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S10-T1

## What

Board `Splash / Default`: logo on a token background color, exported as the splash image plus the
background color value.

## Done when

- [ ] Board and export exist; background matches a `bg.*` token.

### [E10-S11] Prototype flows, small-screen check and handoff

- Type: story
- Parent: E10
- Labels: type:story, area:design, priority:p0
- Milestone: M0
- Size: L
- Blocked by: E10-S3, E10-S4, E10-S5, E10-S6, E10-S7, E10-S8, E10-S9, E10-S10

## User story

As the developer, I want clickable flows and one handoff link, so that I can walk through the app and
inspect every screen before I build it.

## Context

Design-brief §6 (six flows) and §10.4–10.6. **This story is the design-first gate** (ba-brief §7):
SP-1, SP-4, SP-5, the E0 stories, E1-S1 and every other M1–M5 issue without another blocker are
blocked by it.

## Acceptance criteria

- [ ] Given Penpot's Prototype mode, then six flows exist, named after design-brief §6 ("1 · First run" … "6 · Set up reminders later"), starting on the flow's first board, with On click → Navigate to links and Open overlay for sheets, dialogs and toasts.
- [ ] Given steps outside the app, then placeholder boards "Telegram (external)" and "OS permission dialog" stand in for them.
- [ ] Given S-03 and S-08 at 375 × 667, then no critical action is clipped (S-08 with the keyboard open).
- [ ] Given the handoff, then a view-mode link (no edit access) opens the flows and lets the developer inspect code and measurements.
- [ ] Given the handoff note on this issue, then it lists the pages, boards per screen, tokens that are library assets, the offline pattern, copy the designer added (validation messages, sign-out dialog, permission button), and any deviation from the briefs.
- [ ] Given the review, then the developer accepts the handoff and closes this story.

## Business rules

- Design first: no M1–M5 work starts before this story is closed.

## Non-functional

- §6 Accessibility (small-screen and larger-font tolerance).

## Dependencies

Blocked by: E10-S3, E10-S4, E10-S5, E10-S6, E10-S7, E10-S8, E10-S9, E10-S10

## Assumptions / open questions

- Assumption: boards follow the design-brief naming `S-XX / State`, not the `S-03 Upcoming / loading` example in `.claude/agents/product-designer.md` (Open question 32).

## Tasks

(sub-issues)

### [E10-S11-T1] Six prototype flows

- Type: task
- Parent: E10-S11
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: M
- Blocked by: E10-S3, E10-S4, E10-S5, E10-S6, E10-S7, E10-S8

## What

Build the six design-brief §6 flows in Prototype mode, adding the placeholder boards and any
in-between boards a flow needs (e.g. `S-03 / Greeted after send` with Anna greeted and the toast for
flow 2, `S-08 / Pre-filled` for flow 5).

## Done when

- [ ] Each flow plays from its starting board to its last step in view mode.

### [E10-S11-T2] Small-screen check at 375 × 667

- Type: task
- Parent: E10-S11
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S4-T1, E10-S6-T1

## What

Boards `S-03 / Default (375×667)` and `S-08 / Typing (375×667)`; fix the components if anything critical clips.

## Done when

- [ ] Both boards exist; "Write greeting", the tab bar and the Compose actions stay visible.

### [E10-S11-T3] Handoff link and review

- Type: task
- Parent: E10-S11
- Labels: type:task, area:design, priority:p0
- Milestone: M0
- Size: S
- Blocked by: E10-S11-T1, E10-S11-T2, E10-S1-T4, E10-S1-T5, E10-S9, E10-S10

## What

Create the view-mode share link with the flows, write the handoff note as a comment on E10-S11, and
walk the developer through it.

## Done when

- [ ] Link works without edit access; the handoff note covers the E10-S11 acceptance criteria; the developer accepts it.

### [SP-4] Data model and migrations for the MVP entities

- Type: spike
- Labels: type:spike, area:db, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E10-S11 (design handoff)

## Question

What tables, columns, keys and indexes represent the ba-brief §4 entities (User, Auth identity,
Refresh session, Friend, Greeting, Reminder settings, Push token), and how are birthdays without a
year (D4) and Feb 29 (D5) stored?

## Options to compare

- Birthday as `birth_month` + `birth_day` + nullable `birth_year` vs a `date` with a sentinel year
  (libs/db/CLAUDE.md currently suggests a `date` column; compare both).
- Interests as `text[]` vs a `friend_interests` table (§4: must stay a structured list for the AI phase).
- Telegram contact as `telegram_type` + `telegram_value` vs two nullable columns (`username`, `phone`).
- Closeness and greeting channel as `pgEnum` vs text + Zod validation.
- Cascades: `ON DELETE CASCADE` from users → everything, and friends → greetings (D10).

## Decision criteria

- Supports every rule in design-brief F4 (data fields table) and D4, D5, D6, D10.
- Every user-owned table has `user_id` + index + cascade (libs/db/CLAUDE.md, `.claude/rules/migrations.md`).
- Greetings keep full text, channel and timestamps, linked to the friend (§4 "Design for the AI phase").
- Easy for a developer new to SQL to query and to change with forward-only migrations.

## Time box

1 day.

## Output

A decision written as a comment on this issue (entity diagram + proposed columns), plus any
follow-up issues created. The developer records it with `/adr`. The table tasks in E2, E3, E5 and
E7 then use the decided shapes.

### [SP-5] Token strategy: lifetimes, rotation, device storage, revoke

- Type: spike
- Parent: E2
- Labels: type:spike, area:backend, area:mobile, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E10-S11 (design handoff)

## Question

How does the app keep the user signed in safely after the backend verifies an Apple or Google ID
token and issues its own access and refresh tokens (ba-brief §4 Auth, §6 Security)?

## Options to compare

- Access token: signed JWT (e.g. 15 min) vs opaque token looked up in the DB.
- Refresh token: opaque random value stored hashed, rotated on every use with reuse detection, vs
  long-lived non-rotating token.
- Device storage: `expo-secure-store` (Keychain / Keystore) for both tokens vs access token in memory only.
- Sign out and revoke: per-device session revoke vs revoke all sessions.

Already decided, not part of this spike: Sign in with Apple is iOS only (D20), and account deletion
revokes the user's Apple tokens (D21, E8-S3-T3…T5).

## Decision criteria

- Meets §6 Security (server-side verification of signature, audience, issuer, expiry; secure storage).
- A stolen refresh token stops working after one rotation.
- Simple enough to implement and explain to a developer new to auth.
- Works with D10 account deletion and E8 sign out.

## Time box

1 day.

## Output

A decision written as a comment on this issue (lifetimes, rotation rule, storage, revoke flows),
plus any follow-up issues created. The developer records it with `/adr`.

### [SP-1] Telegram deep link to a specific chat with pre-filled text

- Type: spike
- Parent: E5
- Labels: type:spike, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E10-S11 (design handoff)

## Question

Can a Telegram deep link open a **specific user's chat** (by username or by phone number) **with
the text pre-filled**, on iOS and Android? If not, confirm the fallback: copy text + open chat, or
the share link with chat picker (ba-brief §5, design-brief F5 note and A1).

## Options to compare

- `tg://resolve?domain=<username>&text=<text>` and `https://t.me/<username>?text=…`
- `tg://resolve?phone=<digits>` / `https://t.me/+<digits>` (with and without text)
- `tg://msg?text=…` / `https://t.me/share/url?url=…&text=…` (chat picker, used for "Share via Telegram")
- Copy to clipboard, then open the chat (design-brief F5 fallback toast "Greeting copied — paste it in Telegram")

## Decision criteria

- Works with Telegram installed on both platforms, for username and for phone contacts.
- How text with emoji, line breaks and ~4,000 characters survives URL encoding.
- How the app detects that Telegram can't be opened (S-09), including iOS `LSApplicationQueriesSchemes`.
- Channels are fixed (D22): "Telegram" for a direct chat, including the copy-and-open fallback;
  "Telegram share" for the chat picker.

## Time box

½ day.

## Output

A decision written as a comment on this issue (link formats per case and the fallback), plus any
follow-up issues created. The developer records it with `/adr`. Blocks E5-S3.

### [SP-2] Reminder delivery: server push vs local notifications

- Type: spike
- Parent: E7
- Labels: type:spike, area:backend, area:mobile, priority:p0
- Milestone: M2
- Size: M
- Blocked by: SP-4

## Question

Should birthday reminders be sent by a **server-side scheduled job + Expo push**, or scheduled as
**local notifications on the device** (ba-brief §5 SP-2, D3, §6 Reliability)?

## Options to compare

- Server job (cron/worker) computes due reminders per user and sends Expo push messages.
- Local notifications scheduled on the phone with `expo-notifications`, re-scheduled when friends or settings change.
- Hybrid (local scheduling, server only stores settings).

## Decision criteria

- Fires at the chosen time in the phone's **current** time zone (D18, §6 Reliability): 09:00 in
  Tbilisi, then 09:00 in Berlin after travel. The spike defines what happens on the day of travel.
- Still works when the app hasn't been opened for weeks.
- No duplicates with several devices on one account; a signed-out device gets no reminders (D18).
- In-advance reminders are one notification per friend; several birthdays today are grouped (D18, S-15).
- Respects platform limits (e.g. iOS cap on pending local notifications) with 300 friends.
- Hosting needs (cron/worker) for SP-3; cost and complexity for a solo developer.

## Time box

1 day.

## Output

A decision written as a comment on this issue, plus the follow-up delivery issues it creates under
E7-S4 (scheduler/worker and sending for the server option, or local scheduling for the device
option). The developer records it with `/adr`. If local notifications win, E7-S3 is closed as not planned.

### [SP-3] Hosting: VPS with Docker Compose vs PaaS

- Type: spike
- Parent: E9
- Labels: type:spike, area:infra, priority:p0
- Milestone: M4
- Size: M
- Blocked by: SP-2

## Question

Where do the API and the production Postgres run: a VPS with Docker Compose (e.g. Hetzner) or a
PaaS with managed Postgres (Railway, Render, Fly.io)? (ba-brief §5 SP-3)

## Options to compare

- VPS + Docker Compose (existing `docker/api.Dockerfile`), self-managed Postgres and backups.
- PaaS with managed Postgres and built-in deploys from GitHub.

## Decision criteria

- Monthly cost at MVP scale; automatic backups and restore (§7 E9).
- Ease of deploys and rollbacks for a solo developer; HTTPS out of the box (§6 Security).
- Cron/worker support if SP-2 picks server-side reminders.
- How migrations run on deploy (§6 Quality) and where logs are read.

## Time box

1 day.

## Output

A decision written as a comment on this issue, plus any follow-up issues created. The developer
records it with `/adr`. Blocks E9-S1 and E9-S2.

### [E0] Foundations

- Type: epic
- Labels: type:epic, area:infra, area:shared, area:backend, area:mobile, priority:p0
- Milestone: M1
- Size: —

## Goal

The remaining groundwork that every feature relies on: clear dev/prod environments and secrets,
one error convention across API and app, data that stays visible offline, development builds for
native modules, and error tracking. Most of ba-brief §7 E0 already exists (see "Already in place").

## Scope

- Environment and secrets conventions (dev, prod)
- Error-code catalogue in `libs/contracts`, full mobile API client
- Server-state cache with offline read (§6 Offline behavior)
- `expo-dev-client` development builds (needed by Google Sign-In and push)
- Error-tracking tool choice and integration (§6 Observability)

## Out of scope

- Hosting, production database, release builds (E9)
- 5-tab navigation shell (E1)
- Anything listed under "Already in place"

## Screens

None directly (cross-cutting).

## Stories

(sub-issues)

## Done when

- A new contributor can tell which env vars exist per environment and where secrets live.
- API errors reach the app as typed codes and are shown as readable messages with retry.
- The app runs as a development build on an iOS simulator and an Android device.
- Errors from the API and the app appear in the chosen error-tracking tool (by M3).

### [E0-S1] Separate dev and prod environments with safe secrets

- Type: story
- Parent: E0
- Labels: type:story, area:infra, area:mobile, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E10-S11 (design handoff)

## User story

As the developer, I want clearly separated development and production configuration, so that I
never ship a dev API URL or leak a secret into the app bundle or the repo.

## Context

ba-brief §7 E0 ("environments (dev/prod), config and secrets") and §6 Security. The API already
validates env vars in `apps/api/src/env.ts`; the app reads `EXPO_PUBLIC_API_URL`.

## Acceptance criteria

- [ ] Given the docs, when I look for a variable, then I find for each environment (local, CI, production API, EAS builds) where it is set and whether it is secret.
- [ ] Given a development build, when it starts, then it calls the local/dev API; given a production build, then it calls the production API URL.
- [ ] Given any `EXPO_PUBLIC_*` variable, then it contains no secret (it ships in the bundle).
- [ ] Given a missing or invalid required variable, when the API starts, then it fails fast with a readable message (already true; keep it true for new vars).

## Business rules

- Never commit `.env`; new variables go to `.env.example` with a comment (root CLAUDE.md).

## Non-functional

- §6 Security: secrets only from env vars / platform secret stores.

## Dependencies

Blocked by: E10-S11 (design first)

## Assumptions / open questions

- Assumption: two environments only (dev and prod); no staging (ba-brief §7 says "dev/prod").
- Assumption: production values are filled in E9 once hosting is chosen (SP-3).

## Tasks

(sub-issues)

### [E0-S1-T1] Document environments and secrets handling

- Type: task
- Parent: E0-S1
- Labels: type:task, area:infra, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

Write a short doc (e.g. `docs/environments.md`, linked from README) listing every env var per
environment and where its value lives: `.env` (local), GitHub Actions secrets (CI), host secret
store (prod, filled in E9), EAS environment variables (app builds).

## Details

- Table: variable · used by (api/mobile/CI) · local · CI · prod · secret yes/no.
- Rule of thumb for `EXPO_PUBLIC_*` (public, bundled) vs server-only secrets.
- How to rotate a secret.

## Done when

- [ ] Doc exists and covers all variables in `.env.example` and `ci.yml`.
- [ ] `.env.example` comments point at the doc.

## Learning notes

- Build-time vs runtime config: `EXPO_PUBLIC_*` is like `VITE_*`/`NEXT_PUBLIC_*`, inlined into the bundle.
- Where secrets live in CI (GitHub Actions secrets) vs on a server (env vars from the host's secret store).

### [E0-S1-T2] API base URL per EAS build profile

- Type: task
- Parent: E0-S1
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E0-S1-T1

## What

Make the API base URL come from the EAS build profile (development / preview / production) instead
of a single `EXPO_PUBLIC_API_URL`, with a safe local default.

## Details

- Proposed: EAS environment variables per profile, read through `app.config.ts` or `EXPO_PUBLIC_API_URL`.
- Show the environment name somewhere harmless in dev builds (e.g. Settings app version row later) so the developer can tell builds apart.

## Done when

- [ ] A development build points at the dev API, a production build at the production URL placeholder.
- [ ] Unit test for the config helper (missing value → readable error in dev).

### [E0-S2] Shared error-handling conventions for API and app

- Type: story
- Parent: E0
- Labels: type:story, area:shared, area:backend, area:mobile, priority:p0
- Milestone: M1
- Size: L
- Blocked by: E10-S11 (design handoff)

## User story

As a user, I want clear, friendly error messages with a way to retry, so that a failed request
never leaves me stuck or shows me technical text.

## Context

ba-brief §7 E0 "error handling conventions"; design-brief states "Error: inline message with Try
again" (S-03) and "Sign-in failed. Please try again." (S-01). The API already returns
`ErrorResponse` (`libs/contracts/src/error.ts`); the app only has `apiGet`.

## Acceptance criteria

- [ ] Given any API error, then the body matches `ErrorResponse` and `code` is one of the documented codes.
- [ ] Given no network or a timeout, when the app calls the API, then it gets a typed `NETWORK_ERROR` instead of a crash.
- [ ] Given an error code, when the app shows it, then it uses a user-facing message (never the raw API `message`).
- [ ] Given a 401, then the app treats it as "session expired" (handled in E2-S3-T2).

## Business rules

- 4xx for another user's resources is `404`, never `403` (`.claude/rules/security.md`).

## Non-functional

- §6 Security: no stack traces or driver messages in responses.
- §6 Offline: actions that need the server show a clear error with retry.

## Dependencies

Blocked by: E10-S11 (design first)

## Assumptions / open questions

- Assumption: user-facing messages come from the design brief and the E10 mocks (error states, validation messages approved in E10-S11-T3); anything else uses a generic "Something went wrong. Please try again."

## Tasks

(sub-issues)

### [E0-S2-T1] Error code catalogue in contracts

- Type: task
- Parent: E0-S2
- Labels: type:task, area:shared, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

Add a shared list of error codes to `libs/contracts` (the API uses it in E0-S2-T3, the app in E0-S2-T2).

## Details

- Proposed codes: `VALIDATION_ERROR`, `UNAUTHENTICATED`, `NOT_FOUND`, `RATE_LIMITED`,
  `INTERNAL_ERROR`, plus feature codes added later (`FRIEND_NOT_FOUND`, `GREETING_NOT_FOUND`…).
- Proposed: a Zod enum or `as const` object; `errorResponseSchema.error.code` stays a string so
  older apps tolerate new codes.

## Done when

- [ ] Codes exported from `@greetday/contracts` with a unit test.

## Learning notes

- HTTP status vs application error code: status says the category, code says what happened.
- Why APIs keep codes stable: the mobile app in the store can't be updated instantly.

### [E0-S2-T2] API client: all methods, network errors, user-facing messages

- Type: task
- Parent: E0-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E0-S2-T1

## What

Extend `apps/mobile/src/api/client.ts` with `POST`/`PATCH`/`PUT`/`DELETE`, a request timeout,
`NETWORK_ERROR` for fetch failures, and a `messageFor(error)` helper mapping codes to copy.

## Details

- Keep schema validation of responses with `@greetday/contracts`.
- Leave a hook for the auth header (filled in E2-S3-T2).

## Done when

- [ ] Unit tests: success, `ErrorResponse` error, non-JSON error, network failure, timeout.
- [ ] No screen shows `ApiError.message` from the server directly.

### [E0-S2-T3] Use the error codes in the API error handler

- Type: task
- Parent: E0-S2
- Labels: type:task, area:backend, priority:p0
- Milestone: M1
- Size: XS
- Blocked by: E0-S2-T1

## What

Make `apps/api/src/error-handler.ts` return only catalogue codes from E0-S2-T1, and add a short
section to `apps/api/CLAUDE.md` on when to add a new code.

## Done when

- [ ] Unit test: every handler branch returns a catalogue code.

## Learning notes

- Mapping thrown errors (validation, not found, unexpected) to one response shape in one place, like
  an Express error middleware.

### [E0-S3] Last loaded data stays visible offline

- Type: story
- Parent: E0
- Labels: type:story, area:mobile, priority:p1
- Milestone: M1
- Size: L
- Blocked by: E0-S2

## User story

As a user, I want to see my friends and upcoming birthdays even without a connection, so that the
app is still useful on a plane or in a basement.

## Context

ba-brief §6 Offline behavior: "at minimum: last loaded data is visible, and actions that need the
server show a clear error with retry". Design: the offline pattern and boards from E10-S9 (resolved
Q15). Per-screen behavior is written into each screen story.

## Acceptance criteria

- [ ] Given I loaded a screen before, when I open it offline (also after an app restart), then I see the last loaded data.
- [ ] Given I'm offline, then the screen shows the offline pattern from E10-S9 (`S-XX / Offline` boards).
- [ ] Given I'm offline, when a refresh or a server action fails, then the cached data stays on screen and the E10-S9 failure state with "Try again" is shown.
- [ ] Given I sign out or delete my account, then the cached data is cleared from the device.

## Business rules

- Cached data belongs to the signed-in user only (D10, §6 Privacy).

## Non-functional

- §6 Offline behavior, §6 Performance (cache avoids blank screens on launch).

## Dependencies

Blocked by: E0-S2

## Assumptions / open questions

- Assumption: offline is read-only; no offline writes or sync queue in the MVP (ba-brief §6 minimum; the E10-S9 pattern shows it).
- Assumption: library choice is proposed in the task; the developer approves new dependencies.

## Tasks

(sub-issues)

### [E0-S3-T1] Server-state cache for API reads

- Type: task
- Parent: E0-S3
- Labels: type:task, area:mobile, priority:p1
- Milestone: M1
- Size: S
- Blocked by: E0-S2-T2

## What

Introduce a server-state cache for API reads and mutations (Proposed: TanStack Query, the same
library as on the web; ask before adding it) with query-key conventions per resource.

## Details

- Query keys: `['friends']`, `['friend', id]`, `['greetings', filters]`, `['me']`…
- Refetch on app focus (React Native `AppState`), pull-to-refresh helper.

## Done when

- [ ] Provider wired in `App.tsx`; a test helper wraps components with a fresh client.
- [ ] One example hook (`useHealth`) with a test.

### [E0-S3-T2] Persist the cache and detect offline

- Type: task
- Parent: E0-S3
- Labels: type:task, area:mobile, priority:p1
- Milestone: M1
- Size: S
- Blocked by: E0-S3-T1

## What

Persist the query cache to device storage and expose an "online/offline" signal for screens.

## Details

- Proposed: persister on AsyncStorage (not secure storage; no tokens in it), network status via `@react-native-community/netinfo` (ask before adding).
- Clear the persisted cache on sign out and account deletion (called from E8).

## Done when

- [ ] Restarting the app offline shows previously loaded data (manual check on both platforms).
- [ ] Unit test: `clearUserData()` empties the persisted cache.

### [E0-S3-T3] Offline pattern in the app

- Type: task
- Parent: E0-S3
- Labels: type:task, area:mobile, priority:p1
- Milestone: M1
- Size: S
- Blocked by: E0-S3-T2

## What

Build the offline pattern chosen in E10-S9 (e.g. an offline banner component, or a hook that marks
server actions as unavailable) on top of the online/offline signal from E0-S3-T2, so screen stories
only have to drop it in.

## Done when

- [ ] Component test: shown offline, hidden online, announced to screen readers; matches the E10-S9 component.

### [E0-S4] Development builds for native modules

- Type: story
- Parent: E0
- Labels: type:story, area:infra, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E10-S11 (design handoff)

## User story

As the developer, I want a development build of the app, so that I can use native modules (Google
Sign-In, push notifications, secure storage) that Expo Go doesn't include.

## Context

ba-brief §4 (Expo push, EAS Build). `eas.json` already has a `development` profile
(`developmentClient: true`) but `expo-dev-client` is not installed.

## Acceptance criteria

- [ ] Given the docs, when I follow them, then I can install a development build on an iOS simulator and on an Android device.
- [ ] Given a JS-only change, when I save, then it reloads in the development build without rebuilding.
- [ ] Given a new native dependency, then the docs say a rebuild is needed and how to do it.

## Business rules

- None.

## Non-functional

- §6 Quality: CI keeps running lint/typecheck/test; builds are not run on every PR.

## Dependencies

Blocked by: E10-S11 (design first)

## Assumptions / open questions

- Assumption: the developer has (or will create) Apple Developer and Expo accounts; device builds for iOS need the paid Apple account, simulator builds don't.

## Tasks

(sub-issues)

### [E0-S4-T1] Set up expo-dev-client and EAS development builds

- Type: task
- Parent: E0-S4
- Labels: type:task, area:infra, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E10-S11 (design handoff)

## What

Install `expo-dev-client` (`pnpm exec expo install` in `apps/mobile`), build the `development`
profile for iOS simulator and Android, and document the workflow in `apps/mobile/CLAUDE.md` / README.

## Details

- Check the existing `tools/scripts/eas-build-post-install.mjs` hook works in an EAS build.
- Document local builds (`expo run:ios`) vs EAS cloud builds and when each is needed.

## Done when

- [ ] Development build installed and running on an iOS simulator and an Android device.
- [ ] `pnpm nx affected -t lint typecheck test` stays green.
- [ ] Docs: when to rebuild (native dependency or `app.json` plugin change) vs just reload.

## Learning notes

- Expo Go vs development build: like a prebuilt browser vs your own browser build with extra native APIs.
- What a config plugin does and why native changes need a new binary.

### [E0-S5] Error tracking on the API and the app

- Type: story
- Parent: E0
- Labels: type:story, area:infra, area:backend, area:mobile, priority:p1
- Milestone: M3
- Size: L
- Blocked by: E0-S4

## User story

As the developer, I want crashes and server errors reported to one tool, so that I find problems
before my friends using the test build tell me.

## Context

ba-brief §6 Observability: "error tracking on mobile and backend (tool to be chosen in a task)".
Structured backend logs already exist (AIP-6). Scheduled in M3, before TestFlight (M4).

## Acceptance criteria

- [ ] Given an unhandled 5xx in the API, then an event with the request id and route (no personal data, no tokens) appears in the tool.
- [ ] Given a JS crash in a release-like build, then an event with a readable stack trace (source maps) appears.
- [ ] Given local development or tests, then nothing is sent.
- [ ] Given an event, then it never contains names, birthdays, phone numbers, greeting text or tokens.

## Business rules

- §6 Privacy: store only what's needed; the app doesn't send Telegram data anywhere.

## Non-functional

- §6 Observability, §6 Privacy.

## Dependencies

Blocked by: E0-S4

## Assumptions / open questions

- Assumption: a free tier is enough for the MVP.

## Tasks

(sub-issues)

### [E0-S5-T1] Choose the error-tracking tool

- Type: task
- Parent: E0-S5
- Labels: type:task, area:infra, priority:p1
- Milestone: M3
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

Compare 2–3 tools (e.g. Sentry, Bugsnag, Expo-native options) and pick one for both API and app.
Record the decision with `/adr`.

## Details

Criteria: Expo/EAS support and source maps, Node/Fastify integration, PII scrubbing, free tier,
data region.

## Done when

- [ ] ADR in `docs/decisions/` with the choice and the reasons.
- [ ] Account/project created; DSN-like values added to `.env.example` (no real values) and to the environments doc.

## Learning notes

- Logs vs error tracking: logs tell the story of every request, error tracking groups and alerts on failures.

### [E0-S5-T2] Report API errors to error tracking

- Type: task
- Parent: E0-S5
- Labels: type:task, area:backend, priority:p1
- Milestone: M3
- Size: S
- Blocked by: E0-S5-T1

## What

Send unhandled API errors (5xx) to the chosen tool from the error handler, with route, request id
and user id only.

## Details

- New env var validated in `src/env.ts`; disabled when unset and in `NODE_ENV=test`.
- Scrub request bodies and headers before sending.

## Done when

- [ ] Integration test: a forced 5xx calls the reporter with no body or headers attached.
- [ ] A test event visible in the tool from a local run with the env var set.

## Learning notes

- Fastify hooks and `setErrorHandler`: where errors pass through, similar to an Express error middleware.
- PII scrubbing: why ids are fine to log but names and birthdays are not.

### [E0-S5-T3] Report app crashes and errors to error tracking

- Type: task
- Parent: E0-S5
- Labels: type:task, area:mobile, priority:p1
- Milestone: M3
- Size: M
- Blocked by: E0-S5-T1, E0-S4-T1

## What

Integrate the chosen SDK in the app (config plugin if needed), wrap the root in an error boundary,
and upload source maps from EAS builds.

## Details

- Disabled in development and tests; environment tag from E0-S1-T2.
- Strip personal data (friend names, greeting text) from breadcrumbs.

## Done when

- [ ] A test crash in a preview build shows a readable stack trace in the tool.
- [ ] Jest tests still pass with the SDK mocked.

### [E1] Design system

- Type: epic
- Labels: type:epic, area:design, area:mobile, priority:p0
- Milestone: M1
- Size: —

## Goal

Every screen is built from the Penpot semantic tokens and shared components, inside a 5-tab
navigation shell, so the app looks like the mocks and dark mode can be added later without screen
changes (D11, D12).

## Scope

- Import the real Penpot tokens export and generate the RN theme (design-brief §2.1)
- Typography and font loading
- Shared components from design-brief §2.2
- Bottom tab navigation with Upcoming, Calendar, Friends, History, Settings (D1, design-brief §3)

## Out of scope

- Dark theme values and screens (ba-brief §2 Out of scope)
- Tablet, landscape, web
- Producing the Penpot tokens, components and mocks (E10, M0)

## Screens

Design-brief §2.1, §2.2, §3 (navigation for S-03, S-04, S-05, S-10, S-13).

## Stories

(sub-issues)

## Done when

- `libs/design-tokens` is generated from the Penpot export, with no placeholder tokens left.
- Components from §2.2 exist with the listed variants and pass the accessibility rules.
- A signed-in user sees five tabs (M1 exit criterion).

### [E1-S1] App theme generated from the Penpot tokens

- Type: story
- Parent: E1
- Labels: type:story, area:design, area:mobile, priority:p0
- Milestone: M1
- Size: L
- Blocked by: E10-S1-T5, E10-S11

## User story

As the developer, I want the app theme generated from the designer's Penpot tokens, so that colors,
type, spacing, radius and elevation match the mocks and stay in sync.

## Context

Design-brief §2.1 (token sets `core` / `light` / `dark`, theme group `mode`, token names) and §10.1
(tokens JSON export). Design: the export from E10-S1-T5 and the Tokens page from E10-S1-T4, including
the avatar color tokens (resolved Q14). Today `libs/design-tokens/tokens.json` is a placeholder and
`sync-design-tokens.mjs` supports color, dimension, fontFamily, fontWeight, number and duration only.
This is developer work (code); the Penpot side is E10-S1.

## Acceptance criteria

- [ ] Given the Penpot export, when I run `/sync-design-tokens`, then `theme.ts` contains every semantic name from design-brief §2.1 (`bg.default` … `celebration`, `type.*`, `space.*`, `radius.*`, `elevation.*`) and the avatar color tokens.
- [ ] Given the export has `light` and `dark` sets, then the theme uses the Light theme (`core` + `light`) and the structure allows a dark set later.
- [ ] Given a token type the script doesn't know, then the sync fails loudly (existing behavior).
- [ ] Given `/sync-design-tokens --check` in CI, then a stale `theme.ts` fails the build.
- [ ] Given a screen, then it uses semantic tokens only (no `palette.*` from `core`).

## Business rules

- D11: light theme only, semantic tokens. D12: one cross-platform design.

## Non-functional

- §6 Accessibility: text colors meet WCAG AA (designer's responsibility; spot-check in review).

## Dependencies

Blocked by: E10-S1-T5 (tokens export), E10-S11 (design handoff)

## Assumptions / open questions

- Assumption: if Penpot can't export typography or shadow tokens, they exist as same-named library assets (E10-S1-T3, listed in the E10-S11 handoff note) and the task maps them by hand into a small JSON next to the export.

## Tasks

(sub-issues)

### [E1-S1-T1] Import the Penpot tokens export

- Type: task
- Parent: E1-S1
- Labels: type:task, area:design, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E10-S1-T5, E10-S11

## What

Developer task (code), not for the product-designer agent. Replace the placeholder
`libs/design-tokens/tokens.json` with the Penpot export from E10-S1-T5, teach the sync script to pick
the Light theme sets (`core` + `light`) and resolve references, then update `ThemeProvider` consumers
of renamed tokens.

## Details

- Placeholder names (`color.background`, `space.md`) map to brief names (`bg.default`, `space.16`).
- Keep `size.touchTarget` (44 pt) available for `.claude/rules/mobile-ui.md`.

## Done when

- [ ] `theme.ts` regenerated; `pnpm nx affected -t lint typecheck test` green.
- [ ] Unit test for reference resolution across sets.

### [E1-S1-T2] Sync typography and elevation tokens

- Type: task
- Parent: E1-S1
- Labels: type:task, area:design, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E1-S1-T1

## What

Developer task (code). Extend `sync-design-tokens.mjs` for composite typography (`type.display` … `type.label`) and
shadow (`elevation.*`) tokens, producing RN-ready style objects (iOS shadow props + Android elevation).

## Details

- If Penpot exports them as library assets instead, read the hand-written mapping agreed in E1-S1.

## Done when

- [ ] `theme.type.*` and `theme.elevation.*` generated; unit tests for both conversions.

### [E1-S1-T3] Text styles and font loading

- Type: task
- Parent: E1-S1
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E1-S1-T2

## What

Load the design font (`expo-font`, font files in `apps/mobile/assets/fonts`) before the first
screen renders and add a `Text` component with a `variant` prop for `type.*`.

## Details

- Keep the splash screen up until fonts are loaded.
- Respect system font size (no `allowFontScaling={false}`).

## Done when

- [ ] Component test renders each variant; snapshot-free assertions on style.
- [ ] Manual check with the largest system font on iOS and Android: no clipped text on the placeholder screens.

### [E1-S2] Navigation shell with five tabs

- Type: story
- Parent: E1
- Labels: type:story, area:mobile, priority:p0
- Milestone: M1
- Size: L
- Blocked by: E1-S1

## User story

As a signed-in user, I want five tabs (Upcoming, Calendar, Friends, History, Settings), so that I can
reach every part of the app in one tap.

## Context

D1, design-brief §3 (tabs, stack screens, global "+" action), ADR 0002 (React Navigation component API).
Design: tab bar and header components from E10-S2-T5, icons from E10-S2-T1.

## Acceptance criteria

- [ ] Given I'm signed in, when the app opens, then Upcoming is the selected tab (D1).
- [ ] Given the tab bar, then tabs appear in the order Upcoming, Calendar, Friends, History, Settings, each with icon + label and an accessibility label.
- [ ] Given Upcoming, Calendar or Friends, then the header has a "+" button that opens Add Friend (placeholder until E3-S3).
- [ ] Given a stack screen (Friend Profile, Add/Edit Friend, Compose, Greeting Detail, Reminder Settings, Friend's greetings), then it is pushed over the tabs with a back action.
- [ ] Given an iPhone SE size screen, then the tab bar and headers don't clip.

## Business rules

- D1. Tab icons from one open-source set (design-brief §2.3).

## Non-functional

- §6 Accessibility: 44 × 44 pt tap targets, screen-reader labels.

## Dependencies

Blocked by: E1-S1

## Assumptions / open questions

- Assumption: the icon set is the one chosen in E10-S2-T1; `@expo/vector-icons` is already installed and may cover it.

## Tasks

(sub-issues)

### [E1-S2-T1] Bottom tab navigator with placeholder screens

- Type: task
- Parent: E1-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E10-S11 (design handoff)

## What

Add `@react-navigation/bottom-tabs` (ask before adding), a `MainTabs` navigator in
`src/navigation/` with its own param list, nested in the root stack, and five placeholder screens
with the S-xx comment. Style the tab bar with tokens (design-brief §2.2 "Bottom tab bar").

## Details

- Replace the current `Home` placeholder with `MainTabs` as the initial route.

## Done when

- [ ] Test: renders five tabs in order, Upcoming selected by default; pressing a tab switches screens.

### [E1-S2-T2] Stack screens and the global "+" add-friend action

- Type: task
- Parent: E1-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E1-S2-T1

## What

Register placeholder stack routes with typed params (`FriendProfile { friendId }`,
`EditFriend { friendId? }`, `Compose { friendId, text? }`, `GreetingDetail { greetingId }`,
`ReminderSettings`, `FriendGreetings { friendId }`) and a header "+" on Upcoming, Calendar and Friends.

## Details

- Pass ids in params, not objects (`apps/mobile/CLAUDE.md`).

## Done when

- [ ] Test: "+" on each of the three tabs navigates to `EditFriend` without a `friendId`.

### [E1-S3] Core components for the first-run screens

- Type: story
- Parent: E1
- Labels: type:story, area:mobile, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E1-S1

## User story

As the developer, I want the buttons and empty-state blocks from the design system, so that the
M1 screens (S-01, S-02, empty Upcoming) match the mocks.

## Context

Design-brief §2.2 (Primary / secondary / destructive / text buttons, Empty state block, Section
header) and §2.3 (variants `type` × `state`). Design: `Button` from E10-S2-T1, `Empty state block`
from E10-S2-T4, `Section header` from E10-S2-T2. Remaining components are in E1-S4 (M2), built when
the first screen needs them.

## Acceptance criteria

- [ ] Given each button variant, then default, pressed, disabled and loading states render from tokens.
- [ ] Given a loading button, then it shows a spinner, ignores presses and announces "loading" to screen readers.
- [ ] Given the empty state block, then it shows illustration slot, title, text and an optional primary action.
- [ ] Given any of these components, then the tap area is at least 44 × 44 pt and it has an accessibility role and label.

## Business rules

- D11, D12.

## Non-functional

- §6 Accessibility (contrast, tap targets, labels, larger fonts).

## Dependencies

Blocked by: E1-S1

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E1-S3-T1] Button component

- Type: task
- Parent: E1-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

`Button` with `type=primary|secondary|destructive|text` and `state=default|pressed|disabled|loading`.

## Done when

- [ ] Tests: press handler, disabled, loading (no press, accessibility state busy).

### [E1-S3-T2] Empty state block and section header

- Type: task
- Parent: E1-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E1-S3-T1

## What

`EmptyState` (illustration slot, title, body, optional action) and `SectionHeader` (with
`accessibilityRole="header"`).

## Done when

- [ ] Tests: renders copy and action; header role present.

### [E1-S4] Components for lists, forms and feedback

- Type: story
- Parent: E1
- Labels: type:story, area:mobile, priority:p0
- Milestone: M2
- Size: — (≈4 days of tasks)
- Blocked by: E1-S3

## User story

As the developer, I want the remaining shared components, so that the Friends, Upcoming, Compose
and History screens are consistent and quick to build.

## Context

Design-brief §2.2: Avatar (initials, deterministic background from name, sizes S/M/L), Birthday row,
Text field, Multiline text area, Chip, Segmented control, Toggle row, Toast, Confirmation dialog,
Bottom sheet, Badge ("Today", "Greeted"). D9 initials only. Design: E10-S2-T2 (avatar, badge, rows),
E10-S2-T3 (form components), E10-S2-T4 (toast, dialog, bottom sheet); avatar color tokens from
E10-S1-T2 (resolved Q14).

## Acceptance criteria

- [ ] Given a name, then the avatar shows its initials and always the same background color for the same name (D9).
- [ ] Given a birthday row, then it shows avatar (M), name, date, optional age, relative label ("Today", "Tomorrow", "in N days", D17) and optional "Greeted" badge, and it's one accessible element with a combined label.
- [ ] Given a text field, then default, focused, error (with message) and disabled states render; errors are announced to screen readers.
- [ ] Given a text area with a maximum length, then it stops accepting input at the limit (4,096 for Compose, D22).
- [ ] Given a chip, then it can be removable with a labelled remove button.
- [ ] Given a segmented control, then it supports an optional "nothing selected" state (closeness can be cleared, design-brief F4).
- [ ] Given a toast, then it auto-hides and is announced to screen readers.
- [ ] Given a confirmation dialog with a destructive action, then the destructive button uses `status.danger` and the copy passed in.
- [ ] Given status badges, then they pair color with text or icon (design-brief §2 Accessibility).

## Business rules

- D9, D11, D12.

## Non-functional

- §6 Accessibility. §6 Performance: list rows are memoized (`.claude/rules/mobile-ui.md`).

## Dependencies

Blocked by: E1-S3

## Assumptions / open questions

- Assumption: toast and bottom sheet may use a library; the developer approves the dependency.

## Tasks

(sub-issues)

### [E1-S4-T1] Avatar and badge

- Type: task
- Parent: E1-S4
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

`Avatar` (initials, sizes S/M/L, background picked from the avatar color tokens by a stable hash of
the name) and `Badge` ("Today", "Greeted").

## Done when

- [ ] Unit tests: initials for one-word, two-word and three-word names; same name → same color.

### [E1-S4-T2] Birthday row

- Type: task
- Parent: E1-S4
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E1-S4-T1

## What

`BirthdayRow` used by S-03, S-04 and (with a different trailing slot) S-05.

## Done when

- [ ] Tests: with and without age, with "Greeted" badge, combined accessibility label.

### [E1-S4-T3] Text field and multiline text area

- Type: task
- Parent: E1-S4
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: M
- Blocked by: E10-S11 (design handoff)

## What

`TextField` (label, helper, error, disabled, optional character counter) and an auto-growing
`TextArea` with a counter that can switch to `status.warning` and an optional hard maximum length
(used by Compose: 4,096, D22).

## Done when

- [ ] Tests: error message shown and announced; counter value and warning state.

### [E1-S4-T4] Chip, segmented control and toggle row

- Type: task
- Parent: E1-S4
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: M
- Blocked by: E10-S11 (design handoff)

## What

`Chip` (static and removable), `SegmentedControl` (optional value, clearable), `ToggleRow` (label,
switch, disabled).

## Done when

- [ ] Tests: removing a chip, clearing a segmented value, disabled toggle ignores presses.

### [E1-S4-T5] Toast and confirmation dialog

- Type: task
- Parent: E1-S4
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

A `useToast()` API with one visible toast at a time, and a `ConfirmDialog` with title, body,
cancel and a (optionally destructive) confirm.

## Done when

- [ ] Tests: toast shows and hides; dialog confirm and cancel callbacks.

### [E1-S4-T6] Bottom sheet

- Type: task
- Parent: E1-S4
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

A `BottomSheet` component (used by S-09 and the History friend picker) with a labelled close action
and screen-reader focus moved into the sheet.

## Done when

- [ ] Test: opens with content, closes on Cancel; manual check on both platforms.

### [E2] Authentication

- Type: epic
- Labels: type:epic, area:mobile, area:shared, area:backend, area:db, priority:p0
- Milestone: M1
- Size: —

## Goal

The user gets into the app with one tap (Sign in with Apple on iOS, Google on iOS and Android, D20), stays signed in safely, and
is asked for notification permission with a clear reason on first run (F1).

## Scope

- Provider ID token verification on the server, own access + refresh tokens (ba-brief §4 Auth)
- Users, auth identities and refresh sessions
- Sign In screen S-01, first-run priming S-02, session restore, sign-out endpoint
- Rate limiting on auth endpoints and security headers (§6 Security)

## Out of scope

- Email/password, other providers
- Sign-out and delete-account UI (E8)
- Push token registration (E7)

## Screens

S-01, S-02

## Stories

(sub-issues)

## Done when

- M1: a user can sign in with Apple (iOS) or Google (iOS and Android) and sees the empty tabbed app.
- Restarting the app keeps the user signed in; an expired session sends them back to S-01.

### [E2-S1] Account created on first sign-in

- Type: story
- Parent: E2
- Labels: type:story, area:shared, area:backend, area:db, priority:p0
- Milestone: M1
- Size: — (≈3.5 days of tasks)
- Blocked by: SP-4, SP-5

## User story

As a new user, I want my account created the first time I sign in with Apple or Google, so that I
don't need a password and my data is tied to me.

## Context

ba-brief §4 Auth ("the app gets an ID token from Apple/Google; the backend verifies it and issues
its own access token + refresh token"), entities User and Auth identity; design-brief F1.

## Acceptance criteria

- [ ] Given a valid Google or Apple ID token, when the app calls sign-in, then the API returns an access token, a refresh token and the user profile.
- [ ] Given the same provider account signs in again, then the same user is returned (no duplicate user).
- [ ] Given an ID token with a bad signature, wrong audience, wrong issuer or past expiry, then the API returns `401 UNAUTHENTICATED` and creates nothing.
- [ ] Given Apple sends the user's name only on the first sign-in, then the name is stored then and kept on later sign-ins.
- [ ] Given more than the allowed number of auth requests from one client, then the API returns `429 RATE_LIMITED`.
- [ ] Given any response, then it contains no provider tokens and no internal ids beyond the user id.

## Business rules

- One user per provider account. Signing in with Apple and with Google creates two separate accounts, even with the same email; there is no account linking (D20).
- Sign in with Apple is offered on iOS only (D20).

## Non-functional

- §6 Security: server-side verification (signature, audience, issuer, expiry), input validation, rate limiting on auth endpoints, HTTPS (prod, E9).
- §6 Privacy: store only id, provider, provider user id, email and display name (plus the Apple refresh token needed for revocation, E8-S3-T3, D21).

## Dependencies

Blocked by: SP-4, SP-5

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E2-S1-T1] Users and auth identities tables

- Type: task
- Parent: E2-S1
- Labels: type:task, area:db, priority:p0
- Milestone: M1
- Size: S
- Blocked by: SP-4

## What

Drizzle schema and migration for `users` and `auth_identities`, per the SP-4 decision.

## Details

Proposed:

- `users(id uuid pk, display_name text null, email text null, created_at, updated_at)`
- `auth_identities(id uuid pk, user_id fk → users on delete cascade, provider text ('apple'|'google'), provider_user_id text, email text null, created_at)`
- Unique index on `(provider, provider_user_id)`; index on `user_id`.

## Done when

- [ ] Migration generated, SQL reviewed with the developer, applied locally and in the test DB.
- [ ] `pnpm nx test api` green.

## Learning notes

- Unique constraint vs "check then insert" in code: only the database can guarantee no duplicates under concurrency.
- Foreign keys and `ON DELETE CASCADE`: what happens to child rows when a user is deleted (D10).

### [E2-S1-T2] Auth contracts

- Type: task
- Parent: E2-S1
- Labels: type:task, area:shared, priority:p0
- Milestone: M1
- Size: XS
- Blocked by: SP-5

## What

Zod schemas in `libs/contracts` for sign-in, refresh, sign-out and the current user.

## Details

Proposed:

- `signInRequest { provider: 'apple' | 'google', idToken: string, displayName?: string (max 60), authorizationCode?: string (Apple only; exchanged for a refresh token so account deletion can revoke it, D21, E8-S3-T4) }`
- `tokenResponse { accessToken, accessTokenExpiresAt, refreshToken, user: meResponse }`
- `refreshRequest { refreshToken }`, `meResponse { id, displayName | null, email | null, provider }`

## Done when

- [ ] Schemas exported with inferred types; unit tests for valid and invalid payloads.

## Learning notes

- Contracts first: the app and the API share one schema, like sharing types between a Next.js page and its API route.

### [E2-S1-T3] Verify Google ID tokens

- Type: task
- Parent: E2-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E2-S1-T2

## What

A `verifyGoogleIdToken(idToken)` function in `apps/api` that checks signature (Google JWKS),
`aud` (our iOS/Android/web client ids), `iss`, `exp`, and returns `{ providerUserId: sub, email, name }`.

## Details

- Client ids from validated env vars (added to `.env.example`).
- Proposed library: `jose` or Google's official library (ask before adding).

## Done when

- [ ] Unit tests with locally signed test tokens: valid, wrong audience, wrong issuer, expired, bad signature.

## Learning notes

- What a JWT is (header.payload.signature) and why the signature is checked with the provider's public keys (JWKS).
- `aud` and `iss`: making sure the token was issued by Google **for this app**.

### [E2-S1-T4] Verify Apple ID tokens

- Type: task
- Parent: E2-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E2-S1-T2

## What

A `verifyAppleIdToken(idToken, nonce?)` function: Apple JWKS signature, `aud` = the iOS bundle id
(Apple sign-in is iOS only, D20), `iss` = `https://appleid.apple.com`, `exp`, optional nonce.

## Details

- Apple may return a private-relay email; store it as is.

## Done when

- [ ] Unit tests: valid, wrong audience, expired, bad signature, nonce mismatch.

## Learning notes

- Nonces: protecting against a captured token being replayed.

### [E2-S1-T5] Sign-in endpoint: find or create the user

- Type: task
- Parent: E2-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E2-S1-T1, E2-S1-T3, E2-S1-T4, E2-S2-T1

## What

`POST /auth/sign-in`: verify the provider token, find the auth identity or create user + identity
in one transaction, create a refresh session, return `tokenResponse`.

## Details

Proposed:

- 200 `tokenResponse`; 400 `VALIDATION_ERROR`; 401 `UNAUTHENTICATED` (bad provider token).
- Public route (comment says so, `.claude/rules/security.md`).
- Log user id and provider only.

## Done when

- [ ] Integration tests: new user created; returning user gets same id; invalid token → 401 and no rows; Apple name kept on second sign-in.

## Learning notes

- Database transactions: both rows are created or neither is.
- "Find or create" race conditions and how the unique index from T1 protects you.

### [E2-S1-T6] Rate limiting, CORS and security headers

- Type: task
- Parent: E2-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

Register `@fastify/rate-limit` (strict limits on `/auth/*`), `@fastify/helmet` and `@fastify/cors`
as `.claude/rules/security.md` requires once auth exists.

## Details

- Proposed: e.g. 10 requests/minute per IP on `/auth/*`; 429 returns `ErrorResponse` with `RATE_LIMITED`.
- CORS: the native app doesn't need it; allow none by default and document why.

## Done when

- [ ] Integration test: the 11th sign-in call in a minute returns 429 `RATE_LIMITED`.

## Learning notes

- Why rate limits matter most on auth endpoints (credential stuffing, token guessing).
- CORS is a browser protection; native apps don't send preflights.

### [E2-S2] Stay signed in: refresh and sign out on the server

- Type: story
- Parent: E2
- Labels: type:story, area:backend, area:db, priority:p0
- Milestone: M1
- Size: — (≈2.5 days of tasks)
- Blocked by: SP-4, SP-5

## User story

As a user, I want to stay signed in between app launches and be able to sign out, so that I don't
sign in every time and my session can be ended.

## Context

ba-brief §4 Auth, entity Refresh session, SP-5 decision. Sign-out UI is E8-S2.

## Acceptance criteria

- [ ] Given a valid access token, when I call a protected route, then `request.user` is set; without one, the API returns `401 UNAUTHENTICATED`.
- [ ] Given a valid refresh token, when I refresh, then I get a new access token and a new refresh token, and the old refresh token stops working.
- [ ] Given a refresh token that was already used (reuse), then the whole session is revoked and the API returns 401.
- [ ] Given I sign out, then my refresh token is revoked and can't be used again.
- [ ] Given `GET /me`, then it returns my display name, email and provider (for S-13).

## Business rules

- Lifetimes and rotation per SP-5.

## Non-functional

- §6 Security: tokens never logged; refresh tokens stored hashed.

## Dependencies

Blocked by: SP-4, SP-5

## Assumptions / open questions

- None beyond SP-5.

## Tasks

(sub-issues)

### [E2-S2-T1] Refresh sessions table

- Type: task
- Parent: E2-S2
- Labels: type:task, area:db, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E2-S1-T1

## What

Drizzle schema and migration for refresh sessions.

## Details

Proposed: `refresh_sessions(id uuid pk, user_id fk on delete cascade, token_hash text unique,
expires_at timestamptz, revoked_at timestamptz null, replaced_by uuid null, created_at, updated_at)`;
index on `user_id`.

## Done when

- [ ] Migration reviewed and applied locally; `pnpm nx test api` green.

## Learning notes

- Why store a hash of the refresh token (like a password) instead of the token itself.
- Nullable timestamp columns as state (`revoked_at IS NULL` = active).

### [E2-S2-T2] Auth plugin and GET /me

- Type: task
- Parent: E2-S2
- Labels: type:task, area:backend, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E2-S1-T5

## What

A Fastify plugin that verifies the access token on every route except public ones, sets
`request.user`, and a `GET /me` route returning `meResponse`.

## Details

- 401 `UNAUTHENTICATED` for missing, malformed or expired tokens.
- Add the user id to the request log context (not the token).

## Done when

- [ ] Integration tests: no token → 401, expired → 401, valid → 200 `/me` parsed with the contract.

## Learning notes

- Fastify `decorateRequest` + `onRequest` hook: like middleware in Next.js that runs before every route.

### [E2-S2-T3] Refresh endpoint with token rotation

- Type: task
- Parent: E2-S2
- Labels: type:task, area:backend, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E2-S2-T1, E2-S1-T5

## What

`POST /auth/refresh`: look up the session by token hash, check not expired or revoked, rotate
(new session row, old marked replaced), return `tokenResponse`; reuse of a replaced token revokes
the chain.

## Details

Proposed: 200 `tokenResponse`; 401 `UNAUTHENTICATED` for unknown, expired, revoked or reused tokens.
Rate limited like the other `/auth/*` routes.

## Done when

- [ ] Integration tests: rotate once; reuse old token → 401 and new token also revoked; expired → 401.

## Learning notes

- Refresh token rotation and reuse detection (OAuth 2.0 Security Best Current Practice).

### [E2-S2-T4] Sign-out endpoint

- Type: task
- Parent: E2-S2
- Labels: type:task, area:backend, priority:p0
- Milestone: M1
- Size: XS
- Blocked by: E2-S2-T3

## What

`POST /auth/sign-out` with the refresh token: revoke that session. Idempotent.

## Details

Proposed: 204 always for a well-formed request (don't reveal whether the token existed).

## Done when

- [ ] Integration test: after sign-out, refresh with that token → 401.

## Learning notes

- Idempotent endpoints: calling twice has the same effect as once, so retries are safe.

### [E2-S3] Sign in with Apple or Google

- Type: story
- Parent: E2
- Labels: type:story, area:mobile, priority:p0
- Milestone: M1
- Size: — (≈4 days of tasks)
- Blocked by: SP-5, E2-S1, E2-S2, E1-S2, E1-S3, E0-S4

## User story

As a new user, I want to sign in with Apple or Google in one tap, so that I don't need a password.

## Context

Design-brief F1 / S-01 (all four states), flow 1 "First run"; D19, D20. Design: E10-S3-T1, Penpot
boards `S-01 / Default`, `S-01 / Loading`, `S-01 / Error`, `S-01 / Cancelled`,
`S-01 / Default (Android)`.

## Acceptance criteria

- [ ] Given S-01 on iOS, then "Continue with Apple" and "Continue with Google" are equal size and stacked, following each provider's button guidelines, with the value proposition and the Terms/Privacy footer.
- [ ] Given S-01 on Android, then only "Continue with Google" is shown (D20).
- [ ] Given I tap a provider button, then that button shows a spinner and both buttons are disabled until the flow ends.
- [ ] Given sign-in fails (provider or API error, or offline), then "Sign-in failed. Please try again." appears under the buttons and both buttons are enabled again.
- [ ] Given I cancel the provider dialog, then S-01 returns to default silently.
- [ ] Given sign-in succeeds and S-02 was never shown on this installation, then S-02 is shown; otherwise Upcoming is shown (D19).
- [ ] Given I'm signed in and restart the app, then I land on Upcoming without seeing S-01.
- [ ] Given my access token expired, when the app calls the API, then it refreshes once and retries; if refresh fails, then I'm sent to S-01.
- [ ] Given tokens on the device, then they are stored only in secure storage (Keychain / Keystore).

## Business rules

- F1, D19 (S-02 once per installation), D20 (Apple on iOS only). Terms and Privacy links open the pages from E9-S3 (placeholder URLs until then).

## Non-functional

- §6 Security: secure device storage. §6 Accessibility: labelled buttons, 44 pt targets.

## Dependencies

Blocked by: SP-5, E2-S1, E2-S2, E1-S2, E1-S3, E0-S4

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E2-S3-T1] Secure token storage and auth state

- Type: task
- Parent: E2-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: S
- Blocked by: SP-5

## What

`expo-secure-store` wrapper for tokens and an `AuthProvider` (React context) with
`status: 'loading' | 'signedOut' | 'signedIn'`, `signIn(tokens)`, `signOut()`.

## Done when

- [ ] Unit tests with secure store mocked: restore on launch, sign in, sign out clears storage.

### [E2-S3-T2] Attach the access token and refresh on 401

- Type: task
- Parent: E2-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E2-S3-T1, E0-S2-T2, E2-S2-T3

## What

API client adds `Authorization: Bearer <access>`; on 401 it calls `/auth/refresh` once (shared
in-flight promise for parallel calls), stores the new pair and retries; on failure it signs out.

## Done when

- [ ] Unit tests: retry after successful refresh; two parallel 401s trigger one refresh; failed refresh → signed out.

### [E2-S3-T3] Sign In screen S-01

- Type: task
- Parent: E2-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E2-S3-T1

## What

`SignInScreen` with the four states from design-brief S-01 (boards from E10-S3-T1), wired to provider
flows from T4/T5; Google only on Android (D20).

## Done when

- [ ] Tests for default, loading (both disabled), error message, cancelled (back to default), Android (Google only).

### [E2-S3-T4] Google sign-in flow

- Type: task
- Parent: E2-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E2-S3-T3, E2-S1-T5, E0-S4-T1

## What

Native Google Sign-In (Proposed: `@react-native-google-signin/google-signin`, ask before adding),
send the ID token to `POST /auth/sign-in`, store tokens.

## Details

- OAuth client ids for iOS/Android/web in the Google Cloud console (dev values now, prod in E9-S5).

## Done when

- [ ] Signed in on an iOS simulator and an Android device (development build); cancel handled.
- [ ] Unit test with the module mocked: success, cancel, error.

### [E2-S3-T5] Apple sign-in flow

- Type: task
- Parent: E2-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: M
- Blocked by: E2-S3-T3, E2-S1-T5, E0-S4-T1

## What

`expo-apple-authentication` on iOS only (D20): send the identity token, nonce, first-time full name
and the authorization code (used for revocation on account deletion, D21, E8-S3-T4) to the API.
The Apple button isn't rendered on Android.

## Done when

- [ ] Signed in on an iOS device/simulator; first-time name and authorization code reach the API.
- [ ] Test: no Apple button on Android.
- [ ] Unit test with the module mocked: success, cancel, error.

### [E2-S3-T6] Signed-in and signed-out navigation

- Type: task
- Parent: E2-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M1
- Size: S
- Blocked by: E2-S3-T1, E1-S2-T1

## What

Root navigator renders the signed-out screens (S-01, S-02) or the main tabs based on auth status;
splash stays visible while the session is restored.

## Done when

- [ ] Tests: signed out → S-01; signed in → Upcoming; sign-out from anywhere → S-01 with no back navigation.

### [E2-S4] Notification permission priming on first run

- Type: story
- Parent: E2
- Labels: type:story, area:mobile, priority:p1
- Milestone: M1
- Size: S
- Blocked by: E2-S3

## User story

As a new user, I'm asked to allow notifications with a clear reason, so that I understand why
before the system dialog appears.

## Context

Design-brief F1 / S-02 and flow 1 (S-01 → S-02 → S-03 empty); D19. Design: E10-S3-T2, board
`S-02 / Default`.

## Acceptance criteria

- [ ] Given I signed in and S-02 was never shown on this installation, then S-02 shows the illustration, "Never miss a birthday", the reminder explanation, "Turn on reminders" and "Not now".
- [ ] Given I tap "Turn on reminders", then the OS permission dialog appears, and after I answer I land on Upcoming (empty state).
- [ ] Given I tap "Not now", then I land on Upcoming without the OS dialog.
- [ ] Given S-02 was already shown on this installation, then it's never shown again, even for another account (reminders can be enabled later in Settings, E7-S2).

## Business rules

- F1 / F8: priming before the OS dialog. D19: once per installation.

## Non-functional

- §6 Accessibility.

## Dependencies

Blocked by: E2-S3

## Assumptions / open questions

- Assumption: push token registration after permission is granted is done in E7-S3.

## Tasks

(sub-issues)

### [E2-S4-T1] Priming screen S-02

- Type: task
- Parent: E2-S4
- Labels: type:task, area:mobile, priority:p1
- Milestone: M1
- Size: S
- Blocked by: E2-S3-T6

## What

`NotificationPrimingScreen` with a "shown" flag in device storage, `expo-notifications`
permission request on "Turn on reminders", navigation to Upcoming afterwards.

## Done when

- [ ] Tests: both buttons; flag set; not shown on the second sign-in.

### [E3] Friends

- Type: epic
- Labels: type:epic, area:mobile, area:shared, area:backend, area:db, priority:p0
- Milestone: M2
- Size: —

## Goal

The user keeps a list of friends with birthdays and personal context (how they know them,
interests, closeness, Telegram contact), and can find, edit and delete them (F4).

## Scope

- Friend data model, validation rules and CRUD API
- Friends list with search and swipe-to-delete (S-05)
- Add / Edit Friend with validation, duplicate warning, discard and delete dialogs (S-06)
- Friend Profile header, About and Telegram sections (S-07); its Greetings section is E6-S4

## Out of scope

- Photo avatars, contact-book import (ba-brief §2)
- Per-friend reminder settings (ba-brief §2)

## Screens

S-05, S-06, S-07

## Stories

(sub-issues)

## Done when

- A friend can be added with name and birthday (year optional), enriched, found, edited and deleted on iOS and Android.
- Deleting a friend deletes their greeting history (D10).

### [E3-S1] Friends saved to my account

- Type: story
- Parent: E3
- Labels: type:story, area:shared, area:backend, area:db, priority:p0
- Milestone: M2
- Size: — (≈3.5 days of tasks)
- Blocked by: SP-4, E2-S2

## User story

As a user, I want my friends stored on my account, so that they survive reinstalling the app and
no one else can see them.

## Context

Design-brief F4 "Data fields" table; D4, D7, D8, D10; ba-brief §4 entity Friend and "Design for the AI phase".

## Acceptance criteria

- [ ] Given valid data, when I create a friend, then it's stored with name, birthday day + month, optional year, how-we-know, interests, closeness and Telegram contact.
- [ ] Given name empty or longer than 60 characters, then `400 VALIDATION_ERROR`.
- [ ] Given an impossible date (Feb 30, Apr 31, month 13), then `400 VALIDATION_ERROR`.
- [ ] Given Feb 29 without a year, then it's accepted (D5).
- [ ] Given a year in the future, a year before 1900, or a full date after today, then `400 VALIDATION_ERROR` (D15).
- [ ] Given Feb 29 with a non-leap year, then `400 VALIDATION_ERROR` (D15).
- [ ] Given how-we-know over 120 characters, more than 10 interests, or an interest over 30 characters, then `400 VALIDATION_ERROR`.
- [ ] Given closeness, then it's one of Close friend / Friend / Acquaintance or empty (D7).
- [ ] Given a Telegram username, then it's 5–32 characters of letters, digits and underscore, stored without "@"; given a phone, then it's international format with country code (D8).
- [ ] Given another user's friend id, when I read, update or delete it, then `404` (never 403).
- [ ] Given I delete a friend, then their greetings are deleted too (D10).
- [ ] Given I list friends with 300 friends, then the response arrives fast enough for S-03's ~2 s target (§6 Performance).

## Business rules

- D4, D5, D7, D8, D10, D15. Interests stay a list (ba-brief §4 AI phase).

## Non-functional

- §6 Security: every query scoped to the user; input validation on every endpoint.
- §6 Privacy: logs contain ids and counts only.

## Dependencies

Blocked by: SP-4, E2-S2

## Assumptions / open questions

- Assumption: the API returns all friends in one response (no pagination) because the MVP target is ~300 friends.

## Tasks

(sub-issues)

### [E3-S1-T1] Birthday, Telegram contact and duplicate rules in domain

- Type: task
- Parent: E3-S1
- Labels: type:task, area:shared, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

Pure functions in `libs/domain`: `isValidBirthday({ day, month, year? }, today)` (D15: year 1900 to
the current year, full date not after today, Feb 29 only with a leap year), `isLeapYear`,
`normalizeTelegramUsername` (strip "@", validate), `normalizePhone` (international format), and
`isSameFriend(a, b)` (D23: trimmed, case-insensitive name and same day and month), used by contracts
(API) and forms (app).

## Done when

- [ ] Vitest cases: Feb 29 ± year, Feb 29 2001 (rejected), Feb 30, Apr 31, future year, full date after today, today's date, 1899 (rejected), 1900; usernames with "@", 4 and 33 chars, hyphen; phones with/without "+", spaces; " anna petrova " vs "Anna Petrova" on the same day and month (duplicate), same name on another day (not duplicate).

## Learning notes

- Why rules live in `libs/domain`: one source of truth for the API (which must validate) and the app (which validates for UX).

### [E3-S1-T2] Friend contracts

- Type: task
- Parent: E3-S1
- Labels: type:task, area:shared, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S1-T1

## What

Zod schemas in `libs/contracts` for friend create, update and response, using the domain rules.

## Details

Proposed: `friend { id, name, birthday: { day, month, year: number | null }, howWeKnow: string | null,
interests: string[], closeness: 'close_friend' | 'friend' | 'acquaintance' | null,
telegram: { type: 'username' | 'phone', value } | null, lastGreetedAt: string | null (E5-S1-T5), createdAt, updatedAt }`;
`createFriend` = same without id/timestamps; `updateFriend` = full replace (PUT) or partial (PATCH), developer's choice.

## Done when

- [ ] Unit tests for each limit in the F4 data fields table.

## Learning notes

- `.max()` on every string and array: bounding input is part of security, not just UX.

### [E3-S1-T3] Friends table

- Type: task
- Parent: E3-S1
- Labels: type:task, area:db, priority:p0
- Milestone: M2
- Size: S
- Blocked by: SP-4, E2-S1-T1

## What

Drizzle schema and migration for `friends` per SP-4.

## Details

Proposed: `friends(id uuid pk, user_id fk on delete cascade, name text, birth_day smallint,
birth_month smallint, birth_year smallint null, how_we_know text null, interests text[] default '{}',
closeness text null, telegram_type text null, telegram_value text null, created_at, updated_at)`;
index on `user_id`; check constraints for day/month ranges.

## Done when

- [ ] Migration reviewed and applied locally; `pnpm nx test api` green.

## Learning notes

- Nullable columns for optional data (year unknown, D4) vs magic values.
- Check constraints: the database as the last line of validation.

### [E3-S1-T4] List and read friends endpoints

- Type: task
- Parent: E3-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S1-T2, E3-S1-T3, E2-S2-T2

## What

`GET /friends` (all of the user's friends, sorted by name) and `GET /friends/:id`.

## Details

Proposed: 200 `friend[]` / `friend`; 404 `FRIEND_NOT_FOUND` for unknown or another user's id.

## Done when

- [ ] Integration tests: list only own friends; read own; another user's id → 404; invalid uuid → 400.

## Learning notes

- `WHERE id = $1 AND user_id = $2`: why fetching by id alone is a data-leak bug.

### [E3-S1-T5] Create friend endpoint

- Type: task
- Parent: E3-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S1-T4

## What

`POST /friends` stores a friend for the authenticated user.

## Details

Proposed: 201 `friend`; 400 `VALIDATION_ERROR` with field details.

## Done when

- [ ] Integration tests: happy path with all fields, minimal (name + day/month), each validation rule, unauthenticated → 401.

## Learning notes

- 201 vs 200 and returning the created resource so the app can update its cache without refetching.

### [E3-S1-T6] Update and delete friend endpoints

- Type: task
- Parent: E3-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S1-T5

## What

`PATCH` (or `PUT`) `/friends/:id` and `DELETE /friends/:id`, both scoped to the user; delete
cascades to greetings once E5-S1-T2 exists.

## Details

Proposed: 200 `friend` / 204; 404 `FRIEND_NOT_FOUND`.

## Done when

- [ ] Integration tests: update own; clear optional fields (year, closeness, Telegram); another user's id → 404 for both; delete returns 204 and the friend is gone.

## Learning notes

- PATCH vs PUT semantics, and how to "clear" a field (send `null`) vs "leave as is" (omit).

### [E3-S1-T7] Seed sample friends

- Type: task
- Parent: E3-S1
- Labels: type:task, area:db, priority:p1
- Milestone: M2
- Size: S
- Blocked by: E3-S1-T3

## What

Fill `libs/db/scripts/seed.ts` with the design-brief §7 sample friends for a local test user, plus an
option to generate 300 fake friends for the §6 performance check.

## Details

- Fake data only (`.claude/rules/migrations.md`); local DB only (existing guard).
- Greeting history for Anna once E5-S1-T2 exists.

## Done when

- [ ] `pnpm nx run db:db:seed` is repeatable (no duplicates on a second run).

## Learning notes

- Idempotent seeds (upsert by a fixed id) vs "delete then insert".

### [E3-S2] Friends list with search

- Type: story
- Parent: E3
- Labels: type:story, area:mobile, priority:p0
- Milestone: M2
- Size: L
- Blocked by: E3-S1, E1-S4

## User story

As a user, I want an alphabetical list of my friends with search, so that I can find anyone quickly.

## Context

Design-brief F4 / S-05 (default, searching with results, search no results, empty); D16, D23.
Design: E10-S5-T1, boards `S-05 / Default`, `/ Searching`, `/ No results`, `/ Empty`,
`/ Swipe delete`; offline board `S-05 / Offline` (E10-S9-T2).

## Acceptance criteria

- [ ] Given friends, then they're listed A–Z with section headers; each row shows avatar (M), name, birthday ("Mar 14"; Feb 29 friends always "Feb 29", D16) and closeness label if set.
- [ ] Given I type in search, then the list filters to matching names only (case-insensitive, substring; D23).
- [ ] Given no match, then "No friends match "xyz"" is shown.
- [ ] Given no friends, then the F2 empty state is shown with "Add friend".
- [ ] Given I tap a row, then Friend Profile opens.
- [ ] Given loading or an error, then a loading indicator or an error with "Try again" is shown.
- [ ] Given I'm offline, then the last loaded list and search still work and the E10-S9 offline pattern is shown (E0-S3).
- [ ] Given 300 friends, then scrolling stays smooth (virtualized list).

## Business rules

- D9 initials avatar. Birthday shown without year in the list. D16, D23 (search by name only).

## Non-functional

- §6 Performance (virtualized lists), §6 Accessibility, §6 Offline.

## Dependencies

Blocked by: E3-S1, E1-S4

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E3-S2-T1] Friends list screen with A–Z sections and search

- Type: task
- Parent: E3-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: M
- Blocked by: E0-S3-T1, E3-S1-T4

## What

`FriendsScreen` (S-05) with `SectionList`, search field under the title, and all four states.

## Done when

- [ ] Tests: sections, search filter, no-results copy, empty state, error + retry.

### [E3-S2-T2] Swipe to delete a friend

- Type: task
- Parent: E3-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S2-T1, E3-S1-T6

## What

Swipe left on a row → "Delete" → confirmation "Delete Anna Petrova? Their greeting history will also
be deleted." → `DELETE /friends/:id`; list updates. Also reachable without swiping for screen-reader
users (accessibility action).

## Done when

- [ ] Tests: confirm deletes and removes the row; cancel keeps it; API error shows a message and keeps the row.

### [E3-S3] Add a friend

- Type: story
- Parent: E3
- Labels: type:story, area:mobile, priority:p0
- Milestone: M2
- Size: — (≈2.5 days of tasks)
- Blocked by: E3-S1, E1-S4

## User story

As a user, I want to add a friend with name and birthday (year optional) and optional details, so
that I get reminded and can write personal greetings.

## Context

Design-brief F4 / S-06 "New friend" (empty form, filled, validation errors, duplicate warning,
saving, "Discard changes?"); flow 1 and the global "+" (design-brief §3); D15, D23. Design:
E10-S5-T2, boards `S-06 / Empty form`, `/ Filled`, `/ Validation errors`, `/ Duplicate warning`,
`/ Saving`, `/ Discard changes`; offline board `S-06 / Save failed offline` (E10-S9-T2).

## Acceptance criteria

- [ ] Given the form, then it has sections Basics (name, birthday month + day, "Include year" toggle → year picker), About (how we know each other, interests chips, closeness) and Telegram (Username / Phone + value, helper text).
- [ ] Given required fields aren't valid, then Save is disabled.
- [ ] Given the date picker, then impossible dates can't be picked (no Feb 30); Feb 29 can be picked.
- [ ] Given "Include year" is on, then the year picker offers 1900 to the current year, the full date can't be after today, and Feb 29 needs a leap year, with the validation message from the mocks (D15).
- [ ] Given interests, then I add a chip with Enter/"Add", up to 10 chips of max 30 characters, and remove chips.
- [ ] Given closeness was selected, then I can clear it.
- [ ] Given a Telegram username, then "@" is added automatically and an invalid username shows an inline error; given Phone, then an international number with country code is required.
- [ ] Given a friend with the same name (trimmed, case-insensitive) and the same day and month exists, then a non-blocking banner "You already have Anna Petrova with the same birthday. Save anyway?" appears and I can still save (D23).
- [ ] Given I tap Save, then Save shows a spinner; on success the screen closes and the new friend appears in Friends, Upcoming and Calendar.
- [ ] Given saving fails (including offline), then my input stays and an error with retry is shown.
- [ ] Given I edited something and tap Cancel, then "Discard changes?" is asked; with no edits it closes directly.

## Business rules

- Design-brief F4 data fields table; D4, D7, D8, D15, D23.

## Non-functional

- §6 Accessibility: labelled fields, errors announced, larger fonts. §6 Offline.

## Dependencies

Blocked by: E3-S1, E1-S4

## Assumptions / open questions

- Assumption: the duplicate check runs on the device against the loaded friends list, using `isSameFriend` from E3-S1-T1.

## Tasks

(sub-issues)

### [E3-S3-T1] Basics section and Save

- Type: task
- Parent: E3-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: M
- Blocked by: E3-S1-T5, E1-S2-T2

## What

`EditFriendScreen` in "New friend" mode: header Cancel / title / Save, name, month + day picker,
"Include year" toggle with year picker, validation with domain rules, `POST /friends`, cache update.

## Done when

- [ ] Tests: Save disabled until valid; future year error; successful save closes and updates the friends cache; API error keeps input.

### [E3-S3-T2] About section

- Type: task
- Parent: E3-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S3-T1

## What

How-we-know field (max 120), interests chip input (max 10 × 30), closeness segmented control (clearable).

## Done when

- [ ] Tests: 11th chip blocked, 31-char chip blocked, clearing closeness.

### [E3-S3-T3] Telegram section

- Type: task
- Parent: E3-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S3-T1

## What

Username / Phone segmented control + field with helper text, automatic "@", inline validation via
domain rules, phone keyboard for Phone.

## Done when

- [ ] Tests: "@anna" and "anna_petrova" both saved as `anna_petrova`; too-short username error; phone without country code error.

### [E3-S3-T4] Duplicate warning and discard dialog

- Type: task
- Parent: E3-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S3-T1

## What

Non-blocking duplicate banner (`isSameFriend` from `libs/domain`, D23) and "Discard changes?"
confirmation on Cancel when the form is dirty.

## Done when

- [ ] Tests: banner shown for " anna petrova " with Anna's day and month and Save still works; no banner for another day; discard dialog only when dirty.

### [E3-S4] Edit and delete a friend

- Type: story
- Parent: E3
- Labels: type:story, area:mobile, priority:p0
- Milestone: M2
- Size: M
- Blocked by: E3-S3

## User story

As a user, I want to edit a friend's details or delete them, so that my list stays accurate.

## Context

Design-brief F4 / S-06 "Edit friend" (with "Delete friend" button and dialog), flow 4 "Enrich a
friend". Design: E10-S5-T2, boards `S-06 / Edit` and `S-06 / Delete friend`.

## Acceptance criteria

- [ ] Given I open Edit from Friend Profile, then the form shows "Edit friend" with all current values.
- [ ] Given I change values and Save, then Friend Profile, Friends, Upcoming and Calendar show the new values.
- [ ] Given I turn "Include year" off, then the year is removed and the age disappears everywhere (D4).
- [ ] Given I tap "Delete friend", then "Delete Anna Petrova? Their greeting history will also be deleted." is shown; confirming deletes the friend and their greetings, and I return to the screen before the profile (D10).
- [ ] Given the API fails, then an error with retry is shown and nothing is lost.

## Business rules

- D4, D10.

## Non-functional

- §6 Offline: edit and delete need the server; show a clear error offline.

## Dependencies

Blocked by: E3-S3

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E3-S4-T1] Edit mode

- Type: task
- Parent: E3-S4
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S3-T4, E3-S1-T6

## What

`EditFriendScreen` with a `friendId`: load, prefill, update via API, update caches.

## Done when

- [ ] Tests: prefilled values; clearing the year; save updates cache.

### [E3-S4-T2] Delete friend from the form

- Type: task
- Parent: E3-S4
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S4-T1

## What

Destructive "Delete friend" button (edit mode only) with the confirmation dialog; after delete,
pop Edit and Profile and invalidate friends and greetings caches.

## Done when

- [ ] Tests: button absent in new mode; confirm deletes and navigates back; cancel does nothing.

### [E3-S5] Friend profile

- Type: story
- Parent: E3
- Labels: type:story, area:mobile, priority:p0
- Milestone: M2
- Size: M
- Blocked by: E3-S1, E1-S4, E4-S1

## User story

As a user, I want a profile page for each friend with their birthday and what matters about them,
so that I can prepare a personal greeting.

## Context

Design-brief F4 / S-07 (full profile, minimal profile, birthday today); D16, D17. Design: E10-S5-T3,
boards `S-07 / Full`, `/ Minimal`, `/ Birthday today`; offline board `S-07 / Offline` (E10-S9-T2).
Greetings section is E6-S4.

## Acceptance criteria

- [ ] Given a friend, then the header shows avatar (L), name, "October 17" plus "· turns 30" if the year is known, and "Birthday in 23 days", "Birthday tomorrow" (Assumption, from D17) or "Birthday today", with "Edit" in the nav bar.
- [ ] Given the birthday is today, then the header uses `celebration` styling.
- [ ] Given "Write greeting", then Compose opens for this friend (wired in E5-S2-T4).
- [ ] Given About fields, then empty ones are hidden; if all are empty, then "Add details to make greetings more personal" opens Edit.
- [ ] Given a Telegram contact, then "@anna_petrova" or "+995 …" is shown; otherwise "Not linked" with an "Add" text button that opens Edit.
- [ ] Given a Feb 29 friend in a non-leap year, then the date line shows "February 29" while the countdown and "Birthday today" use Feb 28 (D5, D16).
- [ ] Given offline, then the last loaded profile is shown with the E10-S9 offline pattern.

## Business rules

- D4, D5, D8, D9, D16, D17.

## Non-functional

- §6 Accessibility, §6 Offline.

## Dependencies

Blocked by: E3-S1, E1-S4, E4-S1

## Assumptions / open questions

- Assumption: one day away reads "Birthday tomorrow" (D17 defines "Tomorrow" for list labels; the S-07 sentence isn't specified, Open question 33).

## Tasks

(sub-issues)

### [E3-S5-T1] Profile header and Write greeting action

- Type: task
- Parent: E3-S5
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S1-T4, E4-S1-T2

## What

`FriendProfileScreen` (S-07) header with domain-computed age and countdown, celebration styling,
"Edit" and "Write greeting" (navigates once Compose exists), loading/error states.

## Done when

- [ ] Tests: with and without year; birthday today; birthday tomorrow; Feb 29 in a non-leap year ("February 29" shown, countdown to Feb 28).

### [E3-S5-T2] About and Telegram sections

- Type: task
- Parent: E3-S5
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S5-T1

## What

About section (how-we-know, interest chips, closeness; empty prompt) and Telegram section
(contact or "Not linked" + "Add").

## Done when

- [ ] Tests: full profile, minimal profile prompt, not-linked Telegram.

### [E4] Upcoming & Calendar

- Type: epic
- Labels: type:epic, area:mobile, area:shared, priority:p0
- Milestone: M2
- Size: —

## Goal

The home screen answers "whose birthday is next and have I greeted them?", and the Calendar lets
the user browse birthdays by month (F2, F3), with correct date logic for missing years, Feb 29 and age.

## Scope

- Birthday date rules in `libs/domain` (next occurrence, Feb 29, age, greeted window, sections)
- Upcoming list with Today block, sections, Greeted status (S-03)
- Calendar month view with selected-day list (S-04)

## Out of scope

- .ics / calendar import (ba-brief §2)

## Screens

S-03, S-04

## Stories

(sub-issues)

## Done when

- Upcoming and Calendar show the design-brief §7 sample data correctly for "today" = Oct 17, 2026, including Mark as greeted and Laura (Feb 29).
- Upcoming is usable within ~2 s with 300 friends on a mid-range phone (§6 Performance).

### [E4-S1] Birthday date rules

- Type: story
- Parent: E4
- Labels: type:story, area:shared, priority:p0
- Milestone: M2
- Size: L
- Blocked by: E10-S11 (design handoff)

## User story

As a user, I want birthdays, ages and "greeted" status computed correctly, so that I can trust what
the app tells me, including for friends without a birth year or born on Feb 29.

## Context

D4, D5, D6 and the product owner's answers D13 (greeted window), D14 (sections), D16 (Feb 29
display), D17 (relative labels); design-brief F2 business rules and §7 sample data. All rules are pure
functions in `libs/domain` with a `today` parameter in the phone's local date (D3: phone's time zone).
The E10-S4 boards show the expected results for Oct 17 and Oct 19, 2026.

## Acceptance criteria

- [ ] Given a birthday and today, then the next occurrence is today if it's today, otherwise the next future date (within 12 months).
- [ ] Given Feb 29 and a non-leap year, then the occurrence is Feb 28 (D5, D16); in a leap year it's Feb 29.
- [ ] Given a birth year, then the age shown is the age reached at the next occurrence ("turns 31"); on the day, "Turns 30 today".
- [ ] Given no birth year, then no age is returned (D4).
- [ ] Given Laura Kim (Feb 29, 2000) and today = Oct 17, 2026, then next occurrence = Feb 28, 2027, turns 27.
- [ ] Given a greeting for a friend, then the friend is "greeted" if the greeting's local date is from 7 days before the current occurrence through the occurrence day itself; the day after the birthday the friend rolls to next year's occurrence and is no longer greeted (D6, D13).
- [ ] Given a Jan 2 birthday greeted on Dec 28, then the friend is greeted from Dec 28 through Jan 2 and not on Jan 3 (D13).
- [ ] Given Mark (Oct 17) greeted on Oct 17, 2026, then Mark is greeted today; given Anna's last greeting on Oct 17, 2025, then Anna is not greeted.
- [ ] Given today, then each friend falls into exactly one of Today, This week, This month, Later (D14): Today = birthday today; This week = from tomorrow through this Sunday (weeks run Monday–Sunday); This month = after this Sunday through the end of today's calendar month; Later = everything after that, within 12 months.
- [ ] Given this week crosses into the next month (or year), then birthdays on those days of the next month stay in This week, This month is empty (and hidden on screen), and the next month's days after Sunday are in Later (D14).
- [ ] Given days until the birthday, then the relative label is "Today" (0), "Tomorrow" (1) or "in N days" (D17).
- [ ] Given a month, then the function returns birthdays per day for the calendar grid, using Feb 28 for Feb 29 birthdays in non-leap years.

## Business rules

- D4, D5, D6, D13, D14, D16, D17. Time zone: phone's local date.

## Non-functional

- §6 Performance: computing all sections for 300 friends takes a few milliseconds (pure, no I/O).

## Dependencies

Blocked by: E10-S11 (design first)

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E4-S1-T1] Next birthday date with Feb 29

- Type: task
- Parent: E4-S1
- Labels: type:task, area:shared, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

`nextOccurrence(birthday, today)` and `daysUntil(birthday, today)` in `libs/domain`.

## Details

- Work with plain calendar dates (year, month, day), not `Date` objects with time zones.

## Done when

- [ ] Vitest table tests: today, tomorrow, Dec 31 → Jan 1, Feb 29 in leap and non-leap years, Feb 28 friend vs Feb 29 friend on Feb 28 of a non-leap year.

## Learning notes

- Calendar dates vs instants: why "Oct 17" must not become "Oct 16, 23:00 UTC".

### [E4-S1-T2] Age at the next birthday

- Type: task
- Parent: E4-S1
- Labels: type:task, area:shared, priority:p0
- Milestone: M2
- Size: XS
- Blocked by: E4-S1-T1

## What

`ageAtNextOccurrence(birthday, today)` returning `number | null` (null when no year, D4).

## Done when

- [ ] Vitest: sample data ages from design-brief §7 (Anna 30 today, Sofia 33, Daniel 36, Laura 27 in 2027).

## Learning notes

- Return `null` for "unknown" and let the UI decide copy; keeps rules and wording separate.

### [E4-S1-T3] Greeted window

- Type: task
- Parent: E4-S1
- Labels: type:task, area:shared, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E4-S1-T1

## What

`isGreeted(birthday, lastGreetedAt, today)` per D6 and D13: greeted when the greeting's local date is
within [current occurrence − 7 days, current occurrence + 1 day). `lastGreetedAt` is an instant;
convert it to the phone's local date before comparing.

## Done when

- [ ] Vitest: greeted 7 days before, 8 days before (not greeted), on the day, the day after (rolled to next year, not greeted), last year (not greeted), Jan 2 birthday greeted on Dec 28 (greeted Dec 28 – Jan 2, not on Jan 3), Feb 29 friend in a non-leap year (window Feb 21 – Feb 28).

## Learning notes

- Half-open date ranges `[start, end)`: the standard way to avoid off-by-one bugs.

### [E4-S1-T4] Upcoming sections and relative labels

- Type: task
- Parent: E4-S1
- Labels: type:task, area:shared, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E4-S1-T1

## What

`groupUpcoming(friends, today)` → `{ today, thisWeek, thisMonth, later }` per D14 (Monday–Sunday
weeks, calendar month, week crossing into the next month stays in This week), each sorted by date then
name, and `relativeLabel(days)` → "Today" / "Tomorrow" / "in N days" (D17).

## Done when

- [ ] Vitest with the design-brief §7 data:
  - Sat Oct 17, 2026: Today = Anna, Mark; This week = empty; This month = Sofia, Daniel; Later = Elena, Tom, Laura.
  - Mon Oct 19, 2026: This week = Sofia ("Tomorrow"); This month = Daniel; Later = the rest.
  - Mon Oct 26, 2026 (week ends Sun Nov 1): This week = Daniel; This month = empty; Later = Elena onward.
  - Sunday: This week is empty; Mon Dec 28, 2026: birthdays on Jan 1–3, 2027 are in This week.

## Learning notes

- Keeping grouping in `libs/domain` makes the screen a thin renderer, like a selector in Redux.
- Week and month boundaries as plain calendar dates: no time-zone math inside the grouping.

### [E4-S1-T5] Birthdays per day for a calendar month

- Type: task
- Parent: E4-S1
- Labels: type:task, area:shared, priority:p0
- Milestone: M2
- Size: XS
- Blocked by: E4-S1-T1

## What

`birthdaysByDay(friends, year, month)` → map of day → friends (Feb 29 → Feb 28 in non-leap years).

## Done when

- [ ] Vitest: Feb 2027 shows Laura on the 28th; Feb 2028 on the 29th; October 2026 shows Anna and Mark on the 17th.

## Learning notes

- Pure functions are cheap to test exhaustively; that's why date logic lives here.

### [E4-S2] Upcoming list

- Type: story
- Parent: E4
- Labels: type:story, area:mobile, priority:p0
- Milestone: M2
- Size: L
- Blocked by: E4-S1, E3-S1, E1-S4

## User story

As a user, I open the app and immediately see today's and upcoming birthdays, so that I never miss one.

## Context

Design-brief F2 / S-03 (Today block, sections, empty, no birthdays today, loading, error); flows 1
and 2; D14, D16, D17. Design: E10-S4-T1, boards `S-03 / Default`, `/ No birthdays today`, `/ Empty`,
`/ Loading`, `/ Error`, `/ One friend`; small-screen board `S-03 / Default (375×667)` (E10-S11-T2);
offline board `S-03 / Offline` (E10-S9-T2).

## Acceptance criteria

- [ ] Given birthdays today, then a Today block with highlighted cards (`celebration`) shows avatar (L), name, "Turns 30 today" or "Birthday today" (no year), and "Write greeting".
- [ ] Given no birthdays today, then there's no Today block and the list starts with "This week".
- [ ] Given sections This week, This month, Later, then they follow D14 (Monday–Sunday week, calendar month) and empty sections are hidden; e.g. on Sat Oct 17, 2026 Sofia (Oct 20) is under This month.
- [ ] Given a birthday row, then it shows avatar (M), name, date ("Tue, Oct 20"), "turns 31" if the year is known, and the relative label "Tomorrow" or "in 3 days" (D17); tapping opens Friend Profile.
- [ ] Given a Feb 29 friend in a non-leap year, then the row is positioned on Feb 28 and prints "Feb 29" (D16).
- [ ] Given no friends, then "No birthdays yet", "Add friends to start tracking their birthdays." and "Add friend" are shown.
- [ ] Given loading, then skeleton rows; given an error, then an inline message with "Try again".
- [ ] Given pull-to-refresh, then data reloads.
- [ ] Given offline, then the last loaded list is shown with the E10-S9 offline pattern and refresh shows an error without clearing it.
- [ ] Given the app returns to the foreground on a new day, then sections and "today" are recomputed.
- [ ] Given 300 friends on a mid-range phone, then the screen is usable within ~2 s (§6).
- [ ] Given an iPhone SE size screen, then critical actions aren't clipped.

## Business rules

- D1, D4, D5, D14, D16, D17 (via E4-S1).

## Non-functional

- §6 Performance (virtualized `SectionList`), §6 Accessibility, §6 Offline.

## Dependencies

Blocked by: E4-S1, E3-S1, E1-S4

## Assumptions / open questions

- Assumption: Upcoming is computed on the device from `GET /friends` with domain functions (Proposed).
- Assumption: in non-leap years a Feb 29 row prints "Feb 29" without a weekday, since that date doesn't exist that year (Open question 33).

## Tasks

(sub-issues)

### [E4-S2-T1] Upcoming sections and rows

- Type: task
- Parent: E4-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: M
- Blocked by: E4-S1-T4, E3-S1-T4, E1-S4-T2

## What

`UpcomingScreen` (S-03) with header "Upcoming" + "+", `SectionList` of This week / This month /
Later using `groupUpcoming`, rows → Friend Profile.

## Done when

- [ ] Tests with sample data on Oct 17 and Oct 19, 2026: sections per D14 and hidden empty sections; "Tomorrow" label; age shown only with a year.

### [E4-S2-T2] Loading, empty, error and refresh states

- Type: task
- Parent: E4-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E4-S2-T1

## What

Skeleton rows, empty state with "Add friend", inline error with "Try again", pull-to-refresh,
recompute on foreground/new day.

## Done when

- [ ] Tests for each state; a 300-friend render check (manual on a mid-range Android device, noted in the PR).

### [E4-S2-T3] Today block

- Type: task
- Parent: E4-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E4-S2-T1

## What

Highlighted Today cards with "Turns N today" / "Birthday today" and "Write greeting" (opens Compose,
wired in E5-S2-T4).

## Done when

- [ ] Tests: two birthdays today (Anna with year, Mark without).

### [E4-S3] See who I already greeted

- Type: story
- Parent: E4
- Labels: type:story, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E4-S2, E5-S1

## User story

As a user, I can see which friends I've already greeted for their birthday, so that I don't miss
anyone and don't greet twice by accident.

## Context

D6, D13, design-brief F2 (Today card "Greeted ✓" + "Write another"; row "Greeted" badge), flow 2, §7
"Show Mark as already greeted today". Design: E10-S4-T1 (`S-03 / Default`, Mark greeted),
E10-S11-T1 (`S-03 / Greeted after send`), badge from E10-S2-T2.

## Acceptance criteria

- [ ] Given a friend greeted within the D13 window (7 days before through the birthday), then their row shows a "Greeted" badge (text, not color only).
- [ ] Given a greeted friend in the Today block, then "Write greeting" is replaced by a "Greeted ✓" badge and a "Write another" text button that opens Compose.
- [ ] Given I save a greeting and return to Upcoming, then the badge appears without a manual refresh.
- [ ] Given I delete that greeting from History, then the badge disappears (if no other greeting is in the window).

## Business rules

- D2, D6, D13.

## Non-functional

- §6 Accessibility: badge is part of the row's accessibility label.

## Dependencies

Blocked by: E4-S2, E5-S1

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E4-S3-T1] Greeted badge and "Write another"

- Type: task
- Parent: E4-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E4-S1-T3, E5-S1-T5, E4-S2-T3

## What

Use `isGreeted` with `lastGreetedAt` from the friends list to show badges on rows and Today cards;
invalidate the friends cache after a greeting is saved or deleted.

## Done when

- [ ] Tests: Mark greeted / Anna not greeted on Oct 17, 2026; "Write another" opens Compose.

### [E4-S4] Calendar month view

- Type: story
- Parent: E4
- Labels: type:story, area:mobile, priority:p1
- Milestone: M2
- Size: L
- Blocked by: E4-S1, E3-S1, E1-S4

## User story

As a user, I want to browse birthdays by month, so that I can plan ahead.

## Context

Design-brief F3 / S-04 (month with birthdays, selected day with multiple, selected day empty, whole
app empty); D16, D17. Design: E10-S4-T2, boards `S-04 / Month with birthdays`,
`/ Selected day multiple`, `/ Selected day empty`, `/ Empty`.

## Acceptance criteria

- [ ] Given a month, then a grid with weekday header is shown and today's date is clearly marked.
- [ ] Given days with birthdays, then they show a dot, or a count badge for 2+, with an accessibility label like "October 17, 2 birthdays".
- [ ] Given header arrows or a horizontal swipe, then the previous/next month is shown; "Today" returns to the current month.
- [ ] Given I select a day, then its birthdays are listed below with the standard Birthday row (relative label "Today" for today, D17); default selection is today.
- [ ] Given the selected day has none, then "No birthdays on this day".
- [ ] Given no friends at all, then the grid is shown and the list area shows the F2 empty state message.
- [ ] Given a Feb 29 friend, then they appear on Feb 28 in non-leap years, and their row prints "Feb 29" (D5, D16).
- [ ] Given "+", then Add Friend opens.
- [ ] Given offline, then the last loaded data is used with the E10-S9 offline pattern.

## Business rules

- D4, D5, D16, D17.

## Non-functional

- §6 Accessibility (grid cells ≥ 44 pt, labelled), §6 Offline.

## Dependencies

Blocked by: E4-S1, E3-S1, E1-S4

## Assumptions / open questions

- Assumption: the grid starts on Monday, consistent with the Monday–Sunday week of D14 and the E10-S4-T2 boards.

## Tasks

(sub-issues)

### [E4-S4-T1] Month grid with birthday markers

- Type: task
- Parent: E4-S4
- Labels: type:task, area:mobile, priority:p1
- Milestone: M2
- Size: M
- Blocked by: E4-S1-T5, E3-S1-T4

## What

`CalendarScreen` (S-04) grid built from `birthdaysByDay`, today marker, dots/count badges, selectable days.

## Done when

- [ ] Tests: October 2026 sample data; February 2027 shows Laura on the 28th.

### [E4-S4-T2] Month navigation and Today

- Type: task
- Parent: E4-S4
- Labels: type:task, area:mobile, priority:p1
- Milestone: M2
- Size: S
- Blocked by: E4-S4-T1

## What

Previous/next arrows, horizontal swipe between months, "Today" text button.

## Done when

- [ ] Tests: arrows change month; Today resets month and selection.

### [E4-S4-T3] Selected day list and empty states

- Type: task
- Parent: E4-S4
- Labels: type:task, area:mobile, priority:p1
- Milestone: M2
- Size: S
- Blocked by: E4-S4-T1

## What

List of Birthday rows for the selected day, "No birthdays on this day", whole-app empty state.

## Done when

- [ ] Tests: multiple birthdays, empty day, no friends.

### [E5] Compose & Telegram

- Type: epic
- Labels: type:epic, area:mobile, area:shared, area:backend, area:db, priority:p0
- Milestone: M2
- Size: —

## Goal

The user writes a personal greeting with the friend's context in view and hands it off to Telegram
in 1–2 taps; the greeting is saved to history when they tap the Telegram button (F5, D2).

## Scope

- Greetings data model and save API (channel, full text, timestamps)
- Compose screen with recipient strip, context panel and last greeting (S-08)
- Telegram hand-off per SP-1, share fallback, copy text, Telegram unavailable sheet (S-09)

## Out of scope

- AI greeting generation (reserve space only, ba-brief §2)
- Messengers other than Telegram, Telegram bot or MTProto (ba-brief §2)
- Confirming that the message was actually sent (D2)

## Screens

S-08, S-09

## Stories

(sub-issues)

## Done when

- M2: from Upcoming or Friend Profile, a user writes a greeting, Telegram opens with it, and the greeting is in the database.
- "Copy text" alone never saves (D2); Telegram unavailable never saves (S-09).

### [E5-S1] Greetings saved on the server

- Type: story
- Parent: E5
- Labels: type:story, area:shared, area:backend, area:db, priority:p0
- Milestone: M2
- Size: — (≈2.5 days of tasks)
- Blocked by: SP-4, E3-S1

## User story

As a user, I want every greeting I hand off to Telegram saved with its text and date, so that I can
look back at what I wrote and avoid repeating myself.

## Context

D2, D10; ba-brief §4 entity Greeting and "Design for the AI phase"; design-brief F5, S-07, S-08 "Last greeting".

## Acceptance criteria

- [ ] Given a friend of mine and non-empty text, when the app saves a greeting, then it's stored with friend, full text, channel and created-at, and returned.
- [ ] Given empty text or text longer than 4,096 characters, then `400 VALIDATION_ERROR` (D22).
- [ ] Given another user's friend id, then `404`.
- [ ] Given a friend, when the app lists their greetings, then they're newest first with a total count (for "See all (n)").
- [ ] Given the friends list, then each friend includes `lastGreetedAt` (for the Greeted status, D6).
- [ ] Given a friend is deleted, then their greetings are deleted (D10).

## Business rules

- D2, D6, D10, D22. Channel values: "Telegram" (direct chat, including the copy-and-open fallback) and "Telegram share" (S-11). Text is capped at 4,096 characters (Telegram's limit).

## Non-functional

- §6 Security: scoped queries, validation. §6 Privacy: never log greeting text.

## Dependencies

Blocked by: SP-4, E3-S1

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E5-S1-T1] Greeting contracts

- Type: task
- Parent: E5-S1
- Labels: type:task, area:shared, priority:p0
- Milestone: M2
- Size: XS
- Blocked by: E3-S1-T2

## What

Zod schemas for greeting create and response, and the paginated list response.

## Details

Proposed: `createGreeting { text: 1..4096, channel: 'telegram' | 'telegram_share' }`;
`greeting { id, friendId, text, channel, createdAt }`; `greetingPage { items, total, nextCursor | null }`.

## Done when

- [ ] Unit tests for limits and channel values.

## Learning notes

- Why the server sets `createdAt` (the client clock can be wrong).

### [E5-S1-T2] Greetings table

- Type: task
- Parent: E5-S1
- Labels: type:task, area:db, priority:p0
- Milestone: M2
- Size: S
- Blocked by: SP-4, E3-S1-T3

## What

Drizzle schema and migration for `greetings` per SP-4.

## Details

Proposed: `greetings(id uuid pk, user_id fk on delete cascade, friend_id fk → friends on delete cascade,
text text, channel text, created_at, updated_at)`; indexes on `user_id`, `(friend_id, created_at desc)`.

## Done when

- [ ] Migration reviewed and applied; deleting a friend in a test removes their greetings.

## Learning notes

- Composite indexes: `(friend_id, created_at desc)` serves "latest greetings for a friend" directly.
- Two cascades (user and friend) on one table, and why both are needed (D10).

### [E5-S1-T3] Save greeting endpoint

- Type: task
- Parent: E5-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E5-S1-T1, E5-S1-T2

## What

`POST /friends/:friendId/greetings` stores a greeting after checking the friend belongs to the user.

## Details

Proposed: 201 `greeting`; 400 `VALIDATION_ERROR`; 404 `FRIEND_NOT_FOUND`.

## Done when

- [ ] Integration tests: save; empty text → 400; 4,097 chars → 400; another user's friend → 404.

## Learning notes

- Checking ownership of the parent resource before inserting a child row.

### [E5-S1-T4] List a friend's greetings endpoint

- Type: task
- Parent: E5-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E5-S1-T3

## What

`GET /friends/:friendId/greetings?limit=&cursor=` newest first, with `total`.

## Details

Proposed: limit max 50, default 20; 404 for another user's friend.

## Done when

- [ ] Integration tests: order, limit, cursor, total, another user's friend → 404.

## Learning notes

- Cursor vs offset pagination, and why every list endpoint needs a maximum limit.

### [E5-S1-T5] Last greeted date in the friends list

- Type: task
- Parent: E5-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E5-S1-T2, E3-S1-T4

## What

Add `lastGreetedAt` (most recent greeting `created_at` per friend, or null) to `GET /friends` and
`GET /friends/:id`.

## Details

Proposed: one query with a `LEFT JOIN` on `max(created_at)` grouped by friend, not one query per friend.

## Done when

- [ ] Integration tests: null without greetings; latest date with several; still scoped to the user.
- [ ] With 300 seeded friends the list query stays fast (check with `EXPLAIN ANALYZE`, note result in the PR).

## Learning notes

- The N+1 query problem and how a join + `GROUP BY` avoids it.
- Reading `EXPLAIN ANALYZE` output at a basic level.

### [E5-S2] Compose a greeting with the friend's context

- Type: story
- Parent: E5
- Labels: type:story, area:mobile, priority:p0
- Milestone: M2
- Size: L
- Blocked by: E5-S1, E1-S4, E3-S5

## User story

As a user, I want to write a greeting while seeing my friend's interests and my last greeting to
them, so that it feels personal and doesn't repeat last year's.

## Context

Design-brief F5 / S-08 (empty, typing, with context panel, no context/no history, near character
limit, no Telegram linked), §1 "Future phase" (leave room for "Generate"), entry points; D22. Design:
E10-S6-T1, boards `S-08 / Empty`, `/ Typing`, `/ With context`, `/ No context`, `/ Near limit`,
`/ No Telegram linked`, `/ Discard greeting`; small-screen board `S-08 / Typing (375×667)` (E10-S11-T2).

## Acceptance criteria

- [ ] Given Compose for Anna, then the header shows "Cancel" and "Greeting for Anna", and the recipient strip shows avatar (S), name, birthday info ("Turns 30 today") and the Telegram contact or "No Telegram linked".
- [ ] Given the friend has interests, how-we-know or past greetings, then the context panel is expanded by default with chips, how-we-know and "Last greeting" (date + 2-line preview, tap to expand); I can collapse it.
- [ ] Given no context and no history, then the context panel is hidden.
- [ ] Given the text area, then it auto-grows, shows "Write something personal…" and a character counter that turns `status.warning` above 3,500.
- [ ] Given 4,096 characters, then the text area accepts no more input; pasted text is cut at the limit (D22).
- [ ] Given the text is empty, then the primary button is disabled.
- [ ] Given text is entered and I tap Cancel, then "Discard greeting?" is asked; with empty text it closes.
- [ ] Given entry points Today card, Friend Profile, a notification (E7-S5) and "Send again" (E6-S3), then Compose opens for the right friend (pre-filled for Send again).
- [ ] Given an iPhone SE size screen with the keyboard open, then the actions stay visible above the keyboard.

## Business rules

- D2 (saving happens in E5-S3), D22 (hard cap 4,096). AI phase: layout leaves space near the text area; nothing drawn.

## Non-functional

- §6 Accessibility, §6 Offline (Compose opens from cached friend data).

## Dependencies

Blocked by: E5-S1, E1-S4, E3-S5

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E5-S2-T1] Compose screen with recipient strip and text area

- Type: task
- Parent: E5-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: M
- Blocked by: E1-S4-T3, E3-S1-T4

## What

`ComposeScreen` (S-08) with params `{ friendId, text? }`: header, recipient strip, auto-growing text
area with counter, keyboard-aware bottom actions (primary disabled when empty; actions wired in E5-S3).

## Done when

- [ ] Tests: counter and warning state; input stops at 4,096; primary disabled when empty; pre-filled text from params.

### [E5-S2-T2] Context panel with the last greeting

- Type: task
- Parent: E5-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E5-S2-T1, E5-S1-T4

## What

Collapsible context panel: interests, how-we-know, "Last greeting" from
`GET /friends/:id/greetings?limit=1`, expanded by default when data exists, hidden otherwise.

## Done when

- [ ] Tests: full context, no context + no history (hidden), expand last greeting.

### [E5-S2-T3] Cancel and "Discard greeting?"

- Type: task
- Parent: E5-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: XS
- Blocked by: E5-S2-T1

## What

Cancel closes directly when empty, otherwise asks "Discard greeting?" (also on the back gesture).

## Done when

- [ ] Tests: both paths.

### [E5-S2-T4] Open Compose from the Today card and Friend Profile

- Type: task
- Parent: E5-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: XS
- Blocked by: E5-S2-T1, E4-S2-T3, E3-S5-T1

## What

Wire "Write greeting" on the Today card and Friend Profile to `Compose { friendId }`.

## Done when

- [ ] Tests: both buttons navigate with the right `friendId`.

### [E5-S3] Hand off the greeting to Telegram

- Type: story
- Parent: E5
- Labels: type:story, area:mobile, priority:p0
- Milestone: M2
- Size: — (≈3 days of tasks)
- Blocked by: SP-1, E5-S2

## User story

As a user, I want to send my greeting through Telegram with one tap, so that my friend gets it where
we talk, and the app remembers what I sent.

## Context

D2, D8, D22; design-brief F5 "How sending works", S-08 actions, S-09, A1/A2, flows 2 and 3. Link
formats come from SP-1. Design: E10-S6-T1 (`S-08 / No Telegram linked`), E10-S6-T2 (`S-09 / Default`,
`S-08 / Save failed`, toasts), flows 2 and 3 in E10-S11-T1.

## Acceptance criteria

- [ ] Given a linked Telegram contact, then the primary button reads "Open in Telegram"; without one it reads "Share via Telegram" and an inline hint "Link their Telegram to open the chat directly" opens Edit Friend.
- [ ] Given I tap the primary button and Telegram can be opened, then the greeting is saved (channel "Telegram" for a direct chat, including the SP-1 copy-and-open fallback; "Telegram share" for the chat picker; D22), then Telegram opens with the text pre-filled (or per the SP-1 fallback).
- [ ] Given I come back to the app after the hand-off, then Compose is closed, I'm on the previous screen, and the toast "Greeting saved to history" is shown (or "Greeting copied — paste it in Telegram" in the SP-1 copy fallback).
- [ ] Given Telegram isn't installed or can't be opened, then the S-09 sheet appears ("Telegram isn't available", "Copy text", "Get Telegram", "Cancel") and the greeting is **not** saved.
- [ ] Given "Copy text" (on S-08 or S-09), then the text is copied, the toast "Copied" is shown, and nothing is saved (D2).
- [ ] Given "Get Telegram", then the platform's app store page for Telegram opens.
- [ ] Given saving fails (offline or server error), then Telegram is not opened and the `S-08 / Save failed` error with retry is shown (D22).
- [ ] Given a double tap on the primary button, then only one greeting is saved.

## Business rules

- D2 save on Telegram tap only; D8 contact types; D22 (no Telegram without a saved greeting; fallback channel "Telegram"); F5 A1/A2.

## Non-functional

- §6 Privacy: the app doesn't read any Telegram data. §6 Offline.

## Dependencies

Blocked by: SP-1, E5-S2

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E5-S3-T1] Telegram link builder

- Type: task
- Parent: E5-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: SP-1

## What

A pure function `buildTelegramLink({ contact | null, text })` returning the URL(s) and the
channel per SP-1, plus the Telegram store URLs per platform. iOS `LSApplicationQueriesSchemes`
entry if SP-1 needs `canOpenURL`.

## Done when

- [ ] Unit tests: username, phone, no contact, emoji and line breaks, 4,096 characters.

### [E5-S3-T2] Telegram button saves, then opens Telegram

- Type: task
- Parent: E5-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: M
- Blocked by: E5-S3-T1, E5-S1-T3, E5-S2-T1

## What

Primary button flow: check Telegram can be opened → save via `POST /friends/:id/greetings` (button
loading, guarded against double taps) → open the link; invalidate friends and greetings caches.
"Share via Telegram" and the link-Telegram hint for friends without a contact.

## Done when

- [ ] Tests (Linking mocked): saves then opens; can't open → no save; save fails → no open + error; double tap → one save.
- [ ] Manual check on iOS and Android with Telegram installed (username, phone, share).

### [E5-S3-T3] Back in the app: close Compose and show the toast

- Type: task
- Parent: E5-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E5-S3-T2

## What

After a successful hand-off, close Compose and show "Greeting saved to history" (or the SP-1
fallback toast) when the app becomes active again.

## Done when

- [ ] Tests: AppState change back to active closes Compose and shows the toast once.

### [E5-S3-T4] Copy text

- Type: task
- Parent: E5-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: XS
- Blocked by: E5-S2-T1

## What

"Copy text" with `expo-clipboard` and the "Copied" toast; never calls the save endpoint.

## Done when

- [ ] Test: clipboard set, toast shown, no API call.

### [E5-S3-T5] Telegram unavailable sheet S-09

- Type: task
- Parent: E5-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E5-S3-T2, E1-S4-T6

## What

Bottom sheet with title, text, "Copy text", "Get Telegram" (store link) and "Cancel".

## Done when

- [ ] Tests: each button; no save in any path.

### [E6] Greeting history

- Type: epic
- Labels: type:epic, area:mobile, area:shared, area:backend, priority:p0
- Milestone: M3
- Size: —

## Goal

The user can look back at what they sent, overall and per friend, and reuse or delete past greetings (F6).

## Scope

- History API: list with search and friend filter, read, delete
- History list (S-10), Greeting Detail (S-11), Friend's greetings (S-12) and the Greetings section on Friend Profile (S-07)

## Out of scope

- Editing a saved greeting; export

## Screens

S-07 (Greetings section), S-10, S-11, S-12

## Stories

(sub-issues)

## Done when

- All greetings are browsable, searchable, filterable by friend, deletable, and can be sent again.

### [E6-S1] Browse and delete greetings on the server

- Type: story
- Parent: E6
- Labels: type:story, area:shared, area:backend, priority:p0
- Milestone: M3
- Size: L
- Blocked by: E5-S1

## User story

As a user, I want to search, filter and delete my saved greetings, so that History stays useful
and accurate.

## Context

Design-brief F6 / S-10 (search on friend names and greeting text, friend filter), S-11 (delete), D2
("the user can delete a history entry").

## Acceptance criteria

- [ ] Given greetings, when I list them, then they're newest first, paginated, each with friend id, friend name, text, channel and date.
- [ ] Given a search term, then results match friend name or greeting text (case-insensitive).
- [ ] Given a friend filter, then only that friend's greetings are returned.
- [ ] Given a greeting id, then I can read and delete my own; another user's → `404`.
- [ ] Given I delete a greeting, then it no longer counts for the Greeted status (D6).

## Business rules

- D2, D6.

## Non-functional

- §6 Security: scoped queries, bounded `limit` and search length. §6 Privacy: search terms aren't logged.

## Dependencies

Blocked by: E5-S1

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E6-S1-T1] History contracts

- Type: task
- Parent: E6-S1
- Labels: type:task, area:shared, priority:p0
- Milestone: M3
- Size: XS
- Blocked by: E5-S1-T1

## What

Query schema `{ q?: string (max 100), friendId?: uuid, limit?: 1..50, cursor? }` and a history item
schema that adds `friendName` to `greeting`.

## Done when

- [ ] Unit tests for bounds.

## Learning notes

- Validating query strings: everything arrives as a string; Zod coerces and bounds it.

### [E6-S1-T2] List greetings with search and friend filter

- Type: task
- Parent: E6-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M3
- Size: M
- Blocked by: E6-S1-T1, E5-S1-T4

## What

`GET /greetings` joining friends for the name, filtered by user, optional `friendId`, optional `q`
(`ILIKE` on name and text), newest first, cursor-paginated.

## Details

Proposed: 200 `greetingPage`; 400 for bad params. Escape `%` and `_` in `q`.

## Done when

- [ ] Integration tests: order, search by name, search by text, filter, pagination, another user's data never returned.

## Learning notes

- `ILIKE` and why user input must be escaped inside `LIKE` patterns.
- When a full-text index would be needed (not for the MVP's data size).

### [E6-S1-T3] Read and delete one greeting

- Type: task
- Parent: E6-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E6-S1-T2

## What

`GET /greetings/:id` and `DELETE /greetings/:id`, scoped to the user.

## Details

Proposed: 200 / 204; 404 `GREETING_NOT_FOUND`.

## Done when

- [ ] Integration tests: read own, delete own, another user's → 404 for both, `lastGreetedAt` updates after delete.

## Learning notes

- Hard delete vs soft delete; D2/D10 call for real deletion.

### [E6-S2] History list

- Type: story
- Parent: E6
- Labels: type:story, area:mobile, priority:p0
- Milestone: M3
- Size: L
- Blocked by: E6-S1, E1-S4

## User story

As a user, I browse all greetings I've sent, newest first, so that I remember what I wrote to whom.

## Context

Design-brief F6 / S-10 (default, filtered by one friend, search no results, empty); flow 5; D23.
Design: E10-S7-T1, boards `S-10 / Default`, `/ Filtered`, `/ No results`, `/ Empty`,
`/ Friend picker`, `/ Swipe delete`; offline board `S-10 / Offline` (E10-S9-T2).

## Acceptance criteria

- [ ] Given greetings, then they're grouped by month ("October 2026"); each row shows avatar (S), friend name, date sent, 2-line preview and a small "via Telegram" label; tapping opens Greeting Detail.
- [ ] Given I search, then the list filters by friend name and greeting text; with no results, a no-results message is shown.
- [ ] Given the filter chip row, then "All" and a friend filter that opens a friend picker bottom sheet are available; choosing a friend filters the list.
- [ ] Given no greetings, then "No greetings yet. Greetings you send will appear here."
- [ ] Given I swipe left on a row and tap "Delete", then the S-11 confirmation "Delete this greeting from history?" appears (D23); confirming deletes the greeting and updates the list and Greeted status.
- [ ] Given loading or error, then a loading indicator or an error with "Try again".
- [ ] Given offline, then the last loaded list is shown; delete shows a clear error.
- [ ] Given many greetings, then the list loads more on scroll (virtualized).

## Business rules

- D2, D23.

## Non-functional

- §6 Performance, §6 Accessibility (swipe has an accessible alternative), §6 Offline.

## Dependencies

Blocked by: E6-S1, E1-S4

## Assumptions / open questions

- Assumption: no-results copy follows S-05's pattern ("No greetings match "xyz""), as on the `S-10 / No results` board.

## Tasks

(sub-issues)

### [E6-S2-T1] History screen grouped by month

- Type: task
- Parent: E6-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: M
- Blocked by: E6-S1-T2

## What

`HistoryScreen` (S-10) with infinite `SectionList` grouped by month, rows → Greeting Detail, all states.

## Done when

- [ ] Tests: month grouping, empty, error + retry, load more.

### [E6-S2-T2] Search and friend filter

- Type: task
- Parent: E6-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E6-S2-T1, E1-S4-T6

## What

Debounced search field and filter chips ("All" + friend picker bottom sheet).

## Done when

- [ ] Tests: search triggers a query with `q`; picking a friend filters; "All" clears.

### [E6-S2-T3] Swipe to delete a greeting

- Type: task
- Parent: E6-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E6-S2-T1, E6-S1-T3

## What

Swipe left → "Delete" → the S-11 confirmation dialog (D23) → `DELETE /greetings/:id`; invalidate
history and friends caches.

## Done when

- [ ] Tests: confirm deletes; cancel keeps; error keeps the row.

### [E6-S3] Greeting detail

- Type: story
- Parent: E6
- Labels: type:story, area:mobile, priority:p0
- Milestone: M3
- Size: M
- Blocked by: E6-S1, E5-S3

## User story

As a user, I want to open a past greeting to copy it, send it again or delete it, so that I can
reuse good words or clean up greetings I didn't send.

## Context

Design-brief F6 / S-11; flow 5 "Reuse an old greeting". Design: E10-S7-T2, boards
`S-11 / Default`, `S-11 / Delete dialog`; offline board `S-11 / Delete failed offline` (E10-S9-T2).

## Acceptance criteria

- [ ] Given a greeting, then I see friend avatar + name (tap → Friend Profile), date and time sent, channel ("Telegram" / "Telegram share") and the full selectable text.
- [ ] Given "Copy text", then the text is copied and "Copied" toast shown.
- [ ] Given "Send again", then Compose opens for the same friend pre-filled with this text.
- [ ] Given "Delete" and confirming "Delete this greeting from history?", then it's deleted and I return to the previous screen.
- [ ] Given offline, then the cached greeting is shown and Delete shows a clear error.

## Business rules

- D2.

## Non-functional

- §6 Accessibility, §6 Offline.

## Dependencies

Blocked by: E6-S1, E5-S3

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E6-S3-T1] Greeting detail with copy and delete

- Type: task
- Parent: E6-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E6-S1-T3

## What

`GreetingDetailScreen` (S-11) with copy, delete (confirmation), friend link.

## Done when

- [ ] Tests: renders fields, copy, delete confirm/cancel, navigates to profile.

### [E6-S3-T2] Send again

- Type: task
- Parent: E6-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: XS
- Blocked by: E6-S3-T1, E5-S2-T1

## What

"Send again" navigates to `Compose { friendId, text }`.

## Done when

- [ ] Test: Compose opens pre-filled.

### [E6-S4] A friend's greetings

- Type: story
- Parent: E6
- Labels: type:story, area:mobile, priority:p1
- Milestone: M3
- Size: M
- Blocked by: E5-S1, E3-S5, E6-S3

## User story

As a user, I see everything I've sent to one friend, so that each year's greeting is different.

## Context

Design-brief F4 / S-07 "Greetings section" and F6 / S-12. Design: E10-S5-T3 (S-07 Greetings
section), E10-S7-T2 (`S-12 / Default`).

## Acceptance criteria

- [ ] Given a friend with greetings, then Friend Profile shows the last 3 (date + 2-line preview) and "See all (n)".
- [ ] Given no greetings, then "No greetings yet".
- [ ] Given "See all (n)", then S-12 opens with the friend's name in the header and greetings grouped by year ("2026", "2025").
- [ ] Given I tap a greeting, then Greeting Detail opens.
- [ ] Given offline, then the last loaded greetings are shown.

## Business rules

- D10 (greetings disappear with the friend).

## Non-functional

- §6 Performance (virtualized list), §6 Offline.

## Dependencies

Blocked by: E5-S1, E3-S5, E6-S3

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E6-S4-T1] Greetings section on Friend Profile

- Type: task
- Parent: E6-S4
- Labels: type:task, area:mobile, priority:p1
- Milestone: M3
- Size: S
- Blocked by: E5-S1-T4, E3-S5-T2

## What

Section with the last 3 greetings from `GET /friends/:id/greetings?limit=3`, "See all (n)" using `total`.

## Done when

- [ ] Tests: 0, 2 and 5 greetings.

### [E6-S4-T2] Friend's greetings screen S-12

- Type: task
- Parent: E6-S4
- Labels: type:task, area:mobile, priority:p1
- Milestone: M3
- Size: S
- Blocked by: E6-S4-T1

## What

`FriendGreetingsScreen` (S-12): same row pattern as S-10, grouped by year, infinite scroll.

## Done when

- [ ] Tests: year grouping with the Anna sample history.

### [E7] Reminders

- Type: epic
- Labels: type:epic, area:mobile, area:shared, area:backend, area:db, priority:p0
- Milestone: M3
- Size: —

## Goal

The user gets a notification on the birthday and a few days before, at a time they choose, and a
tap takes them straight to the right place (F8, D3).

## Scope

- Global reminder settings (API + S-14), defaults from D3
- Push token registration (if SP-2 picks server push)
- Due-reminder calculation and notification content (S-15)
- Delivery mechanism per SP-2 (follow-up issues from the spike)
- Notification tap deep links

## Out of scope

- Per-friend reminder settings (ba-brief §2)

## Screens

S-02 (permission, in E2-S4), S-14, S-15

## Stories

(sub-issues)

## Done when

- With default settings, a friend whose birthday is in 3 days triggers one "Upcoming birthday" notification at 09:00 local time, and one "birthday is today" notification on the day; taps open the right screens.
- No duplicates; reminders fire at the chosen time in the phone's current time zone (D18), and the travel-day behavior matches the SP-2 decision.

### [E7-S1] Reminder settings saved per user

- Type: story
- Parent: E7
- Labels: type:story, area:shared, area:backend, area:db, priority:p0
- Milestone: M3
- Size: L
- Blocked by: SP-2, SP-4, E2-S2

## User story

As a user, I want my reminder settings saved to my account, so that they apply to all my devices
and survive reinstalling.

## Context

D3; ba-brief §4 entity Reminder settings (per user); design-brief S-14.

## Acceptance criteria

- [ ] Given a new user, then settings default to: reminders on (D18), "On the day" on, "In advance" 3 days, time 09:00 (D3).
- [ ] Given I update settings, then they're stored and returned.
- [ ] Given "In advance", then only None / 1 day / 3 days / 1 week are accepted.
- [ ] Given a time, then only valid `HH:MM` local times are accepted.
- [ ] Given another user, then they can't read or change my settings.

## Business rules

- D3, D18 (master switch on by default).

## Non-functional

- §6 Security: validation, scoped to the user.

## Dependencies

Blocked by: SP-2, SP-4, E2-S2

## Assumptions / open questions

- Assumption: the phone's time zone is also stored if SP-2 picks server-side delivery.

## Tasks

(sub-issues)

### [E7-S1-T1] Reminder settings table

- Type: task
- Parent: E7-S1
- Labels: type:task, area:db, priority:p0
- Milestone: M3
- Size: S
- Blocked by: SP-4, SP-2

## What

Drizzle schema and migration for per-user reminder settings.

## Details

Proposed: `reminder_settings(user_id pk fk on delete cascade, enabled bool, on_the_day bool,
days_before smallint null (null = None, 1, 3, 7), notify_at time, time_zone text null, created_at, updated_at)`.

## Done when

- [ ] Migration reviewed and applied; check constraint on `days_before`.

## Learning notes

- One-to-one tables: using the foreign key as the primary key.
- `time` vs `timestamptz`: a wall-clock time with no date or zone.

### [E7-S1-T2] Reminder settings contracts

- Type: task
- Parent: E7-S1
- Labels: type:task, area:shared, priority:p0
- Milestone: M3
- Size: XS
- Blocked by: E10-S11 (design handoff)

## What

Zod schema `reminderSettings { enabled, onTheDay, daysBefore: 0 | 1 | 3 | 7, notifyAt: 'HH:MM', timeZone? }`
and the defaults constant shared by API and app (`enabled: true`, D18; the rest from D3).

## Done when

- [ ] Unit tests for invalid days and times.

## Learning notes

- Sharing defaults through contracts so the app can show them before the first load.

### [E7-S1-T3] Read and update reminder settings endpoints

- Type: task
- Parent: E7-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E7-S1-T1, E7-S1-T2

## What

`GET /me/reminder-settings` (returns defaults if no row yet) and `PUT /me/reminder-settings` (upsert).

## Details

Proposed: 200 `reminderSettings`; 400 `VALIDATION_ERROR`.

## Done when

- [ ] Integration tests: defaults for a new user, update, invalid values, isolation between users.

## Learning notes

- Upsert (`INSERT … ON CONFLICT DO UPDATE`) and when it beats "read then insert or update".

### [E7-S2] Reminder settings screen

- Type: story
- Parent: E7
- Labels: type:story, area:mobile, priority:p0
- Milestone: M3
- Size: L
- Blocked by: E7-S1, E1-S4

## User story

As a user, I choose how many days in advance and at what time I'm reminded, so that reminders fit my day.

## Context

D3, D18, D19; design-brief F8 / S-14 (default, permission denied, master off); flow 6. Design:
E10-S8-T2, boards `S-14 / Default`, `/ Permission denied`, `/ Permission not asked`, `/ Master off`;
offline board `S-14 / Save failed offline` (E10-S9-T2).

## Acceptance criteria

- [ ] Given S-14, then I see "Birthday reminders" master toggle, "On the day" toggle, "In advance" single-select (None / 1 day / 3 days / 1 week), "Notification time" row with the native time picker, and "Reminders use your phone's time zone."
- [ ] Given the master toggle is off, then the other controls are disabled.
- [ ] Given notification permission isn't granted (denied or never asked), then the banner "Notifications are turned off for this app." is shown and the controls are disabled (D19).
- [ ] Given permission was denied, then the banner button is "Open phone settings"; given it was never asked, then the banner button asks for permission with the OS dialog (label from `S-14 / Permission not asked`, D19).
- [ ] Given I change a setting, then it's saved and the Settings summary row (S-13) updates.
- [ ] Given saving fails or I'm offline, then the previous value is restored and an error is shown.
- [ ] Given I return from phone settings with permission granted, then the banner disappears.

## Business rules

- D3, D18, D19.

## Non-functional

- §6 Accessibility (toggles labelled with state), §6 Offline.

## Dependencies

Blocked by: E7-S1, E1-S4

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E7-S2-T1] Reminder controls with defaults

- Type: task
- Parent: E7-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: M
- Blocked by: E7-S1-T3, E1-S4-T4

## What

`ReminderSettingsScreen` (S-14) with toggles, single-select, time picker
(`@react-native-community/datetimepicker` via `expo install`, ask first), optimistic save with rollback.

## Done when

- [ ] Tests: defaults, master off disables controls, rollback on error.

### [E7-S2-T2] Notifications-off state

- Type: task
- Parent: E7-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E7-S2-T1

## What

Read permission status (`expo-notifications`), show the banner, "Open phone settings" (`Linking.openSettings()`),
re-check on app foreground.

## Done when

- [ ] Tests: denied → banner + disabled; granted → no banner; never asked → request permission.

### [E7-S3] Register the device for push

- Type: story
- Parent: E7
- Labels: type:story, area:mobile, area:backend, area:db, priority:p0
- Milestone: M3
- Size: L
- Blocked by: SP-2, E2-S2, E0-S4

## User story

As a user, I want my phone registered for reminders, so that notifications reach the devices I use.

## Context

ba-brief §4 entity Push token (per device), §7 E7 "push token registration". Only needed if SP-2
chooses server-side push; otherwise close as not planned.

## Acceptance criteria

- [ ] Given notification permission is granted, when the app starts signed in, then the device's Expo push token is registered for my account.
- [ ] Given the token changes, then the new token replaces the old one.
- [ ] Given I sign out or delete my account, then the device's token is removed and the device gets no more reminders (D18).
- [ ] Given the same device signs in as another user, then the token belongs only to the new user.

## Business rules

- No duplicate notifications per device (§6 Reliability). D18: a signed-out device gets no reminders.

## Non-functional

- §6 Security: tokens never logged. §6 Privacy.

## Dependencies

Blocked by: SP-2, E2-S2, E0-S4

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E7-S3-T1] Push tokens table

- Type: task
- Parent: E7-S3
- Labels: type:task, area:db, priority:p0
- Milestone: M3
- Size: S
- Blocked by: SP-2, E2-S1-T1

## What

Drizzle schema and migration for push tokens.

## Details

Proposed: `push_tokens(id uuid pk, user_id fk on delete cascade, token text unique, platform text,
last_seen_at timestamptz, created_at, updated_at)`; index on `user_id`.

## Done when

- [ ] Migration reviewed and applied.

## Learning notes

- Why `token` is unique across users (one device, one owner at a time).

### [E7-S3-T2] Register and remove push token endpoints

- Type: task
- Parent: E7-S3
- Labels: type:task, area:backend, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E7-S3-T1, E2-S2-T2

## What

`PUT /me/push-tokens` (upsert; moves the token to the current user if it belonged to another) and
`DELETE /me/push-tokens/:token`.

## Details

Proposed: 204; 400 `VALIDATION_ERROR` for a malformed Expo token.

## Done when

- [ ] Integration tests: register, re-register (no duplicate), move between users, delete, isolation.

## Learning notes

- Upsert with `ON CONFLICT (token) DO UPDATE SET user_id = …`.

### [E7-S3-T3] Register the Expo push token from the app

- Type: task
- Parent: E7-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E7-S3-T2, E0-S4-T1

## What

Get the Expo push token when permission is granted (after S-02, S-14, or on launch), register it,
listen for token changes; remove it on sign-out (called from E8-S2) and account deletion.

## Done when

- [ ] Unit tests with `expo-notifications` mocked: registers once per token; removes on sign-out.

### [E7-S4] Reminders arrive on the right day and time

- Type: story
- Parent: E7
- Labels: type:story, area:shared, area:backend, area:mobile, priority:p0
- Milestone: M3
- Size: M (plus the SP-2 follow-up delivery issues)
- Blocked by: SP-2, E7-S1, E4-S1

## User story

As a user, I get a notification on the birthday and a few days before, at my chosen time, so that I
never miss a birthday.

## Context

D3, D4, D5, D16, D18; design-brief F8 / S-15 (notification content table, gender-neutral copy); §6
Reliability. Design: E10-S8-T3, boards `S-15 / Birthday today`, `/ Birthday today (no year)`,
`/ Several today`, `/ In advance`. Delivery tasks (scheduler/worker and sending, or local scheduling)
are created as SP-2 follow-ups.

## Acceptance criteria

- [ ] Given reminders on and "On the day" on, then on the birthday at the chosen local time I get "🎂 Anna Petrova's birthday is today" / "Turning 30. Tap to write a greeting." (gender-neutral) or, without a year, "Tap to write a greeting."
- [ ] Given several birthdays on the same day, then I get one "🎂 3 birthdays today" notification listing the names ("Anna, Mark and Sofia.").
- [ ] Given "In advance" = 3 days, then 3 days before at the chosen time I get "Upcoming birthday" / "Sofia Lee's birthday is in 3 days (Oct 20)."
- [ ] Given several friends' in-advance reminders fall on the same day, then I get one notification per friend (D18).
- [ ] Given a Feb 29 friend in a non-leap year, then the reminders are based on Feb 28 (D5, D16).
- [ ] Given reminders off, or both "On the day" off and "In advance" None, then no notifications.
- [ ] Given I change friends or settings, then upcoming reminders reflect the change (no stale or duplicate notifications).
- [ ] Given I travel to another time zone, then reminders fire at the chosen time in the phone's current time zone (D18); the day of the change behaves as SP-2 decides.
- [ ] Given I haven't opened the app for weeks, then reminders still arrive (SP-2 criterion).
- [ ] Given a friend is deleted, then no further reminders for them.

## Business rules

- D3, D4, D5, D16, D18. Copy from design-brief S-15.

## Non-functional

- §6 Reliability: correct local date and time, no duplicates, defined time-zone behavior. §6 Privacy: notification content stays on the device/push provider only as needed.

## Dependencies

Blocked by: SP-2, E7-S1, E4-S1

## Assumptions / open questions

- Assumption: an in-advance reminder one day before reads "Sofia Lee's birthday is tomorrow (Oct 20)." and a Feb 29 friend's date prints "(Feb 29)" (D16, D17; Open question 33).

## Tasks

(sub-issues)

### [E7-S4-T1] Due reminders calculation

- Type: task
- Parent: E7-S4
- Labels: type:task, area:shared, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E4-S1-T1

## What

Pure function in `libs/domain`: `dueReminders(friends, settings, localDate)` → list of
`{ kind: 'today' | 'inAdvance', friendIds, date }`, grouping "today" ones into one entry and keeping
one in-advance entry per friend (D18).

## Done when

- [ ] Vitest: defaults with sample data on Oct 17 and Oct 26, 2026; Feb 28 in a non-leap year; settings off; None.

## Learning notes

- Making "what is due" a pure function lets both delivery options (server or device) share it.

### [E7-S4-T2] Notification texts from S-15

- Type: task
- Parent: E7-S4
- Labels: type:task, area:shared, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E7-S4-T1, E4-S1-T2

## What

Pure function `notificationContent(dueReminder, friends)` → `{ title, body, data: { screen, friendId? } }`
for the four S-15 cases, with gender-neutral bodies and name lists ("Anna, Mark and Sofia.").

## Done when

- [ ] Vitest: one with year, one without year, three today, in advance (3 days and 1 day, see the story Assumption).

## Learning notes

- Keeping copy and routing data together so the tap handler (E7-S5) knows where to go.

### [E7-S5] Notification tap opens the right screen

- Type: story
- Parent: E7
- Labels: type:story, area:mobile, priority:p0
- Milestone: M3
- Size: M
- Blocked by: E7-S4, E5-S2

## User story

As a user, tapping a notification takes me straight to the right place, so that I can greet in one or two taps.

## Context

Design-brief S-15 "Tap opens" column, flow 2 (prototype "2 · Greet from notification" in
E10-S11-T1); ADR 0002 consequence (deep links need a `linking`
config on `NavigationContainer`; app scheme `greetday`).

## Acceptance criteria

- [ ] Given a "birthday today" notification for one friend, when I tap it, then Compose opens for that friend.
- [ ] Given "N birthdays today", then Upcoming opens.
- [ ] Given "Upcoming birthday", then that friend's profile opens.
- [ ] Given the app was closed (cold start), then the same targets open after the session is restored.
- [ ] Given I'm signed out, then S-01 shows and nothing else opens.
- [ ] Given the friend was deleted, then Upcoming opens instead.

## Business rules

- Design-brief §1 principle 2 (1–2 taps to a ready greeting).

## Non-functional

- §6 Reliability.

## Dependencies

Blocked by: E7-S4, E5-S2

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E7-S5-T1] Deep-link config and notification tap handling

- Type: task
- Parent: E7-S5
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: M
- Blocked by: E7-S4-T2, E5-S2-T1, E2-S3-T6

## What

`linking` config for `greetday://` routes (compose, upcoming, friend profile) and an
`expo-notifications` response listener (including the last response on cold start) that navigates
using the notification `data`.

## Done when

- [ ] Tests: each `data` shape navigates correctly; signed out → S-01; deleted friend → Upcoming.
- [ ] Manual check on iOS and Android from a background and a killed app.

### [E8] Settings & account

- Type: epic
- Labels: type:epic, area:mobile, area:backend, area:db, priority:p0
- Milestone: M3
- Size: —

## Goal

The user sees their account and reminder summary, can sign out, and can permanently delete their
account and all data (F7, D10, App Store requirement).

## Scope

- Settings screen S-13 (account, reminders summary, about, sign out, delete account)
- Account deletion with backend cascade and Sign in with Apple token revocation (D21)

## Out of scope

- Changing the sign-in provider, editing the display name, data export

## Screens

S-13

## Stories

(sub-issues)

## Done when

- Sign out returns to S-01 and clears local data; delete account removes every row of the user's data on the server.

### [E8-S1] Settings screen

- Type: story
- Parent: E8
- Labels: type:story, area:mobile, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E2-S2, E7-S1, E1-S4

## User story

As a user, I want one place for my account, reminder summary and legal links, so that I know how
the app is set up.

## Context

Design-brief F7 / S-13 (default, deleting); flow 6; D19, D20. Design: E10-S8-T1, boards
`S-13 / Default`, `/ Apple account`, `/ Reminders off`; offline board `S-13 / Offline` (E10-S9-T2).

## Acceptance criteria

- [ ] Given Settings, then Account shows avatar, display name, email and "Signed in with Google" / "Signed in with Apple".
- [ ] Given Apple hid the user's name or email, then Account shows the name if available, otherwise the private-relay email, plus "Signed in with Apple" (D20).
- [ ] Given Reminders, then a row shows the current summary (e.g. "On the day & 3 days before · 9:00", or "Off" when reminders are off, D19) and opens S-14.
- [ ] Given About, then Privacy Policy, Terms of Service (open the E9-S3 pages) and the app version are shown.
- [ ] Given Sign out and Delete account, then they are shown as in the design (text button, destructive).
- [ ] Given offline, then the last loaded account and settings are shown.

## Business rules

- F7, D19, D20.

## Non-functional

- §6 Accessibility, §6 Offline.

## Dependencies

Blocked by: E2-S2, E7-S1, E1-S4

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E8-S1-T1] Settings screen S-13

- Type: task
- Parent: E8-S1
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E2-S2-T2, E7-S1-T3

## What

`SettingsScreen` with `GET /me` and reminder settings, summary formatter, app version from
`expo-application` or `expo-constants`, legal links (placeholder URLs until E9-S3).

## Done when

- [ ] Tests: provider label, Apple account without name (relay email shown), summary variants (defaults, 1 week only, "Off"), navigation to S-14.

### [E8-S2] Sign out

- Type: story
- Parent: E8
- Labels: type:story, area:mobile, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E8-S1, E2-S2

## User story

As a user, I want to sign out, so that someone else using my phone can't see my friends.

## Context

Design-brief F7 / S-13 "Sign out (text button, confirmation dialog)"; E2-S2 sign-out endpoint; D18.
Design: E10-S8-T1, board `S-13 / Sign out dialog` (copy approved at the E10-S11 handoff).

## Acceptance criteria

- [ ] Given I tap Sign out, then the confirmation dialog from the mocks appears; Cancel keeps me signed in.
- [ ] Given I confirm, then the refresh token is revoked on the server, tokens and cached data are removed from the device, the push token is unregistered, and I see S-01.
- [ ] Given I signed out, then this device gets no more reminders (D18; push token removed, or scheduled local notifications cancelled if SP-2 picks local delivery).
- [ ] Given I'm offline, then I'm still signed out locally (server revoke is best effort).

## Business rules

- §6 Security, §6 Privacy. D18.

## Non-functional

- §6 Security.

## Dependencies

Blocked by: E8-S1, E2-S2

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E8-S2-T1] Sign out with confirmation

- Type: task
- Parent: E8-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E8-S1-T1, E2-S3-T1, E0-S3-T2

## What

Confirmation dialog → `POST /auth/sign-out` (ignore network errors) → remove push token (if E7-S3
exists) or cancel scheduled local notifications (per SP-2) → clear secure storage and persisted
cache → S-01.

## Done when

- [ ] Tests: confirm clears storage and cache and shows S-01; offline still signs out; cancel does nothing.

### [E8-S3] Delete my account

- Type: story
- Parent: E8
- Labels: type:story, area:backend, area:db, area:mobile, priority:p0
- Milestone: M3
- Size: — (≈3.25 days of tasks)
- Blocked by: E8-S1, SP-5

## User story

As a user, I want to delete my account and all my data permanently, so that nothing about me or my
friends stays on the server.

## Context

D10, D21; ba-brief §6 Privacy ("account deletion removes all user data (App Store requirement)");
design-brief F7 / S-13 dialog and "deleting" state. Design: E10-S8-T1, boards
`S-13 / Delete account dialog` and `S-13 / Deleting`. Apple's account-deletion rules for apps with
Sign in with Apple ask the app to revoke the user's Apple tokens; the product owner confirmed this
is in scope (D21), so the server keeps an Apple refresh token from sign-in to revoke later.

## Acceptance criteria

- [ ] Given I tap Delete account, then "Delete your account? All friends and greetings will be permanently deleted. This can't be undone." appears with a destructive "Delete account".
- [ ] Given I confirm, then a blocking loader is shown until the server answers.
- [ ] Given deletion succeeds, then the user, auth identities, sessions, friends, greetings, reminder settings and push tokens are all gone, local data is cleared, and I see S-01.
- [ ] Given I signed in with Apple, when my account is deleted, then the server revokes the app's Apple tokens for me (D21).
- [ ] Given I sign in again with the same provider account, then I start as a new, empty user.
- [ ] Given deletion fails or I'm offline, then an error is shown and nothing is deleted locally.

## Business rules

- D10, D21.

## Non-functional

- §6 Privacy, §6 Security (only the authenticated user's own account).

## Dependencies

Blocked by: E8-S1, SP-5

## Assumptions / open questions

- Assumption: deletion is immediate (no grace period).
- Assumption: if Apple's revoke call fails, the account is still deleted and the failure is logged without tokens (D10 comes first).
- Assumption: accounts created before E8-S3-T4 ships (developer test accounts only, before M4) have no stored Apple token; revocation is skipped for them and logged.

## Tasks

(sub-issues)

### [E8-S3-T1] Delete account endpoint

- Type: task
- Parent: E8-S3
- Labels: type:task, area:backend, priority:p0
- Milestone: M3
- Size: M
- Blocked by: E2-S2-T2, E5-S1-T2

## What

`DELETE /me` deletes the user row in a transaction; every user-owned table cascades. Apple token
revocation is added to this endpoint in E8-S3-T5.

## Details

Proposed: 204; 401 if not authenticated. Log the user id and "account deleted", nothing else.

## Done when

- [ ] Integration test: seed a user with friends, greetings, settings, sessions and push tokens; after `DELETE /me` every table has zero rows for that user, and another user's data is untouched.
- [ ] The old access and refresh tokens no longer work.

## Learning notes

- `ON DELETE CASCADE` end to end: one `DELETE` on `users` removes the whole tree (D10).
- Why the test checks every table: a new table without a cascade would silently keep personal data.

### [E8-S3-T2] Delete account in the app

- Type: task
- Parent: E8-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E8-S3-T1, E8-S2-T1

## What

Destructive dialog, blocking "deleting" state, `DELETE /me`, then the same local cleanup as sign out.

## Done when

- [ ] Tests: confirm → loader → S-01 with storage cleared; error → message, still signed in.

### [E8-S3-T3] Store the Apple refresh token

- Type: task
- Parent: E8-S3
- Labels: type:task, area:db, priority:p0
- Milestone: M3
- Size: XS
- Blocked by: E2-S1-T1

## What

Migration that adds a place for the Apple refresh token on the Apple auth identity (D21).

## Details

Proposed: nullable `provider_refresh_token text` on `auth_identities`, holding a value the API
encrypts before saving (key from a validated env var). Deleted with the identity by the existing cascade.

## Done when

- [ ] Migration reviewed with the developer and applied locally and in the test DB; `pnpm nx test api` green.

## Learning notes

- Adding a nullable column to an existing table: a safe, backward-compatible migration.
- Hashing vs encrypting: refresh sessions are hashed because we only compare them; this token is
  encrypted because the API must send the original value back to Apple.

### [E8-S3-T4] Exchange the Apple authorization code at sign-in

- Type: task
- Parent: E8-S3
- Labels: type:task, area:backend, priority:p0
- Milestone: M3
- Size: M
- Blocked by: E8-S3-T3, E2-S1-T5

## What

When `POST /auth/sign-in` receives an Apple `authorizationCode` (E2-S1-T2, sent by E2-S3-T5), exchange
it at Apple's token endpoint for a refresh token and store it encrypted (E8-S3-T3).

## Details

Proposed:

- `POST https://appleid.apple.com/auth/token` with `grant_type=authorization_code`, `code`,
  `client_id` (bundle id) and `client_secret`: a short-lived ES256 JWT signed with the Sign in with
  Apple private key (team id, key id).
- New env vars for the team id, key id and private key, validated in `src/env.ts` and added to
  `.env.example` with comments (no real values); production values in E9-S5-T1.
- If the exchange fails, sign-in still succeeds; log a warning with the user id only.
- Timeout on the outgoing call; never log the code or tokens.

## Done when

- [ ] Integration tests with Apple's endpoint mocked: token stored encrypted; exchange failure → sign-in still 200, no token stored; Google sign-in unaffected.

## Learning notes

- The OAuth authorization-code exchange: a one-time code (valid for minutes) traded server-to-server for tokens.
- Client secrets as signed JWTs, and why the private key only ever lives on the server.
- Mocking outgoing HTTP calls in integration tests so they don't depend on Apple.

### [E8-S3-T5] Revoke Apple tokens when the account is deleted

- Type: task
- Parent: E8-S3
- Labels: type:task, area:backend, priority:p0
- Milestone: M3
- Size: S
- Blocked by: E8-S3-T1, E8-S3-T4

## What

In `DELETE /me`, before deleting the user, call Apple's revoke endpoint with the stored refresh token
when the user has an Apple identity (D21).

## Details

Proposed: `POST https://appleid.apple.com/auth/revoke` with `client_id`, `client_secret` (same JWT as
E8-S3-T4), `token` and `token_type_hint=refresh_token`. If Apple fails or no token is stored, delete
the account anyway and log the outcome without tokens (story Assumption).

## Done when

- [ ] Integration tests with Apple mocked: revoke called with the decrypted token, then the user is deleted; Apple error → user still deleted; Google user → no Apple call.

## Learning notes

- Ordering side effects: call the external service first, then delete, so the token still exists to revoke.
- Why a third-party failure must not block a user's right to delete their data.

### [E9] Release

- Type: epic
- Labels: type:epic, area:infra, area:mobile, priority:p0
- Milestone: M4
- Size: —

## Goal

The API runs in production over HTTPS with a backed-up database, and the app is installable through
TestFlight and Google Play internal testing (M4).

## Scope

- Hosting and deploys per SP-3, production database and backups, migrations on deploy
- Privacy policy and terms pages (from a generated template, reviewed by the product owner, D25)
- App icon and splash (artwork from E10-S10)
- Production credentials (Apple, Google, push) and EAS production builds
- TestFlight and Play internal testing; M4 ends here

## Out of scope

- Store listings and the public store release (E11, M5; D24)
- Staging environment

## Screens

S-01 and S-13 (legal links)

## Stories

(sub-issues)

## Done when

- The developer installs the app from TestFlight and Play internal testing, signs in against the production API and completes the core loop.

### [E9-S1] Production database with backups

- Type: story
- Parent: E9
- Labels: type:story, area:infra, priority:p0
- Milestone: M4
- Size: M
- Blocked by: SP-3

## User story

As a user, I want my friends and greetings stored safely, so that they aren't lost if the server fails.

## Context

ba-brief §7 E9 "production database and backups", SP-3 decision.

## Acceptance criteria

- [ ] Given production, then Postgres 18 (or the version SP-3 allows) runs with credentials only in the host's secret store and is not reachable from the public internet except as the provider requires.
- [ ] Given a day passes, then an automatic backup exists and is kept for the retention SP-3 defines.
- [ ] Given a backup, then it has been restored once into a scratch database successfully (documented drill).

## Business rules

- §6 Privacy: backups contain personal data; access restricted.

## Non-functional

- §6 Security, §6 Reliability.

## Dependencies

Blocked by: SP-3

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E9-S1-T1] Provision the production database

- Type: task
- Parent: E9-S1
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: S
- Blocked by: SP-3

## What

Create the production Postgres per SP-3 with a dedicated app role (least privilege) and TLS if supported.

## Done when

- [ ] API can connect with the production `DATABASE_URL` (from the secret store); connection documented in the environments doc.

## Learning notes

- Database roles and least privilege: the app's role shouldn't be able to drop the database.

### [E9-S1-T2] Automated backups and a restore drill

- Type: task
- Parent: E9-S1
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: S
- Blocked by: E9-S1-T1

## What

Turn on (managed) or set up (VPS: scheduled `pg_dump` to off-site storage) daily backups, then
restore one into a scratch database and write the steps down.

## Done when

- [ ] Backup schedule and retention documented; one successful restore recorded.

## Learning notes

- A backup you haven't restored is a hope, not a backup.
- Logical (`pg_dump`) vs physical/point-in-time backups.

### [E9-S2] API deployed to production over HTTPS

- Type: story
- Parent: E9
- Labels: type:story, area:infra, priority:p0
- Milestone: M4
- Size: — (≈3 days of tasks)
- Blocked by: SP-3, E9-S1

## User story

As a user, I want the app to talk to a reliable, secure server, so that my data is safe in transit
and the app works wherever I am.

## Context

ba-brief §6 Security (HTTPS), §6 Quality ("DB migrations run automatically on deploy"),
§6 Observability; existing `docker/api.Dockerfile` and `prune` targets.

## Acceptance criteria

- [ ] Given a merge to `main` with green CI, then the API is built and deployed to production automatically (or with one manual approval).
- [ ] Given a deploy with new migrations, then they're applied before the new version takes traffic; a failed migration stops the deploy.
- [ ] Given any request, then it's served over HTTPS only.
- [ ] Given production, then `GET /health` is monitored and logs are viewable as structured JSON without personal data.
- [ ] Given a bad deploy, then the previous version can be restored with documented steps.

## Business rules

- No secrets in the repo or image.

## Non-functional

- §6 Security, §6 Quality, §6 Observability.

## Dependencies

Blocked by: SP-3, E9-S1

## Assumptions / open questions

- Assumption: if SP-2 picks server-side reminders, running the scheduler/worker in production is part of the SP-2 follow-up issues.

## Tasks

(sub-issues)

### [E9-S2-T1] Production config and secrets on the host

- Type: task
- Parent: E9-S2
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: S
- Blocked by: SP-3, E0-S1-T1

## What

Set every production env var (database URL, token secrets, provider client ids, error-tracking DSN)
in the host's secret store, following the environments doc.

## Done when

- [ ] API starts in production with `NODE_ENV=production`; env validation passes; doc updated.

## Learning notes

- Secret stores vs `.env` files on servers; rotating a signing secret invalidates tokens.

### [E9-S2-T2] Domain and HTTPS

- Type: task
- Parent: E9-S2
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: S
- Blocked by: E9-S2-T1

## What

Point an API domain at the host and serve HTTPS only (PaaS-managed certificates or a reverse proxy
with Let's Encrypt on a VPS).

## Done when

- [ ] `https://<api-domain>/health` returns 200; plain HTTP redirects or is refused.

## Learning notes

- TLS termination at a proxy vs in the app, and why Fastify can stay on plain HTTP behind it (`trustProxy`).

### [E9-S2-T3] Deploy pipeline from main

- Type: task
- Parent: E9-S2
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: M
- Blocked by: E9-S2-T1

## What

GitHub Actions workflow (or PaaS integration) that builds the API image from `docker/api.Dockerfile`
after CI passes on `main` and deploys it, with a documented rollback.

## Done when

- [ ] A merge to `main` deploys; rollback steps tested once.

## Learning notes

- Build once, deploy the same image: why the image is tagged with the commit SHA.

### [E9-S2-T4] Migrations run automatically on deploy

- Type: task
- Parent: E9-S2
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: S
- Blocked by: E9-S2-T3, E9-S1-T1

## What

A deploy step (release command or one-off container) that applies pending Drizzle migrations to
production before the new API version starts. This is separate from `db:migrate`, which stays local-only.

## Done when

- [ ] A deploy with a new migration applies it; a failing migration aborts the deploy and keeps the old version running.

## Learning notes

- Why migrations must be backward compatible with the running version during a deploy (expand → contract, `.claude/rules/migrations.md`).

### [E9-S2-T5] Production logs and uptime check

- Type: task
- Parent: E9-S2
- Labels: type:task, area:infra, priority:p1
- Milestone: M4
- Size: S
- Blocked by: E9-S2-T2

## What

Make production logs searchable (host's log viewer) and add an external uptime check on `/health`
with an alert to the developer.

## Done when

- [ ] Logs are visible for a test request; a stopped API triggers an alert.

## Learning notes

- Health checks: liveness ("process is up") vs readiness ("can reach the DB").

### [E9-S3] Privacy policy and terms pages

- Type: story
- Parent: E9
- Labels: type:story, area:infra, area:mobile, priority:p0
- Milestone: M4
- Size: L
- Blocked by: E10-S11 (design handoff)

## User story

As a user, I want to read the privacy policy and terms before I sign in, so that I know how my data
and my friends' data are used.

## Context

ba-brief §6 Privacy ("privacy policy and terms pages exist before store submission"); design-brief
S-01 footer and S-13 About; D25 (texts start from a generated template, the product owner reviews
them). Where the pages live is still open (Open question 31).

## Acceptance criteria

- [ ] Given the drafts from a generated template, then the product owner has reviewed and approved both texts (D25).
- [ ] Given the pages, then they're published at stable public HTTPS URLs.
- [ ] Given S-01 and S-13, then the links open those pages.
- [ ] Given the privacy policy, then it states what is stored (friends' names, birthdays, optional details, greetings), that the app doesn't read Telegram data, and how account deletion works.

## Business rules

- §6 Privacy, D25.

## Non-functional

- §6 Privacy.

## Dependencies

Blocked by: E10-S11 (design first)

## Assumptions / open questions

- Assumption: the pages are simple static pages (e.g. GitHub Pages) until Open question 31 picks the domain.
- Assumption: a third static page explains how to delete the account in the app and gives a contact email, for Google Play's account-deletion link (Open question 36).

## Tasks

(sub-issues)

### [E9-S3-T1] Publish the privacy policy and terms pages

- Type: task
- Parent: E9-S3
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: S
- Blocked by: E9-S3-T3

## What

Publish the approved texts from E9-S3-T3 as static pages (e.g. GitHub Pages or the API host, Open
question 31) at stable URLs.

## Done when

- [ ] Both URLs return 200 over HTTPS; URLs recorded in the environments doc.

## Learning notes

- Static hosting options and why the URLs must never change once submitted to the stores.

### [E9-S3-T2] Link the pages from S-01 and S-13

- Type: task
- Parent: E9-S3
- Labels: type:task, area:mobile, priority:p0
- Milestone: M4
- Size: XS
- Blocked by: E9-S3-T1, E2-S3-T3, E8-S1-T1

## What

Replace placeholder URLs; open them with an in-app browser (`expo-web-browser`) or the system browser.

## Done when

- [ ] Tests: both links open the configured URLs.

### [E9-S3-T3] Draft the privacy policy and terms from a template

- Type: task
- Parent: E9-S3
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

Generate a privacy policy and terms of service from a template generator (D25), fill in what GreetDay
actually stores and sends, and get the product owner's review.

## Details

- Cover: data stored (account email and name, friends' names, birthdays, optional details, greeting
  texts, push token), processors (hosting, error tracking, Expo push), that the app doesn't read
  Telegram data, retention, in-app account deletion (D10) and Apple token revocation (D21), contact.
- Keep the Markdown sources in the repo so later changes are reviewed like code.

## Done when

- [ ] Both texts approved by the product owner (comment on this issue).

## Learning notes

- What store reviewers check in a privacy policy, and why it must match the App Privacy and Data
  safety answers in E11-S1-T3.

### [E9-S4] App icon and splash screen

- Type: story
- Parent: E9
- Labels: type:story, area:mobile, priority:p0
- Milestone: M4
- Size: S
- Blocked by: E10-S10

## User story

As a user, I want a recognizable app icon and a clean launch screen, so that I can find the app and
it feels finished.

## Context

ba-brief §7 E9 "app icons/splash". Artwork and exports come from E10-S10 (resolved Q16; boards
`Icon / iOS`, `Icon / Android adaptive`, `Splash / Default`). Priority p0 because TestFlight uploads
and the store listings (E11) need a real icon.

## Acceptance criteria

- [ ] Given the home screen on iOS and Android, then the GreetDay icon is shown (Android adaptive icon included).
- [ ] Given app launch, then the splash uses the brand artwork and token-matching background, and stays until fonts and session are ready.

## Business rules

- D11 light theme.

## Non-functional

- None.

## Dependencies

Blocked by: E10-S10

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E9-S4-T1] Set the app icon and splash screen

- Type: task
- Parent: E9-S4
- Labels: type:task, area:mobile, priority:p0
- Milestone: M4
- Size: S
- Blocked by: E0-S4-T1, E10-S10-T2

## What

Replace the assets in `apps/mobile/assets/images` with the E10-S10 exports and update `app.json` (icon, adaptive icon,
`expo-splash-screen` plugin colors), then rebuild the development build.

## Done when

- [ ] Icon and splash verified on an iOS and an Android build.

### [E9-S5] Production builds with sign-in and push credentials

- Type: story
- Parent: E9
- Labels: type:story, area:infra, priority:p0
- Milestone: M4
- Size: L
- Blocked by: E9-S2

## User story

As the developer, I want signed production builds that use production sign-in and push
credentials, so that testers get the real app.

## Context

ba-brief §4 (EAS Build, Expo push), §7 E9 "EAS builds"; `eas.json` production profile exists.

## Acceptance criteria

- [ ] Given a production build, then it points at the production API (E0-S1-T2) and sends errors to error tracking.
- [ ] Given a production build, then Sign in with Apple works on a real iPhone and Google Sign-In on a real iPhone and Android device (D20).
- [ ] Given push is used (SP-2), then a test push reaches a production build on iOS and Android.
- [ ] Given the build version, then it increments automatically per build.

## Business rules

- None.

## Non-functional

- §6 Security: credentials managed by EAS / stores, never in the repo.

## Dependencies

Blocked by: E9-S2

## Assumptions / open questions

- Assumption: the developer has paid Apple Developer and Google Play Console accounts by M4.

## Tasks

(sub-issues)

### [E9-S5-T1] Production sign-in credentials for Apple and Google

- Type: task
- Parent: E9-S5
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: S
- Blocked by: E10-S11 (design handoff)

## What

Enable Sign in with Apple for the production bundle id and create its private key (used by the API
for the code exchange and revocation, E8-S3-T4/T5, D21), create production Google OAuth clients (iOS,
Android with the Play signing SHA-1, web), and set the client ids and Apple key values in the API's
secret store and the app config.

## Done when

- [ ] Both providers work in a production build against the production API; an Apple test account deletion revokes its token.

## Learning notes

- Why Android Google Sign-In needs the signing certificate fingerprint (and Play App Signing changes it).

### [E9-S5-T2] Push notification credentials

- Type: task
- Parent: E9-S5
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: S
- Blocked by: SP-2

## What

APNs key and FCM credentials configured in EAS for Expo push (only if SP-2 uses push; local
notifications need no credentials).

## Done when

- [ ] A test notification from the Expo push tool reaches both production builds.

## Learning notes

- APNs and FCM: the platform delivery services that Expo push forwards to.

### [E9-S5-T3] EAS production build profile

- Type: task
- Parent: E9-S5
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: M
- Blocked by: E9-S5-T1, E0-S1-T2

## What

Production profile with env vars, auto-incremented build numbers, EAS-managed signing credentials,
source-map upload for error tracking; build iOS and Android.

## Done when

- [ ] Signed iOS (`.ipa`) and Android (`.aab`) builds produced by EAS.

## Learning notes

- App signing: why stores require it and why EAS keeps the keys.

### [E9-S6] TestFlight and Play internal testing

- Type: story
- Parent: E9
- Labels: type:story, area:infra, priority:p0
- Milestone: M4
- Size: M
- Blocked by: E9-S5, E9-S3

## User story

As the developer, I want the app installable through TestFlight and Google Play internal testing,
so that I and a few friends can use it daily.

## Context

ba-brief §1 Success, M4 definition.

## Acceptance criteria

- [ ] Given a production build, then it's available in TestFlight to internal testers.
- [ ] Given a production build, then it's available on the Play internal testing track.
- [ ] Given a tester installs it, then they can sign in, add a friend, greet via Telegram, see history and get a reminder.

## Business rules

- Privacy policy URL is set in both consoles (E9-S3).

## Non-functional

- §6 Privacy (store privacy questionnaires answered truthfully).

## Dependencies

Blocked by: E9-S5, E9-S3

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E9-S6-T1] Submit to TestFlight

- Type: task
- Parent: E9-S6
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: S
- Blocked by: E9-S5-T3

## What

App Store Connect app record, `eas submit` for iOS, export compliance answers, internal testers.

## Done when

- [ ] Build installable from TestFlight on the developer's iPhone.

## Learning notes

- TestFlight internal vs external testing (external needs a short Beta App Review).

### [E9-S6-T2] Release to Google Play internal testing

- Type: task
- Parent: E9-S6
- Labels: type:task, area:infra, priority:p0
- Milestone: M4
- Size: S
- Blocked by: E9-S5-T3

## What

Play Console app, first `.aab` upload (manual the first time, then `eas submit`), internal testing
track, testers list, Data safety basics.

## Done when

- [ ] Build installable from Play internal testing on an Android device.

## Learning notes

- Play tracks: internal → closed → open → production.

### [E11] Public release

- Type: epic
- Labels: type:epic, area:infra, priority:p0
- Milestone: M5
- Size: —

## Goal

GreetDay is live on the App Store and Google Play (D24), with store listings and privacy disclosures
that match what the app does, and a launch checklist that has been run.

## Scope

- Store listing texts, screenshots and privacy forms (moved here from the former E9-S7)
- App Store review submission and release
- Google Play production access and a staged rollout
- Launch checklist

## Out of scope

- Marketing site, app store optimization, paid promotion
- Localized listings (D11: English only)
- Fixes found in review (they become new issues)

## Screens

All screens (store screenshots); S-01 (sign-in notes for App Review); S-13 (account deletion).

## Stories

(sub-issues)

## Done when

- A new user can find GreetDay in both public stores, install it, sign in against the production API and complete the core loop.

### [E11-S1] Store listings and privacy disclosures

- Type: story
- Parent: E11
- Labels: type:story, area:infra, priority:p0
- Milestone: M5
- Size: — (≈2.5 days of tasks)
- Blocked by: E9-S6, E9-S3

## User story

As someone browsing the store, I want a clear listing with real screenshots and honest privacy
details, so that I know what GreetDay does with my data before I install it.

## Context

ba-brief §1 (public release is the last milestone), §6 Privacy; D10, D24. Moved from the former E9-S7
(store listing, p2) and now required for M5.

## Acceptance criteria

- [ ] Given App Store Connect, then name, subtitle, description, keywords, category, support URL, privacy policy URL, age rating and screenshots in the required sizes are filled in.
- [ ] Given Play Console, then app name, short and full description, category, contact email, privacy policy URL, content rating, target audience, app icon, feature graphic and phone screenshots are filled in.
- [ ] Given the screenshots, then they come from a production build with the design-brief §7 sample data, never real people's data.
- [ ] Given App Privacy (Apple) and Data safety (Google), then the answers match what the app stores and sends: account email and name, friends' names, birthdays and optional details, greeting texts, push token, error-tracking diagnostics; data encrypted in transit; account deletion in the app (D10).
- [ ] Given the listing texts and screenshots, then the product owner approved them.

## Business rules

- D10, D11, D24.

## Non-functional

- §6 Privacy.

## Dependencies

Blocked by: E9-S6, E9-S3

## Assumptions / open questions

- Assumption: plain device screenshots and a simple feature graphic made from the app icon and brand colors (Open question 35).
- Assumption: Play's account-deletion link points at a static page that explains in-app deletion (E9-S3, Open question 36).

## Tasks

(sub-issues)

### [E11-S1-T1] App Store listing texts and screenshots

- Type: task
- Parent: E11-S1
- Labels: type:task, area:infra, priority:p0
- Milestone: M5
- Size: M
- Blocked by: E9-S6-T1

## What

Write the App Store texts (name, subtitle, description, keywords), set category, age rating, support
and privacy policy URLs, and capture screenshots in the sizes App Store Connect asks for.

## Done when

- [ ] Listing saved with no missing required fields; texts and screenshots approved by the product owner.

## Learning notes

- App Store metadata belongs to an app version: most fields change only with the next submission
  (promotional text is the exception).

### [E11-S1-T2] Google Play listing texts and graphics

- Type: task
- Parent: E11-S1
- Labels: type:task, area:infra, priority:p0
- Milestone: M5
- Size: M
- Blocked by: E9-S6-T2

## What

Write the Play store listing (short and full description), upload the icon, feature graphic and phone
screenshots, and complete the "App content" declarations (privacy policy, ads, content rating, target
audience, app access).

## Done when

- [ ] Store listing and App content sections complete in Play Console; texts approved by the product owner.

## Learning notes

- Play separates the store listing from "App content" declarations; both must be complete before a
  release can be reviewed.

### [E11-S1-T3] App Privacy and Data safety forms

- Type: task
- Parent: E11-S1
- Labels: type:task, area:infra, priority:p0
- Milestone: M5
- Size: S
- Blocked by: E9-S6-T1, E9-S6-T2

## What

Answer Apple's App Privacy questionnaire and Google's Data safety form so they match the privacy
policy (E9-S3) and what the app actually sends; add the account-deletion link Play asks for.

## Done when

- [ ] Both forms submitted; answers cross-checked against the privacy policy.

## Learning notes

- "Collected" in store privacy forms means data that leaves the device to you or a third party (your
  API, error tracking, push service), even if you never sell it.

### [E11-S2] App Store review and release

- Type: story
- Parent: E11
- Labels: type:story, area:infra, priority:p0
- Milestone: M5
- Size: M
- Blocked by: E11-S1

## User story

As the product owner, I want GreetDay approved by App Review and released, so that iPhone users can
install it from the App Store.

## Context

D24; Sign in with Apple is offered next to Google on iOS (D20); account deletion is in Settings (D10).

## Acceptance criteria

- [ ] Given the submission, then the review notes explain that sign-in uses Apple or Google, that greetings open in Telegram (an external app), and where account deletion is.
- [ ] Given export compliance and content questions, then they're answered.
- [ ] Given a rejection, then each reason becomes a new issue and the build is resubmitted after the fixes.
- [ ] Given approval and a ticked launch checklist (E11-S4), then the version is released and installable from the App Store.

## Business rules

- D10, D20, D24.

## Non-functional

- §6 Privacy.

## Dependencies

Blocked by: E11-S1

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E11-S2-T1] Submit the app for App Store review

- Type: task
- Parent: E11-S2
- Labels: type:task, area:infra, priority:p0
- Milestone: M5
- Size: S
- Blocked by: E11-S1-T1, E11-S1-T3

## What

Pick the TestFlight build, write the review notes, answer export compliance, choose manual release,
and submit.

## Done when

- [ ] Submission accepted for review; status tracked on this issue.

## Learning notes

- The App Review guidelines that matter most here: login services (Sign in with Apple), account
  deletion, and apps that hand off to other apps.

### [E11-S2-T2] Release on the App Store

- Type: task
- Parent: E11-S2
- Labels: type:task, area:infra, priority:p0
- Milestone: M5
- Size: XS
- Blocked by: E11-S2-T1, E11-S4-T1

## What

After approval and the launch checklist, release the version manually and check the public listing.

## Done when

- [ ] App installable from the public App Store; sign-in works against production.

## Learning notes

- Manual vs automatic release after approval, and phased release for later updates.

### [E11-S3] Google Play production rollout

- Type: story
- Parent: E11
- Labels: type:story, area:infra, priority:p0
- Milestone: M5
- Size: M
- Blocked by: E11-S1

## User story

As the product owner, I want GreetDay on Google Play production, so that Android users can install it.

## Context

D24. New personal Google Play developer accounts must run a closed test before they can publish to
production (at the time of writing: at least 12 testers opted in for 14 days; check Play Console for
the current rule). Organization accounts don't have this step.

## Acceptance criteria

- [ ] Given the account needs it, then a closed test with the required testers has run for the required time and production access is granted.
- [ ] Given production access, then the release goes out as a staged rollout and is increased only while error tracking (E0-S5) shows no new crash spike.
- [ ] Given the rollout reaches 100%, then the app is installable from Google Play.

## Business rules

- D24.

## Non-functional

- §6 Reliability (staged rollout), §6 Observability.

## Dependencies

Blocked by: E11-S1

## Assumptions / open questions

- Assumption: GreetDay is published from a personal Play account that needs the closed test (Open question 34).

## Tasks

(sub-issues)

### [E11-S3-T1] Closed test for Play production access

- Type: task
- Parent: E11-S3
- Labels: type:task, area:infra, priority:p0
- Milestone: M5
- Size: S
- Blocked by: E11-S1-T2, E11-S1-T3

## What

Promote the internal-testing build to a closed testing track, invite the testers, keep them opted in
for the required period, then apply for production access.

## Done when

- [ ] Production access granted in Play Console (or confirmed not needed for this account).

## Learning notes

- Play testing tracks (internal → closed → open → production) and why new personal accounts must
  prove the app with real testers first.

### [E11-S3-T2] Production release with a staged rollout

- Type: task
- Parent: E11-S3
- Labels: type:task, area:infra, priority:p0
- Milestone: M5
- Size: S
- Blocked by: E11-S3-T1, E11-S4-T1

## What

Create the production release with a staged rollout percentage, watch error tracking, and raise it to
100%.

## Done when

- [ ] App installable from the public Google Play listing at 100% rollout.

## Learning notes

- Staged rollouts: ship to a percentage of users first and halt if crash rates rise.

### [E11-S4] Launch checklist

- Type: story
- Parent: E11
- Labels: type:story, area:infra, priority:p0
- Milestone: M5
- Size: S
- Blocked by: E11-S1

## User story

As the developer, I want a launch checklist, so that nothing basic (backups, monitoring, legal pages,
support) is missed when real users arrive.

## Context

ba-brief §6 (Reliability, Observability, Privacy); the production setup from E9 and E0-S5.

## Acceptance criteria

- [ ] Given the checklist, then it covers: production backups and a recent restore drill (E9-S1), uptime alert and logs (E9-S2-T5), error tracking receiving production events (E0-S5), privacy policy and terms URLs live (E9-S3), a monitored support contact, current production secrets and credentials (E9-S5), the release tagged in git, and how to roll back the API and halt a store rollout.
- [ ] Given each store release, then the checklist is run and every item ticked before pressing release.

## Business rules

- None.

## Non-functional

- §6 Reliability, §6 Observability, §6 Privacy.

## Dependencies

Blocked by: E11-S1

## Assumptions / open questions

- None.

## Tasks

(sub-issues)

### [E11-S4-T1] Write and run the launch checklist

- Type: task
- Parent: E11-S4
- Labels: type:task, area:infra, priority:p0
- Milestone: M5
- Size: S
- Blocked by: E11-S1

## What

Write the checklist in the repo (e.g. next to the environments doc) and run it once for 1.0, noting
results on this issue.

## Done when

- [ ] Checklist committed; every item ticked for the 1.0 release.

## Learning notes

- A checklist turns "I think it's fine" into checked facts; the restore drill and the alert test are
  the items most often skipped.

## 3. Dependency order

Effort is the sum of task sizes (XS 2 h, S 4 h, M 8 h; one "dev-day" = 8 focused hours, which on
evenings and weekends is roughly a week of calendar time per 1.5–2 dev-days). Within a milestone, items
on the same line can run in any order; arrows are hard dependencies (see each issue's `Blocked by`).

**Design first (ba-brief §7):** milestones run strictly in order M0 → M1 → … → M5, and nothing in
M1–M5 starts before E10-S11 (design handoff) is closed. Every M1–M5 issue without another blocker
lists `E10-S11` in `Blocked by`; E1-S1 is also blocked by the tokens export (E10-S1-T5).

### M0 Design (about 24 design-days of task size)

1. E10-S1 tokens: T1 → T2, T3 → T4 (Tokens page), T5 (tokens export for E1-S1).
2. E10-S2 components: T1 → T2, T3, T4 → T5 (library published). E10-S10 (icon, splash) can run any
   time after E10-S1-T2.
3. Screen stories, any order once the library is published: E10-S3 (F1), E10-S4 (F2, F3), E10-S5
   (F4), E10-S6 (F5), E10-S7 (F6), E10-S8 (F7, F8).
4. E10-S9 offline: pattern (T1) after the library, boards (T2) after the screens they cover.
5. E10-S11: flows (T1) and small-screen check (T2) → handoff link and review (T3).
6. Exit check: the developer clicks through the six flows from the view-mode link, inspects boards,
   and accepts the handoff.

The `product-designer` agent does the Penpot work quickly; the real calendar time is the developer's
review of each task in Penpot, so plan one short review session per story.

### M1 Foundations (about 21 dev-days)

1. After the handoff: SP-4, SP-5 (decisions first; record each with `/adr`). In parallel: E0-S4
   (development builds), E0-S1, E0-S2.
2. E1-S1 (tokens export from E10-S1-T5) → E1-S2, E1-S3.
3. E2-S1-T1 → E2-S2-T1 → E2-S1 (rest) → E2-S2 (server auth; contracts first: E2-S1-T2).
4. E0-S3 (cache, offline read and the E10-S9 offline pattern, before the first data screen).
5. E2-S3 (Sign In, session restore, navigation gating) → E2-S4 (priming).
6. Exit check: sign in with Apple (iOS) and Google (iOS and Android), see five empty tabs.

### M2 Core loop (about 28.5 dev-days)

1. SP-1 and SP-2 at the start (SP-2 doesn't block M2 work but must finish before M3). E4-S1 (pure
   domain rules: D13, D14, D16, D17) can start any time.
2. E1-S4 (components), in parallel with E3-S1 (friends contracts → table → endpoints).
3. E3-S3 → E3-S4; E3-S2; E3-S5 (needs E4-S1).
4. E4-S2 (Upcoming).
5. E5-S1 (greetings contracts → table → endpoints) → E5-S2 (Compose) → E5-S3 (Telegram hand-off,
   needs SP-1).
6. E4-S3 (Greeted status), then E4-S4 (Calendar, p1).
7. Exit check: add a friend, see them on Upcoming, send a greeting via Telegram, see "Greeted".

### M3 Complete MVP (about 18 dev-days plus the SP-2 follow-up delivery issues)

1. E6-S1 → E6-S2, E6-S3 → E6-S4 (p1).
2. E7-S1 → E7-S2; E7-S3 (only if SP-2 picks server push); E7-S4 with the SP-2 follow-ups → E7-S5.
3. E8-S1 → E8-S2 → E8-S3 (delete account; Apple revocation E8-S3-T3 → T4 → T5, D21).
4. E0-S5 (error tracking) before M4, so TestFlight testers' crashes are visible.
5. Exit check: history, reminders, settings, sign out and account deletion work on both platforms.

### M4 Release (about 10 dev-days)

1. SP-3 → E9-S1 → E9-S2.
2. E9-S3 (draft from a template → product-owner review → publish → link; start early) and E9-S4
   (assets from E10-S10).
3. E9-S5 → E9-S6.
4. Exit check: installed from TestFlight and Play internal testing, using the production API. M4 ends here.

### M5 Public release (about 5 dev-days, plus store review and Play testing wait times)

1. E11-S1 (listings, privacy forms) and E11-S4 (launch checklist).
2. Start E11-S3-T1 (Play closed test) as soon as the Play listing and Data safety form are done: if
   the account needs it, it takes about 14 calendar days and dominates M5.
3. E11-S2 (App Review) and E11-S3-T2 (Play production rollout), each released only after the checklist.
4. Exit check: GreetDay is installable from the public App Store and Google Play.

Total: about 24 design-days (M0) and 82 dev-days (M1–M5).

Critical path: E10-S1 → E10-S2 → E10 screen stories (E10-S3 … E10-S8) → E10-S9 / E10-S11-T1 →
E10-S11-T3 handoff (M0 exit) → SP-4 / SP-5 → E2-S1 / E2-S2 → E2-S3 (M1 exit) → E3-S1 → E5-S1 →
E5-S2 → E5-S3 (M2 exit) → E7-S1 → E7-S4 with the SP-2 follow-ups → E7-S5, in parallel with E8-S1 →
E8-S2 → E8-S3 (M3 exit) → SP-3 → E9-S1 → E9-S2 → E9-S5 → E9-S6 (M4 exit) → E11-S1 → E11-S3 (closed
test, ~14 calendar days) and E11-S2 → release (M5 exit).

## 4. Traceability check

### Screens

| Screen | Design (M0)                      | Build stories              |
| ------ | -------------------------------- | -------------------------- |
| S-01   | E10-S3-T1                        | E2-S3, E9-S3               |
| S-02   | E10-S3-T2                        | E2-S4                      |
| S-03   | E10-S4-T1, E10-S11-T2, E10-S9-T2 | E4-S2, E4-S3, E1-S2 ("+")  |
| S-04   | E10-S4-T2                        | E4-S4                      |
| S-05   | E10-S5-T1, E10-S9-T2             | E3-S2                      |
| S-06   | E10-S5-T2, E10-S9-T2             | E3-S3, E3-S4               |
| S-07   | E10-S5-T3, E10-S9-T2             | E3-S5, E6-S4               |
| S-08   | E10-S6-T1, E10-S6-T2, E10-S11-T2 | E5-S2, E5-S3               |
| S-09   | E10-S6-T2                        | E5-S3                      |
| S-10   | E10-S7-T1, E10-S9-T2             | E6-S2                      |
| S-11   | E10-S7-T2, E10-S9-T2             | E6-S3                      |
| S-12   | E10-S7-T2                        | E6-S4                      |
| S-13   | E10-S8-T1, E10-S9-T2             | E8-S1, E8-S2, E8-S3, E9-S3 |
| S-14   | E10-S8-T2, E10-S9-T2             | E7-S2 (data: E7-S1)        |
| S-15   | E10-S8-T3                        | E7-S4, E7-S5               |

### Design-brief §10 deliverables

| Deliverable                                     | Design issues               | Used by                                         |
| ----------------------------------------------- | --------------------------- | ----------------------------------------------- |
| 1. Tokens page and tokens JSON                  | E10-S1 (T4 page, T5 export) | E1-S1                                           |
| 2. Components page, shared library              | E10-S2                      | E1-S2, E1-S3, E1-S4                             |
| 3. Every screen and state, `S-XX / State`       | E10-S3 … E10-S8             | screen stories above                            |
| 4. Six prototype flows                          | E10-S11-T1                  | E2-S3, E5-S3, E7-S5 (flow references)           |
| 5. Small-screen check (S-03, S-08 at 375 × 667) | E10-S11-T2                  | E4-S2, E5-S2                                    |
| 6. Handoff view-mode link                       | E10-S11-T3                  | every M1–M5 entry point (`Blocked by: E10-S11`) |
| 7. Avatar color tokens (new)                    | E10-S1-T2                   | E1-S1, E1-S4                                    |
| 8. Offline states (new)                         | E10-S9                      | E0-S3 and the screen stories                    |
| 9. App icon and splash (new)                    | E10-S10                     | E9-S4                                           |

### Decisions

| Decision                                                                         | Stories                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------------ |
| D1 Upcoming home, 5 tabs                                                         | E1-S2, E4-S2, E10-S2                             |
| D2 Saved on Telegram tap, copy doesn't save                                      | E5-S3, E5-S1, E6-S1, E6-S2, E6-S3                |
| D3 Global reminder settings and defaults                                         | E7-S1, E7-S2, E7-S4, E10-S8                      |
| D4 Year optional, no age without year                                            | E4-S1, E3-S1, E3-S3, E3-S4, E3-S5                |
| D5 Feb 29 on Feb 28 in non-leap years                                            | E4-S1, E3-S5, E4-S4, E7-S4                       |
| D6 Greeted window                                                                | E4-S1, E4-S3, E5-S1                              |
| D7 Closeness levels                                                              | E3-S1, E3-S3                                     |
| D8 Telegram username or phone                                                    | E3-S1, E3-S3, E5-S3                              |
| D9 Initials avatars                                                              | E1-S4, E10-S1, E10-S2                            |
| D10 Cascading deletes                                                            | E3-S1, E3-S4, E5-S1, E8-S3                       |
| D11 English, light theme, semantic tokens                                        | E1-S1, E1-S3, E1-S4, E10-S1, E10-S2              |
| D12 One cross-platform design                                                    | E1-S1, E1-S3, E1-S4, E10-S2                      |
| D13 Greeted window: 7 days before through the birthday                           | E4-S1, E4-S3, E10-S4                             |
| D14 Upcoming sections: calendar periods, Monday–Sunday week                      | E4-S1, E4-S2, E10-S4                             |
| D15 Birth year 1900–current year, Feb 29 needs a leap year                       | E3-S1, E3-S3, E10-S5                             |
| D16 Feb 29 shown as Feb 29, computed on Feb 28                                   | E3-S2, E3-S5, E4-S1, E4-S2, E4-S4, E7-S4, E10-S4 |
| D17 "Today" / "Tomorrow" / "in N days"                                           | E4-S1, E4-S2, E1-S4, E10-S2, E10-S4              |
| D18 Reminders: master on, one per friend, current time zone, none after sign-out | SP-2, E7-S1, E7-S3, E7-S4, E8-S2                 |
| D19 S-02 once per install; permission banner; "Off" summary                      | E2-S3, E2-S4, E7-S2, E8-S1, E10-S8               |
| D20 Apple iOS only, no account linking, Apple account display                    | SP-5, E2-S1, E2-S3, E8-S1, E10-S3, E10-S8        |
| D21 Revoke Apple tokens on account deletion                                      | E2-S1, E2-S3, E8-S3, E9-S5                       |
| D22 Hand-off: no Telegram without a save, fallback channel, 4,096 cap            | SP-1, E5-S1, E5-S2, E5-S3, E10-S6                |
| D23 Duplicates, name-only search, History swipe confirmation                     | E3-S1, E3-S2, E3-S3, E6-S2, E10-S5, E10-S7       |
| D24 Public store release in scope (M5)                                           | E11 (E11-S1 … E11-S4)                            |
| D25 Legal pages from a template, product-owner review                            | E9-S3                                            |

### Non-functional requirements (ba-brief §6) and E0 items (ba-brief §7)

| Requirement / item                                   | Stories or "Already in place"                    |
| ---------------------------------------------------- | ------------------------------------------------ |
| Security: HTTPS                                      | E9-S2                                            |
| Security: provider token verification                | E2-S1                                            |
| Security: secure device storage                      | E2-S3                                            |
| Security: per-user scoping, validation               | E3-S1, E5-S1, E6-S1, E7-S1, E7-S3, E8-S3         |
| Security: rate limiting on auth                      | E2-S1                                            |
| Privacy: account deletion                            | E8-S3                                            |
| Privacy: policy and terms pages                      | E9-S3, E11-S1 (store privacy forms)              |
| Reliability: reminders on time, no dupes, time zones | SP-2, E7-S4, E7-S3                               |
| Performance: ~2 s with 300 friends                   | E4-S2, E3-S1, E5-S1-T5, E3-S1-T7                 |
| Accessibility                                        | E10-S1, E10-S2, E1-S3, E1-S4, every screen story |
| Offline behavior                                     | E10-S9, E0-S3, every screen story                |
| Observability: structured logs                       | AIP-6, E9-S2-T5                                  |
| Observability: error tracking                        | E0-S5                                            |
| Quality: lint, typecheck, tests in CI                | AIP-2                                            |
| Quality: migrations on deploy                        | E9-S2-T4                                         |
| Monorepo, TypeScript, linting                        | AIP-1                                            |
| Docker Compose for local dev                         | AIP-3                                            |
| Environments, config, secrets                        | E0-S1 (API env validation: AIP-5)                |
| Drizzle setup                                        | AIP-4                                            |
| Expo app scaffold, API client                        | AIP-7, AIP-9, E0-S2, E0-S4                       |
| Error-handling conventions                           | AIP-5, E0-S2                                     |
| Milestone M0 Design (new)                            | E10                                              |
| Milestone M5 Public release (new)                    | E11                                              |

## 5. Open questions

For the product owner. Numbering continues after the 30 questions of the first review, which were
all answered on 2026-10-20 (see "Resolved decisions" below). Each names the brief section it comes
from and the assumption used until it's answered. None blocks M0; 31 must be answered before E9-S3
(M4) and 34–36 before E11 (M5).

31. **Where the privacy policy and terms pages live** (ba-brief §6 Privacy; the remaining part of Q17). Which domain or host, given the URLs can't change after store submission? Assumption (E9-S3): simple static pages, e.g. GitHub Pages.
32. **Board names: design brief vs product-designer agent** (design-brief §2.3 `S-XX / State`, e.g. `S-03 / Empty`, vs `.claude/agents/product-designer.md`, which shows `S-03 Upcoming / loading`). Assumption (E10): the design brief wins. Please align the agent file (the BA can't edit it).
33. **"Tomorrow" and Feb 29 wording outside list rows** (ba-brief D16, D17; design-brief S-03 row date, S-07 header, S-15 in-advance body). D17 covers relative labels, but S-07 ("Birthday in 23 days") and S-15 ("is in 3 days (Oct 20)") use their own sentences, and the S-03 row date has a weekday that doesn't exist for Feb 29 in non-leap years. Assumption (E3-S5, E4-S2, E7-S4, E10-S4): "Birthday tomorrow"; "Sofia Lee's birthday is tomorrow (Oct 20)."; Feb 29 rows print "Feb 29" without a weekday in non-leap years, and S-15 prints "(Feb 29)".
34. **Google Play account type and closed testing** (ba-brief §7 M5, D24). New personal Play developer accounts must run a closed test (currently at least 12 testers opted in for 14 days) before production access; organization accounts don't. Which account publishes GreetDay, and who are the testers? Assumption (E11-S3): a personal account, so the closed test is needed; it dominates M5's calendar time.
35. **Store graphics** (ba-brief §7 E11 vs design-brief §10). Google Play needs a feature graphic, and neither brief lists store graphics; E10 excludes them. Assumption (E11-S1-T2): plain device screenshots and a simple feature graphic made from the app icon and brand colors by the developer. Say so if you want a design task for it instead.
36. **Account-deletion web link for Google Play** (ba-brief §6 Privacy, D10). Play's Data safety section asks apps with accounts for a web link where users can request account and data deletion; the MVP deletes only in the app (S-13). Assumption (E9-S3, E11-S1-T3): a static page next to the privacy policy that explains in-app deletion and gives a contact email; no web deletion feature.

Notes for the developer (not product questions):

- From Q29: existing GitHub issues still weren't checked (the read-only GitHub tool isn't available
  in this session). `/backlog-to-issues` skips issues whose title starts with the same `[ID]`, but an
  older issue with a different title would be duplicated. Check the dry run against the repo.
- IDs of the first version are unchanged. If issues were already created from it, close `[E9-S7]` and
  `[E9-S7-T1]` by hand (moved to E11-S1); the script never edits or closes issues, so changed labels,
  blockers and texts of existing issues must also be updated by hand.

## 6. Resolved decisions

Answered by the product owner on 2026-10-20. Product rules were added to ba-brief §3 as D13–D25;
design-relevant ones to design-brief §9 (A3, A4, A8–A18) and §10 (items 7–9).

| #   | Question (first review)                       | Answer (2026-10-20)                                                                                                                                                                                                                                                                                                   | Applied in                                     |
| --- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | Greeted window boundaries                     | From 7 days before the birthday through the end of the birthday; the next day the friend rolls to next year (a Jan 2 birthday greeted on Dec 28 counts for that Jan 2). **D13**                                                                                                                                       | E4-S1, E4-S1-T3, E4-S3, E10-S4                 |
| 2   | Upcoming section boundaries                   | Calendar periods, week always Monday–Sunday: This week = today through Sunday; This month = rest of the calendar month after this week; Later = beyond. Week crossing into the next month: those days stay in This week, This month is empty and hidden, and the next month's days after Sunday are in Later. **D14** | E4-S1, E4-S1-T4, E4-S2, E4-S4, E10-S4          |
| 3   | Feb 29 with a non-leap birth year, year range | Rejected; lowest year 1900; future years rejected. **D15**                                                                                                                                                                                                                                                            | E3-S1, E3-S1-T1, E3-S3, E10-S5                 |
| 4   | Master reminder default, S-14 banner          | Master switch on by default; S-14 shows the "Notifications are off" banner whenever permission isn't granted and asks for permission if never asked. **D18, D19**                                                                                                                                                     | E7-S1, E7-S1-T2, E7-S2, E10-S8                 |
| 5   | Settings summary when reminders are off       | "Off". **D19**                                                                                                                                                                                                                                                                                                        | E8-S1, E10-S8                                  |
| 6   | S-02 "shown once"                             | Once per installation. **D19**                                                                                                                                                                                                                                                                                        | E2-S3, E2-S4                                   |
| 7   | Several in-advance reminders on one day       | One notification per friend. **D18**                                                                                                                                                                                                                                                                                  | SP-2, E7-S4, E7-S4-T1                          |
| 8   | Save fails on the Telegram tap                | Telegram doesn't open; error with retry. **D22**                                                                                                                                                                                                                                                                      | E5-S3, E10-S6                                  |
| 9   | 4,096 characters                              | Hard cap: input stops, the API rejects more. **D22**                                                                                                                                                                                                                                                                  | E1-S4, E5-S1, E5-S2, E10-S2, E10-S6            |
| 10  | Sign in with Apple on Android                 | iOS only; Google on both. **D20**                                                                                                                                                                                                                                                                                     | SP-5, E2-S1, E2-S1-T4, E2-S3, E10-S3           |
| 11  | Account linking                               | None; Apple and Google sign-ins are separate accounts. **D20**                                                                                                                                                                                                                                                        | E2-S1                                          |
| 12  | Revoke Apple tokens on account deletion       | Yes, as backend work under E8-S3 (no longer left to SP-5). **D21**                                                                                                                                                                                                                                                    | E2-S1-T2, E2-S3-T5, E8-S3-T3 … T5, E9-S5-T1    |
| 13  | Apple hides name or email                     | Show what's available (name, else private-relay email) plus "Signed in with Apple". **D20**                                                                                                                                                                                                                           | E8-S1, E10-S8                                  |
| 14  | Avatar background colors                      | Designed as avatar color tokens.                                                                                                                                                                                                                                                                                      | E10-S1-T2, E1-S1, E1-S4                        |
| 15  | Offline states                                | Designed; the designer decides banner vs read-only patterns.                                                                                                                                                                                                                                                          | E10-S9, E0-S3, screen stories                  |
| 16  | App icon and splash                           | Designed in M0, no outside designer.                                                                                                                                                                                                                                                                                  | E10-S10, E9-S4                                 |
| 17  | Privacy policy and terms                      | Start from a generated template; the product owner reviews them. **D25** Hosting location still open (Q31).                                                                                                                                                                                                           | E9-S3, E9-S3-T3                                |
| 18  | Public store release                          | In scope: milestone M5 Public release, epic E11; M4 ends at internal testing. **D24**                                                                                                                                                                                                                                 | E9, E11                                        |
| 19  | Duplicate friend rule                         | Trimmed, case-insensitive name + same day and month. **D23**                                                                                                                                                                                                                                                          | E3-S1-T1, E3-S3, E10-S5                        |
| 20  | History swipe-to-delete                       | Confirms with the same dialog as S-11. **D23**                                                                                                                                                                                                                                                                        | E6-S2, E10-S7                                  |
| 21  | `area:shared` label                           | Added for `libs/contracts` and `libs/domain`; `area:backend` is `apps/api` only.                                                                                                                                                                                                                                      | every contracts/domain task; intro conventions |
| 22  | Copy for 1 day away                           | "Tomorrow" ("Today" for 0, "in N days" otherwise). **D17**                                                                                                                                                                                                                                                            | E1-S4, E4-S1-T4, E4-S2, E10-S2, E10-S4         |
| 23  | Reminders after sign-out                      | The device push token is removed; reminders stop on that device. **D18**                                                                                                                                                                                                                                              | E7-S3, E8-S2                                   |
| 24  | Channel for the copy-and-open fallback        | "Telegram". **D22**                                                                                                                                                                                                                                                                                                   | SP-1, E5-S1, E5-S3                             |
| 25  | Friends search scope                          | Names only. **D23**                                                                                                                                                                                                                                                                                                   | E3-S2, E10-S5                                  |
| 26  | Feb 29 display in non-leap years              | Show Feb 29; countdown, Upcoming position, Calendar day and reminders use Feb 28. **D16**                                                                                                                                                                                                                             | E3-S2, E3-S5, E4-S1, E4-S2, E4-S4, E7-S4       |
| 27  | Design work tracking                          | Design first: milestone M0 Design with epic E10 for the `product-designer` agent; every M1–M5 entry point is blocked by the handoff (E10-S11).                                                                                                                                                                        | E10, intro conventions, dependency order       |
| 28  | Milestone moves                               | Approved: E0-S5 in M3, E1-S4 in M2, SP-2 in M2, SP-3 in M4.                                                                                                                                                                                                                                                           | ba-brief §7                                    |
| 29  | Existing GitHub issues                        | Not a product question; kept as a note for the dry run (above).                                                                                                                                                                                                                                                       | —                                              |
| 30  | Time-zone change                              | Reminders fire at the chosen time in the phone's current time zone; SP-2 defines the travel-day behavior. **D18**                                                                                                                                                                                                     | SP-2, E7-S4                                    |
