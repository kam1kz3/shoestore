/**
 * Shared catalog utility — the single source of truth for all products.
 *
 * The static files (homeItems.json + adminData.js inventory) are merged
 * into a DEFAULT_CATALOG used only as a fallback when localStorage is empty.
 * All admin mutations call saveCatalog() so the data persists across reloads,
 * and all store/item pages call loadCatalog() so they always reflect admin changes.
 */
import homeItemsData from '../data/homeItems.json'
import { inventory as adminInventoryData } from '../data/adminData.js'

// Default tile sizes for the original 5 items.
// big(2×3) + medium(1×2) + medium(1×2) fills 3 cols × 4 rows with no gaps:
//   row 1-3: big(cols 1-2) | med1(col 3, rows 1-2) then med2(col 3, rows 3-4)
//   row 4:   small(col 1)  | small(col 2)           | med2 (bottom half)
const DEFAULT_TILE_SIZES = ['big', 'medium', 'medium', 'small', 'small']

const DEFAULT_CATALOG = homeItemsData.map((h, idx) => {
  const inv = adminInventoryData.find(i => i.id === h.id) || {}
  return {
    id:          h.id,
    brand:       h.brand,
    name:        h.name,
    colorway:    h.colorway,
    price:       h.price,
    tag:         h.tag         ?? null,
    description: h.description ?? '',
    accentColor: h.accentColor ?? '#08060d',
    tileSize:    DEFAULT_TILE_SIZES[idx] || 'small',
    stock:       inv.stock     ?? 0,
    onSale:      inv.onSale    ?? false,
    salePrice:   inv.salePrice ?? null,
  }
})

/** Returns the full product catalog. Reads localStorage, falls back to merged defaults. */
export function loadCatalog() {
  try {
    const stored = JSON.parse(localStorage.getItem('adminInventory'))
    // Honour an explicit empty array — admin may have removed every item on purpose.
    // Only fall back to DEFAULT_CATALOG when the key has never been written.
    if (Array.isArray(stored)) {
      // Normalise older stored items that pre-date the tileSize field
      return stored.map(item => ({ tileSize: 'small', ...item }))
    }
  } catch { /* fall through to default */ }
  return DEFAULT_CATALOG
}

/** Persists the full product catalog to localStorage. */
export function saveCatalog(items) {
  try { localStorage.setItem('adminInventory', JSON.stringify(items)) } catch { /* localStorage may be full or disabled */ }
}

/** Returns the homepage display order (array of item IDs). */
export function loadDisplayOrder() {
  try {
    const stored = JSON.parse(localStorage.getItem('adminDisplayOrder'))
    if (Array.isArray(stored) && stored.length) return stored
  } catch { /* fall through to default */ }
  return DEFAULT_CATALOG.slice(0, 5).map(i => i.id)
}

/** Persists the homepage display order to localStorage. */
export function saveDisplayOrder(order) {
  try { localStorage.setItem('adminDisplayOrder', JSON.stringify(order)) } catch { /* localStorage may be full or disabled */ }
}
