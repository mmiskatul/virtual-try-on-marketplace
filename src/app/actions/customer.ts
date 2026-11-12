'use server';

import { getTaintedCustomerRecord, sanitizeCustomerToDTO, PublicCustomerDTO } from '@/lib/server-user';
import { requireCustomerServerAction } from '@/lib/server-auth';

/**
 * Server Action: Safely retrieve authenticated customer profile.
 * Even if an engineer mistakenly tries to return the raw tainted object,
 * React's experimental taint system blocks it from reaching the client!
 */
export async function fetchCustomerProfile(customerId?: string): Promise<{
  success: boolean;
  profile?: PublicCustomerDTO;
  error?: string;
}> {
  try {
    const session = await requireCustomerServerAction();
    const targetCustomerId = customerId && customerId === session.userId ? customerId : session.userId;
    const rawTaintedCustomer = await getTaintedCustomerRecord(targetCustomerId);

    // Secure DTO Sanitization: Strips passwordHash, stripeCustomerId, twoFactorSecret
    const publicProfile = sanitizeCustomerToDTO(rawTaintedCustomer);

    return {
      success: true,
      profile: publicProfile,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch customer profile safely',
    };
  }
}
