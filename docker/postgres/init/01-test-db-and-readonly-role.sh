#!/bin/sh
# Runs once, when the postgres-data volume is first created.
# - creates the test database (used by integration tests)
# - creates a read-only role for the Postgres MCP server (dev DB only)
# To re-run: docker compose down -v && docker compose up -d   (this wipes local data)
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
CREATE DATABASE "$POSTGRES_TEST_DB" OWNER "$POSTGRES_USER";

CREATE ROLE "$POSTGRES_READONLY_USER" LOGIN PASSWORD '$POSTGRES_READONLY_PASSWORD'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
ALTER ROLE "$POSTGRES_READONLY_USER" SET default_transaction_read_only = on;
ALTER ROLE "$POSTGRES_READONLY_USER" SET statement_timeout = '10s';

REVOKE ALL ON DATABASE "$POSTGRES_TEST_DB" FROM PUBLIC;
GRANT CONNECT ON DATABASE "$POSTGRES_DB" TO "$POSTGRES_READONLY_USER";
GRANT USAGE ON SCHEMA public TO "$POSTGRES_READONLY_USER";
GRANT SELECT ON ALL TABLES IN SCHEMA public TO "$POSTGRES_READONLY_USER";
-- Tables created later by the app's owner role (via migrations) are readable too.
ALTER DEFAULT PRIVILEGES FOR ROLE "$POSTGRES_USER" IN SCHEMA public
  GRANT SELECT ON TABLES TO "$POSTGRES_READONLY_USER";
SQL
