import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminProductForm } from '@/components/AdminProductForm';
import { getProductById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — edit product',
};

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl text-ink">Edit “{product.name}”</h2>
        <Link
          href={`/product/${product.slug}`}
          className="text-[10px] uppercase tracking-[0.16em] text-mocha underline decoration-champagne underline-offset-4 hover:text-gold"
        >
          View on storefront
        </Link>
      </div>
      <p className="mt-1 text-[11px] text-mocha">
        Changes are reflected on the storefront as soon as you save.
      </p>
      <div className="mt-6">
        <AdminProductForm product={product} />
      </div>
    </div>
  );
}
