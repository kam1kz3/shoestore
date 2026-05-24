/**
 * Admin dashboard. KPI cards (total stock, total orders, today's orders,
 * audit shortcut) + recent-orders list + low-stock list. Stock figures read
 * from the live catalog (`loadCatalog().filter(i => i.kind !== 'bundle')`),
 * so admin edits in the Stock page reflect here on next mount.
 *
 * Order data is still the static seed in adminData.js — there is no order
 * creation flow.
 */
import { useNavigate } from 'react-router-dom'
import { orders } from '../../data/adminData.js'
import { loadCatalog } from '../../utils/catalog.js'
import '../../admin.css'

const statusColor = {
  delivered:  'admin-badge--green',
  shipped:    'admin-badge--blue',
  processing: 'admin-badge--yellow',
}

function StatCard({ label, value, sub, accent, onClick }) {
  return (
    <div
      className={`admin-stat-card${accent ? ' admin-stat-card--accent' : ''}${onClick ? ' admin-stat-card--link' : ''}`}
      onClick={onClick}
    >
      <p className='admin-stat-value'>{value}</p>
      <p className='admin-stat-label'>{label}</p>
      {sub && <p className='admin-stat-sub'>{sub}</p>}
    </div>
  )
}

function DashboardPage() {
  const navigate = useNavigate()
  const TODAY = new Date().toISOString().slice(0, 10)

  const products     = loadCatalog().filter(i => i.kind !== 'bundle')
  const totalStock   = products.reduce((s, i) => s + (i.stock || 0), 0)
  const totalOrders  = orders.length
  const todayOrders  = orders.filter(o => o.date === TODAY)
  const lowStock     = products.filter(i => (i.stock || 0) <= 3)
  const recentOrders = [...orders].reverse().slice(0, 8)

  function goToOrders(date) {
    navigate('/admin/orders', { state: { date } })
  }

  return (
    <div className='admin-page'>
      <div className='admin-page-header'>
        <h1 className='admin-page-title'>Dashboard</h1>
        <p className='admin-page-date'>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stat cards */}
      <div className='admin-stat-grid'>
        <StatCard label='Total Stock'    value={totalStock}        sub='units across all products' onClick={() => navigate('/admin/stock')} />
        <StatCard label='Total Orders'  value={totalOrders}       sub='all time'                  onClick={() => goToOrders(null)} />
        <StatCard label="Today's Orders" value={todayOrders.length} sub='going out today' accent  onClick={() => goToOrders(TODAY)} />
        <StatCard label='Audit & Tax'   value='View →'            sub='revenue · tax · ledger'    onClick={() => navigate('/admin/audit')} />
      </div>

      <div className='admin-dashboard-grid'>
        {/* Recent orders */}
        <div className='admin-card'>
          <div className='admin-card-top-row'>
            <p className='admin-card-title'>Recent Orders</p>
            <button className='admin-action-btn' onClick={() => goToOrders(null)}>View All</button>
          </div>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr
                  key={o.id}
                  className='admin-table-row--link'
                  onClick={() => goToOrders(o.date)}
                >
                  <td className='admin-table-mono'>{o.id}</td>
                  <td>{o.customer}</td>
                  <td className='admin-table-muted'>{o.product}</td>
                  <td>${o.total.toFixed(2)}</td>
                  <td><span className={`admin-badge ${statusColor[o.status]}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='admin-dashboard-side'>
          {/* Today's orders */}
          <div className='admin-card'>
            <div className='admin-card-top-row'>
              <p className='admin-card-title'>Going Out Today</p>
              <button className='admin-action-btn' onClick={() => goToOrders(TODAY)}>View</button>
            </div>
            {todayOrders.length === 0 ? (
              <p className='admin-empty'>No orders today.</p>
            ) : (
              <div className='admin-today-list'>
                {todayOrders.map(o => (
                  <div
                    key={o.id}
                    className='admin-today-item admin-today-item--link'
                    onClick={() => goToOrders(TODAY)}
                  >
                    <div>
                      <p className='admin-today-customer'>{o.customer}</p>
                      <p className='admin-today-product'>{o.product} · EU {o.sizeEu}</p>
                    </div>
                    <p className='admin-today-total'>${o.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low stock */}
          <div className='admin-card'>
            <div className='admin-card-top-row'>
              <p className='admin-card-title'>Low Stock Alerts</p>
              <button className='admin-action-btn' onClick={() => navigate('/admin/stock')}>Manage</button>
            </div>
            {lowStock.length === 0 ? (
              <p className='admin-empty'>All items are well stocked.</p>
            ) : (
              <div className='admin-lowstock-list'>
                {lowStock.map(i => (
                  <div
                    key={i.id}
                    className='admin-lowstock-item admin-lowstock-item--link'
                    onClick={() => navigate('/admin/stock')}
                  >
                    <div>
                      <p className='admin-lowstock-name'>{i.name}</p>
                      <p className='admin-lowstock-colorway'>{i.colorway}</p>
                    </div>
                    <span className='admin-badge admin-badge--red'>{i.stock} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
