# mvp-backlog.md format

The format is defined in [docs/product/ba-brief.md](../../../docs/product/ba-brief.md) §9 (issue
sections), §8 (labels, issue templates) and §7 (milestones). [example-backlog.md](example-backlog.md)
is a small complete sample. This file only lists the extra rules `backlog-to-issues.mjs` relies on.

## What becomes an issue

- Every `### [ID] Title` heading starts an issue; the GitHub title is `[ID] Title`.
  IDs: `E<n>` epic, `E<n>-S<m>` story, `E<n>-S<m>-T<k>` task, `SP-<n>` spike.
- Everything else is ignored: the intro, the summary table, and the document sections
  `## Summary`, `## Issues`, `## Dependency order` / `## Build order`, `## Traceability check`,
  `## Open questions` and `## Already in place` (numbering like `## 3. Dependency order` is fine).
  Those headings also end the issue above them.

## Inside an issue section

1. Metadata bullets right after the heading, in any order:

   | Bullet          | Required       | Values                                                                                     |
   | --------------- | -------------- | ------------------------------------------------------------------------------------------ |
   | `- Type:`       | yes            | `epic`, `story`, `task`, `spike`; must match the ID shape                                  |
   | `- Parent:`     | stories, tasks | story → its epic (`E3`), task → its story (`E3-S2`); spike: optional, an epic or story     |
   | `- Labels:`     | yes            | §8 labels only: one `type:` matching Type, one `priority:`, ≥ 1 `area:` (tasks: exactly 1) |
   | `- Milestone:`  | yes            | `M0`–`M5`                                                                                  |
   | `- Size:`       | tasks, spikes  | tasks/spikes `XS`, `S`, `M`; epics/stories `—` or `XS`–`L`                                 |
   | `- Blocked by:` | no             | comma-separated IDs from this file (or `#123` for an existing issue), `—` for none         |

   A trailing `(comment)` in a value is ignored.

2. Then the body, using the §8 template for its type. Body sections are `##` headings
   (`## Goal`, `## Acceptance criteria`…); use `####` for anything deeper, never `###`.
   Headings inside code fences are ignored.

## Warnings

The dry run reports malformed sections (bad or duplicate IDs, unknown labels such as `area:api`,
wrong Parent, missing metadata, tasks larger than M, unknown Blocked-by IDs). `--apply` refuses to
run until there are none.
