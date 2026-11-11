import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from 'react';
import './server-security';

export interface RawCustomerRecord {
  id: string;
  name: string;
  email: string;
  image: string;
  role: 'CUSTOMER' | 'VIP';
  passwordHash: string;
  stripeCustomerId: string;
  twoFactorSecret?: string;
  internalBillingNotes?: string;
}

export interface PublicCustomerDTO {
  id: string;
  name: string;
  email: string;
  image: string;
  role: 'CUSTOMER' | 'VIP';
}

/**
 * Fetch raw customer record from backend data store with Tainted Data Protection.
 * Both the raw object reference and its cryptographic/PII fields are tainted
 * to prevent accidental exposure down to Client Components.
 */
export async function getTaintedCustomerRecord(customerId: string): Promise<RawCustomerRecord> {
  // In production, retrieved from secure backend data layer
  const runtimeSuffix = crypto.randomUUID().replace(/-/g, '');
  const rawCustomer: RawCustomerRecord = {
    id: customerId,
    name: 'Sarah Miller',
    email: 'sarah.miller@example.com',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'CUSTOMER',
    passwordHash: `ephemeral_hash_${runtimeSuffix}`,
    stripeCustomerId: `ephemeral_cus_${runtimeSuffix}`,
    twoFactorSecret: `EPHEMERAL_2FA_${runtimeSuffix}`,
    internalBillingNotes: 'High-LTV customer; verified VIP try-on quota.',
  };

  // 1. Taint the unique secret primitives
  experimental_taintUniqueValue(
    'CRITICAL SECURITY ERROR: Attempted to pass raw customer password hash to client JavaScript!',
    rawCustomer,
    rawCustomer.passwordHash
  );

  experimental_taintUniqueValue(
    'CRITICAL SECURITY ERROR: Attempted to pass customer Stripe billing ID to client JavaScript!',
    rawCustomer,
    rawCustomer.stripeCustomerId
  );

  if (rawCustomer.twoFactorSecret) {
    experimental_taintUniqueValue(
      'CRITICAL SECURITY ERROR: Attempted to pass 2FA secret key to client JavaScript!',
      rawCustomer,
      rawCustomer.twoFactorSecret
    );
  }

  // 2. Taint the entire raw customer object reference
  experimental_taintObjectReference(
    'CRITICAL SECURITY ERROR: Raw customer database object cannot be passed directly to Client Components. Call sanitizeCustomerToDTO() to extract a clean public DTO.',
    rawCustomer
  );

  return rawCustomer;
}

/**
 * Data Transfer Object (DTO) Sanitizer: Safely extract public client-safe fields.
 */
export function sanitizeCustomerToDTO(raw: RawCustomerRecord): PublicCustomerDTO {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    image: raw.image,
    role: raw.role,
  };
}
