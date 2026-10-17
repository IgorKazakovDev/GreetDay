#!/usr/bin/env node
// PreToolUse (Bash): blocks things permission rules can't express precisely.
//  - database commands against non-local hosts
//  - force pushes (any spelling)
//  - rm -rf outside tmp/
//  - reading .env files through the shell
import { readInput, block } from './lib.mjs';

const LOCAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '[::1]',
  'postgres',
  'host.docker.internal',
]);
const input = await readInput();
// Ignore free text that is data, not commands: heredoc bodies and message/title/body arguments
// (e.g. a commit message that mentions "rm -rf"). Like permission rules, this is a guard rail,
// not a sandbox: `bash -c` or a script can still bypass it.
const cmd = String(input.tool_input?.command ?? '')
  .replace(/<<-?\s*['"]?(\w+)['"]?[\s\S]*?\n\s*\1(?=\s|$)/g, '<<HEREDOC')
  .replace(/(\s(?:-m|--message|--body|--title|--notes)[\s=]+)("(?:[^"\\]|\\.)*"|'[^']*')/g, '$1""');

// 1. Database URLs / hosts
for (const m of cmd.matchAll(/postgres(?:ql)?:\/\/(?:[^@\s'"]*@)?(\[[^\]]+\]|[^:/\s'"?]+)/g)) {
  if (!LOCAL_HOSTS.has(m[1]))
    block(
      `Blocked: database URL points at non-local host "${m[1]}". Only local databases are allowed.`,
    );
}
const isDbTool = /\b(psql|pg_dump|pg_restore|pg_dumpall|dropdb|createdb|drizzle-kit)\b/.test(cmd);
if (isDbTool) {
  for (const m of cmd.matchAll(/(?:-h\s*|--host[=\s]+)['"]?([^\s'"]+)/g)) {
    if (!LOCAL_HOSTS.has(m[1]))
      block(`Blocked: database command targets non-local host "${m[1]}".`);
  }
}
if (/\bALLOW_REMOTE_DB\s*=/.test(cmd))
  block('Blocked: ALLOW_REMOTE_DB may only be set by the developer, by hand.');
if (/\bdrizzle-kit\s+push\b/.test(cmd))
  block('Blocked: drizzle-kit push bypasses migrations. Use db:generate + db:migrate.');

// 2. Force push
if (
  /\bgit\b[^;&|]*\bpush\b[^;&|]*(\s--force(?:-with-lease|-if-includes)?\b|\s-[a-zA-Z]*f[a-zA-Z]*\b|\s\+\S+)/.test(
    cmd,
  )
) {
  block('Blocked: force push is not allowed.');
}

// 3. rm -rf outside tmp/
for (const m of cmd.matchAll(/\brm\s+((?:-[a-zA-Z]+\s+)+)([^;&|]*)/g)) {
  const flags = m[1].replace(/\s/g, '');
  if (!(/r|R/.test(flags) && /f/.test(flags))) continue;
  const targets = m[2].trim().split(/\s+/).filter(Boolean);
  const bad = targets.filter((t) => !/^(\.\/)?tmp(\/|$)/.test(t.replace(/^['"]|['"]$/g, '')));
  if (bad.length)
    block(
      `Blocked: rm -rf is only allowed inside tmp/ (got: ${bad.join(' ')}). Ask the developer to delete other paths.`,
    );
}

// 4. .env files via shell (Read deny rules cover the file tools and common readers)
const envFiles = [...cmd.matchAll(/(?:^|[\s'"=/<])(\.env(?:\.[\w-]+)*)(?![\w.-])/g)]
  .map((m) => m[1])
  .filter((name) => name !== '.env.example');
const readsFiles =
  /\b(cat|less|more|head|tail|grep|rg|sed|awk|source|cp|mv|nano|vi|vim|code|open|bat|xxd|od|strings|base64|diff)\b|(^|[;&|]\s*)\.\s/;
if (envFiles.length && readsFiles.test(cmd)) {
  block('Blocked: .env files hold secrets. Use .env.example to see which variables exist.');
}
