# Performance verification

Chartlite does not publish hardware-independent timing claims. DOM benchmarks vary too
much by CPU, Node version, jsdom, and background load to make numbers from one machine a
useful product guarantee.

The current implementation has two automatic optimizations:

- Charts use a 500-point render budget, divided evenly across multiple series.
- Updates preserve the SVG root while rebuilding current marks and accessibility content.

Run the repeatable checks from the repository root:

```bash
pnpm --filter @chartlite/core perf
pnpm --filter @chartlite/core bench
pnpm --filter @chartlite/core size
```

`perf` and `bench` run the deterministic local render/update harness. `size` reports exact
minified, gzip, and Brotli bytes and fails if the main core entry exceeds 15,360 bytes
gzip. Only the size ceiling is a release gate; timings are diagnostic.

The core package has zero runtime dependencies. Consumer bundlers can tree-shake a
single named chart import substantially below the full core entry.
