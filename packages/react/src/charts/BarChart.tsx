import { useEffect, useRef, useState } from 'react';
import { BarChart as CoreBarChart, type BarChartConfig } from '@chartlite/core';

export interface BarChartProps extends Omit<BarChartConfig, 'width' | 'height'> {
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
}

export function BarChart({ className, style, onError, ...config }: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<CoreBarChart | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Recreate chart when any config changes
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Destroy existing chart if present
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Create new chart with current config
      chartRef.current = new CoreBarChart(containerRef.current, config);
      chartRef.current.render();

      // Clear any previous errors
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) {
        onError(error);
      } else {
        console.error('BarChart render error:', error);
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [
    config.data,
    config.theme,
    config.title,
    config.orientation,
    config.showLegend,
    config.legend,
    config.animate,
    config.responsive,
    config.colors,
    config.referenceLines,
    config.annotations,
    config.regions,
    onError,
  ]);

  if (error) {
    return (
      <div className={className} style={{ ...style, padding: '20px', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', backgroundColor: '#fee2e2' }}>
        <strong>Chart Error:</strong> {error.message}
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={style} />;
}
