import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SizePanel from '../components/SizePanel'
import item1 from '../assets/home_display_item_1.png'
import item2 from '../assets/home_display_item_2.png'
import item3 from '../assets/home_display_item_3.png'
import item4 from '../assets/home_display_item_4.png'
import item5 from '../assets/home_display_item_5.png'
import homeItems from '../data/homeItems.json'
import '../App.css'

const images = [item1, item2, item3, item4, item5]

function WishlistPage({ wishlist, toggleWishlist, addToCart }) {
  const navigate = useNavigate()
  const [sizeTarget, setSizeTarget] = useState(null)

  useEffect(() => {
    const root = document.documentElement.style
    root.removeProperty('--accent')
    root.removeProperty('--accent-bg')
    root.removeProperty('--accent-border')
  }, [])
  const wishlistedItems = homeItems.filter(item => wishlist.includes(item.id))

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
          {wishlistedItems.map(item => {
            const imgIndex = homeItems.findIndex(i => i.id === item.id)
            return (
              <Link key={item.id} to={`/item/${item.id}`} className='wishlist-card'>
                <div className='wishlist-card-image-wrap'>
                  <img
                    src={images[imgIndex]}
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
                    <p className='wishlist-card-price'>${item.price.toFixed(2)}</p>
                    <button className='wishlist-card-cart-btn' onClick={e => { e.preventDefault(); e.stopPropagation(); setSizeTarget(item) }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WishlistPage
