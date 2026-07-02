/**
 * Chartlite Core
 * A lightweight, high-performance charting library
 */

// Export types
export type {
  Theme,
  DataPoint,
  SeriesDefinition,
  SeriesFirstData,
  ColumnOrientedData,
  FlexibleDataInput,
  SeriesData,
  LegendPosition,
  LegendAlign,
  LegendConfig,
  ReferenceLine,
  Annotation,
  Region,
  ChartPointEvent,
  LegendToggleEvent,
  BaseChartConfig,
  LineChartConfig,
  BarChartConfig,
  AreaChartConfig,
  PieChartConfig,
  ScatterChartConfig,
  SparklineConfig,
  Chart,
  Dimensions,
  Scale,
  ChartPlugin,
  PluginContext,
} from './types';

// Export charts
export { LineChart } from './charts/LineChart';
export { BarChart } from './charts/BarChart';
export { AreaChart } from './charts/AreaChart';
export { ScatterChart } from './charts/ScatterChart';
export { PieChart } from './charts/PieChart';
export { Sparkline } from './charts/Sparkline';

// Export utilities (for advanced users)
export {
  getDefaultDimensions,
  createLinearScale,
  createBandScale,
  generateLinePath,
  getThemeColors,
  calculateNiceTicks,
} from './utils';

// Export data transformation utilities
export { normalizeData, extractColorsFromSeriesData } from './utils/dataTransform';

// Export value formatters for axis labels (tree-shakeable)
export {
  formatters,
  abbreviate,
  currency,
  percent,
  number,
  type ValueFormatter,
} from './utils/formatters';

// Export performance utilities (tree-shakeable)
export { downsampleLTTB, downsampleEveryNth, autoDownsample } from './utils/sampling';

// Export plugins (tree-shakeable - only included when explicitly imported)
export { TooltipPlugin, type TooltipOptions } from './plugins/TooltipPlugin';
export { DebugPlugin } from './plugins/DebugPlugin';

// Version — injected at build time from package.json (see tsup.config.ts). The
// `typeof` guard is safe even when the define is absent (e.g. raw ts-node), because
// `typeof` on an undeclared identifier yields "undefined" rather than throwing.
declare const __CHARTLITE_VERSION__: string;
export const VERSION: string =
  typeof __CHARTLITE_VERSION__ !== 'undefined' ? __CHARTLITE_VERSION__ : '0.0.0-dev';