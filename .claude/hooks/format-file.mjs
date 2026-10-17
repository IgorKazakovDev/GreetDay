#!/usr/bin/env node
// PostToolUse (Edit|Write): run Prettier on the file Claude just changed. Never blocks.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { projectDir, readInput, repoPath } from './lib.mjs';

const input = await readInput();
const file = repoPath(input.tool_input?.file_path, input.cwd);
const prettier = join(projectDir(), 'node_modules/.bin/prettier');
if (file && existsSync(prettier) && existsSync(join(projectDir(), file))) {
  try {
    execFileSync(prettier, ['--write', '--ignore-unknown', '--log-level', 'warn', file], {
      cwd: projectDir(),
      stdio: ['ignore', 'ignore', 'pipe'],
    });
  } catch {
    // Syntax errors etc. surface through lint/typecheck; formatting must never block an edit.
  }
}
