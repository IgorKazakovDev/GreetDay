---
name: sync-design-tokens
description: Regenerates the typed React Native theme (libs/design-tokens/src/theme.ts) from the Penpot tokens JSON (W3C DTCG) in libs/design-tokens/tokens.json. Fails on unknown token types.
disable-model-invocation: true
allowed-tools: Bash(node tools/scripts/sync-design-tokens.mjs *) Bash(node tools/scripts/sync-design-tokens.mjs) Bash(pnpm nx *) Bash(git diff *)
---

# Sync design tokens

1. If the developer exported a new tokens file from Penpot to another path (given in `$ARGUMENTS`),
   copy it over `libs/design-tokens/tokens.json` first and show `git diff --stat` for it.
2. Run `node tools/scripts/sync-design-tokens.mjs`.
   - Fails with an unsupported `$type` or unit? Report the token path and type. Don't edit the
     script to skip it. Ask whether to add support (types are mapped in `convert()` in the script),
     and add a unit test for the new mapping if yes.
3. Show `git diff libs/design-tokens/src/theme.ts` summarized: tokens added, removed, changed.
4. Run `pnpm nx run-many -t typecheck test -p design-tokens mobile`. Removed or renamed tokens
   break `apps/mobile` at typecheck; list each usage that needs updating and ask before changing screens.
5. Never edit `theme.ts` by hand. It is generated, and CI checks it is in sync (`design-tokens:test`).
