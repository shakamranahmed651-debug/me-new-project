import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { usingSupabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin dashboard',
  description: 'WARAN ZONE atelier administration.',
};

const TABS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/products', label: 'Products & inventory' },
  { href: '/admin/orders', label: 'Orders' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="container-luxe py-8 sm:py-12">
      <div className="border-b border-brown/10 pb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Atelier admin</p>
            <h1 className="mt-2 text-2xl sm:text-3xl">Store control room</h1>
            <p className="mt-1 text-[11px] text-mocha">
              Signed in as {user.email} · data source:{' '}
              {usingSupabase() ? 'Supabase' : 'local SQLite store'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-outline px-4 py-2 text-[10px]">
              View storefront
            </Link>
            <Link href="/account" className="btn-outline px-4 py-2 text-[10px]">
              My account
            </Link>
          </div>
        </div>

        <nav aria-label="Admin sections" className="no-scrollbar mt-5 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="whitespace-nowrap border border-brown/15 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-mocha transition-colors hover:border-champagne hover:text-gold"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
