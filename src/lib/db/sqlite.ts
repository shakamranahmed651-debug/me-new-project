import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import initSqlJs, { type Database } from 'sql.js';
import catalog from '@/data/catalog.json';
import { categorySlugOf } from '@/lib/categories';
import { deliveryFeeFor, isOrderStatus } from '@/lib/constants';
import type { AdminStats, Order, OrderItem, Product, ProductInput, Role, User } from '@/lib/types';
import { hashPassword } from '@/lib/password';
import { adminEmails } from '@/lib/admin';

const require = createRequire(import.meta.url);

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), '.data');

const dbFile = path.join(dataDir, 'waran-zone.db');

type Row = Record<string, unknown>;

let loadPromise: Promise<Database> | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  compare_at_price INTEGER,
  description TEXT NOT NULL,
  material TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  division TEXT NOT NULL,
  district TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  line_total INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
`;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

function seedProducts(db: Database) {
  const count = Number(all(db, 'SELECT COUNT(*) AS n FROM products')[0]?.n ?? 0);
  if (count > 0) return;
  const now = new Date().toISOString();
  for (const item of catalog.products) {
    run(
      db,
      `INSERT INTO products (id, slug, name, category, price, compare_at_price, description,
        material, stock, image, featured, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        item.slug,
        item.name,
        item.category,
        item.price,
        item.compareAtPrice ?? null,
        item.description,
        item.material,
        item.stock,
        item.art,
        item.featured ? 1 : 0,
        now,
        now,
      ],
    );
  }
}

function seedAdmin(db: Database) {
  const emails = adminEmails();
  if (emails.length === 0) return;
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) return;
  for (const email of emails) {
    const existing = all(db, 'SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      run(db, "UPDATE users SET role = 'admin' WHERE email = ?", [email]);
      continue;
    }
    const now = new Date().toISOString();
    run(
      db,
      `INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
       VALUES (?, ?, ?, ?, ?, 'admin', ?)`,
      [crypto.randomUUID(), 'Store Admin', email, '', hashPassword(password), now],
    );
  }
}

async function loadDatabase(): Promise<Database> {
  const wasmPath = path.join(path.dirname(require.resolve('sql.js/package.json')), 'dist/sql-wasm.wasm');
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(wasmPath) });
  fs.mkdirSync(dataDir, { recursive: true });

  let db: Database;
  if (fs.existsSync(dbFile)) {
    db = new SQL.Database(new Uint8Array(fs.readFileSync(dbFile)));
  } else {
    db = new SQL.Database();
  }

  db.run(SCHEMA);
  seedProducts(db);
  seedAdmin(db);
  save(db);
  return db;
}

function getDb(): Promise<Database> {
  if (!loadPromise) {
    loadPromise = loadDatabase().catch((error) => {
      loadPromise = null;
      throw error;
    });
  }
  return loadPromise;
}

function save(db: Database) {
  fs.mkdirSync(dataDir, { recursive: true });
  const tmp = `${dbFile}.tmp`;
  fs.writeFileSync(tmp, Buffer.from(db.export()));
  fs.renameSync(tmp, dbFile);
}

function all(db: Database, sql: string, params: unknown[] = []): Row[] {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params as never);
    const rows: Row[] = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally {
    stmt.free();
  }
}

function first(db: Database, sql: string, params: unknown[] = []): Row | undefined {
  return all(db, sql, params)[0];
}

function run(db: Database, sql: string, params: unknown[] = []) {
  db.run(sql, params as never);
}

function mapProduct(row: Row): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: String(row.category),
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
    description: String(row.description),
    material: String(row.material),
    stock: Number(row.stock),
    image: String(row.image ?? ''),
    featured: Number(row.featured) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapUser(row: Row): User & { passwordHash: string } {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone ?? ''),
    role: (String(row.role) as Role) ?? 'customer',
    createdAt: String(row.created_at),
    passwordHash: String(row.password_hash),
  };
}

function mapOrder(row: Row, items: OrderItem[]): Order {
  const status = String(row.status);
  return {
    id: String(row.id),
    orderNumber: String(row.order_number),
    userId: row.user_id === null ? null : String(row.user_id),
    customerName: String(row.customer_name),
    phone: String(row.phone),
    division: String(row.division),
    district: String(row.district),
    area: String(row.area),
    address: String(row.address),
    note: String(row.note ?? ''),
    paymentMethod: String(row.payment_method),
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    status: isOrderStatus(status) ? status : 'pending',
    createdAt: String(row.created_at),
    items,
  };
}

