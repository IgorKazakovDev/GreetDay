---
paths:
  - 'libs/db/**'
---

# Schema and migration safety

Read `libs/db/CLAUDE.md` first. These rules are stricter and non-negotiable.

- **Generated SQL must be reviewed.** After `db:generate`, open the new `migrations/NNNN_*.sql`,
  then explain each statement to the developer in plain language, along with its risk. Wait for approval
  before `db:migrate`.
- **Never edit an applied migration** (anything in `migrations/meta/_journal.json` on `main`).
  Fix forward with a new migration. If a migration exists only on your branch and has not been
  applied anywhere but your local DB, you may regenerate it. Say so explicitly.
- **Destructive changes need a plan.** Dropping/renaming a column or table, changing a type, or
  adding `NOT NULL` to an existing column: propose expand → backfill → contract across separate
  migrations, and flag data loss. drizzle-kit may ask "rename or create?" interactively; answer
  deliberately and check the SQL.
- **New `NOT NULL` columns** on existing tables need a default or a backfill step.
- **Indexes:** every foreign key and every column filtered on in hot queries. Use
  `CREATE INDEX CONCURRENTLY` (custom migration) only once the table holds real production data;
  locally a plain index is fine.
- **User data:** every user-owned table has `user_id` + index + `ON DELETE CASCADE`.
- **Local only.** `db:migrate`, `db:seed`, `drizzle-kit studio`, `psql` with writes: only against
  `localhost`/`127.0.0.1` (dev `greetday_dev` or test `greetday_test`). Never set `ALLOW_REMOTE_DB`.
  Never `drizzle-kit push`. Never `DROP DATABASE`, and never `docker compose down -v`, without asking.
- **Seed data** is fake. Never copy real people's names or birthdays into seeds or fixtures.
