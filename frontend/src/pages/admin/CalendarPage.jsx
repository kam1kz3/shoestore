import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { orders } from '../../data/adminData.js'
import '../../admin.css'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const statusColor = {
  delivered:  'admin-badge--green',
  shipped:    'admin-badge--blue',
  processing: 'admin-badge--yellow',
}

function CalendarPage() {
  const { state } = useLocation()
  const initialDate = state?.date || '2026-03-30'
  const initYear  = parseInt(initialDate.split('-')[0])
  const initMonth = parseInt(initialDate.split('-')[1]) - 1

  const [year, setYear]         = useState(initYear)
  const [month, setMonth]       = useState(initMonth)
  const [selected, setSelected] = useState(initialDate)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const firstDay   = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Map orders to their date strings
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

  return (
    <div className='admin-page'>
      <div className='admin-page-header'>
        <h1 className='admin-page-title'>Calendar</h1>
      </div>

      <div className='admin-calendar-layout'>
        <div className='admin-calendar-left'>
          {/* Month nav */}
          <div className='admin-cal-header'>
            <button className='admin-cal-nav-btn' onClick={prevMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <p className='admin-cal-month'>{MONTHS[month]} {year}</p>
            <button className='admin-cal-nav-btn' onClick={nextMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Day labels */}
          <div className='admin-cal-grid'>
            {DAYS.map(d => (
              <div key={d} className='admin-cal-day-label'>{d}</div>
            ))}

            {cells.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} />
              const ds = dateStr(d)
              const dayOrders = ordersByDate[ds] || []
              const isSelected = selected === ds
              const isToday = ds === '2026-03-30'
              return (
                <button
                  key={ds}
                  className={`admin-cal-day${isSelected ? ' admin-cal-day--selected' : ''}${isToday ? ' admin-cal-day--today' : ''}`}
                  onClick={() => setSelected(ds)}
                >
                  <span className='admin-cal-day-num'>{d}</span>
                  {dayOrders.length > 0 && (
                    <span className='admin-cal-dot-row'>
                      {dayOrders.slice(0, 3).map((_, idx) => (
                        <span key={idx} className='admin-cal-dot' />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Day detail */}
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
    </div>
  )
}

export default CalendarPage
