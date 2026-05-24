/**
 * Per-item image store. Admin uploads (data URLs) live in localStorage under
 * `itemImages`, keyed by item id. For the 5 seed items, a bundled PNG asset
 * acts as the fallback when no uploads exist. getItemImages() resolves the
 * effective image list (uploads first, asset second); used by storefront and
 * by admin in equal measure so both always see the same image.
 */
import img1 from '../assets/home_display_item_1.png'
import img2 from '../assets/home_display_item_2.png'
import img3 from '../assets/home_display_item_3.png'
import img4 from '../assets/home_display_item_4.png'
import img5 from '../assets/home_display_item_5.png'

const ASSET_MAP = { 1: img1, 2: img2, 3: img3, 4: img4, 5: img5 }

/** Returns the image array for an item: uploaded images take priority, asset image is fallback. */
export function getItemImages(itemId) {
  try {
    const stored = JSON.parse(localStorage.getItem('itemImages')) || {}
    const uploaded = stored[itemId]
    if (uploaded?.length) return uploaded
  } catch { /* fall through to default */ }
  const asset = ASSET_MAP[itemId]
  return asset ? [asset] : []
}

/** Saves an image array for a single item to localStorage. */
export function saveItemImages(itemId, images) {
  try {
    const stored = JSON.parse(localStorage.getItem('itemImages')) || {}
    stored[itemId] = images
    localStorage.setItem('itemImages', JSON.stringify(stored))
  } catch { /* fall through to default */ }
}

/** Loads the full { [itemId]: [url, ...] } map from localStorage. */
export function loadAllItemImages() {
  try { return JSON.parse(localStorage.getItem('itemImages')) || {} }
  catch { return {} }
}
