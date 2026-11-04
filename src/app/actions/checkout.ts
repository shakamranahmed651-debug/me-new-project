'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { BD_DIVISIONS, normalizeBdPhone } from '@/lib/constants';
import { createOrder } from '@/lib/db';

export interface CheckoutState {
  error?: string;
}

const MAX_QTY = 99;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

export async function placeOrderAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?next=/checkout');
  }

  const customerName = text(formData, 'customerName');
  const phone = text(formData, 'phone');
  const division = text(formData, 'division');
  const district = text(formData, 'district');
  const area = text(formData, 'area');
  const address = text(formData, 'address');
  const note = text(formData, 'note');
  const paymentMethod = text(formData, 'paymentMethod') || 'cod';

  let items: { productId: string; quantity: number }[] = [];
  try {
    const parsed = JSON.parse(text(formData, 'items')) as unknown;
    if (Array.isArray(parsed)) {
      items = parsed
        .map((line) => {
          const record = line as { productId?: unknown; quantity?: unknown };
          return {
            productId: String(record?.productId ?? ''),
            quantity: Math.min(MAX_QTY, Math.max(0, Math.floor(Number(record?.quantity) || 0))),
          };
        })
        .filter((line) => line.productId.length > 0 && line.quantity > 0);
    }
  } catch {
    items = [];
  }

  if (!items.length) return { error: 'Your cart is empty. Add a piece before checking out.' };
  if (customerName.length < 2) return { error: 'Please enter the full name for delivery.' };
  const normalizedPhone = normalizeBdPhone(phone);
  if (!normalizedPhone) {
    return { error: 'Enter a valid Bangladeshi mobile number, for example 01712345678.' };
  }
  if (!(BD_DIVISIONS as readonly string[]).includes(division)) {
    return { error: 'Please choose your division.' };
  }
  if (district.length < 2) return { error: 'Please enter your district or city.' };
  if (address.length < 10) {
    return { error: 'Please enter a complete delivery address (at least 10 characters).' };
  }
  if (paymentMethod !== 'cod') return { error: 'Only cash on delivery is available right now.' };

  let orderNumber: string;
  try {
    const order = await createOrder({
      userId: user.id,
      customerName,
      phone: normalizedPhone,
      division,
      district,
      area,
      address,
      note,
      items,
    });
    orderNumber = order.orderNumber;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'We could not place your order. Please try again.',
    };
  }

  redirect(`/order/${orderNumber}`);
}
