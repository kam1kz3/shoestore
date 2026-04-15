import { useState } from 'react'
import '../App.css'

const sizes = [
  { eu: 39, us: 6.5 },
  { eu: 40, us: 7 },
  { eu: 41, us: 8 },
  { eu: 42, us: 8.5 },
  { eu: 43, us: 9.5 },
  { eu: 44, us: 10 },
  { eu: 45, us: 11 },
]

function SizePanel({ item, onConfirm, onClose }) {
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(false)

  function handleConfirm() {
    if (!selected) { setError(true); return }
    const size = sizes.find(s => s.eu === selected)
    onConfirm(item, size)
  }

  return (
    <div className='size-panel-backdrop' onClick={onClose}>
      <div className='size-panel' onClick={e => e.stopPropagation()}>
        <div className='size-panel-header'>
          <div>
            <p className='size-panel-name'>{item.name}</p>
            <p className='size-panel-colorway'>{item.colorway}</p>
          </div>
          <button className='size-panel-close' onClick={onClose} aria-label='Close'>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p className={`size-panel-label${error ? ' size-panel-label--error' : ''}`}>
          {error ? 'Please select a size' : 'Select Size'}
        </p>

        <div className='size-panel-grid'>
          {sizes.map(s => (
            <button
              key={s.eu}
              className={`size-panel-item${selected === s.eu ? ' size-panel-item--active' : ''}`}
              onClick={() => { setSelected(s.eu); setError(false) }}
            >
              <span className='size-panel-eu'>EU {s.eu}</span>
              <span className='size-panel-us'>US {s.us}</span>
            </button>
          ))}
        </div>

        <button className='size-panel-confirm' onClick={handleConfirm}>
          Add to Cart — ${item.price.toFixed(2)}
        </button>
      </div>
    </div>
  )
}

export default SizePanel
