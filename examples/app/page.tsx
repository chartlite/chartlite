import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <header className="text-center mb-16">
        <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
          📊 Chartlite
        </h1>
        <p className="text-2xl text-white/90 mb-4">
          Lightweight, Beautiful Charts for Modern Web Apps
        </p>
        <p className="text-lg text-white/80 max-w-3xl mx-auto mb-8">
          A high-performance charting library with zero dependencies.
          Beautiful charts in ~20KB. Perfect for landing pages, blogs, and documentation.
        </p>

        {/* Badges */}
        <div className="flex justify-center gap-6 flex-wrap mb-12">
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
            <span className="text-white font-semibold">📦 20KB Bundle</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
            <span className="text-white font-semibold">⚡ Zero Dependencies</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
            <span className="text-white font-semibold">🎨 3 Themes</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
            <span className="text-white font-semibold">📊 Multi-Series</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
            <span className="text-white font-semibold">⚛️ React Ready</span>
          </div>
        </div>
      </header>

      {/* Example Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link
          href="/basic-examples"
          className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
        >
          <div className="text-5xl mb-4">📈</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            Basic Examples
          </h2>
          <p className="text-gray-600">
            Explore LineChart, BarChart, and AreaChart with different themes and configurations.
          </p>
          <span className="inline-block mt-4 px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
            START HERE
          </span>
        </Link>

        <Link
          href="/multi-series"
          className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
        >
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            Multi-Series Charts
          </h2>
          <p className="text-gray-600">
            Multiple datasets on one chart with legends, grouped bars, and stacked areas.
          </p>
          <span className="inline-block mt-4 px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
            NEW
          </span>
        </Link>

        <Link
          href="/data-formats"
          className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
        >
          <div className="text-5xl mb-4">🔄</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            Flexible Data Formats
          </h2>
          <p className="text-gray-600">
            See all 4 supported data formats: DataPoint[], number[], column-oriented, and series-first.
          </p>
        </Link>
      </div>

      {/* Features Section */}
      <div className="mt-16 bg-white rounded-2xl p-12 shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Chartlite?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">
              10-15x smaller than alternatives. Fast page loads guaranteed.
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Zero Dependencies</h3>
            <p className="text-gray-600 text-sm">
              Pure TypeScript. No D3, no Canvas wrappers, no bloat.
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">💪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">TypeScript First</h3>
            <p className="text-gray-600 text-sm">
              Full type safety with intelligent autocomplete.
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Beautiful Defaults</h3>
            <p className="text-gray-600 text-sm">
              Professional themes inspired by Tailwind and Material Design.
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Series Support</h3>
            <p className="text-gray-600 text-sm">
              Multiple datasets with auto-colors and legends.
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">♿</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessible</h3>
            <p className="text-gray-600 text-sm">
              WCAG 2.1 AA compliant with keyboard navigation.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-white/80">
        <p className="mb-4">&copy; 2025 Chartlite. Open source under MIT License.</p>
        <div className="flex justify-center gap-8">
          <a
            href="https://github.com/chartlite/chartlite"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/chartlite/chartlite/blob/main/docs/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Changelog
          </a>
          <a
            href="https://github.com/chartlite/chartlite/blob/main/docs/ROADMAP.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Roadmap
          </a>
          <a
            href="https://www.npmjs.com/package/@chartlite/core"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            npm
          </a>
        </div>
      </footer>
    </div>
  );
}
