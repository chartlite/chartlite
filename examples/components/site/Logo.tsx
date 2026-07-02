/** Minimal Chartlite mark — a rising line over bars, in the accent gradient. */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="cl-logo-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="3" y="13" width="3.4" height="8" rx="1" fill="url(#cl-logo-grad)" opacity="0.55" />
      <rect x="10.3" y="9" width="3.4" height="12" rx="1" fill="url(#cl-logo-grad)" opacity="0.8" />
      <rect x="17.6" y="5" width="3.4" height="16" rx="1" fill="url(#cl-logo-grad)" />
      <path d="M4.7 12L12 7l7.3-4.5" stroke="url(#cl-logo-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19.3" cy="2.6" r="1.7" fill="#22d3ee" />
    </svg>
  );
}
