/**
 * Performance benchmark for the core chart renderer.
 *
 * The benchmark deliberately keeps data construction and chart teardown out of
 * timed update calls. Inputs are deterministic so two runs can be compared,
 * while warm-up iterations give the JIT a chance to settle before samples are
 * collected.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { LineChart } from '../src/charts/LineChart';
import { CHART_POINT_BUDGET } from '../src/render/constants';
import type {
  DataPoint,
  FlexibleDataInput,
  LineChartConfig,
  SeriesFirstData,
  SeriesFirstRecord,
} from '../src/types';

const WARMUP_ITERATIONS = 5;
const MEASURED_ITERATIONS = 50;
const P95_TARGET_MS = 50;
const CHART_WIDTH = 800;
const CHART_HEIGHT = 600;
const CHILD_ARGUMENT = '--benchmark-child';
const SCRIPT_PATH = fileURLToPath(import.meta.url);

interface BenchmarkDefinition {
  name: string;
  points: number;
  series: number;
  seed: number;
}

interface BenchmarkCase {
  definition: BenchmarkDefinition;
  config: LineChartConfig;
  updateData: FlexibleDataInput[];
  expectedRenderedPoints: number;
}

interface BenchmarkStats {
  median: number;
  p95: number;
  minimum: number;
  maximum: number;
}

interface BenchmarkResult {
  phase: 'render' | 'update';
  name: string;
  stats: BenchmarkStats;
  timingPassed: boolean;
  cardinalityPassed: boolean;
  expectedRenderedPoints: number;
  renderedPoints: number;
  targetPassed: boolean;
  note: string;
}

const BENCHMARK_DEFINITIONS: BenchmarkDefinition[] = [
  { name: 'LineChart 100pts', points: 100, series: 1, seed: 0x1001 },
  { name: 'LineChart 500pts', points: 500, series: 1, seed: 0x1002 },
  { name: 'LineChart 1000pts', points: 1_000, series: 1, seed: 0x1003 },
  { name: 'LineChart 2000pts', points: 2_000, series: 1, seed: 0x1004 },
  { name: 'LineChart 5000pts', points: 5_000, series: 1, seed: 0x1005 },
  { name: 'LineChart 1000pts x3 series', points: 1_000, series: 3, seed: 0x3001 },
];

function nextDeterministicValue(state: number): number {
  // A small LCG is sufficient here. It has no dependency on process-global
  // randomness and keeps every generated input reproducible.
  return (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
}

function makeSingleSeriesData(points: number, seed: number): DataPoint[] {
  let state = seed >>> 0;

  return Array.from({ length: points }, (_, index) => {
    state = nextDeterministicValue(state);
    return {
      x: `Point ${index}`,
      y: (state / 0x1_0000_0000) * 100,
    };
  });
}

function makeMultiSeriesData(
  points: number,
  seriesCount: number,
  seed: number,
): SeriesFirstData {
  const series = Array.from({ length: seriesCount }, (_, index) => ({
    name: `Series ${index}`,
    dataKey: `series${index}`,
  }));
  let state = seed >>> 0;

  const data = Array.from({ length: points }, (_, pointIndex) => {
    const point: SeriesFirstRecord = { x: `Point ${pointIndex}` };
    for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex += 1) {
      state = nextDeterministicValue(state);
      point[`series${seriesIndex}`] = (state / 0x1_0000_0000) * 100;
    }
    return point;
  });

  return { series, data };
}

function expectedPointCount(points: number, series: number): number {
  const pointsPerSeries = Math.min(
    points,
    Math.max(3, Math.floor(CHART_POINT_BUDGET / series)),
  );
  return pointsPerSeries * series;
}

function makeBenchmarkCase(definition: BenchmarkDefinition): BenchmarkCase {
  const { points, series, seed } = definition;
  const data = series === 1
    ? makeSingleSeriesData(points, seed)
    : makeMultiSeriesData(points, series, seed);
  const updateData = series === 1
    ? [
      makeSingleSeriesData(points, seed + 1),
      makeSingleSeriesData(points, seed + 2),
    ]
    : [
      makeMultiSeriesData(points, series, seed + 1),
      makeMultiSeriesData(points, series, seed + 2),
    ];

  const config: LineChartConfig = {
    data,
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    animate: false,
    // Responsive resize callbacks are not part of render/update timing.
    responsive: false,
  };

  return {
    definition,
    config,
    updateData,
    expectedRenderedPoints: expectedPointCount(points, series),
  };
}

function setupDOM(): JSDOM {
  // Keep the DOM environment explicit so the same child works through pnpm on
  // Windows and in a Node-only CI runner. Each phase/case gets a fresh process.
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  Object.assign(globalThis, {
    document: dom.window.document,
    window: dom.window,
    HTMLElement: dom.window.HTMLElement,
    SVGElement: dom.window.SVGElement,
    Element: dom.window.Element,
    ResizeObserver: class ResizeObserver {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  });
  return dom;
}

function percentile(samples: number[], probability: number): number {
  const sorted = [...samples].sort((left, right) => left - right);
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function summarize(samples: number[]): BenchmarkStats {
  if (samples.length === 0) {
    throw new Error('Benchmark produced no timing samples');
  }

  return {
    median: percentile(samples, 0.5),
    p95: percentile(samples, 0.95),
    minimum: Math.min(...samples),
    maximum: Math.max(...samples),
  };
}

/**
 * Run an operation after warm-up and clean up each iteration outside the
 * measured interval. The iteration number lets callers select from data that
 * was generated before timing began.
 */
