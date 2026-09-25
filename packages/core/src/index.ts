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
  SeriesFirstRecord,
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
  RadialChartConfig,
  ComboChartConfig,
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
export { RadialChart } from './charts/RadialChart';
export { ComboChart } from './charts/ComboChart';
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
export { DebugPlugin } from './plugins/DebugPlugin';

// Version — injected at build time from package.json (see tsup.config.ts) and
// supplied by vitest.config.ts under the test runner. The catch preserves raw
// source imports in tsx/ts-node, where the injected identifier is absent.
declare const __CHARTLITE_VERSION__: string;
function readVersion(): string {
  try {
    return __CHARTLITE_VERSION__;
  } catch {
    return '0.0.0-dev';
  }
}

export const VERSION: string = readVersion();
