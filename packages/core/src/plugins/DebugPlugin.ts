/**
 * Debug Plugin
 *
 * A simple plugin that logs lifecycle events to the console.
 * Useful for debugging and understanding the plugin system.
 *
 * Usage:
 * ```typescript
 * import { LineChart } from '@chartlite/core';
 * import { DebugPlugin } from '@chartlite/core/plugins';
 *
 * new LineChart('#chart', {
 *   data: [...],
 *   plugins: [new DebugPlugin()]
 * }).render();
 * ```
 */

import type { ChartPlugin, PluginContext } from '../types';

const DEBUG_EVENTS = [
  'beforeRender',
  'afterRender',
  'beforeUpdate',
  'afterUpdate',
  'beforeDestroy',
  'onResize',
] as const;

export class DebugPlugin implements ChartPlugin {
  name = 'debug';
  [key: string]: any;

  constructor(logPrefix: string = '[ChartDebug]') {
    for (const event of DEBUG_EVENTS) {
      this[event] = (context?: PluginContext): void => {
        console.log(`${logPrefix} ${event}`, context);
      };
    }
  }
}
