import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LineChart } from '../src/charts/LineChart';

class ConfigurableLineChart extends LineChart {
  setTitle(title: string): void {
    this.config.title = title;
  }
}

function getTable(container: HTMLElement): HTMLTableElement {
  const table = container.querySelector<HTMLTableElement>('table.sr-only');
  if (!table) throw new Error('Expected screen-reader table');
  return table;
}

function getFallback(container: HTMLElement): SVGForeignObjectElement {
  const fallback = container.querySelector<SVGForeignObjectElement>('foreignObject');
  if (!fallback) throw new Error('Expected screen-reader fallback');
  return fallback;
}

describe('data-table updates', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('retains a compatible single-series table and rows while updating text', () => {
    const chart = new ConfigurableLineChart(container, {
      title: 'Initial title',
      data: [{ x: 'Alpha', y: 10 }, { x: 'Beta', y: 20 }],
    });
    chart.render();

    const fallback = getFallback(container);
    const table = getTable(container);
    const rows = Array.from(table.tBodies[0].rows);
    chart.setTitle('Updated title');

    chart.update([{ x: '<Next>', y: 30 }, { x: 'Final', y: 40 }]);

    const updatedTable = getTable(container);
    expect(getFallback(container)).toBe(fallback);
    expect(updatedTable).toBe(table);
    expect(Array.from(updatedTable.tBodies[0].rows)).toEqual(rows);
    expect(updatedTable.caption?.textContent).toBe('Updated title - Data Table');
    expect(updatedTable.tHead?.rows[0].cells[0].getAttribute('scope')).toBe('col');
    expect(updatedTable.tHead?.rows[0].cells[1].getAttribute('scope')).toBe('col');
    expect(updatedTable.tBodies[0].rows[0].cells[0].textContent).toBe('<Next>');
    expect(updatedTable.tBodies[0].rows[0].cells[1].textContent).toBe('30');
    expect(updatedTable.querySelector('script')).toBeNull();
  });

  it('rebuilds the single-series table when its row shape changes', () => {
    const chart = new LineChart(container, {
      data: [{ x: 'Alpha', y: 10 }, { x: 'Beta', y: 20 }],
    });
    chart.render();

    const originalFallback = getFallback(container);
    const originalTable = getTable(container);
    chart.update([
      { x: 'One', y: 1 },
      { x: 'Two', y: 2 },
      { x: 'Three', y: 3 },
    ]);

    const updatedTable = getTable(container);
    expect(getFallback(container)).not.toBe(originalFallback);
    expect(updatedTable).not.toBe(originalTable);
    expect(updatedTable.tBodies[0].rows).toHaveLength(3);
    expect(updatedTable.tBodies[0].rows[2].cells[0].textContent).toBe('Three');
  });

  it('rebuilds when retained single-series markup is no longer compatible', () => {
    const chart = new LineChart(container, {
      data: [{ x: 'Alpha', y: 10 }, { x: 'Beta', y: 20 }],
    });
    chart.render();

    const originalTable = getTable(container);
    originalTable.tBodies[0].rows[0].cells[0].innerHTML = '<em>Injected</em>';
    chart.update([{ x: 'One', y: 1 }, { x: 'Two', y: 2 }]);

    const updatedTable = getTable(container);
    expect(updatedTable).not.toBe(originalTable);
    expect(updatedTable.tBodies[0].rows[0].cells).toHaveLength(2);
    expect(updatedTable.tBodies[0].rows[0].cells[0].textContent).toBe('One');
    expect(updatedTable.querySelector('em')).toBeNull();
  });

  it('rebuilds instead of reading a missing retained table cell', () => {
    const chart = new LineChart(container, {
      data: [{ x: 'Alpha', y: 10 }, { x: 'Beta', y: 20 }],
    });
    chart.render();

    const originalTable = getTable(container);
    originalTable.tBodies[0].rows[0].deleteCell(1);
    chart.update([{ x: 'One', y: 1 }, { x: 'Two', y: 2 }]);

    const updatedTable = getTable(container);
    expect(updatedTable).not.toBe(originalTable);
    expect(updatedTable.tBodies[0].rows[0].cells).toHaveLength(2);
    expect(updatedTable.tBodies[0].rows[0].cells[1].textContent).toBe('1');
  });

  it('falls back to generated markup for multi-series updates', () => {
    const chart = new LineChart(container, {
      data: {
        series: [
          { name: 'Revenue', dataKey: 'revenue' },
          { name: 'Cost', dataKey: 'cost' },
        ],
        data: [{ month: 'January', revenue: 100, cost: 50 }],
      },
    });
    chart.render();

    const originalTable = getTable(container);
    chart.update({
      series: [
        { name: 'Forecast', dataKey: 'forecast' },
        { name: 'Spend', dataKey: 'spend' },
      ],
      data: [{ month: 'February', forecast: 120, spend: 70 }],
    });

    const updatedTable = getTable(container);
    expect(updatedTable).not.toBe(originalTable);
    expect(Array.from(updatedTable.tHead!.rows[0].cells).map(cell => cell.textContent))
      .toEqual(['Category', 'Forecast', 'Spend']);
    expect(updatedTable.tBodies[0].rows[0].cells[0].tagName).toBe('TH');
    expect(updatedTable.tBodies[0].rows[0].cells[0].getAttribute('scope')).toBe('row');
    expect(Array.from(updatedTable.tBodies[0].rows[0].cells).map(cell => cell.textContent))
      .toEqual(['February', '120', '70']);
  });
});
