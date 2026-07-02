/**
 * Emit the published `schema.json` from the single source of truth in
 * `src/server/schema.ts`. Run via `pnpm gen:schema`. A test asserts the checked-in
 * `schema.json` matches this output, so drift fails CI.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chartSpecSchema } from '../src/server/schema';

const out = fileURLToPath(new URL('../schema.json', import.meta.url));
writeFileSync(out, JSON.stringify(chartSpecSchema, null, 2) + '\n', 'utf8');
// eslint-disable-next-line no-console
console.log(`Wrote ${out}`);
