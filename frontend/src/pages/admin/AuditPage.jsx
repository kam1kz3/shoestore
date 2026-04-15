import { useState, useMemo } from 'react'
import { orders } from '../../data/adminData.js'
import '../../admin.css'

const TAX_RATE = 0.15

const statusColor = {
  delivered:  'admin-badge--green',
  shipped:    'admin-badge--blue',
  processing: 'admin-badge--yellow',
}

// ── helpers ────────────────────────────────────────────────

function weekLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const mon = new Date(d); mon.setDate(d.getDate() - ((day + 6) % 7))
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  const fmt = x => x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(mon)} – ${fmt(sun)}`
}

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

function AuditPage() {
  const [period, setPeriod]           = useState('monthly')   // 'yearly' | 'quarterly' | 'monthly'
  const [selectedYear, setSelectedYear] = useState(allYears[allYears.length - 1])
  const [ledgerFilter, setLedgerFilter] = useState('all')

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
