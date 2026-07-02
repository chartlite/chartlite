import type { CSSProperties, ReactElement } from 'react';
import { useChart, type ChartConstructor } from './useChart';

/** Props shared by every Chartlite React component. */
export interface ChartFrameOwnProps {
  /** Extra class on the container element. */
  className?: string;
  /** Inline styles on the container element. */
  style?: CSSProperties;
  /** Called when the underlying chart throws while rendering. */
  onError?: (error: Error) => void;
}

const errorBoxStyle: CSSProperties = {
  padding: '20px',
  color: '#dc2626',
  border: '1px solid #fecaca',
  borderRadius: '4px',
  backgroundColor: '#fee2e2',
};

/**
 * Renders a container `<div>` and drives a core chart into it via {@link useChart}.
 * If the chart throws, a fallback error box is shown (and `onError` is called).
 * This is the single mount/render/cleanup path behind both `<Chart>` and every
 * named component.
 */
export function ChartFrame({
  ctor,
  config,
  className,
  style,
  onError,
}: {
  ctor: ChartConstructor | undefined;
  config: Record<string, unknown>;
} & ChartFrameOwnProps): ReactElement {
  const { containerRef, error } = useChart(ctor, config, onError);

  if (error) {
    return (
      <div className={className} style={{ ...style, ...errorBoxStyle }}>
        <strong>Chart Error:</strong> {error.message}
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={style} />;
}
