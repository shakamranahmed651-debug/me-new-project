import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: {
    default: 'WARAN ZONE — Jewelry & Fashion Accessories',
    template: '%s · WARAN ZONE',
  },
  description:
    'WARAN ZONE is a Bangladesh-based atelier of hand-finished jewelry and fashion accessories — earrings, churi, jumka, gungur, necklaces, chocolate gifting and complete sets. Cash on delivery nationwide.',
  keywords: [
    'WARAN ZONE',
    'jewelry Bangladesh',
    'earrings',
    'churi',
    'jumka',
    'gungur',
    'necklace',
    'jewelry sets',
  ],
  openGraph: {
    title: 'WARAN ZONE — Jewelry & Fashion Accessories',
    description:
      'Hand-finished jewelry and accessories, delivered across Bangladesh with cash on delivery.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-brown focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-ivory"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
