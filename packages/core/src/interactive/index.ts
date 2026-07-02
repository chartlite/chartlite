/**
 * `@chartlite/core/interactive` — opt-in, tree-shakeable interactivity.
 *
 * Nothing here is pulled into the default `@chartlite/core` bundle; import only
 * what you use. Each factory returns a `ChartPlugin` consumed via the existing
 * `plugins: [...]` config.
 */

export { tooltip, type TooltipOptions } from './tooltip';
export { crosshair, type CrosshairOptions } from './crosshair';
export { legendToggle } from './legendToggle';
export { callbacks, type CallbackHandlers } from './callbacks';
export { interactive, type InteractiveOptions } from './interactive';