function measureOperation(
  operation: (iteration: number) => void,
  cleanup: () => void,
): BenchmarkStats {
  for (let iteration = 0; iteration < WARMUP_ITERATIONS; iteration += 1) {
    operation(iteration);
    cleanup();
  }

  const samples = Array.from({ length: MEASURED_ITERATIONS }, () => 0);
  for (let iteration = 0; iteration < MEASURED_ITERATIONS; iteration += 1) {
    const start = performance.now();
    try {
      operation(iteration);
    } finally {
      samples[iteration] = performance.now() - start;
      cleanup();
    }
  }

  return summarize(samples);
}

function makeContainer(): HTMLElement {
  const container = document.createElement('div');
  container.style.width = `${CHART_WIDTH}px`;
  container.style.height = `${CHART_HEIGHT}px`;
  document.body.appendChild(container);
  return container;
}

function inspectRenderedPoints(testCase: BenchmarkCase): number {
  const container = makeContainer();
  const chart = new LineChart(container, testCase.config);
  chart.render();
  const renderedPoints = container.querySelectorAll('.data-point').length;
  chart.destroy();
  container.remove();
  return renderedPoints;
}

function timingStatus(stats: BenchmarkStats): boolean {
  return stats.p95 < P95_TARGET_MS;
}

function formatStats(stats: BenchmarkStats): string {
  return [
    `${stats.median.toFixed(2)}ms`.padEnd(12),
    `${stats.p95.toFixed(2)}ms`.padEnd(12),
    `${stats.minimum.toFixed(2)}ms`.padEnd(12),
    `${stats.maximum.toFixed(2)}ms`.padEnd(12),
  ].join('');
}

function printHeader(): void {
  console.log('\nChartlite performance benchmark');
  console.log('================================');
  console.log(`Node ${process.version}; isolated child per phase/case; deterministic inputs; ${WARMUP_ITERATIONS} warm-ups; ${MEASURED_ITERATIONS} samples`);
  console.log(`Target: p95 < ${P95_TARGET_MS}ms (timing is informational by default; --enforce-target makes timing failures non-zero; cardinality mismatches are always non-zero)`);
  console.log('JSDOM scope: no browser layout/paint; animation and responsive resize are disabled.');
  console.log('Render includes chart construction and render; destroy is excluded from timing.');
  console.log('Update uses pre-generated alternating datasets; data generation and setup are excluded from timing.');
  console.log(`Sampling budget: up to ${CHART_POINT_BUDGET} rendered points across all series.`);
  console.log(`p95 is an interpolated sample percentile over ${MEASURED_ITERATIONS} measured iterations; compare runs under similar machine conditions.\n`);
}

