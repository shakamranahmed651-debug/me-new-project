import type { Metadata } from 'next';
import Link from 'next/link';
import { adjustStockAction, deleteProductAction } from '@/app/actions/admin';
import { ProductArt } from '@/components/ProductArt';
import { formatPrice } from '@/lib/constants';
import { listProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — products & inventory',
};

type SearchParams = Promise<{ saved?: string; deleted?: string; stock?: string; error?: string }>;

const NOTICES: Record<string, string> = {
  saved: 'Product saved.',
  deleted: 'Product deleted.',
  stock: 'Stock updated.',
};

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const products = await listProducts();
  const notice = Object.keys(NOTICES).find((key) => params[key as keyof typeof params] === '1');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Products & inventory</h2>
          <p className="mt-1 text-[11px] text-mocha">
            {products.length} {products.length === 1 ? 'piece' : 'pieces'} in the catalog
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          Add product
        </Link>
      </div>

      {notice && (
        <p role="status" className="border border-champagne bg-champagne/15 px-3 py-2 text-[12px] text-brown">
          {NOTICES[notice]}
        </p>
      )}
      {params.error && (
        <p role="alert" className="border border-red-300/60 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          That action could not be completed. Please try again.
        </p>
      )}

      {products.length === 0 ? (
        <div className="border border-dashed border-brown/20 bg-white/40 px-6 py-16 text-center">
          <p className="font-display text-2xl text-ink">The catalog is empty</p>
          <p className="mt-3 text-sm text-mocha">Add your first piece to open the store.</p>
          <Link href="/admin/products/new" className="btn-primary mt-6">
            Add product
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-col gap-4 border border-brown/10 bg-white/60 p-4 sm:flex-row sm:items-center"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden border border-brown/10">
                <ProductArt art={product.image} name={product.name} className="h-full w-full" />
              </div>

              <div className="min-w-0 flex-1">
                <Link href={`/product/${product.slug}`} className="text-[13px] text-ink hover:text-gold">
                  {product.name}
                </Link>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-mocha/75">
                  {product.category}
                  {product.featured ? ' · featured' : ''}
                </p>
                <p className="mt-1 text-[11px] text-mocha">
                  {formatPrice(product.price)}
                  {product.compareAtPrice ? ` · was ${formatPrice(product.compareAtPrice)}` : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`border px-2 py-1 text-[9px] uppercase tracking-[0.14em] ${
                    product.stock === 0
                      ? 'border-red-300/70 bg-red-50 text-red-700'
                      : product.stock <= 5
                        ? 'border-champagne bg-champagne/20 text-brown'
                        : 'border-brown/15 text-mocha'
                  }`}
                >
                  {product.stock === 0 ? 'Sold out' : `${product.stock} in stock`}
                </span>

                <form action={adjustStockAction} className="flex items-center gap-1">
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="delta" value="-1" />
                  <button
                    type="submit"
                    disabled={product.stock <= 0}
                    className="h-8 w-8 border border-brown/20 text-sm text-brown hover:border-champagne hover:text-gold disabled:opacity-30"
                    aria-label={`Decrease stock of ${product.name}`}
                  >
                    −
                  </button>
                </form>
                <form action={adjustStockAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="delta" value="1" />
                  <button
                    type="submit"
                    className="h-8 w-8 border border-brown/20 text-sm text-brown hover:border-champagne hover:text-gold"
                    aria-label={`Increase stock of ${product.name}`}
                  >
                    +
                  </button>
                </form>
                <form action={adjustStockAction} className="flex items-center gap-1">
                  <input type="hidden" name="id" value={product.id} />
                  <label htmlFor={`restock-${product.id}`} className="sr-only">
                    Restock quantity for {product.name}
                  </label>
                  <input
                    id={`restock-${product.id}`}
                    name="delta"
                    type="number"
                    min={1}
                    max={1000}
                    defaultValue={10}
                    className="field h-8 w-16 px-2 py-1 text-[11px]"
                  />
                  <button type="submit" className="btn-outline h-8 px-3 py-0 text-[9px]">
                    Restock
                  </button>
                </form>

                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="h-8 border border-brown/20 px-3 text-[9px] uppercase leading-8 tracking-[0.14em] text-brown hover:border-champagne hover:text-gold"
                >
                  Edit
                </Link>
                <form action={deleteProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <button
                    type="submit"
                    className="h-8 border border-red-300/70 px-3 text-[9px] uppercase tracking-[0.14em] text-red-700 hover:border-red-400 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
