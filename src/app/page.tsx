import Link from 'next/link';
import { ProductArt } from '@/components/ProductArt';
import { ProductCard } from '@/components/ProductCard';
import { CATEGORIES } from '@/lib/categories';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, formatPrice } from '@/lib/constants';
import { getFeaturedProducts, listProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';

const CATEGORY_ART: Record<string, string> = {
  earrings: 'drop',
  churi: 'bangle-set',
  jumka: 'tassel',
  gungur: 'bells',
  necklace: 'necklace',
  chocolate: 'chocolate-box',
  'jewelry-sets': 'bridal',
};

export default async function HomePage() {
  const [featured, all] = await Promise.all([getFeaturedProducts(8), listProducts()]);
  const newest = all.slice(0, 4);
  const fromPrice = all.length ? Math.min(...all.map((product) => product.price)) : 0;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-brown/10 bg-cream">
        <div className="container-luxe grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
          <div className="animate-fade-up">
            <p className="eyebrow">Hand-finished in small batches</p>
            <h1 className="mt-5 text-[2.6rem] leading-[1.06] tracking-tight text-ink sm:text-6xl lg:text-[4.2rem]">
              Quiet luxury for
              <span className="block italic text-gold">everyday radiance.</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-mocha sm:text-base">
              WARAN ZONE is a Bangladesh atelier of jewelry and fashion accessories — sculpted gold,
              freshwater pearls and hand-poured chocolate, made to be worn and gifted.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn-primary">
                Shop the collection
              </Link>
              <Link href="/shop?category=jewelry-sets" className="btn-outline">
                Jewelry sets
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-brown/10 pt-6">
              <div>
                <dt className="text-[9px] uppercase tracking-[0.18em] text-mocha/80">Pieces</dt>
                <dd className="mt-1 font-display text-xl text-brown">{all.length}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.18em] text-mocha/80">From</dt>
                <dd className="mt-1 font-display text-xl text-brown">{formatPrice(fromPrice)}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.18em] text-mocha/80">Delivery</dt>
                <dd className="mt-1 font-display text-xl text-brown">Nationwide</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-8 hidden h-[86%] w-[86%] border border-champagne/40 sm:block" />
            <div className="relative border border-brown/10 bg-ivory p-3 shadow-soft">
              <ProductArt
                art="bridal"
                name="WARAN ZONE signature jewelry set"
                className="aspect-[4/5] w-full"
                priority
              />
            </div>
            <div className="absolute -bottom-5 right-0 border border-brown/10 bg-ivory/95 px-5 py-3 text-right shadow-card backdrop-blur-sm sm:right-4">
              <p className="text-[9px] uppercase tracking-[0.2em] text-gold">Cash on delivery</p>
              <p className="mt-1 font-display text-base text-brown">Across all 8 divisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="container-luxe py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Collections</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Shop by category</h2>
          </div>
          <Link
            href="/shop"
            className="link-underline text-[10px] uppercase tracking-[0.2em] text-mocha hover:text-gold"
          >
            View all pieces
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className="group border border-brown/10 bg-white/50 p-3 transition-colors hover:border-champagne/60 hover:bg-white/80"
            >
              <ProductArt
                art={CATEGORY_ART[category.slug] ?? 'drop'}
                name={category.name}
                className="aspect-square w-full transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="px-1 pb-1 pt-4">
                <p className="font-display text-lg text-ink group-hover:text-gold">{category.name}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-mocha/80">{category.tagline}</p>
              </div>
            </Link>
          ))}

          <div className="col-span-2 flex flex-col justify-between border border-champagne/40 bg-brown p-6 text-ivory sm:col-span-1 lg:col-span-1">
            <div>
              <p className="text-[9px] uppercase tracking-[0.24em] text-champagne">Gift edit</p>
              <p className="mt-3 font-display text-2xl leading-snug">
                Wrapped, ribboned, ready to give
              </p>
            </div>
            <Link
              href="/shop?category=chocolate"
              className="mt-6 inline-flex text-[10px] uppercase tracking-[0.2em] text-champagne hover:text-ivory"
            >
              Chocolate gifting →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────────── */}
      <section className="border-y border-brown/10 bg-cream/60 py-16 sm:py-20">
        <div className="container-luxe">
          <div className="text-center">
            <p className="eyebrow">The edit</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Signature pieces</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-mocha">
              A tightly curated selection — the pieces our customers return to, season after season.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/shop" className="btn-outline">
              Browse all products
            </Link>
          </div>
        </div>
      </section>

      {/* ── Brand story ──────────────────────────────────────── */}
      <section className="container-luxe grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <p className="eyebrow">Our craft</p>
          <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
            Made slowly, by hand,
            <span className="block italic text-gold">in small batches.</span>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-mocha">
            Every earring, bangle and gungur is finished by hand in our Dhaka studio. We work in
            gold-plated brass, freshwater pearl and resin — materials chosen to age gracefully and
            stay comfortable through a full day.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-mocha">
            Our chocolate is poured in micro-batches, boxed by hand and dispatched the same week, so
            gifting always arrives fresh.
          </p>
          <ul className="mt-7 grid gap-3 text-sm text-mocha sm:grid-cols-2">
            {[
              'Nickel-free, skin-friendly finishes',
              'Hand-checked before dispatch',
              'Gift wrapping included',
              '7-day exchange on unworn pieces',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span aria-hidden="true" className="mt-1.5 text-champagne">
                  ✦
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 grid grid-cols-2 gap-4 lg:order-2">
          <ProductArt art="filigree" name="Hand-finished filigree detail" className="aspect-[3/4] w-full border border-brown/10" />
          <div className="mt-8">
            <ProductArt art="pearl-gungur" name="Pearl gungur detail" className="aspect-[3/4] w-full border border-brown/10" />
          </div>
        </div>
      </section>

      {/* ── New in ───────────────────────────────────────────── */}
      <section className="border-t border-brown/10 bg-cream/50 py-16 sm:py-20">
        <div className="container-luxe">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Just arrived</p>
              <h2 className="mt-3 text-3xl sm:text-4xl">New this season</h2>
            </div>
            <Link
              href="/shop"
              className="link-underline text-[10px] uppercase tracking-[0.2em] text-mocha hover:text-gold"
            >
              See everything
            </Link>
          </div>
          <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
            {newest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────── */}
      <section className="container-luxe py-14">
        <div className="grid gap-6 border border-brown/10 bg-white/50 px-6 py-8 sm:grid-cols-3 sm:px-10">
          {[
            {
              title: 'Cash on delivery',
              body: `Pay when it arrives. Flat ${formatPrice(DELIVERY_FEE)} delivery, free above ${formatPrice(
                FREE_DELIVERY_THRESHOLD,
              )}.`,
            },
            {
              title: 'Order tracking',
              body: 'Sign in to see live order status, from confirmed to delivered.',
            },
            {
              title: 'Real support',
              body: 'Message us on WhatsApp any day, 10am–8pm, for sizing or gift advice.',
            },
          ].map((item) => (
            <div key={item.title}>
              <p className="text-[9px] uppercase tracking-[0.22em] text-gold">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-mocha">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
