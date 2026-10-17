---
name: adr
description: Records an architecture or product decision (e.g. a spike result, a library choice, a deviation from the plan) as docs/decisions/NNNN-title.md with context, options, decision and consequences. Use when a non-obvious decision is made or reversed.
argument-hint: '<decision title>'
---

# Record a decision

1. List `docs/decisions/` and take the next number (4 digits: `0007`). Read related ADRs. If this
   decision replaces one, the new ADR says `Supersedes 000N` and the old one gets
   `Status: Superseded by 000M` (that is the only edit allowed to an old ADR).
2. Create `docs/decisions/NNNN-<kebab-title>.md` from [template.md](template.md), title from `$ARGUMENTS`.
3. Fill it from the conversation, spike notes or code. Options must be real alternatives with
   honest pros and cons. Keep it to about one page. If you don't know the decision yet, set
   `Status: Proposed` and list what's needed to decide.
4. Link it from where it matters (the issue, a CLAUDE.md gotcha, or a code comment) only if it changes how people work.
