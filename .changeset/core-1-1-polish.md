---
"@chartlite/core": minor
---

1.1 polish: better-looking defaults, smoother interactivity, and easier data input.

**Visual defaults**

- Axes use "nice" ticks (0, 20, 40 … instead of arbitrary steps). Line and
  scatter charts no longer force zero into the y range; bar and area charts
  still start at zero.
- Crowded category labels are shortened with an ellipsis or evenly thinned
  (always keeping the first and last), instead of overlapping. The same applies
  to horizontal bar labels.
- The legend appears automatically when there are two or more series, slices,
  or rings. `legend: false` hides it.
- Point markers are shown only when each series has 24 points or fewer.
  Hidden points stay hoverable and keyboard-focusable. `showPoints` overrides
  this.
- Bars have a maximum thickness, grouped bars sit side by side with a small
  gap, and bar corners are slightly rounded.
- `curve: 'smooth'` uses monotone interpolation, so curves no longer overshoot
  the data.
- Stacked area series use flat fills, so the layers stay distinct. A single
  series keeps its gradient.
- Title and legend fit inside the requested `height` instead of squeezing or
  overflowing the plot.
- Pie percentage labels are drawn only on slices large enough to hold them.
- Reference-line and annotation labels have a background halo, so they stay
  readable over data.

**Easier to use**

- Row objects are accepted as data: `[{ month: 'Jan', revenue: 10, costs: 4 }]`.
  The first non-numeric key becomes the x axis, and each numeric key becomes a
  series.
- `legend: true | false` shorthand.
- `maxPoints`: the downsampling budget (default 500; `0` disables sampling).
- `xFormatter`: formats x-axis labels (and the tooltip header).
- `chart.update(data, options?)` updates options together with the data.
- Sparkline `variant: 'line' | 'area'`, an alias of `type` for declarative specs.
- Invalid data errors now list the accepted formats.

**Interactivity (`@chartlite/core/interactive`)**

- On line, area, and combo charts, the tooltip snaps to the nearest x and lists
  every series there, with colour swatches and `valueFormatter`-formatted values.
- Scatter points are picked by proximity.
- The tooltip flips to stay inside the viewport and follows keyboard focus.
- Hidden point markers are revealed while hovered.
- `tooltip`, `crosshair`, and `callbacks` share one delegated pointer listener
  per chart, so re-renders no longer stack handlers.
- `legendToggle()` now works on pie and radial legends.

**Fixes**

- `responsive` now defaults to `true` for every chart type, as documented.
  Previously, chart-type defaults dropped it.
- `cssVars` also applies to the title, legend, and overlay colours. Label halos,
  point outlines, and slice separators follow `--cl-bg`, so they no longer show
  as white outlines on dark themes.
- Fixed a resize feedback loop when the container had no fixed height.
- Combo chart bars now report their pixel centre in `data-cy`, like bar charts
  (previously their top edge).
