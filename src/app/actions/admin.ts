'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdminEmail } from '@/lib/admin';
import { getCurrentUser } from '@/lib/auth';
import { CATEGORY_NAMES } from '@/lib/categories';
import { isOrderStatus } from '@/lib/constants';
import {
  adjustStock,
  createProduct,
  deleteProduct,
  getProductById,
  updateOrderStatus,
  updateProduct,
} from '@/lib/db';
import type { ProductInput } from '@/lib/types';

export interface AdminState {
  error?: string;
  success?: string;
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function integer(formData: FormData, key: string): number {
  return Math.floor(Number(text(formData, key)));
}

async function guard(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return 'Your session expired. Please sign in again.';
  if (user.role !== 'admin' && !isAdminEmail(user.email)) return 'You do not have admin access.';
  return null;
}

function readProduct(formData: FormData): { input?: ProductInput; error?: string } {
  const name = text(formData, 'name');
  const category = text(formData, 'category');
  const price = integer(formData, 'price');
  const compareRaw = text(formData, 'compareAtPrice');
  const compareAtPrice = compareRaw ? integer(formData, 'compareAtPrice') : null;
  const description = text(formData, 'description');
  const material = text(formData, 'material') || 'Champagne gold finish';
  const stock = integer(formData, 'stock');
  const image = text(formData, 'image') || 'drop';
  const featured = formData.get('featured') === 'on' || formData.get('featured') === 'true';

  if (name.length < 3) return { error: 'Enter a product name of at least 3 characters.' };
  if (!CATEGORY_NAMES.includes(category)) return { error: 'Choose a valid category.' };
  if (!Number.isFinite(price) || price <= 0) return { error: 'Price must be a positive amount.' };
  if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice <= price)) {
    return { error: 'Compare-at price must be higher than the selling price (or leave it empty).' };
  }
  if (description.length < 10) return { error: 'Write a description of at least 10 characters.' };
  if (!Number.isFinite(stock) || stock < 0) return { error: 'Stock cannot be negative.' };
  if (stock > 100000) return { error: 'Stock looks too large. Check the value.' };

  return {
    input: {
      name,
      category,
      price,
      compareAtPrice,
      description,
      material,
      stock,
      image,
      featured,
    },
  };
}

export async function saveProductAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const denied = await guard();
  if (denied) return { error: denied };

  const id = text(formData, 'id');
  const { input, error } = readProduct(formData);
  if (!input) return { error };

  try {
    if (id) {
      const updated = await updateProduct(id, input);
      if (!updated) return { error: 'That product no longer exists.' };
    } else {
      await createProduct(input);
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'We could not save this product. Please try again.',
    };
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');
  revalidatePath('/');
  redirect('/admin/products?saved=1');
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const denied = await guard();
  if (denied) return;
  const id = text(formData, 'id');
  let failed = false;
  if (id) {
    try {
      await deleteProduct(id);
    } catch {
      failed = true;
    }
  }
  if (failed) redirect('/admin/products?error=delete');
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  revalidatePath('/');
  redirect('/admin/products?deleted=1');
}

export async function adjustStockAction(formData: FormData): Promise<void> {
  const denied = await guard();
  if (denied) return;
  const id = text(formData, 'id');
  const delta = integer(formData, 'delta');
  if (!id || !Number.isFinite(delta) || delta === 0) return;
  const product = await getProductById(id);
  if (!product) redirect('/admin/products?error=missing');
  const bounded = Math.max(-product.stock, Math.min(1000, delta));
  if (bounded !== 0) await adjustStock(id, bounded);
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  revalidatePath(`/product/${product.slug}`);
  redirect('/admin/products?stock=1');
}

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const denied = await guard();
  if (denied) return;
  const id = text(formData, 'id');
  const status = text(formData, 'status');
  if (!id || !isOrderStatus(status)) redirect('/admin/orders?error=status');
  await updateOrderStatus(id, status);
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  revalidatePath('/account');
  redirect('/admin/orders?updated=1');
}
