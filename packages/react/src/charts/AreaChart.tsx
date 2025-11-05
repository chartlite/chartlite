import { useEffect, useRef } from 'react';
import { AreaChart as CoreAreaChart, type AreaChartConfig } from '@chartlite/core';

export interface AreaChartProps extends Omit<AreaChartConfig, 'width' | 'height'> {
  className?: string;
  style?: React.CSSProperties;
}

export function AreaChart({ className, style, ...config }: AreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<CoreAreaChart | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = new CoreAreaChart(containerRef.current, config);
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