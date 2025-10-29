import { useEffect, useRef } from 'react';
import { LineChart as CoreLineChart, type LineChartConfig, normalizeData } from '@chartlite/core';

export interface LineChartProps extends Omit<LineChartConfig, 'width' | 'height'> {
  className?: string;
  style?: React.CSSProperties;
}

export function LineChart({ className, style, ...config }: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<CoreLineChart | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = new CoreLineChart(containerRef.current, config);
    chartRef.current.render();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (chartRef.current && config.data) {
      // Normalize data before passing to update method
      const normalizedData = normalizeData(config.data);
      chartRef.current.update(normalizedData);
    }
  }, [config.data]);

  return <div ref={containerRef} className={className} style={style} />;
}