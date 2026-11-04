import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { CURRENCY, FREE_DELIVERY_THRESHOLD } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-brown/10 bg-cream">
      <div className="container-luxe grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl tracking-[0.24em] text-brown">WARAN</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.5em] text-gold">Zone</p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-mocha">
            A quiet atelier of jewelry and fashion accessories, made in small batches for everyday
            elegance and celebration.
          </p>
        </div>

        <div>
          <p className="eyebrow">Collections</p>
          <ul className="mt-5 space-y-2.5">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="text-sm text-mocha transition-colors hover:text-gold"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Care</p>
          <ul className="mt-5 space-y-2.5 text-sm text-mocha">
            <li>
              <Link href="/account" className="transition-colors hover:text-gold">
                My account
              </Link>
            </li>
            <li>
              <Link href="/orders" className="transition-colors hover:text-gold">
                Order history
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition-colors hover:text-gold">
                Shopping cart
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition-colors hover:text-gold">
                Login / Register
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Orders &amp; Delivery</p>
          <ul className="mt-5 space-y-3 text-sm text-mocha">
            <li>Cash on delivery nationwide</li>
            <li>
              Delivery fee {CURRENCY}80 · free over {CURRENCY}
              {FREE_DELIVERY_THRESHOLD.toLocaleString('en-US')}
            </li>
            <li>Dispatch within 1–2 working days</li>
            <li>Dhaka 1–2 days · outside Dhaka 2–4 days</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brown/10">
        <div className="container-luxe flex flex-col items-center justify-between gap-3 py-6 text-[10px] uppercase tracking-[0.18em] text-mocha sm:flex-row">
          <p>© {new Date().getFullYear()} WARAN ZONE. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span aria-hidden="true">✦</span> Cash on Delivery · Made for Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
