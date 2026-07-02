/**
 * Fixed, slowly-drifting aurora mesh behind all content. Pure CSS (no JS), sits
 * at the very back on the near-black canvas to give the "cinematic" depth.
 */
export default function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base vignette */}
      <div className="absolute inset-0 bg-ink-950" />
      {/* drifting colour fields */}
      <div className="aurora-blob aurora-1" />
      <div className="aurora-blob aurora-2" />
      <div className="aurora-blob aurora-3" />
      {/* faint grid */}
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" />
      {/* top fade so nav reads cleanly */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950 to-transparent" />

      <style>{`
        .aurora-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          opacity: 0.5;
          mix-blend-mode: screen;
        }
        .aurora-1 {
          width: 46vw; height: 46vw;
          left: -8vw; top: -10vw;
          background: radial-gradient(circle at 30% 30%, #22d3ee, transparent 60%);
          animation: drift1 22s ease-in-out infinite alternate;
        }
        .aurora-2 {
          width: 52vw; height: 52vw;
          right: -12vw; top: 6vw;
          background: radial-gradient(circle at 60% 40%, #a855f7, transparent 62%);
          animation: drift2 26s ease-in-out infinite alternate;
        }
        .aurora-3 {
          width: 40vw; height: 40vw;
          left: 30vw; top: 40vw;
          background: radial-gradient(circle at 50% 50%, #6366f1, transparent 60%);
          animation: drift3 30s ease-in-out infinite alternate;
        }
        @keyframes drift1 { to { transform: translate(8vw, 6vw) scale(1.15); } }
        @keyframes drift2 { to { transform: translate(-6vw, 8vw) scale(1.1); } }
        @keyframes drift3 { to { transform: translate(4vw, -8vw) scale(1.2); } }
        @media (prefers-reduced-motion: reduce) {
          .aurora-blob { animation: none; }
        }
      `}</style>
    </div>
  );
}
