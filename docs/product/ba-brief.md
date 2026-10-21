# Birthday Tracker — Project Brief for Business Analyst

**Audience:** Business Analyst agent producing the MVP backlog for GitHub Projects
**Version:** 1.1 · 20 Oct 2026 (product-owner answers to the first backlog review: §3 D13–D25, §7 M0 Design and M5 Public release, §8 `area:shared`) · 1.0 · 17 Oct 2026
**Owner / Product owner / Sole developer:** Igor Kazakov

---

## 0. Your task

You are a senior business analyst. Turn this brief into a **complete, implementation-ready MVP backlog** for GitHub Projects, structured as **Epic → Story → Task**.

**Inputs you have:**

1. This brief: product scope, decisions, tech context and backlog rules.
2. `design-brief.md` (in this folder): the screen-level UX specification (screens `S-01`…`S-15`, states, business rules, copy, sample data). Treat it as the source of truth for UI behavior and reference its screen IDs.
3. Penpot mockups and the exported design-tokens JSON, once available. Reference them by board name (`S-XX / State`).

**Your output:** see §9. In short, one Markdown backlog file with every issue in a fixed format, plus a short list of open questions.

**Ground rules**

- Do not add features beyond the MVP scope in §2. If you see a gap, list it under "Open questions", don't invent a requirement.
- Mark every assumption you make explicitly as `Assumption:` inside the issue.
- When something is genuinely ambiguous and blocks a story, **ask the product owner** before writing it.
- Write in English.

---

## 1. Product summary

A mobile app (iOS + Android) that helps people never miss a friend's birthday. The user keeps a list of friends with birthdays and personal context, gets push reminders, writes a personal greeting in the app and sends it through Telegram. Every greeting is saved so the user can review what they sent to whom. AI-generated greetings come in a later phase.

**Core loop:** reminder → open friend context → write greeting → hand off to Telegram → greeting saved to history.

**Target users:** adults with a wide social circle who use Telegram as their main messenger and want greetings to feel personal.

**Success for the MVP:** the developer can use the app daily with real friends: add friends, get reminders on time, send greetings via Telegram, and see history. Published to TestFlight and Google Play internal testing; public store release is the last milestone.

---

## 2. MVP scope

### In scope

| #   | Feature                                                                                  | Design brief ref |
| --- | ---------------------------------------------------------------------------------------- | ---------------- |
| F1  | Authentication (Sign in with Apple, Google Sign-In) and first run (notification priming) | S-01, S-02       |
| F2  | Upcoming (home) list with "Today" block and "Greeted" status                             | S-03             |
| F3  | Calendar month view                                                                      | S-04             |
| F4  | Friends: list, search, add/edit/delete, profile with optional details                    | S-05, S-06, S-07 |
| F5  | Compose greeting and hand off to Telegram (deep link or share)                           | S-08, S-09       |
| F6  | Greeting history (overall, per friend, detail, delete, send again)                       | S-10, S-11, S-12 |
| F7  | Settings and account (sign out, **delete account**)                                      | S-13             |
| F8  | Push reminders with one global setting                                                   | S-14, S-15       |
| —   | Design system implementation (tokens + shared components)                                | Design brief §2  |
| —   | Project foundations: repo, CI, Docker, environments, hosting, release builds             | —                |

### Out of scope (do not write stories for these)

- .ics / calendar import (planned for a later phase)
- AI greeting generation (later phase; the data model and Compose screen must not block it)
- Dark mode (tokens are prepared, no dark screens)
- Tablet, web, landscape
- Photo avatars, contact-book import
- Localization beyond English
- Messengers other than Telegram
- Per-friend reminder settings
- Telegram bot or MTProto/user-session integration

---

## 3. Product decisions already made

