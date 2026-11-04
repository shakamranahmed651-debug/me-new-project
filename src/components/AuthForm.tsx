'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { loginAction, registerAction, type AuthState } from '@/app/actions/auth';

const initial: AuthState = {};

export function AuthForm({ mode, next }: { mode: 'login' | 'register'; next: string }) {
  const action = mode === 'login' ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />

      {mode === 'register' && (
        <div>
          <label htmlFor="name" className="label">
            Full name
          </label>
          <input id="name" name="name" type="text" autoComplete="name" required className="field" />
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field"
          placeholder="you@example.com"
        />
      </div>

      {mode === 'register' && (
        <div>
          <label htmlFor="phone" className="label">
            Mobile number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            className="field"
            placeholder="01712345678"
          />
          <p className="mt-1.5 text-[11px] text-mocha/70">
            Bangladeshi number — used for delivery calls only.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={mode === 'register' ? 8 : undefined}
          className="field"
          placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
        />
      </div>

      {state.error && (
        <p role="alert" className="border border-red-300/60 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="border border-champagne bg-champagne/15 px-3 py-2 text-[12px] text-brown">
          {state.success}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>

      <p className="pt-2 text-center text-[11px] text-mocha">
        {mode === 'login' ? (
          <>
            New to WARAN ZONE?{' '}
            <Link href="/register" className="text-brown underline decoration-champagne underline-offset-4 hover:text-gold">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-brown underline decoration-champagne underline-offset-4 hover:text-gold">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
