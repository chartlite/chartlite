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
  BaseChartConfig,
  LineChartConfig,
  BarChartConfig,
  AreaChartConfig,
  PieChartConfig,
  ScatterChartConfig,
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

// Export performance utilities (tree-shakeable)
export { downsampleLTTB, downsampleEveryNth, autoDownsample } from './utils/sampling';

// Export plugins (tree-shakeable - only included when explicitly imported)
export { TooltipPlugin, type TooltipOptions } from './plugins/TooltipPlugin';
export { DebugPlugin } from './plugins/DebugPlugin';

// Version
export const VERSION = '0.2.1';