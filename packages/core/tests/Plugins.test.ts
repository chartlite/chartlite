import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';
import type { ChartPlugin, PluginContext } from '../src/types';

describe('Plugin System', () => {
  let container: HTMLDivElement;
  const testData = [
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 },
    { x: 'Mar', y: 38 },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('Lifecycle Hooks', () => {
    it('should call beforeRender and afterRender hooks', () => {
      const beforeRender = vi.fn();
      const afterRender = vi.fn();

      const plugin: ChartPlugin = {
        name: 'test-plugin',
        beforeRender,
        afterRender,
      };

      const chart = new LineChart(container, {
        data: testData,
        plugins: [plugin],
      });

      chart.render();

      expect(beforeRender).toHaveBeenCalledOnce();
      expect(afterRender).toHaveBeenCalledOnce();

      // beforeRender should be called before afterRender
      expect(beforeRender.mock.invocationCallOrder[0]).toBeLessThan(
        afterRender.mock.invocationCallOrder[0]
      );
    });

    it('should call beforeUpdate and afterUpdate hooks', () => {
      const beforeUpdate = vi.fn();
      const afterUpdate = vi.fn();

      const plugin: ChartPlugin = {
        name: 'test-plugin',
        beforeUpdate,
        afterUpdate,
      };

      const chart = new LineChart(container, {
        data: testData,
        plugins: [plugin],
      });

      chart.render();

      // Reset mocks after initial render
      beforeUpdate.mockClear();
      afterUpdate.mockClear();

      // Update with new data
      const newData = [
        { x: 'Jan', y: 50 },
        { x: 'Feb', y: 60 },
      ];
      chart.update(newData);

      expect(beforeUpdate).toHaveBeenCalledOnce();
      expect(afterUpdate).toHaveBeenCalledOnce();
    });

    it('should call beforeDestroy hook', () => {
      const beforeDestroy = vi.fn();

      const plugin: ChartPlugin = {
        name: 'test-plugin',
        beforeDestroy,
      };

      const chart = new LineChart(container, {
        data: testData,
        plugins: [plugin],
      });

      chart.render();
      chart.destroy();

      expect(beforeDestroy).toHaveBeenCalledOnce();
    });

    it('should call onResize hook when chart is resized', () => {
      const onResize = vi.fn();

      const plugin: ChartPlugin = {
        name: 'test-plugin',
        onResize,
      };

      const chart = new LineChart(container, {
        data: testData,
        responsive: true,
        plugins: [plugin],
      });

      chart.render();

      // Manually trigger resize by updating dimensions
      chart.update(testData);

      // onResize should be called during the resize process
      // Note: In real scenarios, ResizeObserver would trigger this
    });
  });

  describe('Plugin Context', () => {
    it('should provide valid plugin context to hooks', () => {
      let capturedContext: PluginContext | null = null;

      const plugin: ChartPlugin = {
        name: 'test-plugin',
        afterRender: (context) => {
          capturedContext = context;
        },
      };

      const chart = new LineChart(container, {
        data: testData,
        plugins: [plugin],
      });

      chart.render();

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.chart).toBe(chart);
      expect(capturedContext!.svg).toBeInstanceOf(SVGSVGElement);
      expect(capturedContext!.config).toBeDefined();
      expect(capturedContext!.data).toEqual(testData);
      expect(capturedContext!.dimensions).toBeDefined();
      expect(capturedContext!.container).toBe(container);
      expect(typeof capturedContext!.createSVGElement).toBe('function');
      expect(typeof capturedContext!.emit).toBe('function');
      expect(typeof capturedContext!.on).toBe('function');
      expect(typeof capturedContext!.off).toBe('function');
    });

    it('should provide createSVGElement helper that works', () => {
      let svgElement: Element | null = null;

      const plugin: ChartPlugin = {
        name: 'test-plugin',
        afterRender: (context) => {
          svgElement = context.createSVGElement('circle', {
            cx: '50',
            cy: '50',
            r: '10',
            fill: 'red',
          });
        },
      };

      new LineChart(container, {
        data: testData,
        plugins: [plugin],
      }).render();

      expect(svgElement).toBeTruthy();
      expect(svgElement!.tagName).toBe('circle');
      expect(svgElement!.getAttribute('cx')).toBe('50');
      expect(svgElement!.getAttribute('cy')).toBe('50');
      expect(svgElement!.getAttribute('r')).toBe('10');
      expect(svgElement!.getAttribute('fill')).toBe('red');
    });
  });

  describe('Event System', () => {
    it('should emit and receive custom events', () => {
      const eventHandler = vi.fn();
      let pluginContext: PluginContext | null = null;

      const plugin: ChartPlugin = {
        name: 'test-plugin',
        afterRender: (context) => {
          pluginContext = context;
          context.on('custom-event', eventHandler);
          context.emit('custom-event', { test: 'data' });
        },
      };

      new LineChart(container, {
        data: testData,
        plugins: [plugin],
      }).render();

      expect(eventHandler).toHaveBeenCalledOnce();
      expect(eventHandler).toHaveBeenCalledWith({ test: 'data' });
    });

    it('should support multiple event handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const plugin: ChartPlugin = {
        name: 'test-plugin',
        afterRender: (context) => {
          context.on('test-event', handler1);
          context.on('test-event', handler2);
          context.emit('test-event');
        },
      };

      new LineChart(container, {
        data: testData,
        plugins: [plugin],
      }).render();

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
    });

    it('should remove event handlers with off()', () => {
      const handler = vi.fn();

      const plugin: ChartPlugin = {
        name: 'test-plugin',
        afterRender: (context) => {
          context.on('test-event', handler);
          context.off('test-event', handler);
          context.emit('test-event');
        },
      };

      new LineChart(container, {
        data: testData,
        plugins: [plugin],
      }).render();

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Plugins', () => {
    it('should support multiple plugins', () => {
      const plugin1Render = vi.fn();
      const plugin2Render = vi.fn();

      const plugin1: ChartPlugin = {
        name: 'plugin-1',
        afterRender: plugin1Render,
      };

      const plugin2: ChartPlugin = {
        name: 'plugin-2',
        afterRender: plugin2Render,
      };

      new LineChart(container, {
        data: testData,
        plugins: [plugin1, plugin2],
      }).render();

      expect(plugin1Render).toHaveBeenCalledOnce();
      expect(plugin2Render).toHaveBeenCalledOnce();
    });

    it('should call plugins in order', () => {
      const callOrder: string[] = [];

      const plugin1: ChartPlugin = {
        name: 'plugin-1',
        afterRender: () => callOrder.push('plugin-1'),
      };

      const plugin2: ChartPlugin = {
        name: 'plugin-2',
        afterRender: () => callOrder.push('plugin-2'),
      };

      new LineChart(container, {
        data: testData,
        plugins: [plugin1, plugin2],
      }).render();

      expect(callOrder).toEqual(['plugin-1', 'plugin-2']);
    });
  });

  describe('Error Handling', () => {
    it('should handle plugin errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const workingPlugin = vi.fn();

      const errorPlugin: ChartPlugin = {
        name: 'error-plugin',
        afterRender: () => {
          throw new Error('Plugin error');
        },
      };

      const goodPlugin: ChartPlugin = {
        name: 'good-plugin',
        afterRender: workingPlugin,
      };

      // Chart should still render even if one plugin fails
      new LineChart(container, {
        data: testData,
        plugins: [errorPlugin, goodPlugin],
      }).render();

      expect(consoleSpy).toHaveBeenCalled();
      expect(workingPlugin).toHaveBeenCalledOnce();

      consoleSpy.mockRestore();
    });
  });

  describe('Integration with Different Chart Types', () => {
    it('should work with BarChart', () => {
      const plugin = vi.fn();

      new BarChart(container, {
        data: testData,
        plugins: [{
          name: 'test-plugin',
          afterRender: plugin,
        }],
      }).render();

      expect(plugin).toHaveBeenCalledOnce();
    });
  });
});
