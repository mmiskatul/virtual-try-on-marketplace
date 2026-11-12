import React from 'react';
import { requireCustomerPageSession } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export default async function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCustomerPageSession('/login?callbackUrl=%2Fnotifications');
  return <>{children}</>;
}

