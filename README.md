# SoleStore

A sneaker retail demo built with React 19. Ships with a full customer-facing storefront and a separate admin panel — both backed entirely by `localStorage` so there is no server or database to run. Admin edits flow through to the storefront in real time, and every admin action is captured in an activity log that the Audit page surfaces alongside financial breakdowns.

---

## Features

### Storefront

| Page | Description |
|---|---|
| **Home** | Hero carousel of admin-selected items with per-slot accent colours; respects sale pricing and admin-uploaded images. Empty state when admin removes every displayed product. |
| **Store** | Mosaic grid of products + bundles. Tile sizes (big / medium / small) are admin-configurable. Heart toggles wishlist; "Add to Cart" opens a size-pick modal so customers stay on the grid. Empty state when no items exist. |
| **Item detail** | Per-product gallery, EU + US size grid, wishlist toggle, add to cart. Sale pricing visible (struck-through original + sale price in red). |
| **Wishlist** | Saved items pulled from the live catalog (reflects admin edits + new products). Empty state with Browse Store CTA. |
| **Cart** | Slide-out panel in the nav. Each line item shows the price captured at add-time, so sale prices stay locked even if the admin removes the sale later. |
| **Profile / Settings** | Profile, Preferences, Security, About — all persisted per-section to localStorage. |
| **Support** | Contact form (no backend wired up). |
| **404** | Catch-all route; mounts inside the storefront shell with a Back to Home CTA. |

### Admin panel (`/admin`)

| Page | Description |
|---|---|
| **Dashboard** | Live date, KPI cards (live stock counts), recent orders, low-stock list. Stock metrics derive from the live catalog. |
| **Orders** | Monthly calendar with per-day order dots, full searchable + filterable order list, completion toggle (logged to activity feed). Today's date computed per render. |
| **Stock** | Four tabs — **Inventory** (product CRUD, multi-image upload with Canvas compression, inline edit, ± stock, per-item tile size), **Bundles** (group N products into a fixed-price bundle, shown as a big storefront tile), **Sales** (toggle on-sale + set sale price with validation), **Display** (pick the home carousel items + per-slot accent colors). Every mutation emits an activity event. |
| **Audit** | Two-in-one — chronological **activity feed** (admin events + order events merged, filterable by type) and **financial breakdowns** (gross / tax / net / AOV summary, period breakdown, revenue by product, status breakdown, full ledger). Period filter at the top scopes both halves. |
| **404** | Catch-all route inside `AdminLayout` so the sidebar stays visible. |

### Cross-cutting

- **Splash screen** — brief logo intro on first session visit (sessionStorage-gated, ~1.1s total).
- **Error boundary** — top-of-tree class component catches any render error and shows a friendly fallback with Reload / Try Again actions.
- **Dark mode** — `prefers-color-scheme: dark` is honored across the design tokens; status + product colors have light + dark variants.

---

## Tech stack

- **React 19** with the experimental React Compiler (`babel-plugin-react-compiler`)
- **Vite 8** for bundling and dev server
- **React Router v7** — `BrowserRouter` with nested admin routes + catch-all 404 routes
- **Plain CSS** — design tokens in `index.css`, scoped stylesheets per area, CSS Grid for the store mosaic
- **`localStorage`** for all persistence, **`sessionStorage`** for the splash flag (no backend required)

---

## Getting started

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start the dev server
npm run dev
```

The app opens at `http://localhost:5173`.
The admin panel is at `http://localhost:5173/admin`.

> **Demo data** is seeded automatically on the first load (cart item, wishlisted products, filled-in profile, completed orders, ten synthetic admin activity events). Clearing `localStorage` resets the demo.

---

## Architecture overview

### Data flow

- **`utils/catalog.js`** is the single source of truth for products. The static seed (`homeItems.json` + `adminData.js` inventory) is merged into a `DEFAULT_CATALOG`. `loadCatalog()` returns localStorage state if present, falls back to the seed only when the key has never been written (an explicit empty array is honored — admin can really empty the store). `saveCatalog()` writes it. Every storefront page calls `loadCatalog()` so admin edits surface immediately on next mount.
- **`utils/itemImages.js`** holds the per-item image map (`{ [itemId]: [dataUrl, ...] }`). `getItemImages(id)` returns uploaded images first; for the 5 seed items it falls back to bundled PNG assets. The admin Inventory tab also calls `getItemImages()` for its thumbnail column so admin and customer always see the same effective image.
- **`utils/activityLog.js`** is an append-only event stream capped at 200 entries. `logActivity({ type, message, meta })` is called from every admin mutation in StockPage + OrdersPage. `loadActivity()` returns the array, newest first. Consumed only by the Audit page.
- **`utils/pricing.js`** centralizes sale-pricing logic. `effectivePrice(item)` returns the bundle price for bundles, the sale price when validly discounted, otherwise the regular price. `isDiscounted(item)` is true only when on sale and the sale price is strictly less than the regular price. Used everywhere a price renders or a cart entry is created.
- **`utils/colors.js`** has the single `hexToRgba` helper used by HomePage + ItemPage to derive the `--accent-bg` / `--accent-border` CSS vars from a hex accent color.
- **`utils/seedDemo.js`** writes initial demo data on first load only, gated by a `demoSeeded_v1` flag.

### Routing

`App.jsx` checks the URL for an `/admin` prefix and renders one of two route trees:

- **Storefront**: `NavigationBar` + `<Routes>` for `/`, `/store`, `/item/:id`, `/wishlist`, `/profile`, `/support`, and `*` → `NotFound`.
- **Admin**: `<Routes>` for `/admin/*` nested under `AdminLayout`, with index redirect to `/admin/dashboard` and `*` → `NotFound` inside the layout.

