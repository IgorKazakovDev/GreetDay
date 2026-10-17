# mvp-backlog.md format

```markdown
# MVP Backlog

Free text here is ignored.

## M1: Foundations

Optional milestone description (one paragraph).

### E1: Accounts and sign-in

Labels: type:epic, area:api, area:mobile, priority:p0
Epic description in Markdown.

#### E1.1: Sign in with email magic link

Labels: type:story, area:api, priority:p0
As a … I want … so that …

**Acceptance criteria**

- [ ] Given …, when …, then …

**Out of scope** …
**Design** S-01
**Notes** …

## Later: Not in MVP

### E9: …

## Open questions

Anything under a level-2 heading without an `ID:` prefix is ignored.
```

Rules:

- `## <MilestoneID>: <title>` starts a milestone (IDs like `M1`, `M2`, `Later`).
- `### <EpicID>: <title>` is an epic issue (`E1`, `E2`…), `#### <StoryID>: <title>` is a story
  sub-issue of the epic above it (`E1.1`, `E1.2`…). IDs must be unique.
- An optional `Labels:` line right after the heading, comma-separated.
- Everything else until the next heading of the same or higher level is the issue body. Inside a
  story, use bold text or `#####` headings for sub-sections, never `##`–`####`.
- Issue titles become `[E1.1] Sign in with email magic link`.
