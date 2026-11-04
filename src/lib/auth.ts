import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminEmail } from '@/lib/admin';
import { usingSupabase } from '@/lib/db';
import { SESSION_COOKIE, decodeSession } from '@/lib/session';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { Role, User } from '@/lib/types';

export interface AuthContext {
  user: User | null;
  provider: 'supabase' | 'local';
  supabaseUserId?: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  if (usingSupabase()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      const email = (profile?.email as string) ?? user.email ?? '';
      const role: Role = isAdminEmail(email) || profile?.role === 'admin' ? 'admin' : 'customer';
      return {
        id: user.id,
        name: (profile?.name as string) || (user.user_metadata?.name as string) || email.split('@')[0],
        email,
        phone: (profile?.phone as string) ?? '',
        role,
        createdAt: (profile?.created_at as string) ?? user.created_at ?? new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  const session = decodeSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const role: Role = isAdminEmail(session.email) ? 'admin' : session.role;
  return {
    id: session.uid,
    name: session.name,
    email: session.email,
    phone: '',
    role,
    createdAt: '',
  };
}

export async function requireUser(redirectTo = '/login'): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'admin') redirect('/?denied=admin');
  return user;
}
