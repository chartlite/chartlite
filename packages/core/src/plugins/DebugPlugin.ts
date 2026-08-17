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
  private readonly logPrefix: string;

  constructor(logPrefix: string = '[ChartDebug]') {
    this.logPrefix = logPrefix;
  }

  private log(event: keyof ChartPlugin, context: PluginContext): void {
    console.log(`${this.logPrefix} ${event}`, context);
  }

  beforeRender(context: PluginContext): void {
    this.log('beforeRender', context);
  }

  afterRender(context: PluginContext): void {
    this.log('afterRender', context);
  }

  beforeUpdate(context: PluginContext): void {
    this.log('beforeUpdate', context);
  }

  afterUpdate(context: PluginContext): void {
    this.log('afterUpdate', context);
  }

  beforeDestroy(context: PluginContext): void {
    this.log('beforeDestroy', context);
  }

  onResize(context: PluginContext): void {
    this.log('onResize', context);
  }
}