function printTableHeader(): void {
  console.log(
    'Case'.padEnd(34) +
    'p50'.padEnd(12) +
    'p95'.padEnd(12) +
    'min'.padEnd(12) +
    'max'.padEnd(12) +
    'Target'.padEnd(16) +
    'Notes',
  );
  console.log('-'.repeat(116));
}

function runRenderBenchmark(testCase: BenchmarkCase): BenchmarkResult {
  const container = makeContainer();
  let chart: LineChart | null = null;
  const stats = measureOperation(
    () => {
      chart = new LineChart(container, testCase.config);
      chart.render();
    },
    () => {
      chart?.destroy();
      chart = null;
    },
  );
  container.remove();

  const renderedPoints = inspectRenderedPoints(testCase);
  const timingPassed = timingStatus(stats);
  const cardinalityPassed = renderedPoints === testCase.expectedRenderedPoints;
  const pointsNote = `${renderedPoints}/${testCase.expectedRenderedPoints} points`;
  return {
    phase: 'render',
    name: testCase.definition.name,
    stats,
    timingPassed,
    cardinalityPassed,
    expectedRenderedPoints: testCase.expectedRenderedPoints,
    renderedPoints,
    targetPassed: timingPassed && cardinalityPassed,
    note: cardinalityPassed ? pointsNote : `${pointsNote} (CARDINALITY MISMATCH)`,
  };
}

function runUpdateBenchmark(testCase: BenchmarkCase): BenchmarkResult {
  const container = makeContainer();
  const chart = new LineChart(container, testCase.config);
  chart.render();
  const stats = measureOperation(
    (iteration) => {
      const nextData = testCase.updateData[iteration % testCase.updateData.length];
      chart.update(nextData);
    },
    () => {},
  );
  const renderedPoints = container.querySelectorAll('.data-point').length;
  chart.destroy();
  container.remove();

  const timingPassed = timingStatus(stats);
  const cardinalityPassed = renderedPoints === testCase.expectedRenderedPoints;
  const pointsNote = `${renderedPoints}/${testCase.expectedRenderedPoints} points`;
  return {
    phase: 'update',
    name: testCase.definition.name,
    stats,
    timingPassed,
    cardinalityPassed,
    expectedRenderedPoints: testCase.expectedRenderedPoints,
    renderedPoints,
    targetPassed: timingPassed && cardinalityPassed,
    note: `${pointsNote}; pre-generated data; SVG root reused${cardinalityPassed ? '' : ' (CARDINALITY MISMATCH)'}`,
  };
}

function statusLabel(result: BenchmarkResult): string {
  if (!result.cardinalityPassed) return 'CARDINALITY FAIL'.padEnd(16);
  return (result.timingPassed ? 'PASS' : 'OVER TARGET').padEnd(16);
}

function printResult(result: BenchmarkResult): void {
  console.log(
    result.name.padEnd(34) +
    formatStats(result.stats) +
    statusLabel(result) +
    result.note,
  );
}

function runIsolatedBenchmark(
  phase: 'render' | 'update',
  definitionIndex: number,
): BenchmarkResult {
  const child = spawnSync(
    process.execPath,
    [
      ...process.execArgv,
      SCRIPT_PATH,
      CHILD_ARGUMENT,
      phase,
      String(definitionIndex),
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: process.env,
      maxBuffer: 1024 * 1024,
      timeout: 120_000,
      windowsHide: true,
    },
  );

  if (child.error) throw child.error;
  const stdout = String(child.stdout ?? '').trim();
  const stderr = String(child.stderr ?? '').trim();
  if (child.status !== 0) {
    throw new Error(`Benchmark child failed (${phase} ${definitionIndex}): ${stderr || stdout}`);
  }

  const outputLines = stdout.split(/\r?\n/).filter((line) => line.length > 0);
  const payload = outputLines[outputLines.length - 1];
  if (!payload) {
    throw new Error(`Benchmark child returned no JSON (${phase} ${definitionIndex})${stderr ? `: ${stderr}` : ''}`);
  }

  // SAFETY: the isolated child serializes a BenchmarkResult on its final line.
  return JSON.parse(payload) as BenchmarkResult;
}

