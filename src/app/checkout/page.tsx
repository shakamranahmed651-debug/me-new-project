import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckoutForm } from '@/components/CheckoutForm';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Cash on delivery checkout with nationwide delivery across Bangladesh.',
};

export default async function CheckoutPage() {
  const user = await requireUser('/login?next=/checkout');

  return (
    <div className="container-luxe py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-[10px] uppercase tracking-[0.18em] text-mocha/70">
        <Link href="/cart" className="hover:text-gold">
          Cart
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-brown">Checkout</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Almost yours</p>
          <h1 className="mt-3 text-3xl sm:text-4xl">Checkout</h1>
        </div>
        <p className="text-[11px] text-mocha">
          Signed in as <span className="text-brown">{user.email}</span>
        </p>
      </div>

      <div className="mt-8">
        <CheckoutForm user={{ name: user.name, email: user.email, phone: user.phone }} />
      </div>
    </div>
  );
}
