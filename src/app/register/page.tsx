'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthShell } from '../../components/auth/AuthShell';
import { CustomerEmailFlow } from '../../components/auth/CustomerEmailFlow';

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const prefillEmail = searchParams.get('email') || '';

  return (
    <AuthShell
      title="Join V-TRY Studio"
      subtitle="Continue with Google or enter your email to create an account or sign in."
      badge="Customer Account"
      footer={
        <p>
          Already registered?{' '}
          <Link href="/login" className="text-black hover:text-gray-700 font-semibold">
            Sign in
          </Link>
        </p>
      }
    >
      <CustomerEmailFlow callbackUrl={callbackUrl} initialEmail={prefillEmail} />
    </AuthShell>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <RegisterFormContent />
    </Suspense>
  );
}
