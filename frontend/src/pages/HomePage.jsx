/**
 * Home carousel — the hero. Resolves `displayOrder` against `loadCatalog()`
 * at mount, filters out bundles + dangling ids, then steps through the
 * resulting list. Per-slot accent colors (in localStorage `displayAccentColors`)
 * drive `--accent` / `--accent-bg` / `--accent-border` for the active slide.
 *
 * Falls back to an empty state when admin removes every displayed product.
 * Supports keyboard nav (prev/next buttons), dot nav, and touch swipe.
 */
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadCatalog, loadDisplayOrder } from '../utils/catalog'
import { getItemImages } from '../utils/itemImages'
import { effectivePrice, isDiscounted } from '../utils/pricing'
import { hexToRgba } from '../utils/colors'
import '../App.css'

function loadColors() {
  try {
    const stored = JSON.parse(localStorage.getItem('displayAccentColors'))
    if (Array.isArray(stored)) return stored
  } catch { /* fall through */ }
  return []
}

const sizes = [
  { eu: 39, us: 6.5 },
  { eu: 40, us: 7 },
  { eu: 41, us: 8 },
  { eu: 42, us: 8.5 },
  { eu: 43, us: 9.5 },
  { eu: 44, us: 10 },
  { eu: 45, us: 11 },
]

function HomePage({ addToCart }) {
  const navigate = useNavigate()

  // Resolve display order → catalog items. Bundles + missing references are dropped.
  const [displayItems] = useState(() => {
    const catalog = loadCatalog()
    return loadDisplayOrder()
      .map(id => catalog.find(c => c.id === id))
      .filter(c => c && c.kind !== 'bundle')
  })

  const [index, setIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [sizeError, setSizeError] = useState(false)
  const [accentColors] = useState(loadColors)

  const len = displayItems.length
  const prev = () => setIndex(i => (i - 1 + len) % len)
  const next = () => setIndex(i => (i + 1) % len)

  const touchStartX = useRef(null)

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  // Pick the active item, clamping the index in case displayItems shrank since mount
  const safeIndex = len > 0 ? Math.min(index, len - 1) : 0
  const item = displayItems[safeIndex]

  useEffect(() => {
    if (!item) return
    const accent = accentColors[safeIndex] || item.accentColor || '#08060d'
    const root = document.documentElement.style
    root.setProperty('--accent',        accent)
    root.setProperty('--accent-bg',     hexToRgba(accent, 0.1))
    root.setProperty('--accent-border', hexToRgba(accent, 0.4))
    return () => {
      root.removeProperty('--accent')
      root.removeProperty('--accent-bg')
      root.removeProperty('--accent-border')
    }
  }, [safeIndex, accentColors, item])

  function handleAddToCart() {
    if (!item) return
    if (!selectedSize) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 2000)
      return
    }
    const size = sizes.find(s => s.eu === selectedSize)
    addToCart({
      cartId: `${item.id}-${selectedSize}-${Date.now()}`,
      id: item.id,
      brand: item.brand,
      name: item.name,
      colorway: item.colorway,
      price: effectivePrice(item),
      sizeEu: size.eu,
      sizeUs: size.us,
    })
  }

  // Empty state — admin removed every displayed product
  if (!item) {
    return (
      <div className='home-container home-container--empty'>
        <p className='home-empty-title'>No products on the homepage</p>
        <p className='home-empty-sub'>Set up your homepage carousel from the admin Stock page.</p>
        <button className='home-btn home-btn--solid' onClick={() => navigate('/store')}>Browse Store</button>
      </div>
    )
  }

  return (
    <div className='home-container' onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className='home-info'>
        {item.tag && <span className='home-info-tag'>{item.tag}</span>}
        <p className='home-info-brand'>{item.brand}</p>
        <h1 className='home-info-name'>{item.name}</h1>
        <p className='home-info-colorway'>{item.colorway}</p>
        <p className='home-info-price'>
          {isDiscounted(item) && <span className='price-strike'>${item.price.toFixed(2)}</span>}
          <span className={isDiscounted(item) ? 'price--sale' : ''}>${effectivePrice(item).toFixed(2)}</span>
        </p>
        <p className='home-info-description'>{item.description}</p>
      </div>

      <img
        key={safeIndex}
        src={getItemImages(item.id)[0]}
        alt={item.name}
        className='home-display-image'
      />

      <div className='home-bottom-center'>
        <button className='home-btn home-btn--outline' onClick={() => navigate('/store')}>View All</button>
        <button className='home-btn home-btn--solid' onClick={handleAddToCart}>Add to Cart</button>
      </div>

      <div className='home-sizes'>
        <p className={`home-sizes-label${sizeError ? ' home-sizes-label--error' : ''}`}>
          {sizeError ? 'Please select a size' : 'Select Size'}
        </p>
        <div className={`home-sizes-scroll${sizeError ? ' home-sizes-scroll--error' : ''}`}>
          {sizes.map((s) => (
            <button
              key={s.eu}
              className={`home-size-item${selectedSize === s.eu ? ' home-size-item--active' : ''}`}
              onClick={() => { setSelectedSize(s.eu); setSizeError(false) }}
            >
              <span className='home-size-eu'>EU {s.eu}</span>
              <span className='home-size-us'>US {s.us}</span>
            </button>
          ))}
        </div>
        <select
          className={`home-sizes-select${sizeError ? ' home-sizes-select--error' : ''}`}
          value={selectedSize ?? ''}
          onChange={e => { setSelectedSize(Number(e.target.value)); setSizeError(false) }}
        >
          <option value='' disabled>Select a size</option>
          {sizes.map(s => (
            <option key={s.eu} value={s.eu}>EU {s.eu} / US {s.us}</option>
          ))}
        </select>
      </div>

      <div className='home-nav'>
        <button className='home-nav-button' onClick={prev} aria-label='Previous' disabled={len <= 1}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className='home-nav-dots'>
          {displayItems.map((_, i) => (
            <button
              key={i}
              className={`home-nav-dot${i === safeIndex ? ' home-nav-dot--active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>

        <button className='home-nav-button' onClick={next} aria-label='Next' disabled={len <= 1}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default HomePage
