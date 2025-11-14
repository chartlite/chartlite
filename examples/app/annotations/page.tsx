"use client";

import { LineChart, BarChart, AreaChart } from "@chartlite/react";
import ExampleCard from "@/components/ExampleCard";
import { FrameworkProvider } from "@/components/FrameworkContext";

export default function AnnotationsPage() {
  // Revenue data with goal tracking
  const revenueData = [
    { x: "Jan", y: 42000 },
    { x: "Feb", y: 48000 },
    { x: "Mar", y: 52000 },
    { x: "Apr", y: 49000 },
    { x: "May", y: 55000 },
    { x: "Jun", y: 58000 },
  ];

  // Stock price data with events
  const stockData = [
    { x: "Mon", y: 150 },
    { x: "Tue", y: 155 },
    { x: "Wed", y: 168 },
    { x: "Thu", y: 162 },
    { x: "Fri", y: 172 },
  ];

  // Temperature data with thresholds
  const temperatureData = [
    { x: "8AM", y: 18 },
    { x: "10AM", y: 22 },
    { x: "12PM", y: 28 },
    { x: "2PM", y: 32 },
    { x: "4PM", y: 30 },
    { x: "6PM", y: 24 },
  ];

  // Sales data with regions
  const salesData = [
    { x: "Week 1", y: 2500 },
    { x: "Week 2", y: 3200 },
    { x: "Week 3", y: 4100 },
    { x: "Week 4", y: 3800 },
    { x: "Week 5", y: 4500 },
    { x: "Week 6", y: 5200 },
  ];

  return (
    <FrameworkProvider>
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          📍 Annotations & Reference Lines
        </h1>
        <p className="text-xl text-white/90">
          Add context to your charts with thresholds, goals, annotations, and
          region highlighting
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Example 1: Reference Lines - Goals and Thresholds */}
        <ExampleCard
          title="Reference Lines: Goals & Thresholds"
          description="Add horizontal or vertical reference lines to mark important values like goals, targets, or thresholds."
          code={{
            vanilla: `import { LineChart } from '@chartlite/core';

new LineChart('#chart', {
  data: revenueData,
  referenceLines: [
    {
      axis: 'y',
      value: 50000,
      label: 'Target',
      color: '#10b981',
      strokeDasharray: '4 4'
    }
  ]
}).render();`,
            react: `import { LineChart } from '@chartlite/react';

<LineChart
  data={revenueData}
  title="Monthly Revenue"
  referenceLines={[
    {
      axis: 'y',
      value: 50000,
      label: 'Target',
      color: '#10b981',
      strokeDasharray: '4 4'
    }
  ]}
/>`,
          }}
        >
          <LineChart
            data={revenueData}
            title="Monthly Revenue"
            referenceLines={[
              {
                axis: "y",
                value: 50000,
                label: "Target: $50K",
                color: "#10b981",
              },
            ]}
          />
        </ExampleCard>

        {/* Example 2: Annotations - Mark Events */}
        <ExampleCard
          title="Annotations: Mark Important Events"
          description="Add text annotations to highlight specific data points or events in your charts."
          code={{
            vanilla: `import { LineChart } from '@chartlite/core';

new LineChart('#chart', {
  data: stockData,
  annotations: [
    {
      x: 'Wed',
      y: 168,
      text: 'Earnings Report',
      color: '#3b82f6'
    }
  ]
}).render();`,
            react: `import { LineChart } from '@chartlite/react';

<LineChart
  data={stockData}
  title="Stock Price"
  annotations={[
    {
      x: 'Wed',
      y: 168,
      text: 'Earnings Report',
      color: '#3b82f6'
    }
  ]}
/>`,
          }}
        >
          <LineChart
            data={stockData}
            title="Stock Price This Week"
            annotations={[
              {
                x: "Wed",
                y: 168,
                text: "Earnings Report 📈",
                color: "#3b82f6",
              },
            ]}
          />
        </ExampleCard>

        {/* Example 3: Multiple Reference Lines */}
        <ExampleCard
          title="Multiple Reference Lines: Safety Zones"
          description="Use multiple reference lines to create safety zones, acceptable ranges, or multiple thresholds."
          code={{
            vanilla: `import { AreaChart } from '@chartlite/core';

new AreaChart('#chart', {
  data: temperatureData,
  referenceLines: [
    {
      axis: 'y',
      value: 30,
      label: 'Warning',
      color: '#f59e0b',
      strokeDasharray: '4 4'
    },
    {
      axis: 'y',
      value: 35,
      label: 'Danger',
      color: '#ef4444',
      strokeDasharray: '4 4'
    }
  ]
}).render();`,
            react: `import { AreaChart } from '@chartlite/react';

<AreaChart
  data={temperatureData}
  title="Temperature Monitor"
  referenceLines={[
    {
      axis: 'y',
      value: 30,
      label: 'Warning',
      color: '#f59e0b',
      strokeDasharray: '4 4'
    },
    {
      axis: 'y',
      value: 35,
      label: 'Danger',
      color: '#ef4444',
      strokeDasharray: '4 4'
    }
  ]}
/>`,
          }}
        >
          <AreaChart
            data={temperatureData}
            title="Temperature Monitor (°C)"
            referenceLines={[
              {
                axis: "y",
                value: 30,
                label: "⚠️ Warning: 30°C",
                color: "#f59e0b",
              },
              {
                axis: "y",
                value: 35,
                label: "🔥 Danger: 35°C",
                color: "#ef4444",
              },
            ]}
          />
        </ExampleCard>

        {/* Example 4: Region Highlighting */}
        <ExampleCard
          title="Region Highlighting: Time Periods"
          description="Highlight specific time periods or value ranges to draw attention to important segments."
          code={{
            vanilla: `import { BarChart } from '@chartlite/core';

new BarChart('#chart', {
  data: salesData,
  regions: [
    {
      axis: 'x',
      start: 'Week 3',
      end: 'Week 4',
      color: '#fef3c7',
      label: 'Promotion Period'
    }
  ]
}).render();`,
            react: `import { BarChart } from '@chartlite/react';

<BarChart
  data={salesData}
  title="Weekly Sales"
  regions={[
    {
      axis: 'x',
      start: 'Week 3',
      end: 'Week 4',
      color: '#fef3c7',
      label: 'Promotion Period'
    }
  ]}
/>`,
          }}
        >
          <BarChart
            data={salesData}
            title="Weekly Sales"
            regions={[
              {
                axis: "x",
                start: "Week 3",
                end: "Week 4",
                color: "#fef3c7",
                label: "Promotion Period",
              },
            ]}
          />
        </ExampleCard>

        {/* Example 5: Combining Everything */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Combined: Reference Lines + Annotations + Regions
          </h2>
          <p className="text-gray-600 mb-6">
            Combine reference lines, annotations, and regions for comprehensive
            chart context.
          </p>

          <LineChart
            data={revenueData}
            title="Q1 Revenue Analysis"
            referenceLines={[
              {
                axis: "y",
                value: 50000,
                label: "Target",
                color: "#10b981",
              },
              {
                axis: "x",
                value: "Mar",
                label: "Campaign Launch",
                color: "#8b5cf6",
              },
            ]}
            annotations={[
              {
                x: "Mar",
                y: 52000,
                text: "Hit Target! 🎉",
                color: "#10b981",
              },
            ]}
            regions={[
              {
                axis: "x",
                start: "Apr",
                end: "Jun",
                color: "#e0e7ff",
                label: "Q2 Preview",
              },
            ]}
          />

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Use Cases:</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>
                <strong>Reference Lines:</strong> Goals, thresholds, targets,
                average values
              </li>
              <li>
                <strong>Annotations:</strong> Product launches, events,
                milestones, outliers
              </li>
              <li>
                <strong>Regions:</strong> Promotional periods, downtime,
                seasons, phases
              </li>
            </ul>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-8 shadow-2xl text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Annotations Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-5xl mb-3">📏</div>
              <div className="text-xl font-semibold mb-2">Reference Lines</div>
              <div className="text-sm opacity-80">
                Horizontal or vertical lines to mark thresholds and targets
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-3">📍</div>
              <div className="text-xl font-semibold mb-2">Annotations</div>
              <div className="text-sm opacity-80">
                Text labels to highlight specific data points and events
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-3">🎨</div>
              <div className="text-xl font-semibold mb-2">Regions</div>
              <div className="text-sm opacity-80">
                Highlighted areas to emphasize time periods or ranges
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Common Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">📊 Business Metrics</h4>
                <ul className="text-sm opacity-90 space-y-1">
                  <li>• Revenue goals with target lines</li>
                  <li>• Sales targets and thresholds</li>
                  <li>• KPI benchmarks</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🔬 Scientific Data</h4>
                <ul className="text-sm opacity-90 space-y-1">
                  <li>• Safety thresholds (temp, pressure)</li>
                  <li>• Acceptable value ranges</li>
                  <li>• Experimental milestones</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">📈 Financial Charts</h4>
                <ul className="text-sm opacity-90 space-y-1">
                  <li>• Stock price events (earnings, splits)</li>
                  <li>• Support/resistance levels</li>
                  <li>• Market open/close times</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🎯 Project Tracking</h4>
                <ul className="text-sm opacity-90 space-y-1">
                  <li>• Sprint boundaries</li>
                  <li>• Milestone markers</li>
                  <li>• Critical path events</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FrameworkProvider>
  );
}
