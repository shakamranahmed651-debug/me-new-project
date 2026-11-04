import { createSupabaseAdmin } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';
import { deliveryFeeFor, isOrderStatus } from '@/lib/constants';
import type { AdminStats, Order, OrderItem, Product, ProductInput, Role, User } from '@/lib/types';

type Row = Record<string, unknown>;

function mapProduct(row: Row): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: String(row.category),
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
    description: String(row.description ?? ''),
    material: String(row.material ?? ''),
    stock: Number(row.stock ?? 0),
    image: String(row.image ?? ''),
    featured: Boolean(row.featured),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapUser(row: Row): User {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    role: row.role === 'admin' ? 'admin' : 'customer',
    createdAt: String(row.created_at),
  };
}

function mapOrder(row: Row): Order {
  const status = String(row.status);
  const items = Array.isArray(row.order_items) ? (row.order_items as Row[]) : [];
  return {
    id: String(row.id),
    orderNumber: String(row.order_number),
    userId: row.user_id === null ? null : String(row.user_id),
    customerName: String(row.customer_name),
    phone: String(row.phone),
    division: String(row.division ?? ''),
    district: String(row.district ?? ''),
    area: String(row.area ?? ''),
    address: String(row.address ?? ''),
    note: String(row.note ?? ''),
    paymentMethod: String(row.payment_method ?? 'Cash on Delivery'),
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    status: isOrderStatus(status) ? status : 'pending',
    createdAt: String(row.created_at),
    items: items.map(
      (item): OrderItem => ({
        id: String(item.id),
        orderId: String(item.order_id),
        productId: item.product_id === null ? null : String(item.product_id),
        name: String(item.name),
        slug: String(item.slug ?? ''),
        price: Number(item.price),
        quantity: Number(item.quantity),
        lineTotal: Number(item.line_total),
      }),
    ),
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

const ORDER_SELECT = '*, order_items(*)';

export async function supaListProducts(options: { category?: string; search?: string } = {}) {
  const supabase = createSupabaseAdmin();
  let query = supabase.from('products').select('*');
  if (options.category) query = query.ilike('category', options.category);
  if (options.search) {
    const term = options.search.replace(/[%,()]/g, ' ').trim();
    if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }
  const { data, error } = await query
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProduct);
}

export async function supaGetProductBySlug(slug: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProduct(data) : null;
}

export async function supaGetProductById(id: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProduct(data) : null;
}

export async function supaCreateProduct(input: ProductInput) {
  const supabase = createSupabaseAdmin();
  const slug = slugify(input.slug || input.name);
  const { data, error } = await supabase
    .from('products')
    .insert({
      slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
      name: input.name,
      category: input.category,
      price: input.price,
      compare_at_price: input.compareAtPrice ?? null,
      description: input.description,
      material: input.material,
      stock: input.stock,
      image: input.image || 'drop',
      featured: Boolean(input.featured),
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapProduct(data);
}

export async function supaUpdateProduct(id: string, input: ProductInput) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('products')
    .update({
      name: input.name,
      category: input.category,
      price: input.price,
      compare_at_price: input.compareAtPrice ?? null,
      description: input.description,
      material: input.material,
      stock: input.stock,
      image: input.image || 'drop',
      featured: Boolean(input.featured),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProduct(data) : null;
}

export async function supaDeleteProduct(id: string) {
  const supabase = createSupabaseAdmin();
  const { error, count } = await supabase.from('products').delete({ count: 'exact' }).eq('id', id);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function supaAdjustStock(id: string, delta: number) {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase.from('products').select('stock').eq('id', id).maybeSingle();
  if (!data) return;
  const next = Math.max(0, Number(data.stock) + delta);
  await supabase.from('products').update({ stock: next }).eq('id', id);
}

export async function supaCreateUser(_input: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role?: Role;
}) {
  throw new Error('With Supabase configured, accounts are created through Supabase Auth.');
}

export async function supaFindUserByEmail(_email: string) {
  throw new Error('With Supabase configured, sign in through Supabase Auth.');
}

export async function supaGetUserById(id: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapUser(data) : null;
}

export async function supaGetProfile(id: string) {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (!data) return null;
  const user = mapUser(data);
  if (isAdminEmail(user.email)) return { ...user, role: 'admin' as Role };
  return user;
}

export async function supaSetUserRole(id: string, role: Role) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function supaListOrdersByUser(userId: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOrder);
}

export async function supaGetOrder(id: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('orders').select(ORDER_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapOrder(data) : null;
}

export async function supaGetOrderByNumber(number: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('order_number', number)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapOrder(data) : null;
}

export async function supaListAllOrders() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOrder);
}

export async function supaCreateOrder(input: {
  userId: string | null;
  customerName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  address: string;
  note: string;
  items: { productId: string; quantity: number }[];
}): Promise<Order> {
  const supabase = createSupabaseAdmin();
  if (!input.items.length) throw new Error('Your cart is empty.');
  const { data, error } = await supabase.rpc('place_order', {
    p_user_id: input.userId,
    p_name: input.customerName,
    p_phone: input.phone,
    p_division: input.division,
    p_district: input.district,
    p_area: input.area,
    p_address: input.address,
    p_note: input.note,
    p_items: input.items,
    p_delivery_fee: deliveryFeeFor(0),
  });
  if (error) throw new Error(error.message);
  const orderId = typeof data === 'string' ? data : (data as { id?: string })?.id;
  if (!orderId) throw new Error('Order could not be created.');
  const order = await supaGetOrder(orderId);
  if (!order) throw new Error('Order could not be loaded.');
  return order;
}

export async function supaUpdateOrderStatus(id: string, status: string) {
  const supabase = createSupabaseAdmin();
  if (!isOrderStatus(status)) throw new Error('Unknown order status.');
  const current = await supaGetOrder(id);
  if (!current) return null;
  if (status === 'cancelled' && current.status !== 'cancelled') {
    for (const item of current.items) {
      if (item.productId) await supaAdjustStock(item.productId, item.quantity);
    }
  }
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
  return supaGetOrder(id);
}

export async function supaAdminStats(): Promise<AdminStats> {
  const supabase = createSupabaseAdmin();
  const [{ data: orders }, { count: customerCount }, { data: lowStockRows }, { data: recent }] =
    await Promise.all([
      supabase.from('orders').select('total,status'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('*').lte('stock', 5).order('stock', { ascending: true }).limit(6),
      supabase.from('orders').select(ORDER_SELECT).order('created_at', { ascending: false }).limit(5),
    ]);

  const list = orders ?? [];
  return {
    revenue: list
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + Number(order.total), 0),
    orderCount: list.length,
    pendingOrders: list.filter((order) => order.status === 'pending').length,
    customerCount: customerCount ?? 0,
    lowStock: (lowStockRows ?? []).map(mapProduct),
    recentOrders: (recent ?? []).map(mapOrder),
  };
}
