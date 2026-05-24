/**
 * Store mosaic — variable-size CSS grid of product + bundle tiles. Tile size
 * (big / medium / small) is admin-configurable per item; bundles always render
 * as a big tile. Wishlist heart toggles on tiles; "Add to Cart" opens the
 * appropriate size panel (SizePanel for products, BundleSizePanel for bundles)
 * so customers never leave the grid for a simple purchase.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SizePanel from '../components/SizePanel'
import BundleSizePanel from '../components/BundleSizePanel'
import { getItemImages } from '../utils/itemImages'
import { loadCatalog } from '../utils/catalog'
import { effectivePrice, isDiscounted } from '../utils/pricing'
import '../App.css'

function HeartButton({ active, onClick }) {
  return (
    <button
      className={`store-wishlist-btn${active ? ' store-wishlist-btn--active' : ''}`}
      onClick={e => { e.stopPropagation(); onClick() }}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  )
}

function StorePage({ wishlist, toggleWishlist, addToCart }) {
  const [items] = useState(loadCatalog)
  const [sizeTarget, setSizeTarget] = useState(null)      // product awaiting size selection
  const [bundleTarget, setBundleTarget] = useState(null)  // bundle awaiting size selection

  useEffect(() => {
    const root = document.documentElement.style
    root.removeProperty('--accent')
    root.removeProperty('--accent-bg')
    root.removeProperty('--accent-border')
  }, [])

  function handleSizeConfirm(item, size) {
    addToCart({
      cartId: `${item.id}-${size.eu}-${Date.now()}`,
      id: item.id,
      brand: item.brand,
      name: item.name,
      colorway: item.colorway,
      price: effectivePrice(item),
      sizeEu: size.eu,
      sizeUs: size.us,
    })
    setSizeTarget(null)
  }

  function handleBundleConfirm(bundle, picks) {
    addToCart({
      cartId: `bundle-${bundle.id}-${Date.now()}`,
      kind: 'bundle',
      bundleId: bundle.id,
      name: bundle.name,
      price: bundle.bundlePrice,
      items: picks,
    })
    setBundleTarget(null)
  }

  function bundleItemsFor(bundle) {
    return (bundle.bundleItemIds || [])
      .map(id => items.find(i => i.id === id))
      .filter(i => i && i.kind !== 'bundle')
  }

  const productCount = items.filter(i => i.kind !== 'bundle').length
  const bundleCount  = items.filter(i => i.kind === 'bundle').length

  return (
    <div className='store-page'>
      {sizeTarget && (
        <SizePanel
          item={sizeTarget}
          onConfirm={handleSizeConfirm}
          onClose={() => setSizeTarget(null)}
        />
      )}
      {bundleTarget && (
        <BundleSizePanel
          bundle={bundleTarget}
          items={bundleItemsFor(bundleTarget)}
          onConfirm={handleBundleConfirm}
          onClose={() => setBundleTarget(null)}
        />
      )}
      <div className='store-header'>
        <h1 className='store-title'>Store</h1>
        <p className='store-count'>
          {productCount} product{productCount === 1 ? '' : 's'}
          {bundleCount > 0 && ` · ${bundleCount} bundle${bundleCount === 1 ? '' : 's'}`}
        </p>
      </div>

      {items.length === 0 && (
        <div className='store-empty'>
          <svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='store-empty-icon'>
            <path d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' />
            <line x1='3' y1='6' x2='21' y2='6' />
            <path d='M16 10a4 4 0 0 1-8 0' />
          </svg>
          <p className='store-empty-title'>No products yet</p>
          <p className='store-empty-sub'>Once products are added from the admin panel, they'll show up here.</p>
        </div>
      )}

      <div className='store-grid'>
        {items.map(item => {
          if (item.kind === 'bundle') {
            const accent = item.accentColor || 'var(--accent)'
            const constituents = bundleItemsFor(item)
            return (
              <div
                key={item.id}
                className='store-tile store-tile--big store-tile--bundle'
                onClick={() => setBundleTarget(item)}
                role='button'
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setBundleTarget(item) } }}
              >
                <div className='store-tile-image-wrap'>
                  <img src={getItemImages(item.id)[0]} alt={item.name} className='store-tile-image' />
                  <span
                    className='store-tile-tag'
                    style={{ background: `${accent}18`, color: accent }}
                  >{item.tag || 'BUNDLE'}</span>
                </div>

                <div className='store-tile-info'>
                  <p className='store-tile-brand' style={{ color: accent }}>
                    Bundle · {constituents.length} item{constituents.length === 1 ? '' : 's'}
                  </p>
                  <p className='store-tile-name'>{item.name}</p>
                  <div className='store-tile-bottom'>
                    <p className='store-tile-price'>${item.bundlePrice.toFixed(2)}</p>
                    <button
                      className='store-tile-cart-btn'
                      onClick={e => { e.stopPropagation(); setBundleTarget(item) }}
                    >
                      Add to Cart
                    </button>
                  </div>
                  {item.description && (
                    <p className='store-tile-description'>{item.description}</p>
                  )}
                </div>
              </div>
            )
          }

          const size = item.tileSize || 'small'
          const wishlisted = wishlist.includes(item.id)
          const accent = item.accentColor || 'var(--accent)'

          return (
            <Link key={item.id} to={`/item/${item.id}`} className={`store-tile store-tile--${size}`}>
              <div className='store-tile-image-wrap'>
                <img src={getItemImages(item.id)[0]} alt={item.name} className='store-tile-image' />
                {item.tag && (
                  <span
                    className='store-tile-tag'
                    style={{ background: `${accent}18`, color: accent }}
                  >{item.tag}</span>
                )}
                <HeartButton active={wishlisted} onClick={() => toggleWishlist(item.id)} />
              </div>

              <div className='store-tile-info'>
                <p className='store-tile-brand' style={{ color: accent }}>{item.brand}</p>
                <p className='store-tile-name'>{item.name}</p>
                {size !== 'small' && (
                  <p className='store-tile-colorway'>{item.colorway}</p>
                )}
                <div className='store-tile-bottom'>
                  <p className='store-tile-price'>
                    {isDiscounted(item) && <span className='price-strike'>${item.price.toFixed(2)}</span>}
                    <span className={isDiscounted(item) ? 'price--sale' : ''}>${effectivePrice(item).toFixed(2)}</span>
                  </p>
                  {size === 'small' ? (
                    <button className='store-tile-cart-icon' onClick={e => { e.preventDefault(); e.stopPropagation(); setSizeTarget(item) }} aria-label='Add to Cart'>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                    </button>
                  ) : (
                    <button className='store-tile-cart-btn' onClick={e => { e.preventDefault(); e.stopPropagation(); setSizeTarget(item) }}>
                      Add to Cart
                    </button>
                  )}
                </div>
                {size === 'big' && item.description && (
                  <p className='store-tile-description'>{item.description}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default StorePage
