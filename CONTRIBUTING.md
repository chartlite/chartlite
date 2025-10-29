# Contributing to chartlite

## Development Setup

```bash
pnpm install
pnpm build
pnpm dev
```

## Adding New Charts

1. Create chart class extending `BaseChart`
2. Add config interface in `types/index.ts`
3. Implement `renderChart()` and `renderLegend()`
4. Add tests
5. Export from main index

## Guidelines

- Focus on performance
- Keep bundle size small
- Write tests for new features
- Update documentation