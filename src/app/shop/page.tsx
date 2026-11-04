import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { CATEGORIES, categoryBySlug } from '@/lib/categories';
import { formatPrice } from '@/lib/constants';
import { listProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop all — jewelry, churi, jumka & gifting',
  description:
    'Browse every WARAN ZONE piece: earrings, churi, jumka, gungur, necklaces, chocolate gifting and complete jewelry sets.',
};

type SearchParams = Promise<{ category?: string; q?: string; sort?: string }>;

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'new', label: 'Newest' },
  { value: 'low', label: 'Price: low to high' },
  { value: 'high', label: 'Price: high to low' },
];

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const activeSlug = params.category && categoryBySlug(params.category) ? params.category : undefined;
  const activeCategory = activeSlug ? categoryBySlug(activeSlug) : undefined;
  const query = (params.q ?? '').trim();
  const sort = SORTS.some((option) => option.value === params.sort) ? params.sort! : 'featured';

  let products = await listProducts({ category: activeCategory?.name, search: query || undefined });

  products = [...products].sort((a, b) => {
    if (sort === 'low') return a.price - b.price;
    if (sort === 'high') return b.price - a.price;
    if (sort === 'new') return b.createdAt.localeCompare(a.createdAt);
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { category: activeSlug, q: query || undefined, sort, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value && !(key === 'sort' && value === 'featured')) next.set(key, value);
    }
    const qs = next.toString();
    return qs ? `/shop?${qs}` : '/shop';
  };

  return (
    <>
      <section className="border-b border-brown/10 bg-cream/70">
        <div className="container-luxe py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-[10px] uppercase tracking-[0.18em] text-mocha/70">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href="/shop" className="hover:text-gold">
              Shop
            </Link>
            {activeCategory && (
              <>
                <span aria-hidden="true"> / </span>
                <span className="text-brown">{activeCategory.name}</span>
              </>
            )}
          </nav>
          <h1 className="mt-4 text-4xl sm:text-5xl">
            {activeCategory ? activeCategory.name : 'The full collection'}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mocha">
            {activeCategory
              ? activeCategory.tagline
              : 'Every hand-finished piece in the atelier — jewelry, accessories and small-batch chocolate.'}
          </p>
        </div>
      </section>

      <section className="container-luxe py-8 sm:py-12">
        <div className="flex flex-col gap-5 border-b border-brown/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <Link
              href={buildHref({ category: undefined })}
              className={`whitespace-nowrap border px-4 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                activeSlug
                  ? 'border-brown/15 text-mocha hover:border-champagne hover:text-gold'
                  : 'border-brown bg-brown text-ivory'
              }`}
            >
              All
            </Link>
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={buildHref({ category: category.slug })}
                className={`whitespace-nowrap border px-4 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                  activeSlug === category.slug
                    ? 'border-brown bg-brown text-ivory'
                    : 'border-brown/15 text-mocha hover:border-champagne hover:text-gold'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <form action="/shop" className="flex items-center gap-2">
              {activeSlug && <input type="hidden" name="category" value={activeSlug} />}
              <label htmlFor="shop-search" className="sr-only">
                Search products
              </label>
              <input
                id="shop-search"
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search pieces…"
                className="field w-full py-2 text-xs sm:w-56"
              />
              <button type="submit" className="btn-outline px-4 py-2">
                Search
              </button>
            </form>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-mocha/70">Sort</span>
              <div className="flex flex-wrap gap-1">
                {SORTS.map((option) => (
                  <Link
                    key={option.value}
                    href={buildHref({ sort: option.value })}
                    className={`border px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                      sort === option.value
                        ? 'border-champagne bg-champagne/20 text-brown'
                        : 'border-transparent text-mocha hover:text-gold'
                    }`}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-mocha/80">
          <p>
            {products.length} {products.length === 1 ? 'piece' : 'pieces'}
            {query ? ` matching “${query}”` : ''}
          </p>
          {(query || activeSlug || sort !== 'featured') && (
            <Link href="/shop" className="text-brown underline decoration-champagne underline-offset-4 hover:text-gold">
              Clear filters
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="mt-10 border border-dashed border-brown/20 bg-white/40 px-6 py-16 text-center">
            <p className="font-display text-2xl text-ink">Nothing here yet</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mocha">
              We could not find a piece for that search. Try another category, or browse the full
              collection.
            </p>
            <Link href="/shop" className="btn-primary mt-7">
              Browse all pieces
            </Link>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="container-luxe pb-16">
        <div className="grid gap-6 border border-brown/10 bg-cream/60 px-6 py-8 sm:grid-cols-3 sm:px-10">
          <div>
            <p className="text-[9px] uppercase tracking-[0.22em] text-gold">Free delivery</p>
            <p className="mt-2 text-sm text-mocha">
              On every order above {formatPrice(5000)}, nationwide.
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.22em] text-gold">Cash on delivery</p>
            <p className="mt-2 text-sm text-mocha">Check the piece, then pay the courier.</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.22em] text-gold">Gift ready</p>
            <p className="mt-2 text-sm text-mocha">Ivory box, gold ribbon, handwritten note.</p>
          </div>
        </div>
      </section>
    </>
  );
}
