import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/site/SmoothScroll';
import Backdrop from '@/components/site/Backdrop';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';

const sans = Geist({ subsets: ['latin'], variable: '--nf-sans' });
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--nf-serif',
});
const mono = Geist_Mono({ subsets: ['latin'], variable: '--nf-mono' });

export const metadata: Metadata = {
  title: 'Chartlite — beautiful charts, honestly tiny',
  description:
    'A lightweight, zero-dependency SVG charting library. ~15KB gzipped, 8 chart types, WCAG AA, SSR + agent-native, with React, Vue, Svelte, and web-component wrappers.',
  metadataBase: new URL('https://chartlite.dev'),
  openGraph: {
    title: 'Chartlite — beautiful charts, honestly tiny',
    description:
      'Zero-dependency SVG charts. ~15KB gzipped, 8 types, SSR + agent-native, React/Vue/Svelte/web-component.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
      // The inline script below sets `data-theme` before hydration.
      suppressHydrationWarning
    >
      <head>
        {/* Apply the persisted theme before hydration to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('cl-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light';}catch(e){}",
          }}
        />
      </head>
      <body className="grain antialiased">
        <Backdrop />
        <SmoothScroll>
          <SiteNav />
          <main>{children}</main>
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
