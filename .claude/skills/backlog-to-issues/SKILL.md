---
name: backlog-to-issues
description: Creates GitHub labels, milestones M1–M4, epic/story/task/spike issues, sub-issue links and blocked-by links from docs/product/mvp-backlog.md using the gh CLI, optionally adding them to a GitHub Project. Dry run by default; prints the issue tree it would create.
argument-hint: '[--apply] [--project <number>] [path/to/backlog.md]'
disable-model-invocation: true
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/backlog-to-issues.mjs docs/product/mvp-backlog.md) Bash(gh auth status *) Bash(gh repo view *)
---

# Backlog → GitHub issues

The backlog follows `docs/product/ba-brief.md` §9 (the `business-analyst` agent writes it that
way); the parser's exact rules are in [format.md](format.md).

1. Check prerequisites: `gh auth status` and `gh repo view --json nameWithOwner`. If `gh` is missing,
   not logged in, or the repo has no GitHub remote, stop and tell the developer how to fix it
   (README → "GitHub CLI"). With `--project`, the token also needs the project scope:
   `gh auth refresh -s project`.
2. **Always dry-run first** (add `--project <number>` if it is in `$ARGUMENTS`):
   `node ${CLAUDE_SKILL_DIR}/backlog-to-issues.mjs docs/product/mvp-backlog.md`
   Show the developer the summary: labels, milestones, the issue tree with parents and blockers,
   items that already exist (`=`), skipped extras with their reasons, and any warnings. Warnings
   must be fixed in the backlog first (hand them to the `business-analyst` agent).
3. Only if `$ARGUMENTS` contains `--apply` **and** the developer confirms after seeing the dry run:
   `node ${CLAUDE_SKILL_DIR}/backlog-to-issues.mjs docs/product/mvp-backlog.md --apply [--project <number>]`
   Claude Code asks permission once for this command; the `gh` calls it makes inside are not
   prompted separately, so the dry run is the review step.
4. Report what was created (issue numbers/URLs), what was skipped and why, and any problems.

What `--apply` does, in order:

1. Creates the §8 labels and milestones M1–M4 that don't exist yet (existing ones are left as is).
2. Creates each issue as `[ID] Title` with its labels, milestone and, for organization repos that
   define them, its issue type (Epic / Feature / Task / Spike).
3. Links each new issue to its `Parent` as a sub-issue.
4. Adds `Blocked by` links with GitHub's issue-dependencies API, after all issues exist. If the API
   isn't available, it appends `Blocked by #n` lines to the new issue's body instead.
5. With `--project <number>`, adds issues that aren't in the project yet and sets Status (Backlog),
   Priority, Size and Area when the project has those fields and options.

Guarantees: idempotent (issues are matched by their `[ID]` title prefix, milestones by `M1`… title
prefix), so re-running after editing the backlog only adds new items. It never edits, closes or
deletes existing issues, and it calls `gh` without a shell.
