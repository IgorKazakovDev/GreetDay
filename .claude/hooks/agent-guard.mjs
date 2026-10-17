#!/usr/bin/env node
// PreToolUse guards used from subagent frontmatter (`hooks:`), one mode per agent:
//   git-read-only        Bash may only run read-only git commands   (code-reviewer)
//   tests-only           Edit/Write only on test files              (test-writer)
//   learning-notes-only  Edit/Write only under docs/learning/       (mentor)
import { readInput, repoPath, block } from './lib.mjs';

const mode = process.argv[2];
const input = await readInput();

if (mode === 'git-read-only') {
  const cmd = String(input.tool_input?.command ?? '').trim();
  const parts = cmd.split(/\s*(?:&&|\|\||;|\|)\s*/).filter(Boolean);
  const allowed =
    /^git\s+(?:--no-pager\s+)?(diff|log|show|status|merge-base|branch|rev-parse|blame|ls-files)\b/;
  const readOnlyPipe = /^(head|tail|wc|sort|uniq|grep|cat)\b/;
  for (const part of parts) {
    if (/\bgit\s+branch\s+(-[dDmMcC]|--delete|--move|--copy)/.test(part))
      block('Blocked: reviewer may not modify branches.');
    if (!allowed.test(part) && !readOnlyPipe.test(part)) {
      block(`Blocked: code-reviewer may only run read-only git commands (got: ${part}).`);
    }
  }
} else if (mode === 'tests-only') {
  const file = repoPath(input.tool_input?.file_path, input.cwd) ?? '';
  const ok = /\.(spec|test)\.[cm]?[jt]sx?$/.test(file) || file.startsWith('apps/api/test/');
  if (!ok)
    block(
      `Blocked: test-writer may only edit test files (got: ${file || 'outside repo'}). Report needed code changes instead.`,
    );
} else if (mode === 'learning-notes-only') {
  const file = repoPath(input.tool_input?.file_path, input.cwd) ?? '';
  if (!/^docs\/learning\/[^/]+\.md$/.test(file)) {
    block(
      `Blocked: mentor may only write notes in docs/learning/*.md (got: ${file || 'outside repo'}).`,
    );
  }
} else {
  block(`agent-guard: unknown mode "${mode}"`);
}
