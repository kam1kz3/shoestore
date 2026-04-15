# SoleStore

A sneaker retail demo built with React 19. Ships with a full customer-facing storefront and a separate admin panel — both backed entirely by `localStorage` so there is no server or database to run.

---

## Features

### Storefront

| Page | Description |
|---|---|
| **Home** | Hero section + interactive item carousel with dynamic accent colours |
| **Store** | Mosaic product grid — tile sizes (big / medium / small) are admin-configurable |
| **Item detail** | Per-product gallery, size selector (EU & US), wishlist toggle, add to cart |
| **Wishlist** | Saved items with quick-add-to-cart |
| **Cart** | Slide-out cart panel in the nav with line-item removal |
| **Profile / Settings** | Profile, Preferences, Security, and About sections with localStorage persistence |
| **Support** | Contact / help form |

### Admin panel (`/admin`)

| Page | Description |
|---|---|
| **Dashboard** | Live date, KPI cards, recent activity, quick-nav to today's orders |
| **Orders** | Monthly calendar with per-day order dots, full searchable + filterable order list, completion toggle |
| **Stock** | Inventory table (CRUD), image uploads with Canvas compression, per-item tile-size picker, sale management, homepage display order + accent colours |
| **Audit** | Activity log |

---

## Tech stack

- **React 19** with the experimental React Compiler (`babel-plugin-react-compiler`)
- **Vite 8** for bundling and dev server
- **React Router v7** — `BrowserRouter` with nested admin routes
- **Plain CSS** — custom properties for theming, CSS Grid for the store mosaic
- **`localStorage`** for all persistence (no backend required)

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

> **Demo data** is seeded automatically on the first load (cart item, wishlisted products, filled-in profile, completed orders). Clearing `localStorage` resets the demo.

---

## Project structure

```
frontend/
├── public/
│   └── favicon.svg
└── src/
    ├── assets/              # Bundled product images (items 1–5)
    ├── components/
    │   ├── navigationBar.jsx
    │   ├── SizePanel.jsx    # Quick size-select slide-up (store grid)
    │   └── HomePage.jsx     # Hero section component
    ├── data/
    │   ├── homeItems.json   # Static fallback product data
    │   └── adminData.js     # Static fallback orders + inventory
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── StorePage.jsx
    │   ├── ItemPage.jsx
    │   ├── WishlistPage.jsx
    │   ├── ProfilePage.jsx
    │   ├── SupportPage.jsx
    │   └── admin/
    │       ├── AdminLayout.jsx
    │       ├── DashboardPage.jsx
    │       ├── OrdersPage.jsx
    │       ├── StockPage.jsx
    │       └── AuditPage.jsx
    ├── utils/
    │   ├── catalog.js       # Shared product catalog (read/write localStorage)
    │   ├── itemImages.js    # Shared image store (read/write localStorage)
    │   └── seedDemo.js      # One-time demo data seed
    ├── App.jsx
    ├── App.css              # All storefront styles
    ├── admin.css            # All admin styles
    └── index.css            # CSS reset + global custom properties
```

---

## localStorage keys

| Key | Contents |
|---|---|
| `adminInventory` | Full product catalog (persists admin edits) |
| `adminDisplayOrder` | Homepage carousel item order |
| `displayAccentColors` | Per-slot accent colours for the carousel |
| `itemImages` | Compressed base64 images per product ID |
| `cart` | Active cart items |
| `wishlist` | Wishlisted product IDs |
| `userProfile` | Username, display name, bio, avatar colour, visibility |
| `userPreferences` | Language, currency, default size, notifications |
| `userSecurity` | Email address, 2FA toggle |
| `adminOrderCompletion` | Set of order IDs marked complete |
| `demoSeeded_v1` | Flag — prevents demo seed from running more than once |

---

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
