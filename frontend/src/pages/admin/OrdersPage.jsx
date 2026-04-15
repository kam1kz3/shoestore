import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { orders } from '../../data/adminData.js'
import '../../admin.css'

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const TODAY  = new Date().toISOString().slice(0, 10)

const statusColor = {
  delivered:  'admin-badge--green',
  shipped:    'admin-badge--blue',
  processing: 'admin-badge--yellow',
}

function loadCompleted() {
  try { return new Set(JSON.parse(localStorage.getItem('adminOrderCompletion')) || []) }
  catch { return new Set() }
}

function OrdersPage() {
  const { state } = useLocation()
  const initialDate = state?.date || TODAY
  const initYear    = parseInt(initialDate.split('-')[0])
  const initMonth   = parseInt(initialDate.split('-')[1]) - 1

  const [year, setYear]     = useState(initYear)
  const [month, setMonth]   = useState(initMonth)
  const [selected, setSelected] = useState(initialDate)

  const [completed, setCompleted]           = useState(loadCompleted)
  const [query, setQuery]                   = useState('')
  const [statusFilter, setStatusFilter]     = useState('all')
  const [completionFilter, setCompletionFilter] = useState('all')

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function toggleComplete(orderId) {
    setCompleted(prev => {
      const next = new Set(prev)
      next.has(orderId) ? next.delete(orderId) : next.add(orderId)
      localStorage.setItem('adminOrderCompletion', JSON.stringify([...next]))
      return next
    })
  }

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const ordersByDate = orders.reduce((acc, o) => {
    acc[o.date] = acc[o.date] || []
    acc[o.date].push(o)
    return acc
  }, {})

  const selectedOrders = selected ? (ordersByDate[selected] || []) : []

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function dateStr(d) {
    return `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }

  const filteredOrders = orders
    .filter(o => statusFilter === 'all' || o.status === statusFilter)
    .filter(o => {
      if (completionFilter === 'complete')   return completed.has(o.id)
      if (completionFilter === 'incomplete') return !completed.has(o.id)
      return true
    })
    .filter(o => {
      if (!query) return true
      const q = query.toLowerCase()
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q)
      )
    })

  return (
    <div className='admin-page'>
      <div className='admin-page-header'>
        <h1 className='admin-page-title'>Orders</h1>
      </div>

      {/* ── Calendar ──────────────────────────── */}
      <div className='admin-calendar-layout'>
        <div className='admin-calendar-left'>
          <div className='admin-cal-header'>
            <button className='admin-cal-nav-btn' onClick={prevMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <p className='admin-cal-month'>{MONTHS[month]} {year}</p>
            <button className='admin-cal-nav-btn' onClick={nextMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div className='admin-cal-grid'>
            {DAYS.map(d => <div key={d} className='admin-cal-day-label'>{d}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} />
              const ds          = dateStr(d)
              const dayOrders   = ordersByDate[ds] || []
              const isSelected  = selected === ds
              const isToday     = ds === TODAY
              return (
                <button
                  key={ds}
                  className={`admin-cal-day${isSelected ? ' admin-cal-day--selected' : ''}${isToday ? ' admin-cal-day--today' : ''}`}
                  onClick={() => setSelected(ds)}
                >
                  <span className='admin-cal-day-num'>{d}</span>
                  {dayOrders.length > 0 && (
                    <span className='admin-cal-dot-row'>
                      {dayOrders.slice(0, 3).map((_, idx) => <span key={idx} className='admin-cal-dot' />)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className='admin-calendar-right'>
          <p className='admin-card-title'>
            {selected
              ? new Date(selected + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : 'Select a day'}
          </p>
          {selectedOrders.length === 0 ? (
            <p className='admin-empty'>No orders on this day.</p>
          ) : (
            <div className='admin-cal-order-list'>
              {selectedOrders.map(o => (
                <div key={o.id} className='admin-cal-order-item'>
                  <div className='admin-cal-order-top'>
                    <span className='admin-table-mono'>{o.id}</span>
                    <span className={`admin-badge ${statusColor[o.status]}`}>{o.status}</span>
                  </div>
                  <p className='admin-cal-order-customer'>{o.customer}</p>
                  <p className='admin-cal-order-product'>{o.product} · {o.colorway} · EU {o.sizeEu}</p>
                  <p className='admin-cal-order-total'>${o.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Orders list ───────────────────────── */}
      <div className='admin-card admin-orders-card'>
        <div className='admin-card-top-row'>
          <p className='admin-card-title'>All Orders</p>
          <span className='admin-orders-count'>{filteredOrders.length} / {orders.length}</span>
        </div>

        <div className='admin-orders-toolbar'>
          <div className='admin-orders-search-wrap'>
            <svg className='admin-orders-search-icon' xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className='admin-orders-search'
              type='text'
              placeholder='Search by order, customer or product…'
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className='admin-orders-filters'>
            <select className='admin-input admin-input--select admin-orders-filter' value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value='all'>All Statuses</option>
              <option value='processing'>Processing</option>
              <option value='shipped'>Shipped</option>
              <option value='delivered'>Delivered</option>
            </select>
            <select className='admin-input admin-input--select admin-orders-filter' value={completionFilter} onChange={e => setCompletionFilter(e.target.value)}>
              <option value='all'>All Orders</option>
              <option value='incomplete'>Incomplete</option>
              <option value='complete'>Complete</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <p className='admin-empty'>No orders match your filters.</p>
        ) : (
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id} className={completed.has(o.id) ? 'admin-orders-row--done' : ''}>
                  <td className='admin-table-mono'>{o.id}</td>
                  <td>{o.customer}</td>
                  <td className='admin-table-muted'>{o.product} · {o.colorway} · EU {o.sizeEu}</td>
                  <td className='admin-table-muted'>{o.date}</td>
                  <td>${o.total.toFixed(2)}</td>
                  <td><span className={`admin-badge ${statusColor[o.status]}`}>{o.status}</span></td>
                  <td>
                    <button
                      className={`admin-complete-btn${completed.has(o.id) ? ' admin-complete-btn--done' : ''}`}
                      onClick={() => toggleComplete(o.id)}
                    >
                      {completed.has(o.id) ? 'Complete' : 'Incomplete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
