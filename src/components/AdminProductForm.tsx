'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { saveProductAction, type AdminState } from '@/app/actions/admin';
import { CATEGORIES } from '@/lib/categories';
import { formatPrice } from '@/lib/constants';
import type { Product } from '@/lib/types';

const initial: AdminState = {};

const ART_KEYS = [
  'drop',
  'hoop',
  'tassel',
  'cascade',
  'bells',
  'bangle',
  'necklace',
  'box',
  'set',
  'slab',
];

export function AdminProductForm({ product }: { product?: Product }) {
  const [state, formAction, pending] = useActionState(saveProductAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label htmlFor="name" className="label">
          Product name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={product?.name ?? ''}
          className="field"
          placeholder="Ivory Pearl Drop Earrings"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="label">
            Category
          </label>
          <select id="category" name="category" defaultValue={product?.category ?? 'Earrings'} className="field">
            {CATEGORIES.map((category) => (
              <option key={category.slug} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="material" className="label">
            Material / finish
          </label>
          <input
            id="material"
            name="material"
            defaultValue={product?.material ?? ''}
            className="field"
            placeholder="24k gold plated brass"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className="label">
            Price (BDT)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={product?.price ?? ''}
            className="field"
            placeholder="1850"
          />
        </div>
        <div>
          <label htmlFor="compareAtPrice" className="label">
            Compare-at price
          </label>
          <input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            min={1}
            step={1}
            defaultValue={product?.compareAtPrice ?? ''}
            className="field"
            placeholder="Optional"
          />
        </div>
        <div>
          <label htmlFor="stock" className="label">
            Stock quantity
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={product?.stock ?? 0}
            className="field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={product?.description ?? ''}
          className="field resize-y"
          placeholder="Describe the silhouette, finish and occasion…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="image" className="label">
            Artwork motif
          </label>
          <select id="image" name="image" defaultValue={product?.image ?? 'drop'} className="field">
            {ART_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-end gap-2 pb-3 text-[12px] text-mocha">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured ?? false}
            className="h-4 w-4 accent-[#C6A15B]"
          />
          Feature on the homepage
        </label>
      </div>

      {product && (
        <p className="text-[11px] text-mocha/80">
          Current price on storefront: {formatPrice(product.price)} · /product/{product.slug}
        </p>
      )}

      {state.error && (
        <p role="alert" className="border border-red-300/60 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-brown/10 pt-5">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'Saving…' : product ? 'Save changes' : 'Create product'}
        </button>
        <Link href="/admin/products" className="btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
