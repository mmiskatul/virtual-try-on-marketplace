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
      title="Create your V-TRY account"
      subtitle="Sign up with Google or create an account with your email to start trying on styles."
      badge="Customer Account"
      footer={
        <p>
          Already have an account?{' '}
          <Link href="/login" className="text-black hover:text-gray-700 font-semibold">
            Log in
          </Link>
        </p>
      }
    >
      <CustomerEmailFlow initialMode="signup" callbackUrl={callbackUrl} initialEmail={prefillEmail} />
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
