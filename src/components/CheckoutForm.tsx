'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { placeOrderAction, type CheckoutState } from '@/app/actions/checkout';
import { BD_DIVISIONS, deliveryFeeFor, formatPrice } from '@/lib/constants';
import { useCart } from '@/lib/cart';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const initial: CheckoutState = {};

export function CheckoutForm({
  user,
}: {
  user: { name: string; email: string; phone: string };
}) {
  const { items, ready, subtotal } = useCart();
  const [state, formAction, pending] = useActionState(placeOrderAction, initial);
  const router = useRouter();

  const deliveryFee = deliveryFeeFor(subtotal);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!ready) return;
    if (items.length === 0) router.replace('/cart');
  }, [ready, items.length, router]);

  if (!ready || items.length === 0) {
    return <p className="py-20 text-center text-sm text-mocha">Preparing your checkout…</p>;
  }

  return (
    <form
      action={formAction}
      className="grid gap-9 lg:grid-cols-[1.35fr_0.9fr] lg:gap-12"
    >
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(items.map((line) => ({ productId: line.productId, quantity: line.quantity })))}
      />
      <input type="hidden" name="paymentMethod" value="cod" />

      <div className="space-y-8">
        <section className="border border-brown/10 bg-white/60 p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl text-ink">Delivery details</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-mocha/70">Step 1 of 2</span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="customerName" className="label">
                Full name
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                required
                defaultValue={user.name}
                autoComplete="name"
                className="field"
              />
            </div>

            <div>
              <label htmlFor="phone" className="label">
                Mobile number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                inputMode="tel"
                defaultValue={user.phone}
                placeholder="01712345678"
                autoComplete="tel"
                pattern="(\+?880|0)1[3-9][0-9]{8}"
                className="field"
              />
              <p className="mt-1.5 text-[11px] text-mocha/70">11-digit Bangladeshi number.</p>
            </div>

            <div>
              <label htmlFor="division" className="label">
                Division
              </label>
              <select id="division" name="division" required defaultValue="Dhaka" className="field">
                {BD_DIVISIONS.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="district" className="label">
                District / city
              </label>
              <input
                id="district"
                name="district"
                type="text"
                required
                placeholder="Dhaka"
                autoComplete="address-level2"
                className="field"
              />
            </div>

            <div>
              <label htmlFor="area" className="label">
                Area / thana
              </label>
              <input
                id="area"
                name="area"
                type="text"
                placeholder="Gulshan 2"
                autoComplete="address-level3"
                className="field"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="label">
                Full delivery address
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                placeholder="House / road, landmark, postal code"
                autoComplete="street-address"
                className="field"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="note" className="label">
                Delivery note <span className="normal-case tracking-normal text-mocha/60">(optional)</span>
              </label>
              <textarea
                id="note"
                name="note"
                rows={2}
                placeholder="Gift wrapping, preferred delivery time…"
                className="field"
              />
            </div>
          </div>
        </section>

        <section className="border border-brown/10 bg-white/60 p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl text-ink">Payment</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-mocha/70">Step 2 of 2</span>
          </div>
          <div className="mt-5 border border-champagne bg-champagne/10 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-brown">
                <span className="h-2 w-2 rounded-full bg-brown" />
              </span>
              <div>
                <p className="text-sm text-brown">Cash on Delivery</p>
                <p className="mt-1 text-[11px] leading-relaxed text-mocha">
                  Pay the courier in cash when your parcel arrives. Please keep{' '}
                  <strong className="font-medium text-brown">{formatPrice(total)}</strong> ready.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-mocha/70">
            Online card and mobile banking payments are not enabled yet — cash on delivery is the
            only method.
          </p>
        </section>

        {state.error && (
          <p role="alert" className="border border-red-300/60 bg-red-50 px-4 py-3 text-[12px] text-red-700">
            {state.error}
          </p>
        )}
      </div>

      <aside className="h-fit border border-brown/10 bg-cream/60 p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl text-ink">Your order</h2>
        <ul className="mt-4 space-y-3 border-b border-brown/10 pb-4 text-[12px]">
          {items.map((line) => (
            <li key={line.productId} className="flex justify-between gap-3">
              <span className="min-w-0 text-mocha">
                {line.name} <span className="text-mocha/60">× {line.quantity}</span>
              </span>
              <span className="whitespace-nowrap text-brown">
                {formatPrice(line.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 text-[13px]">
          <div className="flex justify-between text-mocha">
            <dt>Subtotal</dt>
            <dd className="text-brown">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-mocha">
            <dt>Delivery</dt>
            <dd className="text-brown">{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-brown/10 pt-3">
            <dt className="text-brown">Total due</dt>
            <dd className="font-display text-lg text-brown">{formatPrice(total)}</dd>
          </div>
        </dl>

        <button type="submit" disabled={pending} className="btn-primary mt-6 w-full">
          {pending ? 'Placing order…' : 'Place order'}
        </button>
        <Link
          href="/cart"
          className="mt-3 block text-center text-[10px] uppercase tracking-[0.16em] text-mocha/70 hover:text-gold"
        >
          Edit cart
        </Link>
        <p className="mt-4 text-center text-[10px] leading-relaxed text-mocha/60">
          By placing this order you agree to pay in cash on delivery.
        </p>
      </aside>
    </form>
  );
}
