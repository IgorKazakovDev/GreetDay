---
name: api-endpoint
description: Adds a Fastify API endpoint end-to-end, from the Zod contract in libs/contracts to the route plugin, user scoping and integration tests. Use whenever a new route is added or an existing route's request/response shape changes.
---

# Add an API endpoint

Read `apps/api/CLAUDE.md` and `.claude/rules/security.md` first. Templates are in [template.md](template.md).

## Steps

1. **Contract** (`libs/contracts/src/<feature>.ts`): params/query/body/response schemas with
   bounds (`.max()`, ranges). Export inferred types. Export from `src/index.ts`. Add a small spec
   for non-trivial validation.
2. **Route plugin** (`apps/api/src/routes/<feature>/index.ts`): a `FastifyPluginAsyncZod` with
   `schema: { params, querystring, body, response: { 2xx: …, 404: errorResponseSchema } }`.
   Keep handlers thin: business rules come from `@greetday/domain`.
3. **Register** it in `apps/api/src/app.ts` with a prefix (`app.register(contactRoutes, { prefix: '/contacts' })`).
4. **Auth + scoping:** every query on user data filters by the authenticated user's id
   (`and(eq(t.id, id), eq(t.userId, request.user.id))`). Another user's row → `404`.
   _Until auth exists_, note `// TODO(auth): scope to request.user.id` and flag it in your summary.
5. **Integration tests** (`<feature>.integration.spec.ts` next to the route): happy path (parse
   with the contract schema), validation error (400 `VALIDATION_ERROR`), not found (404), and
   cross-user isolation once auth exists. Clean up rows you create.
6. **DB change needed?** Do `/db-migration` first, then come back.
7. Run `/verify`. Then give the developer a short "what I did and why".
