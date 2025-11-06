# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-11-06

### Added
- 

### Changed
- 

### Fixed
- 

## [0.2.0] - 2025-11-05

### Added
- 

### Changed
- 

### Fixed
- 

## [Unreleased]

### Added

- **Phase 1: Multi-Series Support** 🎉
  - Multi-series LineChart with multiple lines on one chart
  - Multi-series BarChart with grouped bars side-by-side
  - Multi-series AreaChart with stacked areas for cumulative visualization
  - Legend component (static, with horizontal/vertical layouts and positioning)
  - Auto-color generation from theme palettes (8 colors per theme)
  - Support for series-first and column-oriented multi-series data formats
  - 24 new comprehensive tests for multi-series functionality
- React wrapper components:
  - AreaChart component (completed)
  - BarChart component (new)
- New example file: `multi-series.html` showcasing all multi-series features
- Enhanced type definitions: `SeriesData`, `SeriesDefinition`, `LegendConfig`, `LegendPosition`
- Data transformation utilities: `normalizeToSeriesData()`, `isMultiSeriesData()`, `getAllXValues()`, `getCombinedYRange()`, `extractSeriesDefinitions()`

### Changed (Breaking - Internal)

- BaseChart constructor now accepts `FlexibleDataInput` instead of `DataPoint[]`
- Chart `update()` method now accepts `FlexibleDataInput` in addition to `DataPoint[]`
- `getThemeColors()` now includes `seriesColors` array (8 colors per theme)
- All chart types now use `seriesData` internally for unified multi-series rendering
- React components now pass data directly to core (normalization handled internally)

### Fixed

- React AreaChart component using incorrect constructor reference
- Test expectations updated for new single-series color behavior

## [0.1.3] - 2024-10-29

### Added

- GitHub Pages deployment pipeline
- Release automation workflows

### Changed

- Updated release naming convention

## [0.1.2] - 2024-10-29

### Fixed

- Pipeline configuration updates

## [0.1.1] - 2024-10-29

### Added

- Initial LineChart, BarChart, and AreaChart implementations
- Theme support (default, midnight, minimal)
- Flexible data format support (4 formats)
- Responsive sizing with ResizeObserver
- SVG export functionality
- Animation support
- Comprehensive test suite (115 tests)

### Changed

- N/A

### Fixed

- TypeScript errors in LineChart
- Turborepo configuration updated to v2.0 syntax

## [0.0.1] - 2024-10-27

### Added

- Initial commit
- Project scaffolding
- Monorepo structure with Turborepo
- Basic documentation (README, CONTRIBUTING, ROADMAP)
