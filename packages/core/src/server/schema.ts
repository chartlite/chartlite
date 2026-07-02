/**
 * JSON Schema (draft 2020-12) for {@link ChartSpec} — the declarative chart
 * description consumed by `renderToString` and the `@chartlite/mcp` server.
 *
 * This is the single source of truth. `scripts/gen-schema.ts` writes it out to
 * the published `schema.json`, and a test asserts the two stay in sync and that
 * the `type` enum matches the render registry, so the schema can't drift from the
 * code.
 */

import { CHART_TYPES } from './renderToString';

/** One of the four accepted data shapes (kept permissive on purpose). */
const dataSchema = {
  description:
    'Chart data. Accepts DataPoint[] ([{x,y}]), a plain number[] , column-oriented ' +
    '({x:[...], y:[...]}), or series-first ({series:[...], data:[...]}).',
  oneOf: [
    {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          x: { type: ['string', 'number'] },
          y: { type: 'number' },
          label: { type: 'string' },
        },
        required: ['x', 'y'],
        additionalProperties: true,
      },
    },
    { type: 'array', items: { type: 'number' } },
    {
      type: 'object',
      properties: {
        x: { type: 'array', items: { type: ['string', 'number'] } },
      },
      required: ['x'],
      additionalProperties: true,
    },
    {
      type: 'object',
      properties: {
        series: { type: 'array' },
        data: { type: 'array' },
      },
      required: ['series', 'data'],
      additionalProperties: true,
    },
  ],
} as const;

export const chartSpecSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://chartlite.dev/schema.json',
  title: 'ChartSpec',
  description: 'A declarative Chartlite chart: a type discriminator plus that chart\'s config.',
  type: 'object',
  required: ['type', 'data'],
  properties: {
    type: {
      description: 'Which chart to render.',
      type: 'string',
      enum: CHART_TYPES,
    },
    data: dataSchema,
    theme: {
      type: 'string',
      enum: ['default', 'midnight', 'minimal', 'tailwind', 'nord', 'high-contrast'],
    },
    colors: { type: 'array', items: { type: 'string' } },
    title: { type: 'string' },
    width: { type: 'number', exclusiveMinimum: 0 },
    height: { type: 'number', exclusiveMinimum: 0 },
    legend: {
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        position: { type: 'string', enum: ['top', 'bottom'] },
        align: { type: 'string', enum: ['left', 'center', 'right'] },
      },
      additionalProperties: false,
    },
    // Type-specific options (validated loosely; the constructors apply defaults).
    curve: { type: 'string', enum: ['linear', 'smooth'] },
    orientation: { type: 'string', enum: ['vertical', 'horizontal'] },
    showPoints: { type: 'boolean' },
    fillOpacity: { type: 'number', minimum: 0, maximum: 1 },
    gradient: { type: 'boolean' },
    innerRadius: { type: 'number', minimum: 0, maximum: 1 },
    showLabels: { type: 'boolean' },
    pointSize: { type: 'number', exclusiveMinimum: 0 },
    pointShape: { type: 'string', enum: ['circle', 'square', 'triangle'] },
    stacked: { type: 'boolean' },
    // radial / gauge
    max: { type: 'number', exclusiveMinimum: 0 },
    startAngle: { type: 'number' },
    endAngle: { type: 'number' },
    thickness: { type: 'number', exclusiveMinimum: 0 },
    showValue: { type: 'boolean' },
  },
  additionalProperties: true,
} as const;

export type ChartSpecSchema = typeof chartSpecSchema;