function runChild(phase: 'render' | 'update', definitionIndex: number): void {
  const definition = BENCHMARK_DEFINITIONS[definitionIndex];
  if (!definition) throw new Error(`Unknown benchmark case index: ${definitionIndex}`);

  const dom = setupDOM();
  try {
    const testCase = makeBenchmarkCase(definition);
    const result = phase === 'render'
      ? runRenderBenchmark(testCase)
      : runUpdateBenchmark(testCase);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } finally {
    dom.window.close();
  }
}

function parseChildRequest(): { phase: 'render' | 'update'; definitionIndex: number } | null {
  if (process.argv[2] !== CHILD_ARGUMENT) return null;

  const phase = process.argv[3];
  const definitionIndex = Number.parseInt(process.argv[4] ?? '', 10);
  if ((phase !== 'render' && phase !== 'update') || !Number.isInteger(definitionIndex)) {
    throw new Error(`Invalid benchmark child arguments: ${process.argv.slice(2).join(' ')}`);
  }
  return { phase, definitionIndex };
}

function runParent(): void {
  const enforceTarget = process.argv.includes('--enforce-target');
  const results: BenchmarkResult[] = [];

  printHeader();

  console.log('Initial render (construction + render; isolated child per case)');
  printTableHeader();
  BENCHMARK_DEFINITIONS.forEach((_, definitionIndex) => {
    const result = runIsolatedBenchmark('render', definitionIndex);
    results.push(result);
    printResult(result);
  });

  console.log('\nUpdate (existing chart.update; isolated child per case)');
  printTableHeader();
  BENCHMARK_DEFINITIONS.forEach((_, definitionIndex) => {
    const result = runIsolatedBenchmark('update', definitionIndex);
    results.push(result);
    printResult(result);
  });

  const timingFailures = results.filter((result) => !result.timingPassed);
  const cardinalityFailures = results.filter((result) => !result.cardinalityPassed);
  const renderResults = results.filter((result) => result.phase === 'render');
  const updateResults = results.filter((result) => result.phase === 'update');

  console.log('\nSummary');
  console.log('-------');
  console.log(`Render cases under p95 timing target: ${renderResults.filter((result) => result.timingPassed).length}/${renderResults.length}`);
  console.log(`Update cases under p95 timing target: ${updateResults.filter((result) => result.timingPassed).length}/${updateResults.length}`);
  console.log(`Render cardinality checks passing: ${renderResults.filter((result) => result.cardinalityPassed).length}/${renderResults.length}`);
  console.log(`Update cardinality checks passing: ${updateResults.filter((result) => result.cardinalityPassed).length}/${updateResults.length}`);
  console.log(`All timing + cardinality checks passing: ${results.filter((result) => result.targetPassed).length}/${results.length}`);
  if (timingFailures.length > 0) {
    console.log(`${timingFailures.length} case(s) exceeded the informational p95 target; compare p50/p95 and machine conditions before drawing conclusions.`);
  }
  if (cardinalityFailures.length > 0) {
    console.error(`${cardinalityFailures.length} case(s) violated the rendered-point cardinality contract.`);
    process.exitCode = 1;
  }

  if (enforceTarget) {
    if (timingFailures.length > 0) {
      console.error('Target enforcement requested and one or more cases exceeded the p95 target.');
      process.exitCode = 1;
    } else if (cardinalityFailures.length === 0) {
      console.log('Target enforcement requested; all timing and cardinality checks passed.');
    }
  } else if (cardinalityFailures.length === 0) {
    console.log('Timing targets are informational by default; use --enforce-target for a non-zero timing failure.');
  }
}

const childRequest = parseChildRequest();
if (childRequest) {
  runChild(childRequest.phase, childRequest.definitionIndex);
} else {
  runParent();
}
