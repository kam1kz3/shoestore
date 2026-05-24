/**
 * Audit + finance. Two-in-one view:
 *  - Activity feed merges admin events (from `activityLog`) with order
 *    events (synthesized from order data — one per order, status-tagged)
 *    into a single timeline filtered by type + period.
 *  - Financial sections: summary stats (gross / tax / net / AOV), period
 *    breakdown (yearly / quarterly / monthly), revenue-by-product, status
 *    breakdown, and the full filterable ledger.
 *
 * Period filter at the top controls both halves.
 */
import { useState, useMemo } from 'react'
import { orders } from '../../data/adminData.js'
import { loadActivity } from '../../utils/activityLog.js'
import '../../admin.css'

const TAX_RATE = 0.15

const statusColor = {
  delivered:  'admin-badge--green',
  shipped:    'admin-badge--blue',
  processing: 'admin-badge--yellow',
}

// ── helpers ────────────────────────────────────────────────

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = keyFn(item)
    acc[k] = acc[k] || []
    acc[k].push(item)
    return acc
  }, {})
}

function getQuarter(dateStr) {
  const month = parseInt(dateStr.slice(5, 7), 10)
  return `Q${Math.ceil(month / 3)}`
}

const allYears = [...new Set(orders.map(o => o.date.slice(0, 4)))].sort()

// ── component ───────────────────────────────────────────────

// ── Activity feed helpers ──────────────────────────────────

const TYPE_LABEL = {
  order:   'Order',
  stock:   'Stock',
  sale:    'Sale',
  catalog: 'Catalog',
  bundle:  'Bundle',
}

