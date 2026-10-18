'use server';

import { getTaintedCustomerRecord, sanitizeCustomerToDTO, PublicCustomerDTO } from '@/lib/server-user';

/**
 * Server Action: Safely retrieve authenticated customer profile.
 * Even if an engineer mistakenly tries to return the raw tainted object,
 * React's experimental taint system blocks it from reaching the client!
 */
export async function fetchCustomerProfile(customerId: string = 'cust_sarah_01'): Promise<{
  success: boolean;
  profile?: PublicCustomerDTO;
  error?: string;
}> {
  try {
    const rawTaintedCustomer = await getTaintedCustomerRecord(customerId);

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
