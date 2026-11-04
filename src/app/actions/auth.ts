'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminEmail } from '@/lib/admin';
import { normalizeBdPhone } from '@/lib/constants';
import { countUsers, createUser, findUserByEmail, usingSupabase } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { SESSION_COOKIE, SESSION_MAX_AGE, encodeSession } from '@/lib/session';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { Role } from '@/lib/types';

export interface AuthState {
  error?: string;
  success?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function safeNext(value: string, fallback: string): string {
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

async function startLocalSession(input: { uid: string; email: string; name: string; role: Role }) {
  const token = encodeSession(input);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = text(formData, 'name');
  const email = text(formData, 'email').toLowerCase();
  const phone = text(formData, 'phone');
  const password = String(formData.get('password') ?? '');
  const next = safeNext(text(formData, 'next'), '/account');

  if (name.length < 2) return { error: 'Please enter your full name.' };
  if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  const normalizedPhone = normalizeBdPhone(phone);
  if (!normalizedPhone) {
    return { error: 'Enter a valid Bangladeshi mobile number, for example 01712345678.' };
  }

  if (usingSupabase()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone: normalizedPhone } },
      });
      if (error) return { error: error.message };
      if (!data.session) {
        return {
          success: 'Account created. Confirm your email address, then sign in to continue.',
        };
      }
      await supabase.from('profiles').upsert({ id: data.user?.id, name, email, phone: normalizedPhone });
    } catch {
      return { error: 'We could not reach the authentication service. Please try again.' };
    }
    redirect(next);
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) return { error: 'An account with this email already exists. Please sign in.' };
    // Bootstrap convenience: the very first local account becomes the store admin.
    const isFirstUser = (await countUsers()) === 0;
    const role: Role = isAdminEmail(email) || isFirstUser ? 'admin' : 'customer';
    const created = await createUser({
      name,
      email,
      phone: normalizedPhone,
      passwordHash: hashPassword(password),
      role,
    });
    if (!created) return { error: 'We could not create your account. Please try again.' };
    await startLocalSession({ uid: created.id, email: created.email, name: created.name, role });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'We could not create your account.',
    };
  }

  redirect(next);
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, 'email').toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = safeNext(text(formData, 'next'), '/account');

  if (!EMAIL_RE.test(email) || password.length === 0) {
    return { error: 'Enter your email address and password.' };
  }

  if (usingSupabase()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: 'Those credentials do not match our records.' };
    } catch {
      return { error: 'We could not reach the authentication service. Please try again.' };
    }
    redirect(next);
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return { error: 'Those credentials do not match our records.' };
    }
    const role: Role = isAdminEmail(user.email) ? 'admin' : user.role;
    await startLocalSession({ uid: user.id, email: user.email, name: user.name, role });
  } catch {
    return { error: 'We could not sign you in. Please try again.' };
  }

  redirect(next);
}

export async function logoutAction(): Promise<void> {
  if (usingSupabase()) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // Signing out locally still clears the browser state below.
    }
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/');
}
