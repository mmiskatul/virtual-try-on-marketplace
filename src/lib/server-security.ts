import {
  experimental_taintUniqueValue,
  experimental_taintObjectReference,
} from 'react';

/**
 * Tainted Data Protection: Backend Security Keys
 * Uses React's experimental_taintUniqueValue to permanently block internal secrets,
 * API tokens, and encryption keys from ever being leaked or passed across the
 * React Server Component (RSC) boundary into client-side JavaScript.
 */
export function taintServerSecret(
  secretValue: string | undefined | null,
  secretIdentifier: string
): void {
  if (!secretValue || typeof secretValue !== 'string') {
    return;
  }

  try {
    experimental_taintUniqueValue(
      `[SECURITY ERROR] Critical Security Violation: Backend secret or API key "${secretIdentifier}" cannot be leaked to client-side JavaScript bundles.`,
      globalThis,
      secretValue
    );
  } catch (error) {
    // Graceful handling if executed in an environment without active taint runtime
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Taint Warning] Failed to taint secret "${secretIdentifier}":`, error);
    }
  }
}

/**
 * Tainted Data Protection: Raw User & Tenant Objects
 * Uses React's experimental_taintObjectReference to lock down full database records,
 * payment profiles, and un-sanitized user objects. If passed directly to a Client Component,
 * React immediately throws a build/runtime boundary exception.
 */
export function taintRawUserData<T extends object>(
  rawData: T,
  resourceName: string = 'Raw User Record'
): T {
  if (!rawData || typeof rawData !== 'object') {
    return rawData;
  }

  try {
    experimental_taintObjectReference(
      `[SECURITY ERROR] Data Leak Violation: ${resourceName} contains sensitive server-only properties and cannot be passed directly to Client Components. Extract a sanitized Public DTO first.`,
      rawData
    );
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Taint Warning] Failed to taint object reference for "${resourceName}":`, error);
    }
  }

  return rawData;
}

/**
 * Tainted Data Protection: Specific Unique User Fields
 * Protects specific sensitive user primitives such as password hashes, payment tokens,
 * internal customer IDs, or session nonces from crossing the client boundary.
 */
export function taintSensitiveUserField(
  fieldValue: string | undefined | null,
  fieldName: string,
  lifetime: object = globalThis
): void {
  if (!fieldValue || typeof fieldValue !== 'string') {
    return;
  }

  try {
    experimental_taintUniqueValue(
      `[SECURITY ERROR] PII Violation: Sensitive user field "${fieldName}" cannot be transmitted to client components.`,
      lifetime,
      fieldValue
    );
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Taint Warning] Failed to taint unique user field "${fieldName}":`, error);
    }
  }
}

// Automatically taint platform server secrets upon module evaluation in Server context
const SERVER_SECRETS_TO_PROTECT: Array<[string | undefined, string]> = [
  [process.env.NEXTAUTH_SECRET, 'NEXTAUTH_SECRET'],
  [process.env.GOOGLE_CLIENT_SECRET, 'GOOGLE_CLIENT_SECRET'],
  [process.env.GITHUB_SECRET, 'GITHUB_SECRET'],
  [process.env.INTERNAL_SERVICE_KEY, 'INTERNAL_SERVICE_KEY'],
  [process.env.DATABASE_URL, 'DATABASE_URL'],
  [process.env.AI_ENGINE_KEY, 'AI_ENGINE_KEY'],
  [process.env.MARKETPLACE_API_KEY, 'MARKETPLACE_API_KEY'],
];

for (const [secret, name] of SERVER_SECRETS_TO_PROTECT) {
  if (secret) {
    taintServerSecret(secret, name);
  }
}
