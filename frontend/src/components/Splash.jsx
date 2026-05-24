import { useEffect, useState } from 'react'

/**
 * Brief logo intro shown on first session visit.
 * Total runtime: ~1100ms (800ms display + 300ms fade-out).
 * Gated by sessionStorage so it only plays once per browser session.
 */
function Splash({ onDone }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 800)
    const t2 = setTimeout(() => onDone(), 1100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div className={`splash${exiting ? ' splash--exit' : ''}`}>
      <p className='splash-logo'>SOLESTORE</p>
      <p className='splash-tag'>SNEAKER RETAIL</p>
    </div>
  )
}

export default Splash
