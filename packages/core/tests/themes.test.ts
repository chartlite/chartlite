import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getThemeColors } from '../src/utils';
import { LineChart } from '../src/charts/LineChart';

const ALL_THEMES = ['default', 'midnight', 'minimal', 'tailwind', 'nord', 'high-contrast'];

describe('getThemeColors', () => {
  it('returns a complete palette for every built-in theme', () => {
    for (const theme of ALL_THEMES) {
      const colors = getThemeColors(theme);
      expect(colors.background).toMatch(/^#/);
      expect(colors.text).toMatch(/^#/);
      expect(colors.grid).toMatch(/^#/);
      expect(colors.primary).toMatch(/^#/);
      expect(colors.seriesColors).toHaveLength(8);
      colors.seriesColors.forEach((c) => expect(c).toMatch(/^#[0-9a-fA-F]{6}$/));
    }
  });

  it('falls back to the default theme for an unknown name', () => {
    expect(getThemeColors('does-not-exist')).toEqual(getThemeColors('default'));
  });

  it('gives the new presets distinct backgrounds', () => {
    expect(getThemeColors('tailwind').background).toBe('#ffffff');
    expect(getThemeColors('nord').background).toBe('#2e3440');
    expect(getThemeColors('high-contrast').grid).toBe('#767676');
  });
});

describe('charts accept the new theme presets', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const data = [
    { x: 'A', y: 10 },
    { x: 'B', y: 20 },
    { x: 'C', y: 15 },
  ];

  for (const theme of ['tailwind', 'nord', 'high-contrast'] as const) {
    it(`renders with theme "${theme}" and applies its background`, () => {
      new LineChart(container, { data, theme }).render();
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.style.backgroundColor).toBeTruthy();
    });
  }

  it('still rejects an invalid theme', () => {
    expect(() => new LineChart(container, { data, theme: 'neon' as never })).toThrow(
      /Invalid theme/
    );
  });
});
