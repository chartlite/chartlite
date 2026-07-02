'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Initial downward offset in px. */
  y?: number;
  /** Animate direct children in sequence instead of the container as a whole. */
  stagger?: boolean;
}

/**
 * Fade-and-rise a block (or its children) as it scrolls into view, driven by
 * GSAP ScrollTrigger (synced to Lenis in {@link SmoothScroll}). No-ops under
 * prefers-reduced-motion.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(stagger ? ref.current!.children : ref.current, { opacity: 1, y: 0 });
        return;
      }
      const targets = stagger ? ref.current!.children : ref.current;
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          stagger: stagger ? 0.09 : 0,
          scrollTrigger: { trigger: ref.current, start: 'top 85%' },
        }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
