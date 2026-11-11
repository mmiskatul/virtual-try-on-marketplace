'use client';

import { signOut } from 'next-auth/react';
import { marketplaceApi } from './api';

export async function logoutMarketplace(options: { callbackUrl?: string; redirect?: boolean } = {}) {
  try {
    await marketplaceApi.auth.logout();
  } catch {
    // Still proceed to clear NextAuth cookie even if backend is temporarily unreachable
  }

  if (options.redirect === false) {
    await signOut({ redirect: false });
    return;
  }

  await signOut({ callbackUrl: options.callbackUrl || '/' });
}

