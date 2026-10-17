# API endpoint templates

Replace `contact`/`Contact` with the feature name.

## libs/contracts/src/contact.ts

```ts
import { z } from 'zod';

export const contactSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(100),
  birthday: z.iso.date(), // YYYY-MM-DD
});
export type Contact = z.infer<typeof contactSchema>;

export const contactParamsSchema = z.object({ id: z.uuid() });

export const createContactBodySchema = contactSchema.omit({ id: true });
export type CreateContactBody = z.infer<typeof createContactBodySchema>;
```

## apps/api/src/routes/contacts/index.ts

```ts
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { and, eq } from 'drizzle-orm';
import { contactParamsSchema, contactSchema, errorResponseSchema } from '@greetday/contracts';
import { schema } from '@greetday/db';

export const contactRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/:id',
    {
      schema: {
        params: contactParamsSchema,
        response: { 200: contactSchema, 404: errorResponseSchema },
      },
    },
    async (request, reply) => {
      const userId = request.user.id; // from the auth plugin
      const [row] = await app.db.db
        .select()
        .from(schema.contacts)
        .where(and(eq(schema.contacts.id, request.params.id), eq(schema.contacts.userId, userId)));
      if (!row) {
        return reply
          .status(404)
          .send({ error: { code: 'CONTACT_NOT_FOUND', message: 'Contact not found' } });
      }
      return row;
    },
  );
};
```

## apps/api/src/routes/contacts/contacts.integration.spec.ts

```ts
import { contactSchema } from '@greetday/contracts';
import type { App } from '../../app';
import { buildTestApp } from '../../../test/helpers';

describe('GET /contacts/:id', () => {
  let app: App;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterEach(async () => {
    // truncate tables this suite touched
  });
  afterAll(async () => {
    await app.close();
  });

  it('returns the contact when it belongs to the user', async () => {
    // arrange: insert user + contact
    const res = await app.inject({ method: 'GET', url: `/contacts/${id}` /*, headers: auth */ });

    expect(res.statusCode).toBe(200);
    expect(contactSchema.parse(res.json()).id).toBe(id);
  });

  it('returns 400 when the id is not a uuid', async () => {
    const res = await app.inject({ method: 'GET', url: '/contacts/nope' });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });

  it('returns 404 when the contact belongs to another user', async () => {
    // arrange: contact owned by user B, request as user A
  });
});
```
