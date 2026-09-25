import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Single source of truth: the package version is injected at build time so the
// exported `VERSION` constant can never drift from package.json.
const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8')
);

const INTERNAL_MEMBERS = new RegExp(
  `^(?:${[
    'seriesData', 'themeColors', 'liveRegion', 'layoutHeight', 'layoutWidth', 'chartBounds',
    'focusedIndex', 'resizeTimeout', 'resizeObserver', 'focusableElements', 'eventHandlers',
    'callPluginHook', 'eventListeners', 'chartTypeName', 'focusElement', 'useCssVars',
    'seriesType', 'resolvedSeriesColors', 'isMultiSeries', 'clearDataPointFocus',
    'calculateDimensions', 'validateConfig', 'setData', 'prepareSVG', 'legendLayout',
    'legendItems', 'collectFocusableElements', 'stackedExtents', 'setupResizeObserver',
    'setupKeyboardNavigation',
    'renderLineSeries', 'renderChart', 'renderBarSeries',
    'instanceId', 'hasAxes', 'handleKeyDown', 'handleFocus', 'handleBlur',
    'createSVG', 'createPluginContext',
    'calculateStackedData', 'assignSeriesColors', 'applyAnimation',
    'announceToScreenReader', 'addEventListenerTracked', 'addDataTableFallback',
    'activateCurrentElement', 'palette', 'cumulativeData',
  ].join('|')})$`
);

export default defineConfig({
  // Separate entry points so bundlers tree-shake interactivity independently of
  // core — importing '@chartlite/core' never pulls in the /interactive bytes.
  entry: ['src/index.ts', 'src/interactive/index.ts', 'src/server/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: 'terser',
  terserOptions: {
    ecma: 2020,
    compress: { passes: 3, unsafe_arrows: true, unsafe_methods: true, pure_getters: true },
    module: true,
    // Shorten internal (private/protected) member names. Only names that never
    // appear in the public API, config, plugin context or DOM are listed here —
    // anything a consumer can reach must keep its name.
    mangle: { properties: { regex: INTERNAL_MEMBERS } },
  },
  treeshake: true,
  define: {
    __CHARTLITE_VERSION__: JSON.stringify(pkg.version),
  },
});
