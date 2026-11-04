import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your WARAN ZONE account to track orders and check out faster.',
};

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (user) redirect('/account');
  const { next } = await searchParams;
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  return (
    <div className="container-luxe grid gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
      <div className="order-2 lg:order-1">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-4 text-4xl">Sign in to WARAN ZONE</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-mocha">
          Your cart, delivery details and order history stay ready for you. Sign in to continue
          where you left off.
        </p>
        <div className="mt-8 border border-brown/10 bg-cream/60 p-5 text-[12px] leading-relaxed text-mocha">
          <p className="text-[9px] uppercase tracking-[0.2em] text-gold">Need an account?</p>
          <p className="mt-2">
            Registration takes a moment and is free.{' '}
            <Link href="/register" className="text-brown underline decoration-champagne underline-offset-4">
              Create one now
            </Link>
            .
          </p>
        </div>
        <dl className="mt-8 space-y-3 text-[12px] text-mocha">
          <div className="flex justify-between border-b border-brown/10 pb-2">
            <dt>Cash on delivery</dt>
            <dd className="text-brown">Nationwide</dd>
          </div>
          <div className="flex justify-between border-b border-brown/10 pb-2">
            <dt>Order tracking</dt>
            <dd className="text-brown">From your account</dd>
          </div>
        </dl>
      </div>

      <div className="order-1 border border-brown/10 bg-white/60 p-6 sm:p-9 lg:order-2">
        <AuthForm mode="login" next={safeNext} />
      </div>
    </div>
  );
}
