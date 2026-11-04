import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCart } from '@/components/AddToCart';
import { ProductArt } from '@/components/ProductArt';
import { ProductCard } from '@/components/ProductCard';
import { categorySlugOf } from '@/lib/categories';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, formatPrice } from '@/lib/constants';
import { getProductBySlug, listProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Piece not found' };
  return {
    title: `${product.name} — ${product.category}`,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categorySlug = categorySlugOf(product.category);
  const related = (await listProducts({ category: product.category }))
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  const soldOut = product.stock <= 0;
  const discounted =
    product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice : null;
  const savings = discounted ? discounted - product.price : 0;

  return (
    <>
      <div className="container-luxe pt-6">
        <nav aria-label="Breadcrumb" className="text-[10px] uppercase tracking-[0.18em] text-mocha/70">
          <Link href="/" className="hover:text-gold">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/shop?category=${categorySlug}`} className="hover:text-gold">
            {product.category}
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-brown">{product.name}</span>
        </nav>
      </div>

      <section className="container-luxe grid gap-9 py-8 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <div className="relative border border-brown/10 bg-beige/40">
            <ProductArt
              art={product.image || 'drop'}
              name={product.name}
              className="aspect-[4/5] w-full"
              priority
            />
            {discounted && (
              <span className="absolute left-0 top-0 bg-brown px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-ivory">
                Save {formatPrice(savings)}
              </span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {['detail', 'styled', 'pairing'].map((variant) => (
              <div key={variant} className="border border-brown/10 bg-beige/30">
                <ProductArt
                  art={product.image || 'drop'}
                  name={`${product.name} — ${variant} view`}
                  className="aspect-square w-full opacity-90"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:pt-4">
          <p className="text-[9px] uppercase tracking-[0.24em] text-gold">{product.category}</p>
          <h1 className="mt-3 text-3xl leading-tight sm:text-[2.6rem]">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-2xl text-brown">{formatPrice(product.price)}</span>
            {discounted && (
              <>
                <span className="text-sm text-mocha/60 line-through">{formatPrice(discounted)}</span>
                <span className="bg-champagne/25 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-brown">
                  On sale
                </span>
              </>
            )}
          </div>

          <p className="mt-5 border-t border-brown/10 pt-5 text-sm leading-relaxed text-mocha">
            {product.description}
          </p>

          <dl className="mt-6 grid gap-3 text-[12px] sm:grid-cols-2">
            <div>
              <dt className="text-[9px] uppercase tracking-[0.18em] text-mocha/70">Material</dt>
              <dd className="mt-1 text-brown">{product.material}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.18em] text-mocha/70">Availability</dt>
              <dd className={`mt-1 ${soldOut ? 'text-mocha' : product.stock <= 5 ? 'text-gold' : 'text-brown'}`}>
                {soldOut
                  ? 'Sold out — restocking soon'
                  : product.stock <= 5
                    ? `Only ${product.stock} left in stock`
                    : 'In stock, ready to ship'}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.18em] text-mocha/70">Delivery</dt>
              <dd className="mt-1 text-brown">
                {formatPrice(DELIVERY_FEE)} flat · free over {formatPrice(FREE_DELIVERY_THRESHOLD)}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.18em] text-mocha/70">Payment</dt>
              <dd className="mt-1 text-brown">Cash on delivery</dd>
            </div>
          </dl>

          <div className="mt-7 border-t border-brown/10 pt-2">
            <AddToCart product={product} />
          </div>

          <div className="mt-8 border border-brown/10 bg-cream/60 p-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-gold">Atelier notes</p>
            <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-mocha">
              <li>Hand-finished in small batches; slight variation is part of the character.</li>
              <li>Arrives in an ivory box with gold ribbon — gift ready.</li>
              <li>Store away from perfume and water to keep the finish luminous.</li>
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-brown/10 bg-cream/50 py-14">
          <div className="container-luxe">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Pairs beautifully</p>
                <h2 className="mt-3 text-3xl">More in {product.category}</h2>
              </div>
              <Link
                href={`/shop?category=${categorySlug}`}
                className="link-underline text-[10px] uppercase tracking-[0.2em] text-mocha hover:text-gold"
              >
                View category
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
