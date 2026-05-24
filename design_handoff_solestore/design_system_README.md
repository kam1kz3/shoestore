# SoleStore Design System

SoleStore is a sneaker retail demo — a full-featured e-commerce storefront paired with a separate admin panel. It is built in React 19 / Vite with plain CSS custom properties for theming, and all data persisted in `localStorage` (no backend).

**Sources provided:**
- Local codebase: `shoe_store/` (mounted via File System Access API)
  - `shoe_store/frontend/src/App.css` — all storefront styles (~2500 lines)
  - `shoe_store/frontend/src/admin.css` — all admin styles (~1100 lines)
  - `shoe_store/frontend/src/index.css` — CSS reset + global custom properties
  - `shoe_store/frontend/src/components/` — NavigationBar, SizePanel, HomePage
  - `shoe_store/frontend/src/pages/` — all storefront + admin pages

---

## Products / Surfaces

| Surface | Description |
|---|---|
| **Storefront** | Customer-facing web app: Home hero carousel, mosaic Store grid, Item detail page, Wishlist, Cart slide-out, Profile/Settings, Support |
| **Admin panel** | `/admin` — Dashboard KPIs, Orders calendar, Stock CRUD, Audit log |

---

## Content Fundamentals

**Tone:** Clean, direct, confident. Sneaker-culture aware without being overwhelming. Copy treats the customer as a knowledgeable enthusiast, not a casual shopper.

**Casing:**
- Labels and section headers: ALL CAPS with generous letter-spacing (`letter-spacing: 0.08–0.12em`). E.g. "NEW ARRIVAL", "SIZE", "ADD TO CART".
- Product names and descriptions: Title Case / sentence case.
- Button text: ALL CAPS, spaced. E.g. "SHOP NOW", "ADD TO CART", "SEND MESSAGE".
- Nav links: ALL CAPS, tracked. E.g. "HOME", "STORE", "SUPPORT".

**Voice:**
- Concise product descriptions, 1–2 sentences. Focus on material, technology, and collaboration context.
- No marketing fluff — product details are factual and specific.
- Tag badges are short and punchy: "New Arrival", "Best Seller", "Limited Edition", "Heritage", "Sale".

**Examples of copy style:**
- "A Travis Scott collaboration reimagining the Jumpman Jack silhouette with earthy tones and signature reversed Swoosh detailing."
- "High-frequency Primeknit construction with full-length Boost cushioning in the unmistakable black and white Zebra print."
- "Items you add will appear here." (empty-state — plain, no punctuation drama)
- "All items are well stocked." (admin — similarly matter-of-fact)

**Emoji:** Not used. No emoji anywhere in the UI.

**Numbers:** Prices always formatted as `$XXX.XX` (two decimal places). Order IDs in monospace.

**Error states:** Short, lowercase labels in red: "Select a size" style. No exclamation marks.

---

## Visual Foundations

### Colors

**Light mode (default):**
| Token | Value | Usage |
|---|---|---|
| `--text` | `#6b6375` | Body text, labels, secondary copy |
| `--text-h` | `#08060d` | Headings, prices, primary text |
| `--bg` | `#ffffff` | Page background |
| `--border` | `#e5e4e7` | All borders, dividers |
| `--code-bg` | `#f4f3ec` | Image backgrounds, code blocks, subtle fills |
| `--accent` | `#000000` | Interactive accent (buttons, active states, brand marks) |
| `--accent-bg` | `rgba(8,6,13,0.06)` | Tinted fill for accent elements |
| `--accent-border` | `rgba(8,6,13,0.2)` | Subtle border for accent elements |
| `--shadow` | `rgba(0,0,0,0.1) 0 10px 15px -3px, rgba(0,0,0,0.05) 0 4px 6px -2px` | Card hover shadows |

**Dark mode** (`prefers-color-scheme: dark`):
| Token | Value |
|---|---|
| `--text` | `#9ca3af` |
| `--text-h` | `#f3f4f6` |
| `--bg` | `#1E1E1E` |
| `--border` | `#2e303a` |
| `--code-bg` | `#1f2028` |
| `--accent` | `#ffffff` |
| `--accent-bg` | `rgba(255,255,255,0.1)` |

**Admin sidebar:** Hard-coded dark background `#0e0c13`, white text at various opacities (0.55 default, 1.0 active, 0.4 muted).

**Dynamic accent colors (per product):** The homepage carousel applies a per-item accent color derived from product data. Example product accents: `#5faa6e` (green), `#e0743a` (orange), `#b85c8a` (pink), `#7b6ec9` (purple), `#4e8fd4` (blue). These override `--accent` in the carousel context only.

**Status badge colors:**
- Green (delivered): `rgba(52,199,89,0.12)` / `#1a7a35`
- Blue (shipped): `rgba(10,132,255,0.12)` / `#0a5ac2`
- Yellow (processing): `rgba(255,159,10,0.12)` / `#a06300`
- Red (error/low stock): `rgba(255,59,48,0.12)` / `#c0392b`

### Typography

**Primary font:** Roboto (Google Fonts) — used for all UI text across both storefront and admin.
**Fallback stack:** `system-ui, 'Segoe UI', Roboto, sans-serif`
**Mono font:** `ui-monospace, Consolas, monospace` — used for order IDs and code.

**Type scale:**
| Role | Size | Weight | Letter-spacing | Transform |
|---|---|---|---|---|
| H1 (global) | 56px (36px mobile) | 500 | -1.68px | — |
| H2 (global) | 24px (20px mobile) | 500 | -0.24px | — |
| Product name (hero) | 36px | 700 | -0.5px | — |
| Page title | 28px | 700 | -0.5px | — |
| Admin page title | 24px | 700 | — | — |
| Section label | 11px | 700 | 0.12em | UPPERCASE |
| Nav buttons | 14px | 500 | 0.08em | UPPERCASE |
| Body | 18px (16px mobile) | 400 | 0.18px | — |
| Small / sub | 12–13px | 400–500 | — | — |
| Code / mono | 15px | 400 | — | — |

