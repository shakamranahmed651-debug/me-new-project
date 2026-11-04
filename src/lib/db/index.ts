import { supabaseConfigured } from '@/lib/supabase';
import * as sqlite from '@/lib/db/sqlite';
import * as supa from '@/lib/db/supabase';
import type { AdminStats, Order, Product, ProductInput, Role, User } from '@/lib/types';

export type ProviderName = 'supabase' | 'sqlite';

export function providerName(): ProviderName {
  return supabaseConfigured() ? 'supabase' : 'sqlite';
}

export function usingSupabase(): boolean {
  return providerName() === 'supabase';
}

export async function listProducts(options: { category?: string; search?: string } = {}) {
  return usingSupabase() ? supa.supaListProducts(options) : sqlite.sqliteListProducts(options);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await listProducts();
  return products.filter((product) => product.featured).slice(0, limit);
}

export async function getProductBySlug(slug: string) {
  return usingSupabase() ? supa.supaGetProductBySlug(slug) : sqlite.sqliteGetProductBySlug(slug);
}

export async function getProductById(id: string) {
  return usingSupabase() ? supa.supaGetProductById(id) : sqlite.sqliteGetProductById(id);
}

export async function createProduct(input: ProductInput): Promise<Product | null> {
  return usingSupabase() ? supa.supaCreateProduct(input) : sqlite.sqliteCreateProduct(input);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product | null> {
  return usingSupabase() ? supa.supaUpdateProduct(id, input) : sqlite.sqliteUpdateProduct(id, input);
}

export async function deleteProduct(id: string): Promise<boolean> {
  return usingSupabase() ? supa.supaDeleteProduct(id) : sqlite.sqliteDeleteProduct(id);
}

export async function adjustStock(id: string, delta: number): Promise<void> {
  return usingSupabase() ? supa.supaAdjustStock(id, delta) : sqlite.sqliteAdjustStock(id, delta);
}

export async function createUser(input: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role?: Role;
}) {
  return usingSupabase() ? supa.supaCreateUser(input) : sqlite.sqliteCreateUser(input);
}

export async function countUsers(): Promise<number> {
  if (usingSupabase()) return supa.supaCountUsers();
  return sqlite.sqliteCountUsers();
}

export async function findUserByEmail(email: string) {
  return usingSupabase() ? supa.supaFindUserByEmail(email) : sqlite.sqliteFindUserByEmail(email);
}

export async function getUserById(id: string): Promise<User | null> {
  if (usingSupabase()) {
    const profile = await supa.supaGetProfile(id);
    return profile;
  }
  const user = await sqlite.sqliteGetUserById(id);
  if (!user) return null;
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function setUserRole(id: string, role: Role) {
  return usingSupabase() ? supa.supaSetUserRole(id, role) : sqlite.sqliteSetUserRole(id, role);
}

export async function createOrder(input: Parameters<typeof sqlite.sqliteCreateOrder>[0]): Promise<Order> {
  return usingSupabase() ? supa.supaCreateOrder(input) : sqlite.sqliteCreateOrder(input);
}

export async function listOrdersByUser(userId: string) {
  return usingSupabase() ? supa.supaListOrdersByUser(userId) : sqlite.sqliteListOrdersByUser(userId);
}

export async function getOrder(id: string) {
  return usingSupabase() ? supa.supaGetOrder(id) : sqlite.sqliteGetOrder(id);
}

export async function getOrderByNumber(number: string) {
  return usingSupabase() ? supa.supaGetOrderByNumber(number) : sqlite.sqliteGetOrderByNumber(number);
}

export async function listAllOrders() {
  return usingSupabase() ? supa.supaListAllOrders() : sqlite.sqliteListAllOrders();
}

export async function updateOrderStatus(id: string, status: string) {
  return usingSupabase() ? supa.supaUpdateOrderStatus(id, status) : sqlite.sqliteUpdateOrderStatus(id, status);
}

export async function adminStats(): Promise<AdminStats> {
  return usingSupabase() ? supa.supaAdminStats() : sqlite.sqliteAdminStats();
}
