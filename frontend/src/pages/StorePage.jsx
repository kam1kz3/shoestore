import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SizePanel from '../components/SizePanel'
import { getItemImages } from '../utils/itemImages'
import { loadCatalog } from '../utils/catalog'
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
  const [sizeTarget, setSizeTarget] = useState(null)  // item awaiting size selection

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
      price: item.price,
      sizeEu: size.eu,
      sizeUs: size.us,
    })
    setSizeTarget(null)
  }

  return (
    <div className='store-page'>
      {sizeTarget && (
        <SizePanel
          item={sizeTarget}
          onConfirm={handleSizeConfirm}
          onClose={() => setSizeTarget(null)}
        />
      )}
      <div className='store-header'>
        <h1 className='store-title'>All Products</h1>
        <p className='store-count'>{items.length} items</p>
      </div>

      <div className='store-grid'>
        {items.map((item, idx) => {
          const size = item.tileSize || 'small'
          const wishlisted = wishlist.includes(item.id)

          return (
            <Link key={item.id} to={`/item/${item.id}`} className={`store-tile store-tile--${size}`}>
              <div className='store-tile-image-wrap'>
                <img src={getItemImages(item.id)[0]} alt={item.name} className='store-tile-image' />
                {item.tag && <span className='store-tile-tag'>{item.tag}</span>}
                <HeartButton active={wishlisted} onClick={() => toggleWishlist(item.id)} />
              </div>

              <div className='store-tile-info'>
                {size === 'big' && (
                  <p className='store-tile-brand'>{item.brand}</p>
                )}
                <p className='store-tile-name'>{item.name}</p>
                {size !== 'small' && (
                  <p className='store-tile-colorway'>{item.colorway}</p>
                )}
                <div className='store-tile-bottom'>
                  <p className='store-tile-price'>${item.price.toFixed(2)}</p>
                  {size === 'big' ? (
                    <button className='store-tile-cart-btn' onClick={e => { e.preventDefault(); e.stopPropagation(); setSizeTarget(item) }}>
                      Add to Cart
                    </button>
                  ) : (
                    <button className='store-tile-cart-icon' onClick={e => { e.preventDefault(); e.stopPropagation(); setSizeTarget(item) }} aria-label='Add to Cart'>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
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
