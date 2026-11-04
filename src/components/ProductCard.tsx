import Link from 'next/link';
import { ProductArt } from '@/components/ProductArt';
import { formatPrice } from '@/lib/constants';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  const discounted =
    product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice : null;

  return (
    <article className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden border border-brown/10 bg-beige/40">
          <ProductArt
            art={product.image || 'drop'}
            name={product.name}
            className="aspect-[4/5] w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute left-0 top-0 flex flex-col">
            {discounted && (
              <span className="bg-brown px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-ivory">
                Sale
              </span>
            )}
            {soldOut && (
              <span className="bg-ivory/95 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-mocha">
                Sold out
              </span>
            )}
            {!soldOut && product.stock <= 5 && !discounted && (
              <span className="bg-champagne/90 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-ink">
                Low stock
              </span>
            )}
          </div>
          <span className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 whitespace-nowrap border border-brown/15 bg-ivory/95 px-5 py-2.5 text-[9px] uppercase tracking-[0.2em] text-brown transition-all duration-300 group-hover:flex">
            View details
          </span>
        </div>

        <div className="pt-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-gold">{product.category}</p>
          <h3 className="mt-1.5 font-display text-[17px] leading-snug text-ink transition-colors group-hover:text-gold sm:text-lg">
            {product.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-mocha/90">
            {product.description}
          </p>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-display text-base text-brown">{formatPrice(product.price)}</span>
            {discounted && (
              <span className="text-[11px] text-mocha/60 line-through">
                {formatPrice(discounted)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
