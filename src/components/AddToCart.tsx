'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import type { Product } from '@/lib/types';

export function AddToCart({ product }: { product: Product }) {
  const { add, lastAdded } = useCart();
  const [quantity, setQuantity] = useState(1);
  const soldOut = product.stock <= 0;
  const max = Math.min(99, Math.max(1, product.stock));
  const added = lastAdded === product.name;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex items-center border border-brown/20">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={soldOut || quantity <= 1}
            className="flex h-12 w-11 items-center justify-center text-lg text-brown transition-colors hover:text-gold disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={max}
            value={quantity}
            onChange={(event) => {
              const next = Math.floor(Number(event.target.value));
              setQuantity(Number.isFinite(next) ? Math.min(max, Math.max(1, next)) : 1);
            }}
            className="h-12 w-12 border-0 bg-transparent text-center text-sm text-ink focus:outline-none"
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(max, value + 1))}
            disabled={soldOut || quantity >= max}
            className="flex h-12 w-11 items-center justify-center text-lg text-brown transition-colors hover:text-gold disabled:opacity-30"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={soldOut}
          onClick={() =>
            add(
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock,
              },
              quantity,
            )
          }
          className="btn-primary flex-1 sm:min-w-[240px]"
        >
          {soldOut ? 'Sold out' : 'Add to cart'}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-[11px]">
        <p aria-live="polite" className="text-gold">
          {added ? 'Added to your cart.' : ''}
        </p>
        {soldOut ? (
          <span className="text-mocha/70">Currently unavailable</span>
        ) : (
          <span className="text-mocha/70">{product.stock} in stock</span>
        )}
      </div>

      <Link
        href="/cart"
        className="mt-6 inline-flex text-[10px] uppercase tracking-[0.2em] text-brown underline decoration-champagne decoration-2 underline-offset-8 transition-colors hover:text-gold"
      >
        View shopping cart
      </Link>
    </div>
  );
}
