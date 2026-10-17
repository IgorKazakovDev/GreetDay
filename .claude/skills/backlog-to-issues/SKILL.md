---
name: backlog-to-issues
description: Creates GitHub labels, milestones, epic issues and story sub-issues from docs/product/mvp-backlog.md using the gh CLI. Dry run by default; prints what it would create.
argument-hint: '[--apply] [path/to/backlog.md]'
disable-model-invocation: true
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/backlog-to-issues.mjs *) Bash(gh auth status *) Bash(gh repo view *)
---

# Backlog → GitHub issues

The backlog must follow [format.md](format.md) (the `business-analyst` agent writes it that way).

1. Check prerequisites: `gh auth status` and `gh repo view --json nameWithOwner`. If `gh` is missing or
   not logged in, stop and tell the developer how to fix it (README → "GitHub CLI").
2. **Always dry-run first:**
   `node ${CLAUDE_SKILL_DIR}/backlog-to-issues.mjs docs/product/mvp-backlog.md`
   Show the developer the summary: labels, milestones, epics, stories, items that already exist
   (skipped), and any parse warnings. Parse warnings must be fixed in the backlog first.
3. Only if `$ARGUMENTS` contains `--apply` **and** the developer confirms after seeing the dry run:
   `node ${CLAUDE_SKILL_DIR}/backlog-to-issues.mjs docs/product/mvp-backlog.md --apply`
   (Claude Code will ask permission for each `gh` write; that's expected.)
4. Report what was created (issue numbers/URLs) and what was skipped.

The script is idempotent: issues are matched by their `[ID]` title prefix, labels are upserted,
milestones are matched by title. Re-running after editing the backlog only adds new items. It
never edits or closes existing issues.
