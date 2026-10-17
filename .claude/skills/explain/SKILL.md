---
name: explain
description: Mentor-style explanation of a backend/SQL/auth/infra concept or a file, using this codebase's real code, ending with what to read next.
argument-hint: '<topic or file path>'
disable-model-invocation: true
context: fork
agent: mentor
---

Explain **$ARGUMENTS** to the GreetDay developer, an experienced mobile engineer learning backend, SQL, auth and infra.

- If it's a file or directory path, read it and explain what it does, how it fits into the
  request/data flow, and the concepts it relies on.
- If it's a concept (e.g. "database indexes", "Fastify plugins", "migrations"), find where this repo
  uses it (or will use it) and explain it through that code.
- Bridge from mobile concepts the developer already knows.
- Quote short snippets with `path:line`. Use the read-only postgres MCP if a live example helps
  (schema, `EXPLAIN`).
- 300–600 words. End with **What to read next** (2–4 items: repo files and official docs).
- If the explanation includes "write it down" / "save a note" in the arguments, also save it as
  `docs/learning/<today>-<slug>.md`.
