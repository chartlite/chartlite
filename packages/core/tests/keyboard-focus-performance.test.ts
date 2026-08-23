import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { requireElement } from './test-helpers';

describe('KeyboardNavigator focus transitions', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    container.remove();
    document.getElementById('chartlite-live-region')?.remove();
  });

  it('moves focus repeatedly across a 500-point chart with one removal mutation per transition', () => {
    const data = Array.from({ length: 500 }, (_, index) => ({ x: index, y: index }));
    const chart = new LineChart(container, { data });
    chart.render();

    const svg = requireElement<SVGElement>(container, 'svg');
    svg.focus();
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

    const removeClass = vi.spyOn(DOMTokenList.prototype, 'remove');
    const removeAttribute = vi.spyOn(Element.prototype, 'removeAttribute');

    const transitionCount = 25;
    for (let index = 0; index < transitionCount; index++) {
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    }

    expect(removeClass).toHaveBeenCalledTimes(transitionCount);
    expect(removeClass).toHaveBeenCalledWith('data-point-focused');
    expect(removeAttribute).toHaveBeenCalledTimes(transitionCount);
    expect(removeAttribute).toHaveBeenCalledWith('data-focused');
    expect(container.querySelectorAll('[data-focused="true"]')).toHaveLength(1);
    expect(container.querySelector('.data-point-focused')?.getAttribute('data-index')).toBe('25');
  });

  it('clears the focused point on Escape and blur', () => {
    const chart = new LineChart(container, { data: [1, 2, 3] });
    chart.render();

    const svg = requireElement<SVGElement>(container, 'svg');
    svg.focus();
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(container.querySelector('[data-focused="true"]')).toBeNull();
    expect(container.querySelector('.data-point-focused')).toBeNull();

    svg.focus();
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    svg.blur();

    expect(container.querySelector('[data-focused="true"]')).toBeNull();
    expect(container.querySelector('.data-point-focused')).toBeNull();
  });
});
