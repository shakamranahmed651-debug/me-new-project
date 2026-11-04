'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import { useCart } from '@/lib/cart';
import type { User } from '@/lib/types';

const NAV = [
  { href: '/shop', label: 'Shop All' },
  ...CATEGORIES.map((category) => ({ href: `/shop?category=${category.slug}`, label: category.name })),
];

export function SiteHeader({ user = null }: { user?: User | null }) {
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div className="overflow-hidden border-b border-brown/10 bg-brown py-2 text-ivory">
        <div className="marquee-track flex w-max gap-12 whitespace-nowrap text-[9px] uppercase tracking-luxe sm:text-[10px]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-12" aria-hidden={copy === 1}>
              <span>Cash on delivery across Bangladesh</span>
              <span className="text-champagne">✦</span>
              <span>Free delivery over ৳5,000</span>
              <span className="text-champagne">✦</span>
              <span>Hand-finished in small batches</span>
              <span className="text-champagne">✦</span>
              <span>Gift wrapping included</span>
              <span className="text-champagne">✦</span>
            </div>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-brown/10 bg-ivory/90 backdrop-blur-md">
        <div className="container-luxe flex h-16 items-center justify-between gap-4 sm:h-20">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-ml-2 flex h-10 w-10 items-center justify-center text-brown lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <span className="sr-only">Menu</span>
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
              <path d="M0 1h22M0 7h22M0 13h22" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>

          <Link href="/" className="group flex shrink-0 flex-col items-center lg:items-start">
            <span className="font-display text-xl leading-none tracking-[0.24em] text-brown sm:text-2xl">
              WARAN
            </span>
            <span className="mt-1 text-[8px] uppercase tracking-[0.5em] text-gold sm:text-[9px]">
              Zone
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
            {NAV.slice(0, 8).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-underline text-[10px] uppercase tracking-[0.18em] text-mocha transition-colors hover:text-brown"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href={user ? '/account' : '/login'}
              className="hidden text-[10px] uppercase tracking-[0.18em] text-mocha transition-colors hover:text-gold sm:block"
            >
              {user ? user.name.split(' ')[0] : 'Account'}
            </Link>
            <Link
              href="/cart"
              className="relative flex h-10 items-center gap-2 px-2 text-brown"
              aria-label={`Cart, ${ready ? count : 0} items`}
            >
              <svg width="19" height="20" viewBox="0 0 19 20" fill="none" aria-hidden="true">
                <path
                  d="M3 6h13l-1.2 12H4.2L3 6Z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
                <path d="M6.5 6V4.5a3 3 0 0 1 6 0V6" stroke="currentColor" strokeWidth="1.1" />
              </svg>
              <span className="min-w-4 text-[10px] font-medium tracking-[0.1em] text-gold">
                {ready ? count : 0}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-ivory px-6 py-6 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg tracking-[0.24em] text-brown">WARAN ZONE</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center text-brown"
                aria-label="Close menu"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </button>
            </div>
            <nav className="mt-8 flex flex-col" aria-label="Mobile">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-brown/10 py-3.5 text-sm uppercase tracking-[0.18em] text-brown"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-3">
              <Link href={user ? '/account' : '/login'} className="btn-outline w-full">
                {user ? 'My Account' : 'Login / Register'}
              </Link>
              <Link href="/cart" className="btn-primary w-full">
                View Cart ({ready ? count : 0})
              </Link>
            </div>
            <p className="mt-auto pt-8 text-[10px] uppercase tracking-[0.2em] text-mocha">
              Cash on delivery · Bangladesh
            </p>
          </div>
        </div>
      )}
    </>
  );
}
