/**
 * Chartlite Core
 * A lightweight, high-performance charting library
 */

// Export types
export type {
  Theme,
  DataPoint,
  BaseChartConfig,
  LineChartConfig,
  BarChartConfig,
  AreaChartConfig,
  PieChartConfig,
  Chart,
  Dimensions,
  Scale,
} from './types';

// Export charts
export { LineChart } from './charts/LineChart';
export { BarChart } from './charts/BarChart';
export { AreaChart } from './charts/AreaChart';

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

// Version
export const VERSION = '0.1.3';