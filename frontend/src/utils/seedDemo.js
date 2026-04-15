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

export function seedDemo() {
  // Already seeded in this browser — don't touch anything
  if (localStorage.getItem(SEED_FLAG)) return

  for (const [key, value] of Object.entries(SEEDS)) {
    // Only write if the key is genuinely absent
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  localStorage.setItem(SEED_FLAG, '1')
}
