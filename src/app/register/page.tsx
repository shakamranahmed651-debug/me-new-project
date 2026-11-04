import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create a free WARAN ZONE account for faster checkout and order history.',
};

type SearchParams = Promise<{ next?: string }>;

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (user) redirect('/account');
  const { next } = await searchParams;
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  return (
    <div className="container-luxe grid gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
      <div>
        <p className="eyebrow">Join the atelier</p>
        <h1 className="mt-4 text-4xl">Create your account</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-mocha">
          Save your delivery details, follow every order and hear about new drops before anyone
          else. It is free, and we never share your information.
        </p>
        <ul className="mt-8 space-y-3 text-[12px] leading-relaxed text-mocha">
          <li className="border-b border-brown/10 pb-3">Faster cash-on-delivery checkout</li>
          <li className="border-b border-brown/10 pb-3">Complete order history in one place</li>
          <li className="border-b border-brown/10 pb-3">Early access to limited pieces</li>
        </ul>
      </div>

      <div className="border border-brown/10 bg-white/60 p-6 sm:p-9">
        <AuthForm mode="register" next={safeNext} />
      </div>
    </div>
  );
}
