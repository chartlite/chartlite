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

export class DebugPlugin implements ChartPlugin {
  name = 'debug';
  private logPrefix: string;

  constructor(logPrefix: string = '[ChartDebug]') {
    this.logPrefix = logPrefix;
  }

  beforeRender(context: PluginContext): void {
    console.log(`${this.logPrefix} beforeRender`, {
      dataPoints: Array.isArray(context.data) ? context.data.length : context.data,
      dimensions: context.dimensions,
    });
  }

  afterRender(context: PluginContext): void {
    console.log(`${this.logPrefix} afterRender`, {
      svgElement: context.svg,
      containerSize: {
        width: context.container.clientWidth,
        height: context.container.clientHeight,
      },
    });
  }

  beforeUpdate(context: PluginContext): void {
    console.log(`${this.logPrefix} beforeUpdate`, {
      newDataPoints: Array.isArray(context.data) ? context.data.length : context.data,
    });
  }

  afterUpdate(): void {
    console.log(`${this.logPrefix} afterUpdate`);
  }

  beforeDestroy(): void {
    console.log(`${this.logPrefix} beforeDestroy`);
  }

  onResize(context: PluginContext): void {
    console.log(`${this.logPrefix} onResize`, {
      newDimensions: context.dimensions,
    });
  }
}