These are settled. Don't reopen them; reflect them in acceptance criteria.

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Home screen is the **Upcoming list**; Calendar is a separate tab. Tabs: Upcoming, Calendar, Friends, History, Settings.                                                                                                                                                                                                                                                              |
| D2  | A greeting is **saved to history when the user taps the Telegram button**. The app cannot confirm the message was actually sent. "Copy text" alone doesn't save. The user can delete a history entry.                                                                                                                                                                                |
| D3  | Reminders: **global settings only**: master toggle, "On the day" toggle, "In advance" (None / 1 day / 3 days / 1 week, default 3 days), notification time (default 09:00, phone's local time zone).                                                                                                                                                                                  |
| D4  | Birthday year is optional. No year → no age shown anywhere.                                                                                                                                                                                                                                                                                                                          |
| D5  | Feb 29 birthdays are shown and reminded on **Feb 28** in non-leap years.                                                                                                                                                                                                                                                                                                             |
| D6  | "Greeted" = a greeting saved for this friend from **7 days before** this year's birthday onward.                                                                                                                                                                                                                                                                                     |
| D7  | Closeness levels: Close friend / Friend / Acquaintance (optional).                                                                                                                                                                                                                                                                                                                   |
| D8  | Telegram contact is either a username or a phone number in international format.                                                                                                                                                                                                                                                                                                     |
| D9  | Avatars are initials only.                                                                                                                                                                                                                                                                                                                                                           |
| D10 | Deleting a friend deletes their greeting history. Deleting the account deletes all user data permanently.                                                                                                                                                                                                                                                                            |
| D11 | UI is English only, light theme only, built on semantic design tokens exported from Penpot.                                                                                                                                                                                                                                                                                          |
| D12 | One custom cross-platform design (no separate iOS/Android variants).                                                                                                                                                                                                                                                                                                                 |
| D13 | "Greeted" window: from **7 days before** the birthday **through the end of the birthday** (phone's local date). The next day the friend rolls to next year's birthday (a Jan 2 birthday greeted on Dec 28 counts for that Jan 2).                                                                                                                                                    |
| D14 | Upcoming sections are **calendar periods**, weeks run **Monday–Sunday**: Today (block); This week = today through Sunday; This month = rest of the calendar month after this week; Later = beyond, within 12 months. If this week crosses into the next month, those days stay in This week, This month is then empty (hidden), and the next month's days after Sunday are in Later. |
| D15 | Birth year (optional) is 1900 to the current year; the full date can't be after today; Feb 29 needs a leap birth year.                                                                                                                                                                                                                                                               |
| D16 | Feb 29 birthdays are **shown as Feb 29**; countdown, Upcoming position, Calendar day and reminders use **Feb 28** in non-leap years (refines D5).                                                                                                                                                                                                                                    |
| D17 | Relative day copy: "Today" (0 days), "Tomorrow" (1 day), "in N days" otherwise.                                                                                                                                                                                                                                                                                                      |
| D18 | Reminders: master switch **on** by default; one in-advance notification **per friend**; reminders fire at the chosen time in the phone's **current** time zone (the travel-day behavior is defined by SP-2); a signed-out device gets no reminders (its push token is removed).                                                                                                      |
| D19 | The notification priming screen (S-02) is shown **once per installation**. S-14 shows the "notifications are off" banner whenever permission isn't granted and asks for permission if it was never asked. The Settings reminders summary reads "Off" when reminders are off.                                                                                                         |
| D20 | Sign in with Apple on **iOS only**; Google on iOS and Android. No account linking: Apple and Google sign-ins are separate accounts. When Apple hides the name or email, Settings shows what's available (name, else the private-relay email) plus "Signed in with Apple".                                                                                                            |
| D21 | Deleting the account **revokes the user's Sign in with Apple tokens**.                                                                                                                                                                                                                                                                                                               |
| D22 | Telegram hand-off: if saving fails on the Telegram tap, Telegram doesn't open (error with retry); the copy-and-open fallback is saved with channel "Telegram"; greeting text is capped at **4,096 characters** (input stops, the API rejects more).                                                                                                                                  |
| D23 | Friends: a duplicate is the same trimmed, case-insensitive name with the same day and month (non-blocking warning); Friends search matches names only. History swipe-to-delete confirms with the same dialog as Greeting Detail.                                                                                                                                                     |
| D24 | The **public store release is in scope** as the last milestone (M5), after TestFlight / Play internal testing (M4).                                                                                                                                                                                                                                                                  |
| D25 | The privacy policy and terms start from a generated template; the product owner reviews them.                                                                                                                                                                                                                                                                                        |

---

## 4. Technical context

| Layer          | Choice                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Mobile         | React Native + Expo, TypeScript. Expo push notifications. EAS Build for store builds.                                    |
| Backend        | Node.js + Fastify, TypeScript. REST/JSON API.                                                                            |
| Database       | PostgreSQL, schema and migrations with Drizzle ORM.                                                                      |
| Infrastructure | Docker for local development and deployment. Hosting **not decided** (see §5).                                           |
| Auth           | The app gets an ID token from Apple/Google; the backend verifies it and issues its **own** access token + refresh token. |
| Repo / board   | GitHub; backlog in GitHub Projects.                                                                                      |
| Design         | Penpot; design tokens exported as JSON (W3C DTCG format).                                                                |

**Conceptual data entities** (for the BA to reference; the developer designs the actual schema):
User · Auth identity (provider + provider user id, linked to User) · Refresh session · Friend (name, birthday day/month, optional year, how-we-know, interests, closeness, Telegram contact) · Greeting (friend, text, channel, created-at) · Reminder settings (per user) · Push token (per device).

**Design for the AI phase:** greetings must stay linked to friends with full text and timestamps, and friend profile fields must stay structured (interests as a list, not free text), so a later AI feature can use them.

---

## 5. Open technical questions → write as Spike issues

Each of these becomes a time-boxed **Spike** task (output: a short written decision added to the issue, ≤ 1 day). Stories that depend on a spike must link to it as blocked-by.

| Spike | Question                                                                                                                                                                                                  | Blocks              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| SP-1  | Can a Telegram deep link open a **specific user's chat** (by username or phone) **with text pre-filled**? If not, confirm the fallback: copy text + open chat, or share sheet with chat picker.           | F5 stories          |
| SP-2  | Reminder delivery: **server-side scheduled job + Expo push** vs **local notifications scheduled on the device**. Consider time zones, travel, app not opened for weeks, multiple devices.                 | F8 stories          |
| SP-3  | Hosting: VPS with Docker Compose (e.g., Hetzner) vs PaaS with managed Postgres (Railway, Render, Fly.io). Criteria: cost, backups, ease of deploys for a solo dev, cron/worker support (depends on SP-2). | Deployment tasks    |
| SP-4  | Data model and migrations for the entities in §4, including handling of birthdays without a year and Feb 29.                                                                                              | All backend stories |
| SP-5  | Token strategy: access/refresh lifetimes, refresh rotation, storage on device (secure storage), logout and revoke.                                                                                        | F1, F7              |

---

## 6. Non-functional requirements

Turn these into acceptance criteria on relevant stories, or into separate stories under the Foundations / Release epics.

- **Security:** all API traffic over HTTPS; provider ID tokens verified server-side (signature, audience, issuer, expiry); tokens stored in secure device storage; every API query scoped to the authenticated user (no access to other users' data); input validation on every endpoint; rate limiting on auth endpoints.
- **Privacy:** store only the data the features need; account deletion removes all user data (App Store requirement); privacy policy and terms pages exist before store submission. The app doesn't read the user's Telegram data.
- **Reliability:** reminders fire on the correct local date and time; no duplicate notifications; behavior defined when the user changes time zone.
- **Performance:** Upcoming screen usable within ~2 s on a mid-range phone with 300 friends; lists virtualized.
- **Accessibility:** WCAG AA contrast, 44 × 44 pt tap targets, screen-reader labels on interactive elements, supports larger system fonts.
- **Offline behavior:** define per screen what's shown without network (at minimum: last loaded data is visible, and actions that need the server show a clear error with retry).
- **Observability:** structured backend logs; error tracking on mobile and backend (tool to be chosen in a task).
- **Quality:** linting, type-checking and automated tests run in CI on every pull request; DB migrations run automatically on deploy.

---

## 7. Suggested epics and milestones

Use these as the starting point. You may split or merge epics if you explain why in the open-questions list.

| Epic                   | Contents                                                                                                                                                                                                                                                 | Milestone |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| E10 Design             | Penpot tokens (incl. avatar colors) and tokens JSON export, component library, every screen S-01…S-15 with every state, offline states, app icon and splash, six prototype flows, small-screen check, handoff link. Done by the `product-designer` agent | M0        |
| E0 Foundations         | Monorepo or repos, TypeScript configs, linting, CI (GitHub Actions), Docker Compose for local dev (API + Postgres), environments (dev/prod), config and secrets, Drizzle setup, Expo app scaffold, API client, error handling conventions                | M1        |
| E1 Design system       | Import Penpot tokens into a RN theme, typography, shared components from design brief §2.2, navigation shell with 5 tabs                                                                                                                                 | M1        |
| E2 Authentication      | Apple + Google sign-in, backend token verification, sessions/refresh, sign out, first-run flow, notification priming                                                                                                                                     | M1        |
| E3 Friends             | Data model, CRUD API, Friends list + search, Add/Edit with validation and duplicate warning, Friend Profile                                                                                                                                              | M2        |
| E4 Upcoming & Calendar | Upcoming sections and "Today" block, Greeted status, Calendar month view, birthday date logic (no year, Feb 29, age)                                                                                                                                     | M2        |
| E5 Compose & Telegram  | Compose screen with context panel, Telegram hand-off per SP-1, save on tap, Telegram unavailable sheet, copy text                                                                                                                                        | M2        |
| E6 Greeting history    | History list, search, friend filter, detail, delete, send again, friend's greetings                                                                                                                                                                      | M3        |
| E7 Reminders           | Reminder settings API + screen, push token registration, scheduling per SP-2, notification content and deep links into the app                                                                                                                           | M3        |
| E8 Settings & account  | Settings screen, sign out, delete account (backend cascade)                                                                                                                                                                                              | M3        |
| E9 Release             | Hosting and deploy per SP-3, production database and backups, app icons/splash (artwork from E10), privacy policy and terms, EAS builds, TestFlight + Play internal testing                                                                              | M4        |
| E11 Public release     | Store listings, screenshots and privacy forms, App Store review submission, Google Play production rollout, launch checklist                                                                                                                             | M5        |

**Milestones**

- **M0 Design:** Penpot tokens, components, every MVP screen and flow are designed and handed off.
- **M1 Foundations:** user can sign in and sees the empty tabbed app.
- **M2 Core loop:** user can add friends, see upcoming birthdays and send a greeting via Telegram.
- **M3 Complete MVP:** history, reminders, settings and account deletion work.
- **M4 Release:** app is deployed and installable through TestFlight / Play internal testing (M4 ends here).
- **M5 Public release:** app is live on the App Store and Google Play.

**Design first (decided 20 Oct 2026):** no development work runs in parallel with design. Every M1–M5
item without another blocker is blocked by the E10 design handoff.

**Approved layout changes (20 Oct 2026):** E0 error tracking is scheduled in M3 (nothing needs it before
testers arrive); E1 list/form components are in M2 (M1 stays focused on sign-in); spike SP-2 is in M2
(so reminders aren't blocked in M3); spike SP-3 is in M4 (it depends on SP-2 and only blocks deployment).

---

## 8. GitHub Projects conventions

### Hierarchy

- Use GitHub **sub-issues**: Epic → Story → Task.
- Use GitHub **issue types** where available: `Epic`, `Feature` (for stories), `Task`, `Spike`. Also apply the matching `type:` label so filtering works either way.

### Labels

- `type:epic`, `type:story`, `type:task`, `type:spike`
- `area:mobile` (apps/mobile), `area:backend` (apps/api only), `area:shared` (libs/contracts, libs/domain), `area:db`, `area:infra`, `area:design`
- A task has exactly one `area:` label; work that touches contracts and the API is two tasks.
- `priority:p0` (MVP blocker), `priority:p1` (MVP should-have), `priority:p2` (nice to have, can slip)

### Project fields

- **Status:** Backlog → Ready → In progress → In review → Done
- **Priority:** P0 / P1 / P2
- **Size:** XS (≤ 2 h), S (≤ ½ day), M (≤ 1 day), L (≤ 2 days). Tasks must be **M or smaller**; split anything larger.
- **Milestone:** M0–M5
- **Area:** mobile / backend / shared / db / infra / design

### Issue templates

**Epic**

```
## Goal
<one paragraph: user/business outcome>
## Scope
- <bullets>
## Out of scope
- <bullets>
## Screens
S-XX, S-YY
## Stories
(sub-issues)
## Done when
- <epic-level exit criteria>
```

**Story**

```
## User story
As a <user>, I want <capability>, so that <benefit>.
## Context
<why, links to design brief section and Penpot boards S-XX / State>
## Acceptance criteria
- [ ] Given <context>, when <action>, then <result>.
- [ ] ... (cover happy path, empty, loading, error, validation, edge cases)
## Business rules
- <rules from the design brief / decisions D1–D12 that apply>
## Non-functional
- <relevant items from §6>
## Dependencies
Blocked by: #<spike or story>
## Assumptions / open questions
- Assumption: ...
## Tasks
(sub-issues)
```

**Task**

```
## What
<concrete technical work, one area only>
## Details
<for backend/db: proposed endpoint (method, path, request/response shape, error codes) or tables/columns — marked "Proposed", the developer finalizes>
<for mobile: screen/component, states to implement, API calls>
## Done when
- [ ] <verifiable checks, including tests>
## Learning notes (backend/db/infra tasks only)
<1–3 bullets on the concept involved and a pointer to what to read: e.g., "unique index vs app-level duplicate check", "refresh token rotation">
```

**Spike**

```
## Question
## Options to compare
## Decision criteria
## Time box
## Output
A decision written as a comment on this issue, plus any follow-up issues created.
```

### Definition of Ready (story)

User story, acceptance criteria, screen references, dependencies and size of every task are filled in; no blocking open questions.

### Definition of Done (story)

All acceptance criteria pass on iOS and Android; tests for business logic and API endpoints; CI green; reviewed; matches Penpot mock; no new lint or type errors.

---

## 9. Required output

Produce **one Markdown file `mvp-backlog.md`** with:

1. **Summary table:** every issue with ID, type, title, parent, milestone, priority, size, area.
2. **Issues**, ordered Epic → its Stories → each Story's Tasks, each as:
   ```
   ### [E3-S2] Add a friend with name and birthday
   - Type: story
   - Parent: E3
   - Labels: type:story, area:mobile, area:backend, priority:p0
   - Milestone: M2
   - Size: —            (stories: sum of tasks; tasks: XS/S/M)
   - Blocked by: SP-4, E2-S1
   <issue body using the template from §8>
   ```
   ID scheme: `E<n>` epics, `E<n>-S<m>` stories, `E<n>-S<m>-T<k>` tasks, `SP-<n>` spikes.
3. **Dependency order:** a suggested build order of stories within each milestone.
4. **Traceability check:** a table mapping every screen `S-01`…`S-15` and every decision `D1`–`D12` to the stories that implement it. Every row must have at least one story.
5. **Open questions** for the product owner, numbered.

The file's structure must be consistent enough that a script can turn each `###` section into a GitHub issue with the `gh` CLI.

---

## 10. About the developer (affects task writing)

- Solo developer: Senior Frontend Engineer, ~8–9 years of React, strong TypeScript, knows Next.js, has built a BFF layer.
- Some Node.js/Fastify experience; **new to SQL and database design**. The project is also a learning vehicle for backend, auth and databases.
- So: mobile tasks can be concise; backend, database, auth and infra tasks should be **smaller and more explicit**, and include the "Learning notes" section.
- Works in iterations on evenings/weekends; keep tasks completable in one sitting (≤ 1 day).
