import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white/10 backdrop-blur-md rounded-xl px-8 py-4 mb-8 flex justify-between items-center">
      <Link
        href="/"
        className="text-white font-semibold text-lg hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
      >
        📊 Chartlite
      </Link>

      <div className="flex gap-2 flex-wrap">
        <Link
          href="/basic-examples"
          className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          Basic
        </Link>
        <Link
          href="/multi-series"
          className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          Multi-Series
        </Link>
        <Link
          href="/data-formats"
          className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          Data Formats
        </Link>
        <Link
          href="/scatter-plots"
          className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          Scatter
        </Link>
        <Link
          href="/performance"
          className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          ⚡ Performance
        </Link>
        <Link
          href="/annotations"
          className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          Annotations
        </Link>
      </div>
    </nav>
  );
}
