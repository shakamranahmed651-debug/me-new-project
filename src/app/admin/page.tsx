import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDateTime, formatPrice, STATUS_LABELS } from '@/lib/constants';
import { adminStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin overview',
};

export default async function AdminOverviewPage() {
  const stats = await adminStats();

  const cards = [
    { label: 'Revenue (excl. cancelled)', value: formatPrice(stats.revenue) },
    { label: 'Orders', value: String(stats.orderCount) },
    { label: 'Awaiting confirmation', value: String(stats.pendingOrders) },
    { label: 'Customers', value: String(stats.customerCount) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="border border-brown/10 bg-white/60 p-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-gold">{card.label}</p>
            <p className="mt-3 font-display text-2xl text-ink">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-brown/10 bg-white/60">
          <div className="flex items-center justify-between border-b border-brown/10 px-5 py-3">
            <h2 className="text-[9px] uppercase tracking-[0.2em] text-gold">Recent orders</h2>
            <Link href="/admin/orders" className="text-[10px] uppercase tracking-[0.16em] text-mocha hover:text-gold">
              View all
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-mocha">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-brown/10">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-[12px] text-ink">{order.orderNumber}</p>
                    <p className="text-[10px] text-mocha/75">
                      {order.customerName} · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-brown">{formatPrice(order.total)}</p>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-mocha/75">
                      {STATUS_LABELS[order.status]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-brown/10 bg-white/60">
          <div className="flex items-center justify-between border-b border-brown/10 px-5 py-3">
            <h2 className="text-[9px] uppercase tracking-[0.2em] text-gold">Low stock</h2>
            <Link href="/admin/products" className="text-[10px] uppercase tracking-[0.16em] text-mocha hover:text-gold">
              Manage inventory
            </Link>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-mocha">Every piece is well stocked.</p>
          ) : (
            <ul className="divide-y divide-brown/10">
              {stats.lowStock.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-[12px] text-ink">{product.name}</p>
                    <p className="text-[10px] text-mocha/75">{product.category}</p>
                  </div>
                  <span
                    className={`border px-2 py-1 text-[9px] uppercase tracking-[0.14em] ${
                      product.stock === 0
                        ? 'border-red-300/70 bg-red-50 text-red-700'
                        : 'border-champagne bg-champagne/20 text-brown'
                    }`}
                  >
                    {product.stock === 0 ? 'Sold out' : `${product.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="btn-primary">
          Add a product
        </Link>
        <Link href="/admin/orders" className="btn-outline">
          Manage orders
        </Link>
      </div>
    </div>
  );
}
