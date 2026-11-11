'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';

function SessionTokenSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (status === 'authenticated' && session?.backendToken) {
      localStorage.setItem('marketplace_token', session.backendToken);
    }
  }, [session?.backendToken, status]);

  return null;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      })
  );

  return (
    <SessionProvider>
      <SessionTokenSync />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
