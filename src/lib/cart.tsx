'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  lastAdded: string | null;
}

const STORAGE_KEY = 'wz_cart_v1';

const CartContext = createContext<CartContextValue | null>(null);

function read(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.productId === 'string' && Number(item.quantity) > 0)
      .map((item) => ({
        productId: String(item.productId),
        slug: String(item.slug ?? ''),
        name: String(item.name ?? ''),
        price: Number(item.price) || 0,
        image: String(item.image ?? ''),
        stock: Number(item.stock) || 0,
        quantity: Math.min(99, Math.max(1, Math.floor(Number(item.quantity) || 1))),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    setItems(read());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be unavailable in private mode — cart simply stays in memory.
    }
  }, [items, ready]);

  useEffect(() => {
    if (!lastAdded) return;
    const timer = window.setTimeout(() => setLastAdded(null), 2600);
    return () => window.clearTimeout(timer);
  }, [lastAdded]);

  const add = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((line) => line.productId === item.productId);
      const limit = item.stock > 0 ? item.stock : 1;
      if (existing) {
        return current.map((line) =>
          line.productId === item.productId
            ? { ...line, ...item, quantity: Math.min(limit, line.quantity + quantity) }
            : line,
        );
      }
      return [...current, { ...item, quantity: Math.min(limit, Math.max(1, quantity)) }];
    });
    setLastAdded(item.name);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((line) => {
          if (line.productId !== productId) return line;
          const limit = line.stock > 0 ? line.stock : 1;
          return { ...line, quantity: Math.min(limit, Math.max(0, Math.floor(quantity))) };
        })
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = items.reduce((sum, line) => sum + line.price * line.quantity, 0);
    return { items, ready, count, subtotal, add, setQuantity, remove, clear, lastAdded };
  }, [items, ready, add, setQuantity, remove, clear, lastAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>.');
  return context;
}
