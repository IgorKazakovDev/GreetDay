import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

describe('design tokens', () => {
  it('theme.ts is in sync with tokens.json', () => {
    const script = resolve(import.meta.dirname, '../../../tools/scripts/sync-design-tokens.mjs');
    expect(() => execFileSync('node', [script, '--check'], { stdio: 'pipe' })).not.toThrow();
  });
});
