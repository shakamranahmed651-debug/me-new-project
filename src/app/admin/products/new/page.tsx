import type { Metadata } from 'next';
import { AdminProductForm } from '@/components/AdminProductForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — new product',
};

export default function NewProductPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-xl text-ink">Add a product</h2>
      <p className="mt-1 text-[11px] text-mocha">
        New pieces appear on the storefront immediately after saving.
      </p>
      <div className="mt-6">
        <AdminProductForm />
      </div>
    </div>
  );
}
