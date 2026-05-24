# Handoff: SoleStore Hi-Fi Mockup

## Overview
This package contains a high-fidelity interactive mockup of **SoleStore** — a sneaker retail web app with a customer-facing storefront and a separate admin panel. The designs cover 6 core screens across both surfaces, with dark mode, micro-animations, and hover states.

The source codebase is a **React 19 / Vite** app (located in `shoe_store/frontend/`). The target implementation environment is already established — use it.

---

## About the Design Files

The HTML files in this bundle are **design references built as prototypes** — they show the intended look, layout, interactions, and behavior. They are **not production code to copy directly**.

Your task is to **recreate these designs inside the existing `shoe_store/frontend/` React codebase**, using its established patterns (React Router v7, plain CSS custom properties, `localStorage` for state). Match the designs pixel-for-pixel where they differ from the current implementation.

The existing codebase already has most of the structure in place. The mockup refines and upgrades the visual quality — treat the HTML prototype as the visual spec.

---

## Fidelity

**High-fidelity.** All colors, typography, spacing, border radii, shadows, hover states, and animations are final and should be matched exactly. The developer should recreate the UI pixel-perfectly using the codebase's existing CSS custom property system and React component patterns.

---

## Screens / Views

### 1. Home — Hero Carousel

**Purpose:** Landing page showcasing featured products with an animated carousel. User can select a size and add to cart.

**Layout:**
- Full-viewport height minus nav (`calc(100vh - 56px)`)
- Product info panel: `position: absolute; left: 48px; top: 50%; transform: translateY(-50%)` — max-width 300px
- Product image: `position: absolute; right: 10%; top: 50%; transform: translateY(-50%) scaleX(-1) rotate(22deg)` — max-height 72%, max-width 48%, `filter: drop-shadow(0 20px 40px rgba(0,0,0,0.18))`
- Size selector: `position: absolute; bottom: 28px; left: 48px`
- CTA buttons: `position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%)`
- Carousel controls: `position: absolute; bottom: 28px; right: 28px`

**Product info panel:**
- Tag badge: 11px / 700 / uppercase / 0.1em tracking — bg and color driven by per-product `accent` color at 10% opacity
- Brand: 11px / 500 / uppercase / 0.14em tracking / `--text`
- Name: 30px / 700 / -0.5px tracking / `--text-h` / line-height 1.1
- Colorway: 13px / 400 / `--text`
- Price: 22px / 600 / `--text-h`
- Description: 13px / 400 / 1.65 line-height / `--text`
- Entry animation: `opacity 0 → 1, translateY +14px → 0`, 0.4s ease

**Product image:**
- Entry animation: `opacity 0 → 1, scale 0.92 → 1`, 0.45s ease
- `filter: drop-shadow(0 20px 40px rgba(0,0,0,0.18))`

**Size chips:**
- Two-line (EU / US), `padding: 7px 10px`, `border-radius: 8px`, `border: 1px solid var(--border)`
- Hover: `background: var(--accent-bg); border-color: var(--accent-border); transform: translateY(-1px)`
- Selected: `background: var(--text-h); border-color: var(--text-h)` — text flips to `var(--bg)`

**CTA buttons:** `border-radius: 0` (sharp), 12px / 700 / uppercase / 0.07em tracking, `padding: 10px 26px`
- Outline: `border: 1px solid var(--border)`, transparent bg
- Solid: `background: var(--accent)` — uses per-product accent color

**Carousel dots + arrow circles:**
- Dots: 7px circles, active dot scales to 1.35×
- Arrows: 32px circles, `border: 1px solid var(--border)`, hover: `background: var(--accent-bg)`

**Per-product accent colors (override `--accent` in carousel context only):**
| Product | Accent |
|---|---|
| Jordan Jumpman Jack TR | `#5faa6e` |
| Adidas BADBO 1.0 | `#e0743a` |
| Nike Kobe Dunk Low | `#b85c8a` |
| Force 1 Low Merion | `#7b6ec9` |
| Nike Foamposite Pro | `#4e8fd4` |