function itemsFor(db: Database, orderId: string): OrderItem[] {
  return all(db, 'SELECT * FROM order_items WHERE order_id = ?', [orderId]).map((row) => ({
    id: String(row.id),
    orderId: String(row.order_id),
    productId: row.product_id === null ? null : String(row.product_id),
    name: String(row.name),
    slug: String(row.slug),
    price: Number(row.price),
    quantity: Number(row.quantity),
    lineTotal: Number(row.line_total),
  }));
}

function orderNumber(): string {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WZ-${stamp}-${rand}`;
}

export async function sqliteListProducts(options: { category?: string; search?: string } = {}) {
  const db = await getDb();
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (options.category) {
    clauses.push('LOWER(category) = LOWER(?)');
    params.push(options.category);
  }
  if (options.search) {
    clauses.push('(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)');
    const term = `%${options.search.toLowerCase()}%`;
    params.push(term, term);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return all(db, `SELECT * FROM products ${where} ORDER BY featured DESC, created_at DESC`, params).map(
    mapProduct,
  );
}

export async function sqliteGetProductBySlug(slug: string) {
  const db = await getDb();
  const row = first(db, 'SELECT * FROM products WHERE slug = ?', [slug]);
  return row ? mapProduct(row) : null;
}

export async function sqliteGetProductById(id: string) {
  const db = await getDb();
  const row = first(db, 'SELECT * FROM products WHERE id = ?', [id]);
  return row ? mapProduct(row) : null;
}

export async function sqliteCreateProduct(input: ProductInput) {
  const db = await getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  let slug = slugify(input.slug || input.name);
  if (first(db, 'SELECT id FROM products WHERE slug = ?', [slug])) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  run(
    db,
    `INSERT INTO products (id, slug, name, category, price, compare_at_price, description,
      material, stock, image, featured, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      slug,
      input.name,
      input.category,
      input.price,
      input.compareAtPrice ?? null,
      input.description,
      input.material,
      input.stock,
      input.image || 'drop',
      input.featured ? 1 : 0,
      now,
      now,
    ],
  );
  save(db);
  const created = first(db, 'SELECT * FROM products WHERE id = ?', [id]);
  return created ? mapProduct(created) : null;
}

export async function sqliteUpdateProduct(id: string, input: ProductInput) {
  const db = await getDb();
  const existing = first(db, 'SELECT * FROM products WHERE id = ?', [id]);
  if (!existing) return null;
  let slug = slugify(input.slug || input.name);
  const clash = first(db, 'SELECT id FROM products WHERE slug = ? AND id <> ?', [slug, id]);
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  run(
    db,
    `UPDATE products SET slug = ?, name = ?, category = ?, price = ?, compare_at_price = ?,
      description = ?, material = ?, stock = ?, image = ?, featured = ?, updated_at = ? WHERE id = ?`,
    [
      slug,
      input.name,
      input.category,
      input.price,
      input.compareAtPrice ?? null,
      input.description,
      input.material,
      input.stock,
      input.image || 'drop',
      input.featured ? 1 : 0,
      new Date().toISOString(),
      id,
    ],
  );
  save(db);
  const updated = first(db, 'SELECT * FROM products WHERE id = ?', [id]);
  return updated ? mapProduct(updated) : null;
}

export async function sqliteDeleteProduct(id: string) {
  const db = await getDb();
  const existing = first(db, 'SELECT id FROM products WHERE id = ?', [id]);
  if (!existing) return false;
  run(db, 'DELETE FROM products WHERE id = ?', [id]);
  save(db);
  return true;
}

export async function sqliteAdjustStock(id: string, delta: number) {
  const db = await getDb();
  run(
    db,
    'UPDATE products SET stock = MAX(0, stock + ?), updated_at = ? WHERE id = ?',
    [delta, new Date().toISOString(), id],
  );
  save(db);
}

