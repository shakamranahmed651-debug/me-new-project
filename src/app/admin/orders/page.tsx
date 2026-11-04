import type { Metadata } from 'next';
import { updateOrderStatusAction } from '@/app/actions/admin';
import { formatDateTime, formatPhone, formatPrice, ORDER_STATUSES, STATUS_LABELS } from '@/lib/constants';
import { listAllOrders } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — orders',
};

type SearchParams = Promise<{ updated?: string; error?: string }>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const orders = await listAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-ink">Customer orders</h2>
        <p className="mt-1 text-[11px] text-mocha">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} · all payments are cash on delivery
        </p>
      </div>

      {params.updated === '1' && (
        <p role="status" className="border border-champagne bg-champagne/15 px-3 py-2 text-[12px] text-brown">
          Order status updated.
        </p>
      )}
      {params.error && (
        <p role="alert" className="border border-red-300/60 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          That status change could not be applied.
        </p>
      )}

      {orders.length === 0 ? (
        <div className="border border-dashed border-brown/20 bg-white/40 px-6 py-16 text-center">
          <p className="font-display text-2xl text-ink">No orders yet</p>
          <p className="mt-3 text-sm text-mocha">
            Orders placed through cash-on-delivery checkout will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border border-brown/10 bg-white/60">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brown/10 px-5 py-4">
                <div>
                  <p className="text-[13px] text-ink">{order.orderNumber}</p>
                  <p className="mt-1 text-[10px] text-mocha/75">
                    {formatDateTime(order.createdAt)} · {order.customerName} ·{' '}
                    {formatPhone(order.phone)}
                  </p>
                  <p className="mt-1 max-w-md text-[11px] leading-relaxed text-mocha">
                    {order.address}, {order.area ? `${order.area}, ` : ''}
                    {order.district}, {order.division}
                  </p>
                  {order.note && (
                    <p className="mt-1 text-[11px] text-mocha/80">Note: {order.note}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-display text-base text-brown">{formatPrice(order.total)}</p>
                  <span className="mt-1 inline-block border border-brown/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-mocha">
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1.5fr_1fr]">
                <ul className="space-y-1 text-[11px] text-mocha">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span className="text-brown">
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.lineTotal)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between border-t border-brown/10 pt-1 text-mocha/80">
                    <span>Delivery</span>
                    <span>{order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}</span>
                  </li>
                </ul>

                <form action={updateOrderStatusAction} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={order.id} />
                  <div className="flex-1">
                    <label htmlFor={`status-${order.id}`} className="label">
                      Update status
                    </label>
                    <select
                      id={`status-${order.id}`}
                      name="status"
                      defaultValue={order.status}
                      className="field py-2 text-xs"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary px-4 py-2.5 text-[10px]">
                    Save
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