---

### 2. Store — Mosaic Grid

**Purpose:** Browsable product catalog. Mosaic CSS grid with big/medium/small tile sizes.

**Layout:**
- Page padding: `40px 48px` (mobile: `24px 16px`)
- Page title: 26px / 700 / -0.5px tracking
- Grid: `grid-template-columns: repeat(3, 1fr); grid-auto-rows: 200px; grid-auto-flow: dense; gap: 14px`
- Tile sizes: big = `span 2 col / span 3 row`, med = `span 1 col / span 2 row`, sm = `span 1 col / span 1 row`
- Default layout: [big, med, med, sm, sm]

**Tile:**
- `border: 1px solid var(--border); border-radius: 10px; overflow: hidden`
- Hover: `box-shadow: var(--shadow); transform: translateY(-2px)` — 0.22s ease
- Image: `transform: scale(1.05)` at rest; hover: `scale(1.09)` — **no rotation** — 0.38s ease
- Tag badge: `position: absolute; bottom: 10px; left: 10px` — accent color bg at 10% opacity
- Wishlist heart: `position: absolute; top: 10px; right: 10px` — 30px circle, white bg, shadow
- Brand: 10px / 700 / uppercase / accent color
- Name: 14px / 600 / `--text-h` (sm: 12px)
- Colorway: 11px / `--text`
- Price: 15px / 700 / `--text-h` (sm: 13px)
- Add to Cart button (big/med): `border-radius: 0`, accent-bg fill, 11px / 700
- Cart icon button (sm): 28px circle, border, hover fills with accent

---

### 3. Item Detail

**Purpose:** Full product detail view with gallery, size selector, add to cart, and wishlist.

**Layout:**
- Page padding: `24px 44px`
- Back button: inline-flex with chevron, 12px / 500 / `--text`, margin-bottom 24px
- Two-column grid: `1fr 1fr`, gap 56px

**Gallery (left column):**
- Main image: `aspect-ratio: 4/3`, `background: var(--bg2)`, `border-radius: 6px`
- Image at rest: `scale(1.05)`; hover: `scale(1.09)` — **no rotation** — 0.42s ease
- Thumbnails: flex row, `gap: 7px`, each `flex: 1; aspect-ratio: 1; border: 2px solid transparent; border-radius: 4px`
- Active thumb: `border-color: var(--accent)`

**Details panel (right column):**
- Tag: 10px / 700 / uppercase — accent color tinted bg + border
- Brand: 11px / 500 / uppercase / 0.12em tracking / `--text`
- Name: 28px / 700 / -0.5px / `--text-h`
- Colorway: 13px / `--text`
- Price: 22px / 600 / `--text-h`
- Description: 13px / 1.7 line-height / `--text`, `padding-bottom: 10px; border-bottom: 1px solid var(--border)`
- Size label: 10px / 700 / uppercase / 0.12em tracking
- Size grid: `repeat(4, 1fr)`, gap 7px
- Size button: `padding: 9px 6px`, `border: 1px solid var(--border)`, `border-radius: 4px`
  - Hover: accent-bg fill, border-color, `translateY(-1px)`
  - Selected: `border-color: var(--accent); background: var(--accent-bg)` — EU label turns accent color
- Add to Cart: full-width (flex: 1), `padding: 13px`, `border-radius: 0`, 12px / 700 / uppercase
  - Hover: `opacity: 0.88; translateY(-1px)`
- Wishlist button: 46px square, `border: 1px solid var(--border)`, `border-radius: 4px`
  - Active/hover: `border-color: var(--accent-border); color: var(--accent)`

---

### 4. Admin — Dashboard

**Purpose:** Overview of store health — KPI stats, recent orders table, today's orders, low stock alerts.