function relativeTime(ts) {
  const d  = new Date(ts)
  const now = new Date()
  const diffMs = now - d
  const diffMin  = Math.round(diffMs / 60000)
  const diffHour = Math.round(diffMs / 3600000)
  const diffDay  = Math.round(diffMs / 86400000)
  if (diffMin < 1)   return 'just now'
  if (diffMin < 60)  return `${diffMin} min ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`
  if (diffDay < 7)   return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function AuditPage() {
  const [period, setPeriod]             = useState('monthly')   // 'yearly' | 'quarterly' | 'monthly'
  const [selectedYear, setSelectedYear] = useState(allYears[allYears.length - 1])
  const [ledgerFilter, setLedgerFilter] = useState('all')
  const [activityFilter, setActivityFilter] = useState('all')
  const [adminEvents] = useState(loadActivity)

  // orders scoped to selected year
  const yearOrders = useMemo(
    () => orders.filter(o => o.date.startsWith(selectedYear)),
    [selectedYear]
  )

  // summary stats for selected year
  const totalRevenue  = yearOrders.reduce((s, o) => s + o.total, 0)
  const totalTax      = totalRevenue * TAX_RATE
  const avgOrderValue = yearOrders.length ? totalRevenue / yearOrders.length : 0

  // period breakdown rows
  const breakdownRows = useMemo(() => {
    if (period === 'yearly') {
      return allYears.map(year => {
        const ords = orders.filter(o => o.date.startsWith(year))
        const rev  = ords.reduce((s, o) => s + o.total, 0)
        return { label: year, orders: ords.length, revenue: rev, tax: rev * TAX_RATE }
      })
    }
    if (period === 'quarterly') {
      const byQ = groupBy(yearOrders, o => getQuarter(o.date))
      return ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
        const ords = byQ[q] || []
        const rev  = ords.reduce((s, o) => s + o.total, 0)
        return { label: q, orders: ords.length, revenue: rev, tax: rev * TAX_RATE }
      })
    }
    // monthly
    const byMonth = groupBy(yearOrders, o => o.date.slice(0, 7))
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, ords]) => {
        const rev = ords.reduce((s, o) => s + o.total, 0)
        return {
          label: new Date(month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          orders: ords.length,
          revenue: rev,
          tax: rev * TAX_RATE,
        }
      })
  }, [period, yearOrders])

  // product & status breakdowns — always scoped to selected year
  const productRows = useMemo(() => {
    const byProduct = groupBy(yearOrders, o => o.product)
    return Object.entries(byProduct)
      .map(([product, ords]) => ({
        product,
        units: ords.length,
        revenue: ords.reduce((s, o) => s + o.total, 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [yearOrders])

  const statusRows = useMemo(() => {
    const byStatus = groupBy(yearOrders, o => o.status)
    return Object.entries(byStatus).map(([status, ords]) => ({
      status,
      count: ords.length,
      revenue: ords.reduce((s, o) => s + o.total, 0),
    }))
  }, [yearOrders])

  const filteredOrders = useMemo(() => {
    const base = ledgerFilter === 'all' ? yearOrders : yearOrders.filter(o => o.status === ledgerFilter)
    return [...base].reverse()
  }, [yearOrders, ledgerFilter])

  const periodLabel = period === 'yearly' ? 'All years' : selectedYear

  // ── Merged activity feed: order events + admin events ─────
  const activityFeed = useMemo(() => {
    // Order events — synthesize from order data (date + status)
    const orderEvents = yearOrders.map(o => ({
      id:    `order-${o.id}`,
      ts:    `${o.date}T12:00:00.000Z`,  // noon UTC keeps order events stable vs admin times
      type:  'order',
      message: `${o.customer} ordered ${o.product} (EU ${o.sizeEu}) — $${o.total.toFixed(2)}`,
      meta:  { orderId: o.id, status: o.status, total: o.total },
    }))

    // Admin events — scoped to selected year (or all years if period === 'yearly')
    const adminScoped = period === 'yearly'
      ? adminEvents
      : adminEvents.filter(e => e.ts.startsWith(selectedYear))

    const merged = [...orderEvents, ...adminScoped]
      .sort((a, b) => b.ts.localeCompare(a.ts))

    return activityFilter === 'all'
      ? merged
      : merged.filter(e => e.type === activityFilter)
  }, [yearOrders, adminEvents, period, selectedYear, activityFilter])

  // Per-type counts for filter chip badges
  const activityCounts = useMemo(() => {
    const adminScoped = period === 'yearly'
      ? adminEvents
      : adminEvents.filter(e => e.ts.startsWith(selectedYear))
    const counts = { all: yearOrders.length + adminScoped.length, order: yearOrders.length, stock: 0, sale: 0, catalog: 0, bundle: 0 }
    for (const e of adminScoped) counts[e.type] = (counts[e.type] || 0) + 1
    return counts
  }, [yearOrders, adminEvents, period, selectedYear])

  return (
    <div className='admin-page'>
      <div className='admin-page-header'>
        <h1 className='admin-page-title'>Audit &amp; Tax</h1>
        <p className='admin-page-date'>Tax rate: {TAX_RATE * 100}%</p>
      </div>

      {/* Filter bar */}
      <div className='admin-audit-filters'>
        <div className='admin-audit-filter-group'>
          <label className='admin-audit-filter-label'>Period</label>
          <div className='admin-audit-toggle'>
            {['monthly', 'quarterly', 'yearly'].map(p => (
              <button
                key={p}
                className={`admin-audit-toggle-btn${period === p ? ' admin-audit-toggle-btn--active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {period !== 'yearly' && (
          <div className='admin-audit-filter-group'>
            <label className='admin-audit-filter-label'>Year</label>
            <select
              className='admin-input admin-input--select'
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
            >
              {allYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className='admin-stat-grid admin-stat-grid--5'>
        <div className='admin-stat-card'>
          <p className='admin-stat-value'>${totalRevenue.toFixed(2)}</p>
          <p className='admin-stat-label'>Gross Revenue</p>
          <p className='admin-stat-sub'>{periodLabel}</p>
        </div>
        <div className='admin-stat-card admin-stat-card--accent'>
          <p className='admin-stat-value'>${totalTax.toFixed(2)}</p>
          <p className='admin-stat-label'>Est. Tax Liability</p>
          <p className='admin-stat-sub'>at {TAX_RATE * 100}%</p>
        </div>
        <div className='admin-stat-card'>
          <p className='admin-stat-value'>${(totalRevenue - totalTax).toFixed(2)}</p>
          <p className='admin-stat-label'>Net Revenue</p>
          <p className='admin-stat-sub'>after estimated tax</p>
        </div>
        <div className='admin-stat-card'>
          <p className='admin-stat-value'>{yearOrders.length}</p>
          <p className='admin-stat-label'>Total Orders</p>
          <p className='admin-stat-sub'>{periodLabel}</p>
        </div>
        <div className='admin-stat-card'>
          <p className='admin-stat-value'>${avgOrderValue.toFixed(2)}</p>
          <p className='admin-stat-label'>Avg. Order Value</p>
          <p className='admin-stat-sub'>{periodLabel}</p>
        </div>
      </div>

      {/* ── Activity feed ──────────────────────────── */}
      <div className='admin-card'>
        <div className='admin-card-top-row'>
          <p className='admin-card-title'>Activity ({periodLabel})</p>
          <span className='admin-orders-count'>{activityFeed.length} events</span>
        </div>

        <div className='admin-activity-filters'>
          {['all', 'order', 'stock', 'sale', 'catalog', 'bundle'].map(t => (
            <button
              key={t}
              className={`admin-activity-chip${activityFilter === t ? ' admin-activity-chip--active' : ''}`}
              onClick={() => setActivityFilter(t)}
            >
              {t === 'all' ? 'All' : TYPE_LABEL[t]}
              <span className='admin-activity-chip-count'>{activityCounts[t] || 0}</span>
            </button>
          ))}
        </div>

        {activityFeed.length === 0 ? (
          <p className='admin-empty'>No activity in this period.</p>
        ) : (
          <ul className='admin-activity-list'>
            {activityFeed.map(e => (
              <li key={e.id} className={`admin-activity-item admin-activity-item--${e.type}`}>
                <div className='admin-activity-marker' aria-hidden='true' />
                <div className='admin-activity-body'>
                  <div className='admin-activity-top'>
                    <span className={`admin-activity-type admin-activity-type--${e.type}`}>{TYPE_LABEL[e.type]}</span>
                    {e.type === 'order' && e.meta?.status && (
                      <span className={`admin-badge ${statusColor[e.meta.status]}`}>{e.meta.status}</span>
                    )}
                    <span className='admin-activity-time'>{relativeTime(e.ts)}</span>
                  </div>
                  <p className='admin-activity-message'>{e.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className='admin-audit-grid'>
        {/* Period breakdown */}
        <div className='admin-card'>
          <p className='admin-card-title'>
            {period === 'yearly' ? 'Yearly' : period === 'quarterly' ? `Quarterly (${selectedYear})` : `Monthly (${selectedYear})`} Breakdown
          </p>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>{period === 'yearly' ? 'Year' : period === 'quarterly' ? 'Quarter' : 'Month'}</th>
                <th>Orders</th>
                <th>Gross Revenue</th>
                <th>Est. Tax</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {breakdownRows.map(r => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{r.orders}</td>
                  <td>${r.revenue.toFixed(2)}</td>
                  <td className='admin-table-muted'>${r.tax.toFixed(2)}</td>
                  <td>${(r.revenue - r.tax).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Revenue by product */}
        <div className='admin-card'>
          <p className='admin-card-title'>Revenue by Product ({periodLabel})</p>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
                <th>Est. Tax</th>
              </tr>
            </thead>
            <tbody>
              {productRows.map(r => (
                <tr key={r.product}>
                  <td>{r.product}</td>
                  <td>{r.units}</td>
                  <td>${r.revenue.toFixed(2)}</td>
                  <td className='admin-table-muted'>${(r.revenue * TAX_RATE).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order status summary */}
      <div className='admin-card' style={{ marginBottom: '1.5rem' }}>
        <p className='admin-card-title'>Orders by Status ({periodLabel})</p>
        <table className='admin-table'>
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {statusRows.map(r => (
              <tr key={r.status}>
                <td><span className={`admin-badge ${statusColor[r.status]}`}>{r.status}</span></td>
                <td>{r.count}</td>
                <td>${r.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Full order ledger */}
      <div className='admin-card'>
        <div className='admin-card-top-row'>
          <p className='admin-card-title'>Full Order Ledger ({periodLabel})</p>
          <select
            className='admin-input admin-input--select'
            value={ledgerFilter}
            onChange={e => setLedgerFilter(e.target.value)}
          >
            <option value='all'>All statuses</option>
            <option value='delivered'>Delivered</option>
            <option value='shipped'>Shipped</option>
            <option value='processing'>Processing</option>
          </select>
        </div>
        <table className='admin-table'>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Size</th>
              <th>Gross</th>
              <th>Tax</th>
              <th>Net</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o.id}>
                <td className='admin-table-mono'>{o.id}</td>
                <td className='admin-table-muted'>{o.date}</td>
                <td>{o.customer}</td>
                <td className='admin-table-muted'>{o.product}</td>
                <td>EU {o.sizeEu}</td>
                <td>${o.total.toFixed(2)}</td>
                <td className='admin-table-muted'>${(o.total * TAX_RATE).toFixed(2)}</td>
                <td>${(o.total * (1 - TAX_RATE)).toFixed(2)}</td>
                <td><span className={`admin-badge ${statusColor[o.status]}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AuditPage
