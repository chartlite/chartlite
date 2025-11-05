import { useEffect, useRef } from 'react';
import { BarChart as CoreBarChart, type BarChartConfig } from '@chartlite/core';

export interface BarChartProps extends Omit<BarChartConfig, 'width' | 'height'> {
  className?: string;
  style?: React.CSSProperties;
}

export function BarChart({ className, style, ...config }: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<CoreBarChart | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = new CoreBarChart(containerRef.current, config);
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
      chartRef.current.update(config.data);
    }
  }, [config.data]);

  return <div ref={containerRef} className={className} style={style} />;
}
