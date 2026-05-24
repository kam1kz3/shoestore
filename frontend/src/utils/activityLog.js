/**
 * Admin activity log — append-only event stream stored in localStorage.
 * Event shape:
 *   { id, ts, type, message, meta? }
 *   - id:      stable unique id
 *   - ts:      ISO datetime string
 *   - type:    'stock' | 'sale' | 'catalog' | 'bundle' | 'order'
 *   - message: short human-readable description
 *   - meta:    optional structured payload
 */

const KEY = 'adminActivityLog'
const MAX = 200

export function loadActivity() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY))
    if (Array.isArray(stored)) return stored
  } catch { /* fall through to default */ }
  return []
}

export function logActivity({ type, message, meta }) {
  try {
    const events = loadActivity()
    const event = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: new Date().toISOString(),
      type,
      message,
      meta: meta || null,
    }
    const next = [event, ...events].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch { /* localStorage may be full or disabled */ }
}

export function clearActivity() {
  try { localStorage.removeItem(KEY) } catch { /* swallow */ }
}
