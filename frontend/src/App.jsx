import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import NavigationBar from './components/navigationBar'
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
      </Route>
    </Routes>
  ) : (
    <StoreShell cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
