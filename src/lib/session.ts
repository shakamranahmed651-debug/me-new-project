import { createHmac, timingSafeEqual } from 'node:crypto';
import { SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/cookies';

export interface SessionPayload {
  uid: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  exp: number;
}

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 16) return value;
  // Never bake a real secret into the repo. Deployments must provide SESSION_SECRET;
  // this derived fallback only keeps local/offline runs working.
  return createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'waran-zone')
    .update('waran-zone-session-v1')
    .digest('hex');
}

function sign(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

export function encodeSession(payload: Omit<SessionPayload, 'exp'>): string {
  const full: SessionPayload = { ...payload, exp: Date.now() + SESSION_MAX_AGE * 1000 };
  const body = Buffer.from(JSON.stringify(full)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = sign(body);
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload;
    if (!payload?.uid || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, SESSION_MAX_AGE };
