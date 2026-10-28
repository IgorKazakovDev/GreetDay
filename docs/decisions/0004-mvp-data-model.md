# 0004. MVP data model: birthday as month/day/year, text + checks, cascades from users

- **Status:** Accepted
- **Date:** 2026-10-28
- **Deciders:** Igor Kazakov (drafted by Claude Code)
- **Related:** issue #44 (SP-4, full table list in the decision comment); ba-brief §4, D4, D10,
  D15, D16, D22; design-brief F4 data fields; open parts in SP-2 (#94) and SP-5 (#45)

## Context

The table tasks in E2, E3, E5 and E7 need agreed shapes for users, auth identities, refresh sessions,
friends, greetings, reminder settings and push tokens. The hard part is the birthday: the year is
optional (D4), Feb 29 is shown as Feb 29 but counted on Feb 28 in non-leap years (D16), and a
birth year must be 1900 or later, with Feb 29 only in a leap year (D15). A Postgres `date` always
has a year. Other constraints: every user-owned table has `user_id` + index + cascade
(`.claude/rules/migrations.md`); greetings keep full text and stay linked to friends for the AI phase
(ba-brief §4); the developer is new to SQL, and migrations are forward-only.

## Options considered

### Option A: birthday as one `date` column with a placeholder year

- Pros: Postgres rejects impossible dates by itself; one column; SQL date functions work.
- Cons: "year unknown" needs a fake leap year (e.g. `0004`) or an extra `has_year` flag that can
  disagree with the date; every reader (age, "turns N", D15 rule, API, seed, AI prompts) must know
  the year may be fake; recurring birthdays use only month and day anyway.

### Option B: `birth_month` + `birth_day` NOT NULL, `birth_year` NULL

- Pros: "year unknown" is a real `NULL`, typed `number | null` all the way to the app; Feb 29 is
  stored as entered; matches the S-06 form and the API contract.
- Cons: date validity (no Feb 30, Feb 29 only in a leap year) must be written as check constraints.

### Smaller choices (same pattern of trade-off)

- Interests: `text[]` vs a `friend_interests` table. The array is always read and written with the
  friend; a table adds a join and diff-on-update for no MVP query.
- Telegram: `telegram_type` + `telegram_value` vs nullable `username` and `phone`. The pair matches
  the one-of control (D8); two columns would allow both at once.
- Closed sets (closeness, channel, provider, platform): `pgEnum` vs `text` + check + Zod enum.
  Postgres can't drop or rename enum values without recreating the type; a check is a drop + add.

## Decision

We choose **Option B** for birthdays, `text[]` for interests, `telegram_type` + `telegram_value`
(both null or both set), and `text` + `CHECK (... IN (...))` + Zod enum for closed sets, typed in
Drizzle with `.$type<>()`. Every user-owned table references `users` with `ON DELETE CASCADE` and
an index. `greetings` references `friends` through a composite foreign key `(friend_id, user_id)`
→ `friends (id, user_id)` with `ON DELETE CASCADE`, so a friend's deletion removes their greetings
(D10) and a greeting can never point at another user's friend. Age, the Feb 28 shift, Upcoming,
Calendar and "Greeted" are computed in `@greetday/domain`, not SQL. The column-by-column proposal
is in the #44 comment; drizzle-kit 0.31 generated the expected SQL for it.

## Consequences

- Positive: no magic values; the database enforces the F4 rules as a last line behind Zod;
  deleting an account is one `DELETE FROM users`; adding a channel value is a small migration.
- Negative / accepted trade-offs: hand-written check constraints for day/month/leap year;
  "not after today" (D15) and per-item limits (interest length, Telegram format) live only in Zod;
  the composite FK needs an extra `UNIQUE (id, user_id)` on `friends`.
- Follow-ups: E3-S1-T3 and E5-S1-T2 use these shapes (closeness/Telegram checks, composite FK,
  History index `(user_id, created_at DESC, id DESC)`); SP-5 decides storing Apple's refresh token
  for D21 and a `family_id` on refresh sessions; SP-2 decides `time_zone`, a delivery log and
  whether `push_tokens` is needed.
