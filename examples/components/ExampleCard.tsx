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
    <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {badge && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full uppercase">
              {badge}
            </span>
          )}
        </div>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Chart Display */}
      <div className="mb-6 min-h-[300px]">{children}</div>

      {/* Code Viewer */}
      <CodeViewer code={code} />
    </div>
  );
}
