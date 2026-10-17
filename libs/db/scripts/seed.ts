// Sample data for local development (design brief §7). Not written yet:
// fill this in together with the first schema tables.
import { createDb } from '../src/client';

const { close } = createDb(process.env.DATABASE_URL as string);
console.log('db:seed: nothing to seed yet.');
await close();
