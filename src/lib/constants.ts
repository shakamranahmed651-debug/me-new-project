export const CURRENCY = '৳';
export const DELIVERY_FEE = 80;
export const FREE_DELIVERY_THRESHOLD = 5000;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function formatPrice(amount: number): string {
  return `${CURRENCY}${Math.round(amount).toLocaleString('en-US')}`;
}

export function deliveryFeeFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

/** Bangladeshi mobile numbers: 01[3-9] followed by 8 digits, optionally +880 / 880 prefixed. */
export function normalizeBdPhone(input: string): string | null {
  const digits = input.replace(/[\s\-()]/g, '');
  let local = digits;
  if (local.startsWith('+880')) local = '0' + local.slice(4);
  else if (local.startsWith('880')) local = '0' + local.slice(3);
  if (!/^01[3-9]\d{8}$/.test(local)) return null;
  return local;
}

export function formatPhone(phone: string): string {
  if (/^01[3-9]\d{8}$/.test(phone)) return `${phone.slice(0, 4)}-${phone.slice(4)}`;
  return phone;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export const BD_DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
] as const;
