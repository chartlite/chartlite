'use client';

import { ReactNode } from 'react';
import CodeViewer, { CodeExample } from './CodeViewer';

interface ExampleCardProps {
  title: string;
  description: string;
  children: ReactNode;
  code: CodeExample;
  badge?: string;
}

export default function ExampleCard({ title, description, children, code, badge }: ExampleCardProps) {
  return (
    <div className="border-glow relative rounded-2xl glass p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <h2 className="font-display text-2xl font-semibold text-mist-100">{title}</h2>
          {badge && (
            <span className="rounded-full border border-glow-cyan/30 bg-glow-cyan/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-glow-cyan">
              {badge}
            </span>
          )}
        </div>
        <p className="text-mist-500">{description}</p>
      </div>

      {/* Chart panel — a clean light slab so charts read crisply against the dark card */}
      <div className="mb-6 min-h-[300px] rounded-xl bg-white/95 p-4 shadow-inner">{children}</div>

      {/* Code */}
      <CodeViewer code={code} />
    </div>
  );
}
