---
name: db-migration
description: Changes the database schema safely. Edits the Drizzle schema, generates the SQL migration, shows and explains the SQL to the developer, and applies it to the local dev DB only after approval, then updates the seed if needed. Use for any table, column, index or constraint change in libs/db.
---

# Database migration

Read `libs/db/CLAUDE.md` and `.claude/rules/migrations.md` first.

1. **Preflight:** `docker compose ps` shows postgres healthy. `git status` is clean in `libs/db/migrations/`.
2. **Edit the schema** in `libs/db/src/schema/<aggregate>.ts` (re-export from `index.ts`). Follow
   the conventions: uuid ids, `createdAt`/`updatedAt`, `userId` FK with cascade + index.
3. **Generate:** `pnpm nx run db:db:generate`. If drizzle-kit asks whether something is a rename,
   **stop** and ask the developer. Don't guess.
4. **Show and explain the SQL.** Print the new `libs/db/migrations/NNNN_*.sql` and explain each
   statement in plain language:
   - what it creates or changes, and why it's needed for the task
   - locking/rewrite risk on a large table, and data-loss risk (drops, type changes, NOT NULL)
   - whether it can be rolled back by a follow-up migration
5. **STOP. Ask for approval** to apply it to the local dev DB. Don't continue without a clear yes.
6. **Apply:** `pnpm nx run db:db:migrate` (local only; the target refuses other hosts).
   Verify with the postgres MCP (`get_object_details`) or Drizzle Studio.
7. **Tests:** `pnpm nx test api` (the test DB is migrated automatically by the test setup).
8. **Seed:** if the new tables need sample data, update `libs/db/scripts/seed.ts` (fake data
   from design brief §7) and run `pnpm nx run db:db:seed`.
9. Summarize: tables/columns changed, migration file name, commands run, and a short
   "what this SQL does" note for the developer.

Something wrong after applying locally? Don't edit the migration once it's committed. If it isn't
committed yet and only your local DB has it, tell the developer the options (reset local DB with
`docker compose down -v`, which wipes data; or a corrective migration) and let them choose.
