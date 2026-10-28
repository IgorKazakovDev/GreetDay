# libs/db: Drizzle schema and migrations

PostgreSQL 18 + Drizzle ORM 0.45 (`node-postgres` driver). Imported **only by `apps/api`**.
Extra safety rules load from `.claude/rules/migrations.md`. Use the `/db-migration` skill for schema changes.

## Commands

```bash
docker compose up -d                 # Postgres on 127.0.0.1:5433
pnpm nx run db:db:generate           # diff schema → migrations/NNNN_name.sql
pnpm nx run db:db:migrate            # apply pending migrations to DATABASE_URL (local only)
pnpm nx run db:db:studio             # browse data
pnpm nx run db:db:seed               # sample data (design brief §7, not written yet)
```

`db:migrate` and `db:seed` run `scripts/assert-local-db.ts` first and refuse any non-local host.

## Layout

```
drizzle.config.ts      dialect, schema path, out dir, casing: snake_case
src/schema/            one file per aggregate (users.ts, contacts.ts…), re-exported from index.ts
src/client.ts          createDb(url) → { db, pool, ping, close }
src/migrate.ts         runMigrations(db): used by API integration-test setup
migrations/            generated SQL + meta/ (journal, snapshots). Committed.
scripts/               assert-local-db.ts, seed.ts
```

## Conventions

- **Naming:** TS names in camelCase, columns in snake_case automatically (`casing: 'snake_case'`).
  Tables are plural snake_case (`contacts`, `greeting_logs`).
- **IDs:** `id: uuid().primaryKey().defaultRandom()`. Never expose serial ids.
- **Timestamps:** every table gets
  `createdAt: timestamp({ withTimezone: true }).notNull().defaultNow()` and
  `updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())`.
- **Birthdays** are `birth_month` + `birth_day` (smallint, NOT NULL) and `birth_year` (smallint,
  NULL = year unknown), with check constraints for valid dates. Not a `date` column: see
  [ADR 0004](../../docs/decisions/0004-mvp-data-model.md). Date math lives in `@greetday/domain`, not in SQL.
- **Ownership:** every user-owned table has `userId` → `users.id` with `onDelete: 'cascade'` and an index on it.
- Add indexes for every foreign key and every column used in a `where` on a hot path.
- Enums: `pgEnum` only for closed sets that change rarely; otherwise text + Zod validation.

## Migration workflow

1. Edit `src/schema/*.ts`.
2. `pnpm nx run db:db:generate`, which creates `migrations/NNNN_*.sql`.
3. **Read the generated SQL** and explain it to the developer: what tables/columns/indexes change,
   whether it locks or rewrites a table, whether data could be lost.
4. Only after approval: `pnpm nx run db:db:migrate` against the local dev DB.
5. Run `pnpm nx test api` (integration tests re-migrate the test DB).
6. Update `scripts/seed.ts` if the change affects sample data.

For data migrations or anything drizzle-kit can't express: `pnpm exec drizzle-kit generate --custom --name=<name>`
(run inside `libs/db`), then write the SQL by hand.

## Never

- Edit or delete a migration that has been applied anywhere (it's in `meta/_journal.json` and
  committed). Fix forward with a new migration.
- Use `drizzle-kit push` (it bypasses migration files).
- Run migrate, seed, drop or truncate against a non-local database, or set `ALLOW_REMOTE_DB`.
- `docker compose down -v` without asking (it wipes local data).
