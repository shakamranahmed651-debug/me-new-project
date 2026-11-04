import { createHmac, timingSafeEqual } from 'node:crypto';
import crypto from 'node:crypto';

const COOKIE_NAME = 'wz_session';
const MAX_AGE = 60 * 60 * 24 * 30;

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
  // Local development fallback: deterministic per-process secret, never used in production
  // because deployments must set SESSION_SECRET.
  if (process.env.NODE_ENV === 'production') {
    if (!value) {
      return process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'waran-zone-fallback-session-key-change-me';
    }
    return value;
  }
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 'waran-zone-local-development-secret';
}

function sign(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

export function encodeSession(payload: Omit<SessionPayload, 'exp'>): string {
  const full: SessionPayload = { ...payload, exp: Date.now() + MAX_AGE * 1000 };
  const body = Buffer.from(JSON.stringify(full)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload;
    if (!payload?.uid || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = MAX_AGE;

export function randomToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}
