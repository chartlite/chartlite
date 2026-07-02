# @chartlite/mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that renders
[Chartlite](https://github.com/chartlite/chartlite) charts to **accessible SVG** from a
single JSON spec. Zero-dependency core (~13 KB), runs headless — ideal inside an agent
sandbox.

## Run

```bash
npx -y @chartlite/mcp
```

The server speaks MCP over stdio.

## MCP client configuration

```jsonc
{
  "mcpServers": {
    "chartlite": {
      "command": "npx",
      "args": ["-y", "@chartlite/mcp"]
    }
  }
}
```

## Tools

### `render_chart({ spec })`

Render a chart to an SVG string. `spec` is a **ChartSpec**: `{ type, data, ...options }`.

```jsonc
{
  "spec": {
    "type": "line",
    "data": [{ "x": "Jan", "y": 4200 }, { "x": "Feb", "y": 4800 }],
    "theme": "tailwind",
    "title": "Revenue"
  }
}
```

Returns the SVG as text — drop it straight into HTML or Markdown; it needs no client JS.

- `type`: `line` | `bar` | `area` | `scatter` | `pie` | `sparkline`
- `data`: `DataPoint[]` (`[{x,y}]`), `number[]`, column (`{x:[],y:[]}`), or series-first
  (`{series:[...],data:[...]}`)
- options: `theme`, `title`, `colors`, `width`, `height`, `legend`, `curve`,
  `orientation`, `innerRadius`, `pointShape`, `referenceLines`, `annotations`, … (see the
  schema below)

### `list_chart_types()`

Returns the supported chart types and the full JSON Schema for a spec, so you can build a
valid `render_chart` call.

## Schema

The chart-spec JSON Schema is published as
[`@chartlite/core/schema.json`](https://www.npmjs.com/package/@chartlite/core) and returned
by `list_chart_types`.

## License

MIT © Riel St. Amand
