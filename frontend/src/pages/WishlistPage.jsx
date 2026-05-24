/**
 * Saved-items page. Filters the live catalog by the wishlist id list (owned
 * by App), so admin edits / new products surface here automatically. Renders
 * an empty state with a Browse Store CTA when nothing's saved. Bundles are
 * filtered out — they aren't wishlistable.
 */
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SizePanel from '../components/SizePanel'
import { loadCatalog } from '../utils/catalog'
import { getItemImages } from '../utils/itemImages'
import { effectivePrice, isDiscounted } from '../utils/pricing'
import '../App.css'

function WishlistPage({ wishlist, toggleWishlist, addToCart }) {
  const navigate = useNavigate()
  const [sizeTarget, setSizeTarget] = useState(null)

  useEffect(() => {
    const root = document.documentElement.style
    root.removeProperty('--accent')
    root.removeProperty('--accent-bg')
    root.removeProperty('--accent-border')
  }, [])

  // Pull from the live catalog so admin edits / new products surface here.
  // Bundles aren't wishlistable, so they're filtered out as a safety net.
  const catalog = loadCatalog()
  const wishlistedItems = catalog.filter(item =>
    item.kind !== 'bundle' && wishlist.includes(item.id)
  )

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

  return (
    <div className='wishlist-page'>
      {sizeTarget && (
        <SizePanel
          item={sizeTarget}
          onConfirm={handleSizeConfirm}
          onClose={() => setSizeTarget(null)}
        />
      )}
      <div className='wishlist-header'>
        <h1 className='wishlist-title'>Wishlist</h1>
        <p className='wishlist-count'>
          {wishlistedItems.length} {wishlistedItems.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {wishlistedItems.length === 0 ? (
        <div className='wishlist-empty'>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className='wishlist-empty-icon'>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <p className='wishlist-empty-title'>Your wishlist is empty</p>
          <p className='wishlist-empty-sub'>Save items you love by tapping the heart on any product.</p>
          <button className='wishlist-browse-btn' onClick={() => navigate('/store')}>Browse Products</button>
        </div>
      ) : (
        <div className='wishlist-grid'>
          {wishlistedItems.map(item => (
            <Link key={item.id} to={`/item/${item.id}`} className='wishlist-card'>
              <div className='wishlist-card-image-wrap'>
                <img
                  src={getItemImages(item.id)[0]}
                  alt={item.name}
                  className='wishlist-card-image'
                />
                <button
                  className='wishlist-card-heart wishlist-card-heart--active'
                  onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(item.id) }}
                  aria-label='Remove from wishlist'
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                {item.tag && <span className='wishlist-card-tag'>{item.tag}</span>}
              </div>

              <div className='wishlist-card-info'>
                <div className='wishlist-card-text'>
                  <p className='wishlist-card-brand'>{item.brand}</p>
                  <p className='wishlist-card-name'>{item.name}</p>
                  <p className='wishlist-card-colorway'>{item.colorway}</p>
                </div>
                <div className='wishlist-card-footer'>
                  <p className='wishlist-card-price'>
                    {isDiscounted(item) && <span className='price-strike'>${item.price.toFixed(2)}</span>}
                    <span className={isDiscounted(item) ? 'price--sale' : ''}>${effectivePrice(item).toFixed(2)}</span>
                  </p>
                  <button className='wishlist-card-cart-btn' onClick={e => { e.preventDefault(); e.stopPropagation(); setSizeTarget(item) }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default WishlistPage
