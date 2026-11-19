import type { CartItem, MarketplaceProduct } from '../types';

/**
 * A size can have its own price. When it does not, the product price applies.
 * (The server makes the final decision at checkout; this is what shoppers see before that.)
 */
export function variantUnitPrice(
  product: MarketplaceProduct,
  size?: string,
  color?: string,
  variantSku?: string
): number {
  const variants = product.variants || [];
  const match =
    (variantSku ? variants.find((v) => v.sku === variantSku) : undefined) ||
    variants.find((v) => (!size || v.size === size) && (!color || v.color.toLowerCase() === color.toLowerCase())) ||
    variants.find((v) => !size || v.size === size);
  return typeof match?.price === 'number' && match.price > 0 ? match.price : product.price;
}

/** What one piece of a cart line costs. */
export const lineUnitPrice = (item: Pick<CartItem, 'product' | 'size' | 'color' | 'variantSku'>): number =>
  variantUnitPrice(item.product, item.size, item.color, item.variantSku);

/** Lowest and highest price across sizes, for product cards ("From ৳…"). */
export function priceRange(product: MarketplaceProduct): { low: number; high: number } {
  const prices = [product.price, ...(product.variants || []).map((v) => (typeof v.price === 'number' && v.price > 0 ? v.price : product.price))];
  return { low: Math.min(...prices), high: Math.max(...prices) };
}
