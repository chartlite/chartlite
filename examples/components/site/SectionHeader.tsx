import type { ReactNode } from 'react';
import Reveal from './Reveal';

interface SectionHeaderProps {
  /** Section number, printed in the margin like a chapter mark. */
  number: string;
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
}

/** Chapter-style heading shared by the homepage sections. */
export default function SectionHeader({ number, kicker, title, children }: SectionHeaderProps) {
  return (
    <Reveal className="mb-14 grid gap-6 border-t border-ink pt-6 md:grid-cols-[8rem_1fr]">
      <div className="flex items-baseline gap-3 md:block">
        <span className="font-serif text-5xl leading-none text-accent md:text-6xl">{number}</span>
        <p className="kicker md:mt-3">{kicker}</p>
      </div>
      <div className="max-w-3xl">
        <h2 className="font-serif text-4xl leading-[1.02] tracking-[-0.01em] text-ink sm:text-[3.4rem]">
          {title}
        </h2>
        {children && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{children}</p>}
      </div>
    </Reveal>
  );
}
