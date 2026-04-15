import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import '../App.css'

const pages = [
  { label: 'Home',    path: '/' },
  { label: 'Store',   path: '/store' },
  { label: 'Support', path: '/support' },
]

function NavigationBar({ cart, removeFromCart, wishlistCount }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const cartRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (cartRef.current && !cartRef.current.contains(e.target)) setCartOpen(false)
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const total = cart.reduce((sum, i) => sum + i.price, 0)

  return (
    <div className='nav-bar-container'>
      <div className='nav-bar-left' />

      <div className='nav-bar-center'>
        {pages.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) => `nav-bar-button${isActive ? ' nav-bar-button--active' : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </div>

      <div className='nav-bar-right'>
        {/* Cart */}
        <div className='nav-dropdown-wrapper' ref={cartRef}>
          <button
            className={`nav-bar-icon-button${cartOpen ? ' nav-bar-icon-button--active' : ''}`}
            aria-label='Cart'
            onClick={() => { setCartOpen(o => !o); setMenuOpen(false) }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cart.length > 0 && (
              <span className='nav-cart-badge'>{cart.length}</span>
            )}
          </button>
          {cartOpen && (
            <div className='nav-dropdown nav-dropdown--cart'>
              {cart.length === 0 ? (
                <>
                  <p className='nav-dropdown-empty'>Your cart is empty.</p>
                  <p className='nav-dropdown-empty-sub'>Items you add will appear here.</p>
                </>
              ) : (
                <>
                  <div className='nav-cart-items'>
                    {cart.map((item) => (
                      <div key={item.cartId} className='nav-cart-item'>
                        <div className='nav-cart-item-info'>
                          <p className='nav-cart-item-name'>{item.name}</p>
                          <p className='nav-cart-item-sub'>{item.colorway} &middot; EU {item.sizeEu} / US {item.sizeUs}</p>
                        </div>
                        <div className='nav-cart-item-right'>
                          <p className='nav-cart-item-price'>${item.price.toFixed(2)}</p>
                          <button
                            className='nav-cart-item-remove'
                            onClick={() => removeFromCart(item.cartId)}
                            aria-label='Remove item'
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='nav-cart-footer'>
                    <span className='nav-cart-total-label'>Total</span>
                    <span className='nav-cart-total'>${total.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Menu */}
        <div className='nav-dropdown-wrapper' ref={menuRef}>
          <button
            className={`nav-bar-icon-button${menuOpen ? ' nav-bar-icon-button--active' : ''}`}
            aria-label='Menu'
            onClick={() => { setMenuOpen(o => !o); setCartOpen(false) }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {menuOpen && (
            <div className='nav-dropdown nav-dropdown--menu'>
              {pages.map(({ label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  end
                  className={({ isActive }) => `nav-dropdown-item nav-dropdown-item--page${isActive ? ' nav-dropdown-item--page-active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
              <div className='nav-dropdown-divider nav-mobile-only' />
              <NavLink
                to='/profile'
                className={({ isActive }) => `nav-dropdown-item nav-dropdown-item--page${isActive ? ' nav-dropdown-item--page-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Profile &amp; Settings
              </NavLink>
              <NavLink
                to='/wishlist'
                className={({ isActive }) => `nav-dropdown-item nav-dropdown-item--wishlist${isActive ? ' nav-dropdown-item--wishlist-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Wishlist
                {wishlistCount > 0 && (
                  <span className='nav-wishlist-badge'>{wishlistCount}</span>
                )}
              </NavLink>
              <div className='nav-dropdown-divider' />
              <button className='nav-dropdown-item nav-dropdown-item--signout'>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NavigationBar
