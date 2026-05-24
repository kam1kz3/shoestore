/**
 * 404 page. Mounted as the catch-all `<Route path='*'>` in both the storefront
 * Routes and the admin nested Routes — auto-detects which side it's on via the
 * `/admin` URL prefix and adjusts the CTA accordingly. Renders inside its
 * parent shell (NavBar on storefront, AdminLayout sidebar on admin).
 */
import { Link, useLocation } from 'react-router-dom'

function NotFound() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  return (
    <div className={`not-found${isAdmin ? ' not-found--admin' : ''}`}>
      <p className='not-found-code'>404</p>
      <h1 className='not-found-title'>Page not found</h1>
      <p className='not-found-sub'>
        We couldn't find <code className='not-found-path'>{pathname}</code>.
      </p>
      <Link
        className='not-found-cta'
        to={isAdmin ? '/admin/dashboard' : '/'}
      >
        {isAdmin ? 'Back to Dashboard' : 'Back to Home'}
      </Link>
    </div>
  )
}

export default NotFound
