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

      <div className="flex gap-4">
        <Link
          href="/basic-examples"
          className="text-white hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          Basic Examples
        </Link>
        <Link
          href="/multi-series"
          className="text-white hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          Multi-Series
        </Link>
        <Link
          href="/data-formats"
          className="text-white hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          Data Formats
        </Link>
      </div>
    </nav>
  );
}
