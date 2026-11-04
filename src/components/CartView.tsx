'use client';

import Link from 'next/link';
import { ProductArt } from '@/components/ProductArt';
import { useCart } from '@/lib/cart';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, deliveryFeeFor, formatPrice } from '@/lib/constants';

export function CartView() {
  const { items, ready, subtotal, setQuantity, remove } = useCart();

  if (!ready) {
    return (
      <div className="container-luxe py-20 text-center text-sm text-mocha">Loading your cart…</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-luxe py-16">
        <div className="mx-auto max-w-lg border border-brown/10 bg-white/50 px-6 py-16 text-center">
          <p className="eyebrow">Your cart</p>
          <h1 className="mt-4 text-3xl">Nothing selected yet</h1>
          <p className="mt-3 text-sm leading-relaxed text-mocha">
            Pieces you add will appear here. Start with the newest arrivals from the atelier.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/shop" className="btn-primary">
              Browse the collection
            </Link>
            <Link href="/shop?category=jewelry-sets" className="btn-outline">
              Shop sets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const deliveryFee = deliveryFeeFor(subtotal);
  const total = subtotal + deliveryFee;
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <div className="container-luxe py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Your selection</p>
          <h1 className="mt-3 text-3xl sm:text-4xl">Shopping cart</h1>
        </div>
        <Link
          href="/shop"
          className="text-[10px] uppercase tracking-[0.18em] text-mocha underline decoration-champagne underline-offset-4 hover:text-gold"
        >
          Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_0.9fr] lg:gap-12">
        <ul className="divide-y divide-brown/10 border-y border-brown/10">
          {items.map((line) => {
            const max = Math.max(1, line.stock);
            return (
              <li key={line.productId} className="flex gap-4 py-5 sm:gap-6">
                <Link
                  href={`/product/${line.slug}`}
                  className="block w-24 shrink-0 border border-brown/10 bg-beige/30 sm:w-28"
                >
                  <ProductArt art={line.image || 'drop'} name={line.name} className="aspect-[4/5] w-full" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${line.slug}`}
                        className="font-display text-lg leading-snug text-ink hover:text-gold"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-1 text-[11px] text-mocha/80">{formatPrice(line.price)} each</p>
                      {line.stock <= 0 && (
                        <p className="mt-1 text-[11px] text-gold">Currently out of stock</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.productId)}
                      className="text-[10px] uppercase tracking-[0.16em] text-mocha/70 hover:text-gold"
                      aria-label={`Remove ${line.name} from cart`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center border border-brown/20">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-brown hover:text-gold"
                        aria-label={`Decrease quantity of ${line.name}`}
                      >
                        −
                      </button>
                      <span
                        className="w-9 text-center text-sm text-ink"
                        aria-label={`Quantity of ${line.name}`}
                      >
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                        disabled={line.quantity >= max}
                        className="flex h-9 w-9 items-center justify-center text-brown hover:text-gold disabled:opacity-30"
                        aria-label={`Increase quantity of ${line.name}`}
                      >
                        +
                      </button>
                    </div>
                    <p className="font-display text-base text-brown">
                      {formatPrice(line.price * line.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit border border-brown/10 bg-cream/60 p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-xl text-ink">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-mocha">
              <dt>Subtotal</dt>
              <dd className="text-brown">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-mocha">
              <dt>Delivery</dt>
              <dd className="text-brown">
                {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-brown/10 pt-3 text-base">
              <dt className="text-brown">Total</dt>
              <dd className="font-display text-lg text-brown">{formatPrice(total)}</dd>
            </div>
          </dl>

          {remainingForFree > 0 ? (
            <p className="mt-4 bg-champagne/15 px-3 py-2 text-[11px] leading-relaxed text-brown">
              Add {formatPrice(remainingForFree)} more for free delivery (orders over{' '}
              {formatPrice(FREE_DELIVERY_THRESHOLD)}).
            </p>
          ) : (
            <p className="mt-4 bg-champagne/15 px-3 py-2 text-[11px] leading-relaxed text-brown">
              Free delivery applied. Flat fee is {formatPrice(DELIVERY_FEE)} below the threshold.
            </p>
          )}

          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.16em] text-mocha/70">
            Cash on delivery nationwide
          </p>
        </aside>
      </div>
    </div>
  );
}
