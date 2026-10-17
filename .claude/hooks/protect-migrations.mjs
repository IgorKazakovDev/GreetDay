#!/usr/bin/env node
// PreToolUse (Edit|Write): block edits to migration files already committed to git.
// Applied migrations must never change; fix forward with a new migration.
import { execFileSync } from 'node:child_process';
import { readInput, repoPath, projectDir, block } from './lib.mjs';

const input = await readInput();
const file = repoPath(input.tool_input?.file_path, input.cwd);
if (file && file.startsWith('libs/db/migrations/')) {
  let committed = false;
  try {
    execFileSync('git', ['cat-file', '-e', `HEAD:${file}`], { cwd: projectDir(), stdio: 'ignore' });
    committed = true;
  } catch {
    committed = false;
  }
  if (committed) {
    block(
      `Blocked: ${file} is a committed migration. Never edit applied migrations. ` +
        'Change the schema and run `pnpm nx run db:db:generate` to create a new one.',
    );
  }
}
