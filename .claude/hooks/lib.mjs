// Shared helpers for Claude Code hooks. Hooks get the tool call as JSON on stdin.
// Blocking: print the reason to stderr and exit 2.
import { relative, isAbsolute, resolve } from 'node:path';

export async function readInput() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

export function projectDir() {
  return process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
}

/** Repo-relative POSIX path for a tool's file_path, or null if outside the repo. */
export function repoPath(filePath, cwd) {
  if (!filePath) return null;
  const abs = isAbsolute(filePath) ? filePath : resolve(cwd ?? projectDir(), filePath);
  const rel = relative(projectDir(), abs).split('\\').join('/');
  return rel.startsWith('..') ? null : rel;
}

export function block(reason) {
  process.stderr.write(`${reason}\n`);
  process.exit(2);
}