### Spacing & Layout

- Max content width: `1920px`, centered, with `1px solid var(--border)` inline borders.
- Nav height: `10vh`.
- Standard page padding: `40px 48px` (desktop), `24px 16px` (mobile).
- Gap scale used: 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64px.

### Border Radius

- **Cards (product tiles, size panels, dropdowns):** `8–12px`
- **Buttons & inputs (storefront CTA, support form):** `0` — completely sharp / flat.
- **Admin inputs & buttons:** `0` (flat) or `4px` (profile section inputs).
- **Badges / pills:** `99px` (fully rounded).
- **Tags:** `3–4px`.
- **Small UI chrome (thumbnail remove, etc.):** `50%` (circle).

### Backgrounds & Surfaces

- Page background is plain white (`#fff`). No gradient backgrounds used anywhere.
- Image placeholder areas use `var(--code-bg)` (`#f4f3ec`) — a warm off-white/cream.
- Admin sidebar is solid `#0e0c13` (near-black charcoal).
- No full-bleed images used as backgrounds. Product images are always contained within bordered card areas.
- No decorative textures, illustrations, or patterns in the UI.

### Hover & Press States

- **Nav buttons:** `opacity: 0.6` on hover; active indicated by a 2px underline that scales in (`scaleX(0 → 1)`).
- **Product cards:** `translateY(-2px)` + `box-shadow` on hover; inner image scales `1.05 → 1.08` and `rotate(3deg)`.
- **Buttons (outline):** border darkens on hover.
- **Buttons (solid/accent):** `opacity: 0.85` on hover.
- **Icon buttons:** `opacity: 0.7` on hover.
- **Admin nav items:** `background: rgba(255,255,255,0.07)` on hover.
- **Table rows:** `background: var(--accent-bg)` on hover.
- **No press/scale animations on buttons** — pure opacity or background transitions.

### Animations & Transitions

- All transitions: `0.15–0.2s ease` (very fast, subtle).
- Page-level animations: `home-info-in` (fade + 12px translateY), `home-image-in` (fade + scale 0.92→1). Duration ~0.35–0.4s.
- Dropdown: `dropdown-fade-in` — 0.15s fade + -6px translateY.
- Modal/panel: `panel-in` — 0.2s fade + 12px translateY.
- Image hover: 0.35s ease scale + rotate.
- No bounces or spring animations. All easing is plain `ease`.

### Cards

- Product tile cards: `border: 1px solid var(--border)`, `border-radius: 10px`, hover shadow + lift.
- Admin stat cards: `border: 1px solid var(--border)`, `border-radius: 0` (square), no shadow.
- Admin content cards: same — flat, square, bordered.
- Size selector items: `border: 1px solid var(--border)`, `border-radius: 6–8px`.

### Iconography — see ICONOGRAPHY section below.

### Shadows

Only one shadow level used: `rgba(0,0,0,0.1) 0 10px 15px -3px, rgba(0,0,0,0.05) 0 4px 6px -2px` — applied on card hover only. No resting shadows (cards are flat at rest).

---

## Iconography

**Approach:** Inline SVG icons only. No icon font, no external CDN icon set, no PNG icons. All icons are hand-coded Lucide-compatible stroke SVGs embedded directly in JSX.

**Style:** 2px stroke, round linecap, round linejoin. 22×22px for nav icons, 16px for inline/action icons, 13px for small remove/close icons.

**Icon sprite:** `assets/icons.svg` — contains symbol definitions referenced via `<use>`. Used for frequently repeated icons.

**Emoji:** Never used.

**Unicode chars:** `·` (middle dot) used as a separator in cart items (e.g. "Colorway · EU 42 / US 9"). Not used as icons.

---

## Index / File Manifest

```
/
├── README.md                    ← This file
├── SKILL.md                     ← Agent skill definition
├── colors_and_type.css          ← CSS custom properties for colors + typography
├── assets/
│   ├── icons.svg                ← Icon sprite (SVG symbols)
│   ├── hero.png                 ← Hero background image
│   ├── home_display_item_1.png  ← Product image 1 (Travis Scott x AJ)
│   ├── home_display_item_2.png  ← Product image 2 (Adidas BADBO)
│   ├── home_display_item_3.png  ← Product image 3 (Nike Kobe Dunk Low)
│   ├── home_display_item_4.png  ← Product image 4 (Kobe x Nike AF1)
│   └── home_display_item_5.png  ← Product image 5 (Nike Foamposite Pro)
├── preview/
│   ├── colors-base.html         ← Color palette card
│   ├── colors-semantic.html     ← Semantic/status colors card
│   ├── type-scale.html          ← Typography scale card
│   ├── type-labels.html         ← Label / uppercase text styles card
│   ├── spacing-tokens.html      ← Spacing scale card
│   ├── borders-radius.html      ← Border radius card
│   ├── shadows.html             ← Shadow system card
│   ├── buttons.html             ← Button variants card
│   ├── inputs.html              ← Form input variants card
│   ├── badges.html              ← Badge/tag variants card
│   ├── nav.html                 ← Navigation bar card
│   ├── product-tile.html        ← Product tile card
│   ├── admin-card.html          ← Admin stat/content card
│   └── admin-sidebar.html       ← Admin sidebar card
└── ui_kits/
    ├── storefront/
    │   ├── README.md
    │   └── index.html           ← Storefront UI kit (Home → Store → Item detail)
    └── admin/
        ├── README.md
        └── index.html           ← Admin UI kit (Dashboard → Orders → Stock)
```
