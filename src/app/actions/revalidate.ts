'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { requireCustomerServerAction } from '@/lib/server-auth';

/**
 * Server Action for Server-Driven Data Cache Invalidation
 * Purges Next.js fetch cache by precise tag or path.
 */
export async function revalidateCatalogTag(tag: string = 'catalog-products') {
  try {
    await requireCustomerServerAction();
    revalidateTag(tag, 'max');
    revalidatePath('/');
    return {
      success: true,
      tag,
      revalidatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Tag revalidation failed',
    };
  }
}
