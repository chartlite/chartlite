/**
 * Convenience bundler: build the set of interactivity plugins from one options
 * object, for people who'd rather write `plugins: interactive({ crosshair: true })`
 * than assemble the factories themselves. Everything here is still individually
 * importable and tree-shakeable.
 */

import type { ChartPlugin } from '../types';
import { tooltip, type TooltipOptions } from './tooltip';
import { crosshair, type CrosshairOptions } from './crosshair';
import { legendToggle } from './legendToggle';
import { callbacks, type CallbackHandlers } from './callbacks';

export interface InteractiveOptions {
  /** Hover tooltip. Enabled by default; pass `false` to disable or an object to configure. */
  tooltip?: boolean | TooltipOptions;
  /** Crosshair guide line. Off by default; `true` or an options object to enable. */
  crosshair?: boolean | CrosshairOptions;
  /** Click-to-toggle legend. Off by default; `true` to enable. */
  legend?: boolean;
  /**
   * Point click/hover callbacks. Enabled by default (reads `onPointClick`/`onHover`
   * from the chart config); pass `false` to disable or handlers to override.
   */
  callbacks?: boolean | CallbackHandlers;
}

/** Returns the configured interactivity plugins, ready to spread into `plugins`. */
export function interactive(options: InteractiveOptions = {}): ChartPlugin[] {
  const plugins: ChartPlugin[] = [];

  if (options.tooltip !== false) {
    plugins.push(tooltip(typeof options.tooltip === 'object' ? options.tooltip : {}));
  }
  if (options.crosshair) {
    plugins.push(crosshair(typeof options.crosshair === 'object' ? options.crosshair : {}));
  }
  if (options.legend) {
    plugins.push(legendToggle());
  }
  if (options.callbacks !== false) {
    plugins.push(callbacks(typeof options.callbacks === 'object' ? options.callbacks : {}));
  }

  return plugins;
}
