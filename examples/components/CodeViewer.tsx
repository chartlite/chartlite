'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { gruvboxDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useFramework } from './FrameworkContext';

export interface CodeExample {
  vanilla: string;
  react: string;
  vue?: string;
  svelte?: string;
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
  ];

  const currentCode = code[selectedFramework] || code.vanilla;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-plate flex flex-col overflow-hidden rounded-sm lg:mt-[4.5rem]">
      {/* Tab Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-line px-4">
        <div role="tablist" aria-label="Framework" className="flex gap-4">
          {frameworks.map((framework) => (
            <button
              key={framework.id}
              role="tab"
              aria-selected={selectedFramework === framework.id}
              onClick={() => setSelectedFramework(framework.id)}
              disabled={!framework.available}
              className={`-mb-px border-b-2 py-3 text-sm transition-colors ${
                selectedFramework === framework.id
                  ? 'border-accent text-slate-text'
                  : framework.available
                  ? 'border-transparent text-slate-muted hover:text-slate-text'
                  : 'cursor-not-allowed border-transparent text-slate-muted/40'
              }`}
            >
              {framework.label}
            </button>
          ))}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="font-mono text-xs text-slate-muted transition-colors hover:text-accent"
        >
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-x-auto">
        <SyntaxHighlighter
          language={selectedFramework === 'vanilla' ? 'javascript' : 'jsx'}
          style={gruvboxDark}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: 'transparent',
            fontSize: '0.84rem',
            lineHeight: 1.65,
          }}
          codeTagProps={{ style: { fontFamily: 'var(--font-mono)', background: 'transparent' } }}
        >
          {currentCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
