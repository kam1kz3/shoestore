/**
 * Returns the price the customer pays for an item right now.
 * Bundles: bundlePrice. Products: salePrice when validly discounted, else price.
 */
export function effectivePrice(item) {
  if (item.kind === 'bundle') return item.bundlePrice
  if (isDiscounted(item)) return item.salePrice
  return item.price
}

/**
 * True if a product is actively discounted (on sale, with a sale price strictly below
 * the regular price). Bundles are never "discounted" via this helper — their bundlePrice
 * is the headline price, not a markdown.
 */
export function isDiscounted(item) {
  return item.kind !== 'bundle'
    && item.onSale === true
    && item.salePrice != null
    && item.salePrice < item.price
}
