import type { Metadata } from 'next';
import Link from 'next/link';
import { logoutAction } from '@/app/actions/auth';
import { requireUser } from '@/lib/auth';
import { formatDate, formatPrice, STATUS_LABELS } from '@/lib/constants';
import { listOrdersByUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My account',
  description: 'Your WARAN ZONE order history and account details.',
};

export default async function AccountPage() {
  const user = await requireUser('/login?next=/account');
  const orders = await listOrdersByUser(user.id).catch(() => []);

  return (
    <div className="container-luxe py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-brown/10 pb-6">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-3 text-3xl sm:text-4xl">Hello, {user.name.split(' ')[0]}</h1>
          <p className="mt-2 text-[12px] text-mocha">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.role === 'admin' && (
            <Link href="/admin" className="btn-outline">
              Admin dashboard
            </Link>
          )}
          <form action={logoutAction}>
            <button type="submit" className="btn-outline">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.7fr_1.6fr]">
        <aside className="h-fit space-y-3 border border-brown/10 bg-cream/60 p-5 text-[12px]">
          <h2 className="text-[9px] uppercase tracking-[0.2em] text-gold">Profile</h2>
          <p className="text-brown">{user.name}</p>
          <p className="text-mocha">{user.email}</p>
          {user.phone && <p className="text-mocha">{user.phone}</p>}
          <p className="border-t border-brown/10 pt-3 text-mocha/80">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </p>
          <Link
            href="/shop"
            className="inline-block text-[10px] uppercase tracking-[0.16em] text-brown underline decoration-champagne underline-offset-4 hover:text-gold"
          >
            Shop new arrivals
          </Link>
        </aside>

        <section>
          <h2 className="font-display text-xl text-ink">Order history</h2>
          {orders.length === 0 ? (
            <div className="mt-4 border border-dashed border-brown/20 bg-white/40 px-5 py-12 text-center">
              <p className="text-sm text-mocha">You have not placed an order yet.</p>
              <Link href="/shop" className="btn-primary mt-6">
                Explore the collection
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="border border-brown/10 bg-white/60">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-brown/10 px-5 py-4">
                    <div>
                      <Link
                        href={`/order/${order.orderNumber}`}
                        className="font-display text-base text-ink hover:text-gold"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="mt-1 text-[11px] text-mocha/80">
                        {formatDate(order.createdAt)} · {order.items.length}{' '}
                        {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-brown">{formatPrice(order.total)}</p>
                      <span className="mt-1 inline-block border border-brown/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-mocha">
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                  </div>
                  <div className="px-5 py-3 text-[11px] leading-relaxed text-mocha">
                    {order.items.map((item) => `${item.name} × ${item.quantity}`).join(' · ')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
