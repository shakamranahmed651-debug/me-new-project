import type { Metadata } from 'next';
import { CartView } from '@/components/CartView';

export const metadata: Metadata = {
  title: 'Shopping cart',
  description: 'Review the pieces in your WARAN ZONE cart before checkout.',
};

export default function CartPage() {
  return <CartView />;
}
