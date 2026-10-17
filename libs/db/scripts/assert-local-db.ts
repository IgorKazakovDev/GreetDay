// Refuses to run migrations/seeds against anything but a local database.
// Set ALLOW_REMOTE_DB=1 only when you really mean it (never from an agent).
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'postgres', 'host.docker.internal']);

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env at the repo root.');
  process.exit(1);
}
const host = new URL(raw).hostname.replace(/^\[|\]$/g, '');
if (!LOCAL_HOSTS.has(host) && process.env.ALLOW_REMOTE_DB !== '1') {
  console.error(
    `Refusing to touch non-local database host "${host}". Set ALLOW_REMOTE_DB=1 to override.`,
  );
  process.exit(1);
}
