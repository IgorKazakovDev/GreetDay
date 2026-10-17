---
name: verify
description: Runs the same checks as CI (Nx affected lint, typecheck and test) and summarizes failures with suggested fixes. Use before finishing any task, before committing, or when the developer types /verify.
argument-hint: '[--all]'
allowed-tools: Bash(pnpm nx *) Bash(docker compose ps *) Bash(git status *) Bash(git diff *)
---

# Verify

1. If any API project is affected, make sure Postgres is up: `docker compose ps --format '{{.Name}} {{.Status}}'`.
   If it isn't running, tell the developer to run `docker compose up -d` (don't start it yourself),
   then continue with the other checks.
2. Run the checks:
   - Default: `pnpm nx affected -t lint typecheck test --output-style=static`
     (compares against `main`, plus uncommitted changes).
   - If `$ARGUMENTS` contains `--all`, or there is no `main` branch yet:
     `pnpm nx run-many -t lint typecheck test --output-style=static`.
   - Also run `pnpm nx sync:check` (CI fails if TS project references are stale).
3. Report:

   ```
   ## Verify: <passed | failed>
   Ran: <command> (<n> projects)
   | Project | lint | typecheck | test |
   ### Failures
   - <project>:<target>: <file:line> <error, one line>. Likely fix: <concrete suggestion>
   ```

   Group repeated errors. Quote only the relevant lines of output, not whole logs.

4. Don't fix anything unless you were asked to implement a change in this same task. If you are
   mid-task, fix the failures that your change caused and re-run. Never silence a lint rule or
   delete a failing test to make it pass.