The whole tree is wrapped in `<ErrorBoundary>`, with `<Splash>` rendered exclusively on first session visit.

### Design system

- **Tokens** live in [`index.css`](frontend/src/index.css) — foreground / background / border scales, accent (dynamic per item), shadow, product palette, status colors (with `--status-danger-*` for destructive actions), admin sidebar palette, plus type / weight / leading / tracking scales.
- **Dark mode** overrides foreground, background, accent, shadow, status text, and product palette inside a `@media (prefers-color-scheme: dark)` block.
- **Legacy aliases** (`--text`, `--text-h`, `--text-s`) point at `--fg2 / --fg1 / --fg3` so existing CSS keeps working while new code can adopt the richer scale.

### Activity log instrumentation pattern

Each admin mutation in `StockPage` / `OrdersPage` follows this shape:

```js
import { logActivity } from '../../utils/activityLog.js'

function someMutation(...) {
  // perform the mutation
  logActivity({
    type: 'stock' | 'sale' | 'catalog' | 'bundle' | 'order',
    message: 'human-readable description',
    meta: { /* optional structured payload */ },
  })
}
```

To instrument a new admin action: pick the closest type, write the message in past tense, include identifying info in `meta`. The Audit page picks it up automatically.

---

## Project structure

```
frontend/
├── public/
│   └── favicon.svg
└── src/
    ├── assets/                       # Bundled PNGs for the 5 seed items
    ├── components/
    │   ├── NavigationBar.jsx         # Top nav + cart dropdown + menu dropdown
    │   ├── SizePanel.jsx             # Size-pick modal (single product)
    │   ├── BundleSizePanel.jsx       # Multi-step size-pick modal (bundles)
    │   ├── NotFound.jsx              # 404 page (storefront + admin)
    │   ├── ErrorBoundary.jsx         # Top-level error catcher
    │   └── Splash.jsx                # First-session intro
    ├── data/
    │   ├── homeItems.json            # Static product seed
    │   └── adminData.js              # Static order + inventory seed (dates rebased to today)
    ├── pages/
    │   ├── HomePage.jsx              # Hero carousel
    │   ├── StorePage.jsx             # Mosaic grid (products + bundles)
    │   ├── ItemPage.jsx              # Item detail
    │   ├── WishlistPage.jsx          # Saved items
    │   ├── ProfilePage.jsx           # Profile / Preferences / Security / About
    │   ├── SupportPage.jsx           # Contact form
    │   └── admin/
    │       ├── AdminLayout.jsx       # Sidebar shell
    │       ├── DashboardPage.jsx     # KPIs + recent orders + low stock
    │       ├── OrdersPage.jsx        # Calendar + filterable order list
    │       ├── StockPage.jsx         # Inventory / Bundles / Sales / Display tabs
    │       └── AuditPage.jsx         # Activity feed + financial breakdowns
    ├── utils/
    │   ├── catalog.js                # Product catalog read/write
    │   ├── itemImages.js             # Per-item image store (admin uploads + bundled fallback)
    │   ├── activityLog.js            # Admin event stream (append-only, cap 200)
    │   ├── pricing.js                # effectivePrice + isDiscounted
    │   ├── colors.js                 # hexToRgba helper
    │   └── seedDemo.js               # One-time demo data seed
    ├── App.jsx                       # Routing + cart/wishlist state + ErrorBoundary + Splash
    ├── main.jsx                      # createRoot
    ├── App.css                       # Storefront styles
    ├── admin.css                     # Admin styles
    └── index.css                     # Design tokens + reset + base type
```

---

## localStorage keys

| Key | Contents |
|---|---|
| `adminInventory` | Full product catalog (persists admin edits). Explicit `[]` is honored. |
| `adminDisplayOrder` | Homepage carousel item order |
| `displayAccentColors` | Per-slot accent colours for the home carousel |
| `itemImages` | Compressed base64 images per product id (uploaded — bundled assets are the fallback) |
| `cart` | Active cart entries; `price` is the value captured at add-time |
| `wishlist` | Wishlisted product ids |
| `userProfile` | Username, display name, bio, avatar colour, visibility |
| `userPreferences` | Language, currency, default size, notifications |
| `userSecurity` | Email address, 2FA toggle |
| `adminOrderCompletion` | Set of order ids marked complete |
| `adminActivityLog` | Append-only event stream (last 200 admin actions) |
| `demoSeeded_v1` | Flag — prevents demo seed from running more than once |

### sessionStorage keys

| Key | Contents |
|---|---|
| `splashSeen` | Set after the splash plays so it only shows once per browser session |

---

## Common operations

**Reset everything** (clear seeded demo + all admin edits):
```js
localStorage.clear(); sessionStorage.clear(); location.reload()
```

**Skip the splash for the rest of the session**: it already self-flags after one play. To replay it: `sessionStorage.removeItem('splashSeen')` then reload.

**Inspect the activity log**:
```js
JSON.parse(localStorage.getItem('adminActivityLog'))
```

---

## Known limitations

- **No backend.** Orders can't actually be placed; the customer support form is a no-op. The cart "Checkout" flow ends at the cart panel.
- **localStorage quota.** Image uploads are downsampled but a fully populated store with 10+ items × 5 images can still approach the ~5MB browser cap. The image-write paths have try/catch but no user-facing quota error.
- **`TODAY` reactivity.** `new Date()` is computed per render in Dashboard / Orders. An idle tab open across midnight won't refresh until the next interaction.
- **No tests.** Not appropriate for a portfolio demo; would be the first thing to add for production.

---

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
