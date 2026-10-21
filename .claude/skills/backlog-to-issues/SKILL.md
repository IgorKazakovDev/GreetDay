---
name: backlog-to-issues
description: Creates GitHub labels, milestones M0–M5, epic/story/task/spike issues, sub-issue links and blocked-by links from docs/product/mvp-backlog.md using the gh CLI, one milestone batch at a time if wanted, optionally filling GitHub Project fields. Dry run by default; prints the issue tree, the write count and how long it will take. Paced for GitHub's rate limits and resumable.
argument-hint: '[--apply] [--milestone M0,M1] [--project <number>] [path/to/backlog.md]'
disable-model-invocation: true
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/backlog-to-issues.mjs docs/product/mvp-backlog.md) Bash(gh auth status *) Bash(gh repo view *)
---

# Backlog → GitHub issues

The backlog follows `docs/product/ba-brief.md` §9 (the `business-analyst` agent writes it that
way); the parser's exact rules are in [format.md](format.md).

## Before the first import: let the Project do the board work (recommended)

Every GitHub write counts against GitHub's secondary rate limits (about 80 content writes per
minute and 500 per hour, including what you click in the web UI). The full backlog is about 860
writes without `--project` and about 2,000 with it, because each Project item and field is a
separate write. The Project's built-in workflows do most of that board work for free, so set them
up once, **before** importing (auto-add only picks up issues created or changed after it is on):

1. Project → ⋯ → **Workflows** → **Auto-add to project**: pick this repo, filter `is:issue`, turn it on.
2. **Item added to project**: set Status to **Backlog**, turn it on.

Then import without `--project`. Priority and area are on the issues as `priority:` and `area:`
labels. To also fill the Project's Priority/Size/Area fields, run once more with
`--project <number>` later: items already exist then, so it only fills empty fields.

## Steps

1. Check prerequisites: `gh auth status` and `gh repo view --json nameWithOwner`. If `gh` is missing,
   not logged in, or the repo has no GitHub remote, stop and tell the developer how to fix it
   (README → "GitHub CLI"). `--project` also needs the project scope: `gh auth refresh -s project`.
2. **Always dry-run first** with the same options as the real run:
   `node ${CLAUDE_SKILL_DIR}/backlog-to-issues.mjs docs/product/mvp-backlog.md [--milestone M0,M1] [--project <number>]`
   Show the developer: warnings, the issue tree (`+` new, `= #12` exists), links to add, links that
   wait for a later milestone (`~`), skipped extras with reasons, and the **write estimate and
   duration** for both modes. Warnings must be fixed in the backlog first (hand them to the
   `business-analyst` agent).
3. Suggest importing in milestone batches (`--milestone M0,M1`, then `M2`, …) so each run stays
   well under an hour; links to issues of a later batch are added when that batch is imported.
4. Only if `$ARGUMENTS` contains `--apply` **and** the developer confirms after seeing the dry run,
   run the same command with `--apply`. Claude Code asks permission once for it; the `gh` calls
   inside are not prompted separately, so the dry run is the review step. Long runs: start it in the
   background and tell the developer how long the estimate says.
5. Report what was created and linked, what was skipped and why, and any problems. If it stopped
   (rate limit, network), the fix is to re-run the same command later.

## What `--apply` does

1. Creates the §8 labels and milestones M0–M5 that don't exist yet (existing ones are left as is).
2. Creates the selected issues as `[ID] Title` with labels, milestone and, for organization repos
   that define them, the issue type (Epic / Feature / Task / Spike).
3. Adds every missing sub-issue link (`Parent`) and blocked-by link (GitHub's issue-dependencies
   API; without it, `Blocked by #n` lines go into the body of issues created in this run). A link
   counts when either end is selected, and links that already exist are read back first.
4. With `--project <number>`: adds selected issues that aren't on the Project and fills **empty**
   Status (Backlog), Priority, Size and Area fields. Values already set are never changed.

**Rate limits.** Writes are at least 1 s apart. The script pauses with a message before 450 writes
in a rolling hour (it remembers recent write times in a temp file, so back-to-back runs share
the budget). On a secondary-rate-limit error it waits for GitHub's `retry-after` (or the
rate-limit reset), otherwise 60 s doubling, and after 5 retries stops with "re-run to resume".

**Resumable and safe.** Issues are matched by their `[ID]` title prefix and milestones by `M0`…
title prefix, so a re-run creates only what's missing and repairs missing links, Project items and
empty fields, including gaps left by earlier runs. It never edits titles or bodies of existing
issues, never closes or deletes anything, and calls `gh` without a shell.
