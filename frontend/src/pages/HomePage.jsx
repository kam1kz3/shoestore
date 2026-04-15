import { useState, useRef, useEffect } from 'react'
import item1 from '../assets/home_display_item_1.png'
import item2 from '../assets/home_display_item_2.png'
import item3 from '../assets/home_display_item_3.png'
import item4 from '../assets/home_display_item_4.png'
import item5 from '../assets/home_display_item_5.png'
import homeItems from '../data/homeItems.json'
import '../App.css'

const images = [item1, item2, item3, item4, item5]

const defaultColors = homeItems.map(i => i.accentColor)

function loadColors() {
  try { return JSON.parse(localStorage.getItem('displayAccentColors')) || defaultColors }
  catch { return defaultColors }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const sizes = [
  { eu: 39, us: 6.5 },
  { eu: 40, us: 7 },
  { eu: 41, us: 8 },
  { eu: 42, us: 8.5 },
  { eu: 43, us: 9.5 },
  { eu: 44, us: 10 },
  { eu: 45, us: 11 },
]

function HomePage({ addToCart }) {
  const [index, setIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [sizeError, setSizeError] = useState(false)
  const [accentColors] = useState(loadColors)

  const prev = () => setIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setIndex(i => (i + 1) % images.length)

  const touchStartX = useRef(null)

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  const item = homeItems[index]

  useEffect(() => {
    const accent = accentColors[index] || defaultColors[index]
    const root = document.documentElement.style
    root.setProperty('--accent',        accent)
    root.setProperty('--accent-bg',     hexToRgba(accent, 0.1))
    root.setProperty('--accent-border', hexToRgba(accent, 0.4))
    return () => {
      root.removeProperty('--accent')
      root.removeProperty('--accent-bg')
      root.removeProperty('--accent-border')
    }
  }, [index, accentColors])

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 2000)
      return
    }
    const size = sizes.find(s => s.eu === selectedSize)
    addToCart({
      cartId: `${item.id}-${selectedSize}-${Date.now()}`,
      id: item.id,
      brand: item.brand,
      name: item.name,
      colorway: item.colorway,
      price: item.price,
      sizeEu: size.eu,
      sizeUs: size.us,
    })
  }

  return (
    <div className='home-container' onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className='home-info'>
        {item.tag && <span className='home-info-tag'>{item.tag}</span>}
        <p className='home-info-brand'>{item.brand}</p>
        <h1 className='home-info-name'>{item.name}</h1>
        <p className='home-info-colorway'>{item.colorway}</p>
        <p className='home-info-price'>${item.price.toFixed(2)}</p>
        <p className='home-info-description'>{item.description}</p>
      </div>

      <img
        key={index}
        src={images[index]}
        alt={item.name}
        className='home-display-image'
      />

      <div className='home-bottom-center'>
        <button className='home-btn home-btn--outline' onClick={() => {}}>View All</button>
        <button className='home-btn home-btn--solid' onClick={handleAddToCart}>Add to Cart</button>
      </div>

      <div className='home-sizes'>
        <p className={`home-sizes-label${sizeError ? ' home-sizes-label--error' : ''}`}>
          {sizeError ? 'Please select a size' : 'Select Size'}
        </p>
        <div className={`home-sizes-scroll${sizeError ? ' home-sizes-scroll--error' : ''}`}>
          {sizes.map((s) => (
            <button
              key={s.eu}
              className={`home-size-item${selectedSize === s.eu ? ' home-size-item--active' : ''}`}
              onClick={() => { setSelectedSize(s.eu); setSizeError(false) }}
            >
              <span className='home-size-eu'>EU {s.eu}</span>
              <span className='home-size-us'>US {s.us}</span>
            </button>
          ))}
        </div>
        <select
          className={`home-sizes-select${sizeError ? ' home-sizes-select--error' : ''}`}
          value={selectedSize ?? ''}
          onChange={e => { setSelectedSize(Number(e.target.value)); setSizeError(false) }}
        >
          <option value='' disabled>Select a size</option>
          {sizes.map(s => (
            <option key={s.eu} value={s.eu}>EU {s.eu} / US {s.us}</option>
          ))}
        </select>
      </div>

      <div className='home-nav'>
        <button className='home-nav-button' onClick={prev} aria-label='Previous'>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className='home-nav-dots'>
          {images.map((_, i) => (
            <button
              key={i}
              className={`home-nav-dot${i === index ? ' home-nav-dot--active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>

        <button className='home-nav-button' onClick={next} aria-label='Next'>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default HomePage