export async function sqliteCreateUser(input: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role?: Role;
}) {
  const db = await getDb();
  const email = input.email.trim().toLowerCase();
  const existing = first(db, 'SELECT id FROM users WHERE email = ?', [email]);
  if (existing) throw new Error('An account with this email already exists.');
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  run(
    db,
    `INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, input.name, email, input.phone, input.passwordHash, input.role ?? 'customer', now],
  );
  save(db);
  const row = first(db, 'SELECT * FROM users WHERE id = ?', [id]);
  return row ? mapUser(row) : null;
}

export async function sqliteFindUserByEmail(email: string) {
  const db = await getDb();
  const row = first(db, 'SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  return row ? mapUser(row) : null;
}

export async function sqliteGetUserById(id: string) {
  const db = await getDb();
  const row = first(db, 'SELECT * FROM users WHERE id = ?', [id]);
  return row ? mapUser(row) : null;
}

export async function sqliteSetUserRole(id: string, role: Role) {
  const db = await getDb();
  run(db, 'UPDATE users SET role = ? WHERE id = ?', [role, id]);
  save(db);
}

export async function sqliteCreateOrder(input: {
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
  const db = await getDb();
  if (!input.items.length) throw new Error('Your cart is empty.');

  db.run('BEGIN');
  try {
    type Priced = { product: Product; quantity: number; lineTotal: number };
    const priced: Priced[] = [];
    let subtotal = 0;
    for (const line of input.items) {
      const row = first(db, 'SELECT * FROM products WHERE id = ?', [line.productId]);
      if (!row) throw new Error('One of the items in your cart is no longer available.');
      const product = mapProduct(row);
      const quantity = Math.max(1, Math.min(99, Math.floor(line.quantity)));
      if (product.stock < quantity) {
        throw new Error(`${product.name} only has ${product.stock} left in stock.`);
      }
      const lineTotal = product.price * quantity;
      subtotal += lineTotal;
      priced.push({ product, quantity, lineTotal });
    }

    const fee = deliveryFeeFor(subtotal);
    const total = subtotal + fee;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const number = orderNumber();

    run(
      db,
      `INSERT INTO orders (id, order_number, user_id, customer_name, phone, division, district, area,
        address, note, payment_method, subtotal, delivery_fee, total, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Cash on Delivery', ?, ?, ?, 'pending', ?)`,
      [
        id,
        number,
        input.userId,
        input.customerName,
        input.phone,
        input.division,
        input.district,
        input.area,
        input.address,
        input.note,
        subtotal,
        fee,
        total,
        now,
      ],
    );

    for (const line of priced) {
      run(
        db,
        `INSERT INTO order_items (id, order_id, product_id, name, slug, price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          id,
          line.product.id,
          line.product.name,
          line.product.slug,
          line.product.price,
          line.quantity,
          line.lineTotal,
        ],
      );
      run(db, 'UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?', [
        line.quantity,
        now,
        line.product.id,
      ]);
    }

    db.run('COMMIT');
    save(db);
    const row = first(db, 'SELECT * FROM orders WHERE id = ?', [id]);
    if (!row) throw new Error('Order could not be created.');
    return mapOrder(row, itemsFor(db, id));
  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
}

export async function sqliteListOrdersByUser(userId: string) {
  const db = await getDb();
  return all(db, 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]).map(
    (row) => mapOrder(row, itemsFor(db, String(row.id))),
  );
}

export async function sqliteGetOrder(id: string) {
  const db = await getDb();
  const row = first(db, 'SELECT * FROM orders WHERE id = ?', [id]);
  return row ? mapOrder(row, itemsFor(db, id)) : null;
}

export async function sqliteGetOrderByNumber(number: string) {
  const db = await getDb();
  const row = first(db, 'SELECT * FROM orders WHERE order_number = ?', [number]);
  return row ? mapOrder(row, itemsFor(db, String(row.id))) : null;
}

export async function sqliteListAllOrders() {
  const db = await getDb();
  return all(db, 'SELECT * FROM orders ORDER BY created_at DESC').map((row) =>
    mapOrder(row, itemsFor(db, String(row.id))),
  );
}

export async function sqliteUpdateOrderStatus(id: string, status: string) {
  const db = await getDb();
  if (!isOrderStatus(status)) throw new Error('Unknown order status.');
  const row = first(db, 'SELECT * FROM orders WHERE id = ?', [id]);
  if (!row) return null;

  if (status === 'cancelled' && String(row.status) !== 'cancelled') {
    for (const item of itemsFor(db, id)) {
      if (item.productId) {
        run(db, 'UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.productId]);
      }
    }
  }
  run(db, 'UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  save(db);
  const updated = first(db, 'SELECT * FROM orders WHERE id = ?', [id]);
  return updated ? mapOrder(updated, itemsFor(db, id)) : null;
}

export async function sqliteAdminStats(): Promise<AdminStats> {
  const db = await getDb();
  const revenue = Number(
    first(db, "SELECT COALESCE(SUM(total), 0) AS v FROM orders WHERE status <> 'cancelled'")?.v ?? 0,
  );
  const orderCount = Number(first(db, 'SELECT COUNT(*) AS v FROM orders')?.v ?? 0);
  const pendingOrders = Number(
    first(db, "SELECT COUNT(*) AS v FROM orders WHERE status = 'pending'")?.v ?? 0,
  );
  const customerCount = Number(first(db, 'SELECT COUNT(*) AS v FROM users')?.v ?? 0);
  const lowStock = all(db, 'SELECT * FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 6').map(
    mapProduct,
  );
  const recentOrders = all(db, 'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').map((row) =>
    mapOrder(row, itemsFor(db, String(row.id))),
  );
  return { revenue, orderCount, pendingOrders, customerCount, lowStock, recentOrders };
}

export { save as sqliteSave, getDb as sqliteDb };
