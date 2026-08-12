import { readFileSync } from 'node:fs';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const BUDGET = 15_360;
const bundle = readFileSync(new URL('../dist/index.js', import.meta.url));
const gzip = gzipSync(bundle, { level: 9 }).length;
const brotli = brotliCompressSync(bundle).length;

console.log(
  `Core bundle: minified ${bundle.length} B, gzip ${gzip} B, brotli ${brotli} B (gzip budget ${BUDGET} B)`
);

if (gzip > BUDGET) {
  console.error(`Core gzip size exceeds budget by ${gzip - BUDGET} B`);
  process.exitCode = 1;
}
