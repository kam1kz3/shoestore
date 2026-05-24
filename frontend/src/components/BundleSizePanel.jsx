/**
 * Slide-up modal for buying a bundle. Steps the customer through each
 * constituent item picking a size for each, then emits one cart entry per
 * item via `onConfirm(items)`. Renders thumbnails per step and disables
 * Continue until a size is chosen.
 */
import { useState } from 'react'
import { getItemImages } from '../utils/itemImages'
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

function BundleSizePanel({ bundle, items, onConfirm, onClose }) {
  // { [itemId]: euSize }
  const [selected, setSelected] = useState({})
  const [error, setError] = useState(false)

  function pickSize(itemId, eu) {
    setSelected(prev => ({ ...prev, [itemId]: eu }))
    setError(false)
  }

  const allPicked = items.length > 0 && items.every(item => selected[item.id])

  function handleConfirm() {
    if (!allPicked) { setError(true); return }
    const picks = items.map(item => {
      const eu = selected[item.id]
      const size = sizes.find(s => s.eu === eu)
      return {
        id: item.id,
        brand: item.brand,
        name: item.name,
        colorway: item.colorway,
        sizeEu: size.eu,
        sizeUs: size.us,
      }
    })
    onConfirm(bundle, picks)
  }

  return (
    <div className='size-panel-backdrop' onClick={onClose}>
      <div className='size-panel size-panel--bundle' onClick={e => e.stopPropagation()}>
        <div className='size-panel-header'>
          <div>
            <p className='size-panel-name'>{bundle.name}</p>
            <p className='size-panel-colorway'>Bundle · {items.length} item{items.length === 1 ? '' : 's'}</p>
          </div>
          <button className='size-panel-close' onClick={onClose} aria-label='Close'>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && (
          <p className='size-panel-label size-panel-label--error'>Pick a size for every item</p>
        )}

        <div className='bundle-panel-items'>
          {items.map(item => {
            const img = getItemImages(item.id)[0]
            return (
              <div key={item.id} className='bundle-panel-item'>
                <div className='bundle-panel-item-header'>
                  {img && <img src={img} alt={item.name} className='bundle-panel-item-image' />}
                  <div className='bundle-panel-item-meta'>
                    <p className='bundle-panel-item-name'>{item.name}</p>
                    <p className='bundle-panel-item-colorway'>{item.colorway}</p>
                  </div>
                </div>
                <div className='bundle-panel-sizes'>
                  {sizes.map(s => (
                    <button
                      key={s.eu}
                      className={`bundle-panel-size${selected[item.id] === s.eu ? ' bundle-panel-size--active' : ''}`}
                      onClick={() => pickSize(item.id, s.eu)}
                    >
                      <span className='bundle-panel-size-eu'>EU {s.eu}</span>
                      <span className='bundle-panel-size-us'>US {s.us}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <button className='size-panel-confirm' onClick={handleConfirm} disabled={items.length === 0}>
          Add Bundle to Cart — ${bundle.bundlePrice.toFixed(2)}
        </button>
      </div>
    </div>
  )
}

export default BundleSizePanel
