import { revalidatePath } from 'next/cache';

/**
 * Revalidate all cached pages after an admin write operation.
 * Uses layout-level revalidation so every page under '/' is refreshed.
 */
export function revalidateAll() {
  revalidatePath('/', 'layout');
}
