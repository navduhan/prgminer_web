import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const fraunces = localFont({
  src: '../fonts/Fraunces-Latin.woff2',
  display: 'swap',
  variable: '--font-serif',
  weight: '400 700',
});

const jakarta = localFont({
  src: '../fonts/PlusJakartaSans-Latin.woff2',
  display: 'swap',
  variable: '--font-sans',
  weight: '400 800',
});

const jetbrains = localFont({
  src: '../fonts/JetBrainsMono-Latin.woff2',
  display: 'swap',
  variable: '--font-mono',
  weight: '400 700',
});

const gaId = process.env.NEXT_PUBLIC_GA_ID || '';

export const metadata: Metadata = {
  title: 'PRGminer · Plant Resistance Gene Prediction & Classification',
  description:
    'Two-phase deep learning identification and 8-family classification of plant disease resistance genes (R-genes). Published in Frontiers in Plant Science (2025).',
  keywords: [
    'PRGminer',
    'Plant Resistance Genes',
    'R-genes',
    'NLR',
    'CNL',
    'TNL',
    'RLK',
    'RLP',
    'LECRK',
    'LYK',
    'Plant Immunity',
    'KAABiL',
  ],
  authors: [
    { name: 'Naveen Duhan', url: 'https://github.com/navduhan' },
    { name: 'Rakesh Kaundal', url: 'https://kaabil.net' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-white antialiased">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="prgminer-google-tag" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
