/** Chartlite mark — three ink bars and a vermilion trend line, in theme tokens. */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="3" y="13" width="3.4" height="8" rx="0.6" className="fill-ink" opacity="0.35" />
      <rect x="10.3" y="9" width="3.4" height="12" rx="0.6" className="fill-ink" opacity="0.6" />
      <rect x="17.6" y="5" width="3.4" height="16" rx="0.6" className="fill-ink" />
      <path d="M4.7 10.5L12 6l7.3-3.5" className="stroke-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19.3" cy="2.6" r="1.8" className="fill-accent" />
    </svg>
  );
}
