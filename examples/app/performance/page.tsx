'use client';

import { useState, useEffect } from 'react';
import { LineChart, BarChart } from '@chartlite/react';
import ExampleCard from '@/components/ExampleCard';
import { FrameworkProvider } from '@/components/FrameworkContext';

export default function PerformancePage() {
  // Data for rapid updates demo
  const [rapidUpdateData, setRapidUpdateData] = useState(
    Array.from({ length: 50 }, (_, i) => ({
      x: `T${i}`,
      y: Math.random() * 100,
    }))
  );

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRapidUpdateData(
        Array.from({ length: 50 }, (_, i) => ({
          x: `T${i}`,
          y: Math.random() * 100,
        }))
      );
    }, 500); // Update every 500ms

    return () => clearInterval(interval);
  }, []);

  // Small dataset (no sampling)
  const smallData = Array.from({ length: 100 }, (_, i) => ({
    x: `Point ${i}`,
    y: Math.sin(i / 10) * 50 + 50 + Math.random() * 10,
  }));

  // Large dataset (auto-sampled to 500 points)
  const largeData = Array.from({ length: 2000 }, (_, i) => ({
    x: `Point ${i}`,
    y: Math.sin(i / 50) * 50 + 50 + Math.random() * 10,
  }));

  // Performance comparison data
  const comparisonData = [
    { x: '100 pts', y: 10 },
    { x: '500 pts', y: 12 },
    { x: '1000 pts', y: 12 },
    { x: '2000 pts', y: 12 },
    { x: '5000 pts', y: 12 },
  ];

  return (
    <FrameworkProvider>
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          ⚡ Performance & Benchmarks
        </h1>
        <p className="text-xl text-white/90 mb-6">
          See automatic optimizations in action. Fast by default, zero configuration.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
            <span className="text-white font-semibold">⚡ 42% faster updates</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
            <span className="text-white font-semibold">📉 Auto-sampling at 500+ points</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
            <span className="text-white font-semibold">🚀 Zero configuration</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Example 1: Element Pooling - Rapid Updates */}
        <ExampleCard
          title="Element Pooling: Rapid Updates"
          description="Chart updates every 500ms. Element pooling (always enabled) reuses DOM elements for 42% faster updates."
          code={{
            vanilla: `import { LineChart } from '@chartlite/core';

const chart = new LineChart('#chart', {
  data: initialData
}).render();

// Update every 500ms - element pooling makes this fast!
setInterval(() => {
  const newData = generateRandomData(50);
  chart.update(newData);
}, 500);

// Element pooling is ALWAYS enabled
// No configuration needed!`,
            react: `import { useState, useEffect } from 'react';
import { LineChart } from '@chartlite/react';

function LiveChart() {
  const [data, setData] = useState(generateData(50));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateData(50));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <LineChart data={data} />;
}

// Element pooling handles rapid updates automatically!`,
          }}
        >
          <LineChart data={rapidUpdateData} />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              📊 Updating every 500ms • ⚡ Element pooling: Always enabled
            </p>
          </div>
        </ExampleCard>

        {/* Example 2: Auto-Sampling Comparison */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Auto-Sampling: 100 Points vs 2000 Points
          </h2>
          <p className="text-gray-600 mb-6">
            Both charts render in ~12ms thanks to automatic sampling. The 2000-point dataset is automatically sampled to 500 points.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                100 Points (No Sampling)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Below 500-point threshold - renders all points
              </p>
              <LineChart data={smallData} />
              <div className="mt-2 text-center">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                  ✅ All 100 points rendered
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                2000 Points (Auto-Sampled)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Above 500-point threshold - auto-sampled to 500
              </p>
              <LineChart data={largeData} />
              <div className="mt-2 text-center">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                  ⚡ Auto-sampled: 2000 → 500 points
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Key Insight:</strong> Both charts render in similar time (~10-12ms) because auto-sampling kicks in at 500+ points.
              This means consistent performance regardless of dataset size - with zero configuration!
            </p>
          </div>
        </div>

        {/* Example 3: Render Performance Chart */}
        <ExampleCard
          title="Consistent Render Performance"
          description="Thanks to auto-sampling, render time stays consistent (~10-15ms) regardless of dataset size."
          code={{
            vanilla: `import { BarChart } from '@chartlite/core';

// Small dataset (100 points): ~10ms
const chart1 = new BarChart('#chart1', {
  data: generateData(100)
}).render();

// Medium dataset (500 points): ~12ms
const chart2 = new BarChart('#chart2', {
  data: generateData(500)
}).render();

// Large dataset (2000 points): ~12ms (auto-sampled!)
const chart3 = new BarChart('#chart3', {
  data: generateData(2000)
}).render();

// No configuration needed!
// Auto-sampling keeps it fast!`,
            react: `import { BarChart } from '@chartlite/react';

// All these render in similar time (~10-15ms)
// Auto-sampling handles large datasets automatically!

<BarChart data={generateData(100)} />   {/* 10ms */}
<BarChart data={generateData(500)} />   {/* 12ms */}
<BarChart data={generateData(2000)} />  {/* 12ms - sampled! */}
<BarChart data={generateData(5000)} />  {/* 12ms - sampled! */}`,
          }}
        >
          <BarChart data={comparisonData} title="Render Time (ms) by Dataset Size" />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              📊 Consistent ~12ms render time • ⚡ Auto-sampling at 500+ points
            </p>
          </div>
        </ExampleCard>

        {/* Performance Summary */}
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-8 shadow-2xl text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Performance Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">42%</div>
              <div className="text-xl">Faster Updates</div>
              <div className="text-sm opacity-80 mt-2">
                Element pooling reuses DOM elements
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold mb-2">37-92%</div>
              <div className="text-xl">Faster Rendering</div>
              <div className="text-sm opacity-80 mt-2">
                Auto-sampling for large datasets
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold mb-2">0</div>
              <div className="text-xl">Configuration</div>
              <div className="text-sm opacity-80 mt-2">
                Fast by default, just works!
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">How It Works</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-2xl mr-3">⚡</span>
                <div>
                  <strong>Element Pooling:</strong> Always enabled. DOM elements are reused across updates instead of destroyed/recreated.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">📉</span>
                <div>
                  <strong>Auto-Sampling:</strong> Automatically kicks in at 500+ points. Uses fast &apos;nth&apos; algorithm to downsample to 500 points.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🎯</span>
                <div>
                  <strong>Optimized Defaults:</strong> Animations disabled by default, responsive sizing enabled. One fast way, zero configuration.
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <p className="text-lg">
              Want to see the benchmarks?{' '}
              <a
                href="https://github.com/chartlite/chartlite/blob/main/docs/PERFORMANCE_BENCHMARKS.md"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-200 transition-colors"
              >
                Read the full performance documentation →
              </a>
            </p>
          </div>
        </div>
      </div>
    </FrameworkProvider>
  );
}
