/**
 * App entry — owns the two router trees (storefront + admin) and the
 * cross-page state that both share (cart, wishlist). Wraps everything in an
 * ErrorBoundary and a one-shot Splash on first session visit.
 *
 * Cart + wishlist live here (not in Context) because only the NavBar reads cart
 * and only a handful of pages mutate them; prop-passing stays readable. Every
 * mutation persists to localStorage immediately — there is no backend.
 */
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import NavigationBar from './components/NavigationBar'
import NotFound from './components/NotFound'
import ErrorBoundary from './components/ErrorBoundary'
import Splash from './components/Splash'
import HomePage from './pages/HomePage'
import StorePage from './pages/StorePage'
import WishlistPage from './pages/WishlistPage'
import ItemPage from './pages/ItemPage'
import ProfilePage from './pages/ProfilePage'
import SupportPage from './pages/SupportPage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import OrdersPage from './pages/admin/OrdersPage'
import StockPage from './pages/admin/StockPage'
import AuditPage from './pages/admin/AuditPage'
import { seedDemo } from './utils/seedDemo'
import './App.css'

seedDemo()

function StoreShell({ cart, addToCart, removeFromCart, wishlist, toggleWishlist }) {
  return (
    <>
      <NavigationBar cart={cart} removeFromCart={removeFromCart} wishlistCount={wishlist.length} />
      <Routes>
        <Route path='/'        element={<HomePage addToCart={addToCart} />} />
        <Route path='/store'    element={<StorePage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />} />
        <Route path='/wishlist' element={<WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />} />
        <Route path='/item/:id' element={<ItemPage addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path='/profile'  element={<ProfilePage />} />
        <Route path='/support'  element={<SupportPage />} />
        <Route path='*'         element={<NotFound />} />
      </Routes>
    </>
  )
}

function AppRoutes() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || [] }
    catch { return [] }
  })

  function addToCart(item) {
    setCart(prev => {
      const updated = [...prev, item]
      localStorage.setItem('cart', JSON.stringify(updated))
      return updated
    })
  }

  function removeFromCart(cartId) {
    setCart(prev => {
      const updated = prev.filter(i => i.cartId !== cartId)
      localStorage.setItem('cart', JSON.stringify(updated))
      return updated
    })
  }

  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist')) || [] }
    catch { return [] }
  })

  function toggleWishlist(id) {
    setWishlist(prev => {
      const updated = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      localStorage.setItem('wishlist', JSON.stringify(updated))
      return updated
    })
  }

  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return isAdmin ? (
    <Routes>
      <Route path='/admin' element={<AdminLayout />}>
        <Route index element={<Navigate to='/admin/dashboard' replace />} />
        <Route path='dashboard' element={<DashboardPage />} />
        <Route path='orders'    element={<OrdersPage />} />
        <Route path='stock'     element={<StockPage />} />
        <Route path='audit'     element={<AuditPage />} />
        <Route path='*'         element={<NotFound />} />
      </Route>
    </Routes>
  ) : (
    <StoreShell cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
  )
}

function App() {
  const [splashDone, setSplashDone] = useState(() => sessionStorage.getItem('splashSeen') === '1')

  function handleSplashDone() {
    sessionStorage.setItem('splashSeen', '1')
    setSplashDone(true)
  }

  if (!splashDone) return <Splash onDone={handleSplashDone} />

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
