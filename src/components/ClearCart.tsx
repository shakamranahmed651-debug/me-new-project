'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/cart';

/** Clears the local cart once an order has been confirmed server-side. */
export function ClearCart({ orderNumber }: { orderNumber: string }) {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // Clear only once per confirmed order number.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  return null;
}
