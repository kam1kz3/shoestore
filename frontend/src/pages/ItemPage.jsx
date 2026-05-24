/**
 * Item detail. Reads :id from the URL, looks up the catalog entry, applies the
 * item's accent color to the `--accent*` CSS vars while mounted, and renders
 * the gallery + size grid + add-to-cart flow. Wishlist heart syncs with the
 * shared wishlist state owned by App.
 *
 * Because React Router keeps the component mounted across /item/:id changes,
 * per-item state (photoIndex, selectedSize, etc.) is reset in-render via a
 * `prevId` tracker — React's recommended pattern for reacting to prop changes.
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getItemImages } from '../utils/itemImages'
import { loadCatalog } from '../utils/catalog'
import { effectivePrice, isDiscounted } from '../utils/pricing'
import { hexToRgba } from '../utils/colors'
import '../App.css'

const sizes = [
  { eu: 39, us: 6.5 },
  { eu: 40, us: 7 },
  { eu: 41, us: 8 },
  { eu: 42, us: 8.5 },
  { eu: 43, us: 9.5 },
  { eu: 44, us: 10 },
  { eu: 45, us: 11 },
]

function ItemPage({ addToCart, wishlist, toggleWishlist }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const found = loadCatalog().find(i => i.id === parseInt(id))
  const item = found && found.kind !== 'bundle' ? found : null
  const photos = item ? getItemImages(item.id) : []

  const [photoIndex, setPhotoIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [sizeError, setSizeError] = useState(false)
  const [added, setAdded] = useState(false)

  // Reset per-item state when the URL changes (React Router keeps the same component
  // mounted across /item/:id changes). Adjust during render — React's recommended pattern.
  const [prevId, setPrevId] = useState(id)
  if (prevId !== id) {
    setPrevId(id)
    setPhotoIndex(0)
    setSelectedSize(null)
    setSizeError(false)
    setAdded(false)
  }

  const wishlisted = item && wishlist ? wishlist.includes(item.id) : false

  useEffect(() => {
    if (!item) return
    const accent = item.accentColor
    const root = document.documentElement.style
    root.setProperty('--accent', accent)
    root.setProperty('--accent-bg', hexToRgba(accent, 0.1))
    root.setProperty('--accent-border', hexToRgba(accent, 0.4))
    return () => {
      root.removeProperty('--accent')
      root.removeProperty('--accent-bg')
      root.removeProperty('--accent-border')
    }
  }, [item])

  if (!item) {
    return (
      <div className='item-page item-page--not-found'>
        <p className='item-not-found-msg'>Item not found.</p>
        <button className='item-not-found-btn' onClick={() => navigate('/store')}>Back to Store</button>
      </div>
    )
  }

  function handleAddToCart() {
    if (!selectedSize) { setSizeError(true); return }
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
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className='item-page'>
      <button className='item-back-btn' onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className='item-layout'>
        {/* Gallery */}
        <div className='item-gallery'>
          <div className='item-gallery-main'>
            <img
              src={photos[photoIndex]}
              alt={item.name}
              className='item-gallery-image'
            />
          </div>
          {photos.length > 1 && (
            <div className='item-gallery-thumbs'>
              {photos.map((src, i) => (
                <button
                  key={i}
                  className={`item-gallery-thumb${i === photoIndex ? ' item-gallery-thumb--active' : ''}`}
                  onClick={() => setPhotoIndex(i)}
                >
                  <img src={src} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className='item-details'>
          {item.tag && <span className='item-tag'>{item.tag}</span>}
          <p className='item-brand'>{item.brand}</p>
          <h1 className='item-name'>{item.name}</h1>
          <p className='item-colorway'>{item.colorway}</p>
          <p className='item-price'>
            {isDiscounted(item) && <span className='price-strike'>${item.price.toFixed(2)}</span>}
            <span className={isDiscounted(item) ? 'price--sale' : ''}>${effectivePrice(item).toFixed(2)}</span>
          </p>
          <p className='item-description'>{item.description}</p>

          <div className='item-sizes'>
            <p className={`item-sizes-label${sizeError ? ' item-sizes-label--error' : ''}`}>
              {sizeError ? 'Please select a size' : 'Select Size'}
            </p>
            <div className={`item-sizes-grid${sizeError ? ' item-sizes-grid--error' : ''}`}>
              {sizes.map(s => (
                <button
                  key={s.eu}
                  className={`item-size-btn${selectedSize === s.eu ? ' item-size-btn--active' : ''}`}
                  onClick={() => { setSelectedSize(s.eu); setSizeError(false) }}
                >
                  <span className='item-size-eu'>EU {s.eu}</span>
                  <span className='item-size-us'>US {s.us}</span>
                </button>
              ))}
            </div>
          </div>

          <div className='item-actions'>
            <button className='item-add-to-cart' onClick={handleAddToCart}>
              {added ? 'Added to Cart ✓' : `Add to Cart — $${effectivePrice(item).toFixed(2)}`}
            </button>
            {toggleWishlist && (
              <button
                className={`item-wishlist-btn${wishlisted ? ' item-wishlist-btn--active' : ''}`}
                onClick={() => toggleWishlist(item.id)}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                  fill={wishlisted ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemPage
