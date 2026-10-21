---
name: work-on
description: Playbook for the main session to take one story or spike from the GitHub Project board to a pull request. Tidies finished parents, picks the next Ready story, moves cards as work happens, delegates each task to the developer agent for its area, reviews, and opens one PR per story.
argument-hint: '[story ID like E3-S2 | issue number]'
disable-model-invocation: true
---

# Work on a story

You, the **main session**, run this flow yourself. You are the orchestrator: you delegate tasks to
the developer agents with the Agent tool, and they report back to you. (Subagents can't start other
subagents, so never hand this playbook to an agent.)

**Board helper:** `node .claude/skills/work-on/board.mjs <command>`. Always run it from the repo root
with exactly that path (the permission rules match it). Pass issue numbers without `#` (`57`, not `#57`:
the shell reads `#` as a comment). Commands: `next`, `show <ID|number>`,
`status <ID|number> "<Status>" [--assign-me]`, `close-done-parents [--apply]`.
If it says gh is missing, not logged in, lacks the `project` scope, or `.claude/github.json` is
empty, show the developer its message and stop.

**One story = one branch = one pull request.** Each task is one commit on that branch.

## Who moves which card

Status flow (ba-brief §8): Backlog → Ready → In progress → In review → Done.

| Move                                   | Who                                               |
| -------------------------------------- | ------------------------------------------------- |
| Backlog → Ready                        | the developer, on the board                       |
| story and task → In progress           | `/work-on`                                        |
| task → Done (after its commit)         | `/work-on`; the issue stays open until the merge  |
| story → In review (after the PR opens) | `/work-on`                                        |
| everything → Done and closed on merge  | GitHub (`Closes #n` + built-in project workflows) |
| epics, leftover stories → closed       | `/work-on` step 1, after you confirm              |

Project workflows: keep **"Item closed" → Done** and **"Pull request merged" → Done** on. Keep
**"Auto-close issue" (when Status is Done) off**: task cards move to Done before the PR merges, and
that workflow would close them early.

## 1. Tidy

Run `close-done-parents` (dry run). If it lists anything, show the list and ask
"Close these N issues?". Only on a yes run `close-done-parents --apply`.

## 2. Pick

- `$ARGUMENTS` names a story or spike → `show <it>`. If it isn't open, or is blocked by an open
  issue, say so and ask whether to continue anyway.
- Otherwise → `next`. It picks the first Ready story/spike by milestone (M0…M5), then priority
  (P0 > P1 > P2), then ID, skipping anything blocked by an open issue, and prints the tasks in work order.
  If it lists items already In progress, offer to resume one of those instead.

Show the developer the choice, the **why** line, and the task list, then **wait for their OK**.
An `ID` on its own is a story (`E3-S2`) or spike (`SP-1`); for a task or epic, ask which story they mean.

## 3. Start (stories)

1. `status <story> "In progress" --assign-me`
2. Branch from an up-to-date `main` (CLAUDE.md conventions): `feat/<story-number>-<slug>`, using the
   "Suggested branch" from `show`/`next`; use `fix/` or `chore/` when the story is clearly a fix or
   chore. Resuming? Check out the existing branch instead and skip tasks whose card is already Done.

## 4. For each task, in the printed work order

Skip closed tasks and tasks already Done. If a task is blocked by an open issue **outside** the
story, stop and ask.

1. `status <task> "In progress"`
2. `show <task>` gives the brief: the task body plus the parent story's acceptance criteria.
3. Delegate by the task's `area:` label, passing the brief, the branch name, and the instruction
   "don't commit; report what changed":

   | Label                     | Who                                                                                                   |
   | ------------------------- | ----------------------------------------------------------------------------------------------------- |
   | `area:backend`, `area:db` | `backend-developer` (its `/db-migration` still stops to show the SQL and wait for approval: relay it) |
   | `area:shared`             | `backend-developer`: contracts/domain first, before any api or mobile task that uses them             |
   | `area:mobile`             | `mobile-developer`                                                                                    |
   | `area:design`             | `product-designer` (needs Penpot open with the MCP plugin connected; if not, ask the developer)       |
   | `area:infra`              | you, in this session, explaining each step in plain words as you go                                   |

   Relay the agent's "What I did and why" to the developer; don't summarize it away.

4. If the tests look thin for the acceptance criteria, run `test-writer` on the change.
5. `/verify`. Fix failures the task caused (send them back to the same agent), then re-run.
6. Show the changed files and a proposed message, and **ask before committing**. One Conventional
   Commit per task, scope = Nx project, ending with the task's issue number:
   `feat(db): friends table (#58)`. Stage only that task's files.
7. `status <task> Done`. The issue stays open; the PR closes it on merge.

## 5. Review

Run `code-reviewer` on the whole branch (`git diff main...HEAD`) with the story's acceptance
criteria. Send each finding to the agent that owns that area, as above, and commit the fixes (ask
first, `fix(<project>): … (#<task>)`). Repeat until the reviewer has no blocking findings, then
`/verify` again.

## 6. Ship

1. **Ask before pushing**, then `git push -u origin <branch>`.
2. `gh pr create --base main --title "<type>(<scope>): <story title>" --body "<body>"` (it asks for
   permission). Body: a short summary of the story and what changed per task, how it was verified,
   anything the developer must check (migration SQL, security-relevant code), then one line per issue:
   `Closes #<story>` and `Closes #<task>` for every task.
3. `status <story> "In review"`. Share the PR link.

## 7. Hand back

The developer reviews and merges. GitHub then closes the story and its tasks and the project keeps
them in Done. The epic closes at a later `/work-on`, in step 1.

## Spikes (`SP-n`)

1. `status <spike> "In progress" --assign-me`. No branch unless the spike needs code (a prototype
   goes on `chore/<number>-<slug>` and is not merged without asking).
2. Research within the time box in the issue body; delegate area questions to the matching agent.
3. Show the decision (question, options, decision, why) and **ask before posting** it with
   `gh issue comment <number> --body "<decision>"`.
4. Offer `/adr <title>` to record it in `docs/decisions/`.
5. **Ask before closing**: `gh issue close <number> --reason completed`. Then mention any stories
   the spike unblocked.

## Rules

- Never push, commit, comment, close or open a PR without the developer's yes in this conversation.
- Never move a card the table above doesn't give to `/work-on`, and never move cards of other stories.
- If an acceptance criterion can't be met as written, stop and ask; suggest the `business-analyst`
  agent to refine the story.
- Finish (end of step 6, or when stopping early) with what is done, what is left, and the card
  states. If anything in `apps/api`, `libs/db`, `docker/`, CI or Expo-specific code changed, end with a
  short plain-language "what we did and why" (CLAUDE.md) and offer `/explain <topic>`.
