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
    <article className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
      <div className="flex flex-col">
        <div className="mb-4">
          <div className="mb-1 flex items-center gap-3">
            <h3 className="font-serif text-3xl text-ink">{title}</h3>
            {badge && (
              <span className="rounded-full border border-accent px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-ink">
                {badge}
              </span>
            )}
          </div>
          <p className="text-ink-soft">{description}</p>
        </div>

        {/* Chart panel — follows the site theme. Charts inside use `cssVars`. */}
        <div className="plate flex min-h-[280px] flex-1 flex-col justify-center rounded-sm p-4">
          {children}
        </div>
      </div>

      <CodeViewer code={code} />
    </article>
  );
}