**Layout:**
- Sidebar: 210px wide, `background: #0e0c13` (hard-coded dark, not affected by dark mode toggle)
- Main content: `padding: 32px 36px 52px`, flex column, gap 20px
- Stat row: `repeat(4, 1fr)`, gap 12px
- Dashboard body: `grid-template-columns: 1fr 280px`, gap 14px

**Sidebar:**
- Header: `padding: 20px 16px 13px`, section title 11px / 700 / uppercase / 0.14em tracking / `rgba(255,255,255,0.45)`
- Nav items: 13px / 500, default `rgba(255,255,255,0.5)`
  - Hover: `background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85)`
  - Active: `background: rgba(255,255,255,0.1); color: #fff`
- Back link: 12px / `rgba(255,255,255,0.35)`, hover lightens

**Stat cards:**
- `border: 1px solid var(--border)`, `padding: 17px 20px`
- Value: 26px / 700 / `--text-h`
- Label: 10px / 700 / uppercase / 0.08em
- Sub: 10px / `--text` / 0.7 opacity
- Hover: `border-color: var(--accent-border); background: var(--accent-bg); translateY(-2px)` — 0.18s
- Accent variant (today's orders): pre-applied `accent-bg` fill + `accent-border`

**Content cards:** `border: 1px solid var(--border); padding: 16px 20px`

**Table:**
- TH: 10px / 700 / uppercase / 0.08em, `border-bottom: 1px solid var(--border)`
- TD: `padding: 8px 9px`, `border-bottom: 1px solid var(--border)`
- Row hover: `background: var(--accent-bg)`
- Status badges: pill shape (99px radius), 10px / 700

**Status badge colors:**
| Status | BG | Text |
|---|---|---|
| delivered | `rgba(52,199,89,0.12)` | `#1a7a35` |
| shipped | `rgba(10,132,255,0.12)` | `#0a5ac2` |
| processing | `rgba(255,159,10,0.12)` | `#a06300` |
| low stock | `rgba(255,59,48,0.12)` | `#c0392b` |

---

### 5. Admin — Orders

**Purpose:** Monthly calendar view with order indicators + filterable order list.

**Layout:** `grid-template-columns: 1fr 260px`, gap 14px

**Calendar:**
- `border: 1px solid var(--border); padding: 16px`
- 7-column grid, day cells min-height 38px
- Day number: 20px circle container, 11px / 500
- Today: number gets `background: var(--text-h); color: var(--bg); border-radius: 50%`
- Order dots: 4px circles, `background: var(--accent)`, up to 3 shown
- Cell hover: `background: var(--accent-bg); border-color: var(--accent-border)`
- Selected day: pre-applied hover state

**Order list panel:** scrollable, `max-height: 340px`

---

### 6. Admin — Stock

**Purpose:** Inventory CRUD with live stock count controls.

**Layout:** Full-width table inside a card

**Stock controls:** `−` and `+` buttons (20px squares), stock count in between
- Low stock (≤ 3): count shown in `#c0392b` / bold
- Buttons: `border: 1px solid var(--border)`, hover: `background: var(--accent-bg)`

**Table action buttons:** 11px / 600, `border: 1px solid var(--border)`, hover accent-bg
- Delete variant: `color: #c0392b; border-color: rgba(192,57,43,0.3)`

---

## Interactions & Behavior

| Interaction | Behavior |
|---|---|
| Carousel next/prev | Swap product, reset selected size, animate info panel in |
| Carousel dots | Jump to product index |
| Size chip / button | Toggle selected state |
| Home "Add to Cart" | If size selected → add; if not → button label reads "Select a Size" |
| Product tile click | Navigate to Item Detail |
| Wishlist heart | Toggle filled/unfilled |
| Gallery thumb | Swap main image |
| Admin stat card | Navigate to relevant admin sub-page |
| Calendar day | Filter order list to that day; click again to clear |
| Stock +/− | Increment/decrement in real time, disable − at 0 |
| Dark mode | Toggle CSS class on root `.ss` element; admin sidebar stays `#0e0c13` always |

**Transitions:** All UI transitions use `0.15–0.22s ease`. Image scale transitions use `0.38–0.42s ease`. No bounces or spring physics.

**Hover states:**
- Cards/tiles: `translateY(-2px)` + shadow
- Buttons: `translateY(-1px)` + `opacity: 0.85–0.88`
- Nav links: `opacity: 0.6`
- Nav active indicator: 2px underline, `scaleX(0 → 1)` on `transform-origin: center`
- Icon buttons: `opacity: 0.6`

---

## Design Tokens

### Colors
```css
/* Light mode */
--text:          #6b6375;
--text-h:        #08060d;
--bg:            #ffffff;
--bg2:           #f4f3ec;
--border:        #e5e4e7;
--accent:        #000000;
--accent-bg:     rgba(8, 6, 13, 0.06);
--accent-border: rgba(8, 6, 13, 0.20);
--shadow:        rgba(0,0,0,0.1) 0 10px 15px -3px, rgba(0,0,0,0.05) 0 4px 6px -2px;

/* Dark mode */
--text:          #9ca3af;
--text-h:        #f3f4f6;
--bg:            #1E1E1E;
--bg2:           #1f2028;
--border:        #2e303a;
--accent:        #ffffff;
--accent-bg:     rgba(255, 255, 255, 0.10);
--accent-border: rgba(255, 255, 255, 0.25);
```

### Typography
- **Font:** Roboto (400, 500, 600, 700) via Google Fonts
- **Mono:** `ui-monospace, Consolas, monospace`

### Spacing (gap/padding scale in use)
`4, 6, 7, 8, 9, 10, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 44, 48, 52, 56px`

### Border Radius
| Usage | Value |
|---|---|
| CTA buttons, inputs | `0` |
| Tag badges | `3–4px` |
| Size buttons | `4–8px` |
| Product tiles, cards | `10px` |
| Modals | `12px` |
| Badges / pills | `99px` |
| Avatar / dot controls | `50%` |

---

## Assets

All product images are in `shoe_store/frontend/src/assets/`:
- `home_display_item_1.png` — Jordan Jumpman Jack TR
- `home_display_item_2.png` — Adidas BADBO 1.0
- `home_display_item_3.png` — Nike Kobe Dunk Low
- `home_display_item_4.png` — Force 1 Low Merion
- `home_display_item_5.png` — Nike Foamposite Pro
- `hero.png` — Hero background

Icon sprite: `shoe_store/frontend/public/icons.svg`

All icons are inline Lucide-style SVGs: `stroke-width: 2`, round linecap/join, no fill.

---

## Files in This Package

| File | Description |
|---|---|
| `SoleStore Mockup.html` | Full interactive hi-fi prototype — all 6 screens, dark mode, animations |
| `ui_kits/storefront/index.html` | Storefront-only click-through prototype |
| `ui_kits/admin/index.html` | Admin panel click-through prototype |
| `colors_and_type.css` | All CSS custom property tokens |
| `assets/` | Product images and icon sprite |
| `README.md` | Full design system documentation |

---

## Implementation Notes

1. **Dark mode:** The existing codebase uses `prefers-color-scheme: dark` media query in `index.css`. The mockup adds a manual toggle — if implementing the toggle, add a `dark` class to `:root` or `#root` and override the CSS vars there.

2. **Image hover — no rotation:** The existing `App.css` uses `rotate(3deg)` on image hover. The updated spec removes this — use `scale(1.08–1.09)` only, no rotation.

3. **Product accent colors:** The carousel applies per-product CSS variable overrides inline. Pass the accent color as a prop/CSS var to the carousel slot — don't hardcode per-product color in CSS.

4. **Admin sidebar is always dark:** The sidebar background `#0e0c13` is hardcoded and should NOT respond to the app's dark mode toggle. Only the main content area changes.
