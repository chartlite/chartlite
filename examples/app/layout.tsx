import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/site/SmoothScroll';
import Aurora from '@/components/site/Aurora';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Chartlite — beautiful charts, honestly tiny',
  description:
    'A lightweight, zero-dependency SVG charting library. ~13KB gzipped, 8 chart types, WCAG AA, SSR + agent-native, with React, Vue, Svelte, and web-component wrappers.',
  metadataBase: new URL('https://chartlite.dev'),
  openGraph: {
    title: 'Chartlite — beautiful charts, honestly tiny',
    description:
      'Zero-dependency SVG charts. ~13KB gzipped, 8 types, SSR + agent-native, React/Vue/Svelte/web-component.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable}`}>
      <head>
        {/* Apply the persisted chart theme before hydration to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('cl-chart-theme');document.documentElement.dataset.chartTheme=t==='light'?'light':'dark';}catch(e){}",
          }}
        />
      </head>
      <body className="grain antialiased">
        <Aurora />
        <SmoothScroll>
          <SiteNav />
          <main>{children}</main>
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
