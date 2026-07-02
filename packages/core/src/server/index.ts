/**
 * `@chartlite/core/server` — headless, zero-JS SSR.
 *
 * Render charts to SVG strings in Node/Bun/edge with no browser and no jsdom.
 * The default `@chartlite/core` bundle is unaffected; this entry is imported only
 * where you render on the server.
 */

export {
  renderToString,
  CHART_TYPES,
  type ChartSpec,
  type ChartType,
} from './renderToString';
export { chartSpecSchema, type ChartSpecSchema } from './schema';
export { installDOM, ShimElement } from './dom';
