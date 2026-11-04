import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ClearCart } from '@/components/ClearCart';
import { getCurrentUser } from '@/lib/auth';
import { formatDateTime, formatPhone, formatPrice, STATUS_LABELS } from '@/lib/constants';
import { getOrderByNumber } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Order confirmed',
  description: 'Your WARAN ZONE order confirmation.',
};

type Params = Promise<{ number: string }>;

export default async function OrderPage({ params }: { params: Params }) {
  const { number } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/order/${encodeURIComponent(number)}`);

  const order = await getOrderByNumber(number);
  const ownsOrder = order && (order.userId === user.id || user.role === 'admin');
  if (!order || !ownsOrder) notFound();

  return (
    <div className="container-luxe py-10 sm:py-16">
      <ClearCart orderNumber={order.orderNumber} />

      <div className="mx-auto max-w-3xl">
        <div className="border border-champagne bg-cream/70 px-6 py-10 text-center sm:px-10">
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Thank you</p>
          <h1 className="mt-4 text-3xl sm:text-4xl">Your order is confirmed</h1>
          <p className="mt-3 text-sm leading-relaxed text-mocha">
            Order <span className="text-brown">{order.orderNumber}</span> was placed on{' '}
            {formatDateTime(order.createdAt)}. We will call {formatPhone(order.phone)} to confirm
            delivery, then send it by courier.
          </p>
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2">
            <span className="border border-brown/20 bg-white/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-brown">
              {STATUS_LABELS[order.status]}
            </span>
            <span className="border border-brown/20 bg-white/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-brown">
              Cash on Delivery
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <section className="border border-brown/10 bg-white/60 p-5">
            <h2 className="text-[9px] uppercase tracking-[0.2em] text-gold">Delivering to</h2>
            <p className="mt-3 text-sm text-ink">{order.customerName}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-mocha">
              {order.address}
              <br />
              {order.area ? `${order.area}, ` : ''}
              {order.district}, {order.division}
              <br />
              {formatPhone(order.phone)}
            </p>
            {order.note && (
              <p className="mt-3 border-t border-brown/10 pt-3 text-[11px] leading-relaxed text-mocha/80">
                Note: {order.note}
              </p>
            )}
          </section>

          <section className="border border-brown/10 bg-white/60 p-5">
            <h2 className="text-[9px] uppercase tracking-[0.2em] text-gold">Payment</h2>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between text-mocha">
                <dt>Subtotal</dt>
                <dd className="text-brown">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-mocha">
                <dt>Delivery</dt>
                <dd className="text-brown">
                  {order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-brown/10 pt-2 text-sm">
                <dt className="text-brown">Total due on delivery</dt>
                <dd className="font-display text-base text-brown">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="mt-8 border border-brown/10">
          <h2 className="border-b border-brown/10 bg-cream/50 px-5 py-3 text-[9px] uppercase tracking-[0.2em] text-gold">
            Items
          </h2>
          <ul className="divide-y divide-brown/10">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                <div>
                  <Link href={`/product/${item.slug}`} className="text-ink hover:text-gold">
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-mocha/70">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="whitespace-nowrap text-brown">{formatPrice(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/account" className="btn-primary">
            View order history
          </Link>
          <Link href="/shop" className="btn-outline">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
