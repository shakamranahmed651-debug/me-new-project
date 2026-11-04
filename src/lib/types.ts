import type { OrderStatus } from '@/lib/constants';

export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  description: string;
  material: string;
  stock: number;
  image: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  address: string;
  note: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export interface ProductInput {
  name: string;
  slug?: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  description: string;
  material: string;
  stock: number;
  image?: string;
  featured?: boolean;
}

export interface AdminStats {
  revenue: number;
  orderCount: number;
  pendingOrders: number;
  customerCount: number;
  lowStock: Product[];
  recentOrders: Order[];
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
}
