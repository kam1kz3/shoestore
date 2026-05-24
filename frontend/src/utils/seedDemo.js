/**
 * Seeds localStorage with realistic demo data on first load.
 * Each key is only written if it doesn't already exist, so user
 * interactions are never overwritten.
 */

const SEED_FLAG = 'demoSeeded_v1'

const SEEDS = {
  userProfile: {
    username: 'jsneaks',
    displayName: 'Jordan Sneaker',
    bio: 'Sneakerhead since 2012. Always on the hunt for the next grail. Current rotation: 12 pairs and counting.',
    avatarColor: '#7b6ec9',
    visibility: 'public',
  },

  userPreferences: {
    language: 'English',
    currency: 'USD',
    defaultSize: '42',
    sizeSystem: 'EU',
    newsletter: true,
    orderUpdates: true,
    newArrivals: false,
  },

  userSecurity: {
    email: 'jordan@solestore.com',
    twoFactor: false,
  },

  // Items 2 (BADBO 1.0) and 4 (Force 1 Low) are pre-wishlisted
  wishlist: [2, 4],

  // One item already sitting in the cart
  cart: [
    {
      cartId: '3-42-1712000000001',
      id: 3,
      brand: 'Nike Kobe Dunk Low',
      name: "Proto 'Lower Merion",
      colorway: "'Aces Home'",
      price: 229.99,
      sizeEu: 42,
      sizeUs: 8.5,
    },
  ],

  // First 9 orders (all delivered) pre-marked complete
  adminOrderCompletion: [
    'ORD-001', 'ORD-002', 'ORD-003',
    'ORD-004', 'ORD-005', 'ORD-006',
    'ORD-007', 'ORD-008', 'ORD-009',
  ],
}

// Demo activity log — synthetic admin events scattered over the past few weeks.
// Generated each first-load so timestamps stay relative to "now".
function buildDemoActivity() {
  const now = Date.now()
  const hoursAgo = h => new Date(now - h * 3600_000).toISOString()
  const id = i => `act-seed-${i}`
  return [
    { id: id(1),  ts: hoursAgo(2),   type: 'order',   message: 'ORD-019 marked complete (Sena Darko · Yeezy Boost 350 V2)', meta: { orderId: 'ORD-019', complete: true } },
    { id: id(2),  ts: hoursAgo(5),   type: 'stock',   message: 'Stock for BADBO 1.0: 14 → 13',                              meta: { from: 14, to: 13 } },
    { id: id(3),  ts: hoursAgo(28),  type: 'sale',    message: 'Proto \'Lower Merion put on sale at $189.99',               meta: { onSale: true, salePrice: 189.99 } },
    { id: id(4),  ts: hoursAgo(52),  type: 'catalog', message: 'Edited Foamposite Pro: price 319.99 → 299.99',              meta: { field: 'price' } },
    { id: id(5),  ts: hoursAgo(78),  type: 'stock',   message: 'Stock for Force 1 Low \'Lower Merion\': 4 → 6',             meta: { from: 4, to: 6 } },
    { id: id(6),  ts: hoursAgo(120), type: 'order',   message: 'ORD-013 marked complete (Fiifi Acheampong · Jordan Jumpman Jack TR)', meta: { orderId: 'ORD-013', complete: true } },
    { id: id(7),  ts: hoursAgo(168), type: 'stock',   message: 'Stock for Jordan Jumpman Jack TR: 12 → 8',                  meta: { from: 12, to: 8 } },
    { id: id(8),  ts: hoursAgo(216), type: 'catalog', message: 'Edited Air Force 1 Low: tag null → New Arrival',            meta: { field: 'tag' } },
    { id: id(9),  ts: hoursAgo(312), type: 'stock',   message: 'Stock for Foamposite Pro: 5 → 2',                           meta: { from: 5, to: 2 } },
    { id: id(10), ts: hoursAgo(480), type: 'sale',    message: 'Proto \'Lower Merion taken off sale',                       meta: { onSale: false } },
  ]
}

export function seedDemo() {
  // Already seeded in this browser — don't touch anything
  if (localStorage.getItem(SEED_FLAG)) return

  for (const [key, value] of Object.entries(SEEDS)) {
    // Only write if the key is genuinely absent
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  // Seed the activity log with synthetic admin events (relative to now)
  if (localStorage.getItem('adminActivityLog') === null) {
    localStorage.setItem('adminActivityLog', JSON.stringify(buildDemoActivity()))
  }

  localStorage.setItem(SEED_FLAG, '1')
}
