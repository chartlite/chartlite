'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useFramework } from './FrameworkContext';

export interface CodeExample {
  vanilla: string;
  react: string;
  vue?: string;
  svelte?: string;
  angular?: string;
}

interface CodeViewerProps {
  code: CodeExample;
}

export default function CodeViewer({ code }: CodeViewerProps) {
  const { selectedFramework, setSelectedFramework } = useFramework();
  const [copied, setCopied] = useState(false);

  const frameworks = [
    { id: 'vanilla' as const, label: 'Vanilla JS', available: true },
    { id: 'react' as const, label: 'React', available: true },
    { id: 'vue' as const, label: 'Vue', available: !!code.vue },
    { id: 'svelte' as const, label: 'Svelte', available: !!code.svelte },
    { id: 'angular' as const, label: 'Angular', available: !!code.angular },
  ];

  const currentCode = code[selectedFramework] || code.vanilla;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-lg overflow-hidden bg-gray-900">
      {/* Tab Bar */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex gap-2">
          {frameworks.map((framework) => (
            <button
              key={framework.id}
              onClick={() => setSelectedFramework(framework.id)}
              disabled={!framework.available}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                selectedFramework === framework.id
                  ? 'bg-blue-600 text-white'
                  : framework.available
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              {framework.label}
            </button>
          ))}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy Code'}
        </button>
      </div>

      {/* Code Display */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={selectedFramework === 'vanilla' ? 'javascript' : 'jsx'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
          }}
        >
          {currentCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
