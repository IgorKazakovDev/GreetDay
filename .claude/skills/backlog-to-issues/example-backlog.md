# MVP Backlog (example used to test the parser)

A small sample in the docs/product/ba-brief.md §9 format. Only the `### [ID] Title` sections become
issues; everything else (this intro, the summary table, dependency order, traceability, open
questions) is ignored by `backlog-to-issues.mjs`.

## 1. Summary

| ID       | Type  | Title                                   | Parent | Milestone | Priority | Size | Area    |
| -------- | ----- | --------------------------------------- | ------ | --------- | -------- | ---- | ------- |
| SP-1     | spike | Telegram deep link with pre-filled text | —      | M2        | p0       | S    | mobile  |
| E3       | epic  | Friends                                 | —      | M2        | p0       | —    | all     |
| E3-S1    | story | Store friends on the server             | E3     | M2        | p0       | M    | backend |
| E3-S1-T1 | task  | Create the friends table                | E3-S1  | M2        | p0       | S    | db      |
| E3-S1-T2 | task  | Friends CRUD endpoints                  | E3-S1  | M2        | p0       | M    | backend |
| E3-S2    | story | Add a friend with name and birthday     | E3     | M2        | p0       | S    | mobile  |
| E3-S2-T1 | task  | Add Friend screen                       | E3-S2  | M2        | p0       | S    | mobile  |
| E5       | epic  | Compose & Telegram                      | —      | M2        | p0       | —    | all     |
| E5-S1    | story | Send a greeting through Telegram        | E5     | M2        | p0       | M    | mobile  |
| E5-S1-T1 | task  | Save greeting endpoint                  | E5-S1  | M2        | p0       | S    | backend |
| E5-S1-T2 | task  | Compose screen with Telegram hand-off   | E5-S1  | M2        | p0       | M    | mobile  |

## 2. Issues

### [SP-1] Can a Telegram deep link open a chat with text pre-filled?

- Type: spike
- Labels: type:spike, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: —

## Question

Can a Telegram deep link open a specific user's chat (username or phone) with the text pre-filled?

## Options to compare

- `tg://resolve?domain=<username>&text=<text>`
- `https://t.me/<username>?text=<text>`
- Share sheet with chat picker

## Decision criteria

Works on iOS and Android, works with usernames and phone numbers.

## Time box

½ day.

## Output

A decision written as a comment on this issue, plus any follow-up issues created.

### [E3] Friends

- Type: epic
- Labels: type:epic, area:mobile, area:backend, area:db, priority:p0
- Milestone: M2
- Size: —

## Goal

The user keeps a list of friends with birthdays and personal context.

## Scope

- Friend data model and CRUD API
- Add friend screen

## Out of scope

- Contact-book import

## Screens

S-05, S-06

## Stories

(sub-issues)

## Done when

- A friend can be added on the phone and is stored on the server.

### [E3-S1] Store friends on the server

- Type: story
- Parent: E3
- Labels: type:story, area:backend, area:db, priority:p0
- Milestone: M2
- Size: M

## User story

As a user, I want my friends saved to my account, so that they survive reinstalling the app.

## Acceptance criteria

- [ ] Given I am signed in, when I create a friend, then only I can read it.

## Tasks

(sub-issues)

### [E3-S1-T1] Create the friends table

- Type: task
- Parent: E3-S1
- Labels: type:task, area:db, priority:p0
- Milestone: M2
- Size: S

## What

Drizzle table for friends with an optional birth year.

## Details

Proposed: `friends(id, user_id, name, birth_day, birth_month, birth_year null, …)`.

## Done when

- [ ] Migration generated and applied locally.

## Learning notes (backend/db/infra tasks only)

- Nullable column vs sentinel value for "year unknown".

### [E3-S1-T2] Friends CRUD endpoints

- Type: task
- Parent: E3-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M2
- Size: M
- Blocked by: E3-S1-T1

## What

`GET/POST/PATCH/DELETE /friends`, scoped to the signed-in user.

## Done when

- [ ] Integration tests cover another user's friend returning 404.

## Learning notes (backend/db/infra tasks only)

- Scoping every query by `user_id`.

### [E3-S2] Add a friend with name and birthday

- Type: story
- Parent: E3
- Labels: type:story, area:mobile, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S1

## User story

As a user, I want to add a friend with their name and birthday, so that I get reminded.

## Acceptance criteria

- [ ] Given a name and a day/month, when I tap Save, then the friend appears in the list.

## Tasks

(sub-issues)

### [E3-S2-T1] Add Friend screen

- Type: task
- Parent: E3-S2
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: S

## What

Screen S-06 with validation and loading/error states.

```markdown
### Not an issue: headings inside code fences are ignored
```

## Done when

- [ ] Component test for the validation errors.

### [E5] Compose & Telegram

- Type: epic
- Labels: type:epic, area:mobile, area:backend, priority:p0
- Milestone: M2
- Size: —

## Goal

The user writes a greeting and hands it off to Telegram; it is saved to history.

## Screens

S-08, S-09

## Stories

(sub-issues)

## Done when

- Tapping the Telegram button opens Telegram and saves the greeting.

### [E5-S1] Send a greeting through Telegram

- Type: story
- Parent: E5
- Labels: type:story, area:mobile, area:backend, priority:p0
- Milestone: M2
- Size: M
- Blocked by: SP-1, E3-S2

## User story

As a user, I want to send my greeting through Telegram, so that my friend gets it where we talk.

## Acceptance criteria

- [ ] Given a written greeting, when I tap Telegram, then Telegram opens and the greeting is saved (D2).

## Tasks

(sub-issues)

### [E5-S1-T1] Save greeting endpoint

- Type: task
- Parent: E5-S1
- Labels: type:task, area:backend, priority:p0
- Milestone: M2
- Size: S
- Blocked by: E3-S1-T2

## What

`POST /friends/:id/greetings` stores text, channel and created-at.

## Done when

- [ ] Integration test for saving and for an unknown friend (404).

## Learning notes (backend/db/infra tasks only)

- Foreign keys with `ON DELETE CASCADE` (D10).

### [E5-S1-T2] Compose screen with Telegram hand-off

- Type: task
- Parent: E5-S1
- Labels: type:task, area:mobile, priority:p0
- Milestone: M2
- Size: M
- Blocked by: SP-1, E5-S1-T1

## What

Screen S-08 with the context panel and the Telegram button.

## Done when

- [ ] Component test: tapping Telegram calls the save endpoint, then opens the link.

## 3. Dependency order

### M2

1. SP-1, E3-S1 → E3-S2 → E5-S1

## 4. Traceability check

| Ref  | Stories |
| ---- | ------- |
| S-06 | E3-S2   |
| D2   | E5-S1   |

## 5. Open questions

1. None in this example.
