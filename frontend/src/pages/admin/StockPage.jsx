import { useState } from 'react'
import { loadCatalog, saveCatalog, loadDisplayOrder, saveDisplayOrder } from '../../utils/catalog.js'
import { loadAllItemImages, saveItemImages } from '../../utils/itemImages.js'
import '../../admin.css'

function loadColors() {
  try {
    const stored = JSON.parse(localStorage.getItem('displayAccentColors'))
    if (Array.isArray(stored) && stored.length) return stored
  } catch {}
  // Fall back to the accent colors of whatever items are in the current display order
  const catalog = loadCatalog()
  return loadDisplayOrder().map(id => catalog.find(i => i.id === id)?.accentColor ?? '#08060d')
}

function saveColors(colors) {
  localStorage.setItem('displayAccentColors', JSON.stringify(colors))
}

const BLANK_ITEM = {
  brand: '', name: '', colorway: '', price: '', stock: '',
  tag: '', description: '', accentColor: '#08060d', tileSize: 'small',
}

// Downsample + re-encode as JPEG so images stay well within localStorage limits.
// A 2 MB photo compresses to ~60–120 KB, making 5 images per item feasible.
function compressImage(dataUrl) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const MAX = 900
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.78))
    }
    img.onerror = () => resolve(dataUrl)   // fallback: keep original if canvas fails
    img.src = dataUrl
  })
}

function readFiles(files, existing, max, onDone) {
  const slots = max - existing.length
  const accepted = Array.from(files)
    .filter(f => f.type.startsWith('image/'))
    .slice(0, slots)
  if (!accepted.length) return
  Promise.all(
    accepted.map(file => new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = ev => compressImage(ev.target.result).then(resolve)
      reader.readAsDataURL(file)
    }))
  ).then(results => onDone(results))
}

function StockPage() {
  const [tab, setTab]                     = useState('inventory')
  const [items, setItems]                 = useState(loadCatalog)
  const [displayOrder, setDisplayOrder]   = useState(loadDisplayOrder)
  const [displayColors, setDisplayColors] = useState(loadColors)
  const [editingId, setEditingId]         = useState(null)
  const [showAddForm, setShowAddForm]     = useState(false)
  const [newItem, setNewItem]             = useState(BLANK_ITEM)
  const [newImages, setNewImages]         = useState([])
  const [dragOver, setDragOver]           = useState(false)
  const [savedImages, setSavedImages]     = useState(loadAllItemImages)

  // ── Persistence helper — wraps every items mutation ───
  function updateItems(updater) {
    setItems(prev => {
      const next = updater(prev)
      saveCatalog(next)
      return next
    })
  }

  // ── Image helpers ──────────────────────────────────────
  function persistImages(itemId, images) {
    saveItemImages(itemId, images)
    setSavedImages(prev => ({ ...prev, [itemId]: images }))
  }

  function handleNewImageUpload(e) {
    readFiles(e.target.files, newImages, 5, batch =>
      setNewImages(prev => [...prev, ...batch].slice(0, 5))
    )
    e.target.value = ''
  }

  function handleNewImageDrop(e) {
    e.preventDefault()
    setDragOver(false)
    readFiles(e.dataTransfer.files, newImages, 5, batch =>
      setNewImages(prev => [...prev, ...batch].slice(0, 5))
    )
  }

  function removeNewImage(idx) {
    setNewImages(prev => prev.filter((_, i) => i !== idx))
  }

  function handleEditImageUpload(itemId, e) {
    const current = savedImages[itemId] || []
    readFiles(e.target.files, current, 5, batch =>
      persistImages(itemId, [...current, ...batch].slice(0, 5))
    )
    e.target.value = ''
  }

  function removeEditImage(itemId, idx) {
    const updated = (savedImages[itemId] || []).filter((_, i) => i !== idx)
    persistImages(itemId, updated)
  }

  // ── Inventory helpers ──────────────────────────────────
  function updateStock(id, delta) {
    updateItems(prev => prev.map(i => i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i))
  }

  function removeItem(id) {
    updateItems(prev => prev.filter(i => i.id !== id))
    setDisplayOrder(prev => {
      const filtered = prev.filter(d => d !== id)
      saveDisplayOrder(filtered)
      return filtered
    })
  }

  function saveEdit(id, field, value) {
    updateItems(prev => prev.map(i => i.id === id
      ? { ...i, [field]: field === 'price' ? parseFloat(value) || 0 : value }
      : i
    ))
  }

  // imagesToSave is passed explicitly from the button click to avoid the React
  // Compiler hoisting newImages.length at render time (when it is still []).
  function addItem(imagesToSave) {
    if (!newItem.brand || !newItem.name) return
    const id = Math.max(...items.map(i => i.id), 0) + 1
    updateItems(prev => [...prev, {
      id,
      brand:       newItem.brand,
      name:        newItem.name,
      colorway:    newItem.colorway,
      price:       parseFloat(newItem.price) || 0,
      stock:       parseInt(newItem.stock)   || 0,
      tag:         newItem.tag         || null,
      description: newItem.description || '',
      accentColor: newItem.accentColor || '#08060d',
      tileSize:    newItem.tileSize    || 'small',
      onSale:    false,
      salePrice: null,
    }])
    if (imagesToSave?.length) persistImages(id, imagesToSave)
    setNewItem(BLANK_ITEM)
    setNewImages([])
    setShowAddForm(false)
  }

  // ── Sales helpers ──────────────────────────────────────
  function toggleSale(id) {
    updateItems(prev => prev.map(i => i.id === id
      ? { ...i, onSale: !i.onSale, salePrice: i.onSale ? null : i.salePrice }
      : i
    ))
  }

  function setSalePrice(id, value) {
    updateItems(prev => prev.map(i => i.id === id ? { ...i, salePrice: parseFloat(value) || null } : i))
  }

  // ── Display helpers ────────────────────────────────────
  function moveDisplay(idx, dir) {
    const target = idx + dir
    setDisplayOrder(prev => {
      if (target < 0 || target >= prev.length) return prev
      const arr = [...prev];[arr[idx], arr[target]] = [arr[target], arr[idx]]
      saveDisplayOrder(arr)
      return arr
    })
    setDisplayColors(prev => {
      if (target < 0 || target >= prev.length) return prev
      const arr = [...prev];[arr[idx], arr[target]] = [arr[target], arr[idx]]
      saveColors(arr); return arr
    })
  }

  function swapDisplay(idx, newId) {
    setDisplayOrder(prev => {
      const arr = [...prev]; arr[idx] = parseInt(newId)
      saveDisplayOrder(arr)
      return arr
    })
  }

  function setDisplayColor(idx, color) {
    setDisplayColors(prev => {
      const arr = [...prev]; arr[idx] = color; saveColors(arr); return arr
    })
  }

  return (
    <div className='admin-page'>
      <div className='admin-page-header'>
        <h1 className='admin-page-title'>Stock Management</h1>
      </div>

      {/* Tabs */}
      <div className='admin-tabs'>
        {['inventory', 'sales', 'display'].map(t => (
          <button
            key={t}
            className={`admin-tab${tab === t ? ' admin-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Inventory tab ── */}
      {tab === 'inventory' && (
        <div className='admin-card'>
          <div className='admin-card-top-row'>
            <p className='admin-card-title'>All Products</p>
            <button className='admin-btn admin-btn--solid' onClick={() => { setShowAddForm(v => !v); setNewItem(BLANK_ITEM); setNewImages([]) }}>
              {showAddForm ? 'Cancel' : '+ Add Item'}
            </button>
          </div>

          {showAddForm && (
            <div className='admin-add-form'>
              <input className='admin-input' placeholder='Brand *'    value={newItem.brand}    onChange={e => setNewItem(p => ({...p, brand:    e.target.value}))} />
              <input className='admin-input' placeholder='Name *'     value={newItem.name}     onChange={e => setNewItem(p => ({...p, name:     e.target.value}))} />
              <input className='admin-input' placeholder='Colorway'   value={newItem.colorway} onChange={e => setNewItem(p => ({...p, colorway: e.target.value}))} />
              <input className='admin-input' placeholder='Price'      type='number' value={newItem.price} onChange={e => setNewItem(p => ({...p, price: e.target.value}))} />
              <input className='admin-input' placeholder='Stock'      type='number' value={newItem.stock} onChange={e => setNewItem(p => ({...p, stock: e.target.value}))} />
              <input className='admin-input' placeholder='Tag (e.g. New Arrival — optional)' value={newItem.tag} onChange={e => setNewItem(p => ({...p, tag: e.target.value}))} />
              <textarea
                className='admin-input'
                placeholder='Description (optional)'
                value={newItem.description}
                onChange={e => setNewItem(p => ({...p, description: e.target.value}))}
                rows={3}
                style={{resize: 'vertical'}}
              />
              <div style={{display:'flex', alignItems:'center', gap:10, fontSize:13, color:'var(--admin-muted,#888)'}}>
                <span>Accent Colour</span>
                <input
                  type='color'
                  className='admin-color-picker'
                  value={newItem.accentColor}
                  onChange={e => setNewItem(p => ({...p, accentColor: e.target.value}))}
                />
              </div>
              <select
                className='admin-input admin-input--select'
                value={newItem.tileSize}
                onChange={e => setNewItem(p => ({...p, tileSize: e.target.value}))}
              >
                <option value='small'>Tile: Small</option>
                <option value='medium'>Tile: Medium</option>
                <option value='big'>Tile: Big</option>
              </select>

              {/* Upload zone */}
              <div className='admin-upload-row'>
                <label
                  className={`admin-upload-zone${dragOver ? ' admin-upload-zone--over' : ''}${newImages.length >= 5 ? ' admin-upload-zone--full' : ''}`}
                  htmlFor='new-item-images'
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleNewImageDrop}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>{newImages.length >= 5 ? 'Max 5 images reached' : 'Click or drag images here'}</span>
                  <span className='admin-upload-hint'>PNG · JPG · up to 5 images</span>
                </label>
                <input
                  id='new-item-images'
                  type='file'
                  accept='image/*'
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleNewImageUpload}
                  disabled={newImages.length >= 5}
                />

                {newImages.length > 0 && (
                  <div className='admin-upload-previews'>
                    {newImages.map((src, i) => (
                      <div key={i} className='admin-upload-thumb'>
                        <img src={src} alt={`Preview ${i + 1}`} />
                        <button className='admin-upload-thumb-remove' onClick={() => removeNewImage(i)} type='button'>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className='admin-btn admin-btn--solid' onClick={() => addItem(newImages)}>Save</button>
            </div>
          )}

          <table className='admin-table'>
            <thead>
              <tr>
                <th style={{width: 56}}>Image</th>
                <th>Brand</th>
                <th>Name</th>
                <th>Colorway</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Tile</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const imgs = savedImages[item.id] || []
                const isEditing = editingId === item.id
                return (
                  <tr key={item.id}>
                    {/* Image column */}
                    <td>
                      {isEditing ? (
                        <div className='admin-img-edit'>
                          {imgs.map((src, i) => (
                            <div key={i} className='admin-img-edit-thumb'>
                              <img src={src} alt='' />
                              <button onClick={() => removeEditImage(item.id, i)} type='button'>×</button>
                            </div>
                          ))}
                          {imgs.length < 5 && (
                            <>
                              <label className='admin-img-edit-add' htmlFor={`edit-img-${item.id}`} title='Add image'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              </label>
                              <input id={`edit-img-${item.id}`} type='file' accept='image/*' multiple style={{display:'none'}} onChange={e => handleEditImageUpload(item.id, e)} />
                            </>
                          )}
                        </div>
                      ) : (
                        imgs[0]
                          ? <img src={imgs[0]} alt={item.name} className='admin-item-thumb' />
                          : <div className='admin-item-thumb-empty'>—</div>
                      )}
                    </td>

                    <td>
                      {isEditing
                        ? <input className='admin-input admin-input--inline' defaultValue={item.brand} onBlur={e => saveEdit(item.id, 'brand', e.target.value)} />
                        : item.brand}
                    </td>
                    <td>
                      {isEditing
                        ? <input className='admin-input admin-input--inline' defaultValue={item.name} onBlur={e => saveEdit(item.id, 'name', e.target.value)} />
                        : item.name}
                    </td>
                    <td className='admin-table-muted'>
                      {isEditing
                        ? <input className='admin-input admin-input--inline' defaultValue={item.colorway} onBlur={e => saveEdit(item.id, 'colorway', e.target.value)} />
                        : item.colorway}
                    </td>
                    <td>
                      {isEditing
                        ? <input className='admin-input admin-input--inline' type='number' defaultValue={item.price} onBlur={e => saveEdit(item.id, 'price', e.target.value)} />
                        : `$${item.price.toFixed(2)}`}
                    </td>
                    <td>
                      <div className='admin-stock-ctrl'>
                        <button className='admin-stock-btn' onClick={() => updateStock(item.id, -1)}>−</button>
                        <span className={item.stock <= 3 ? 'admin-stock-low' : ''}>{item.stock}</span>
                        <button className='admin-stock-btn' onClick={() => updateStock(item.id, +1)}>+</button>
                      </div>
                    </td>
                    <td>
                      <select
                        className='admin-input admin-input--select'
                        value={item.tileSize || 'small'}
                        onChange={e => saveEdit(item.id, 'tileSize', e.target.value)}
                        style={{minWidth: 84}}
                      >
                        <option value='small'>Small</option>
                        <option value='medium'>Medium</option>
                        <option value='big'>Big</option>
                      </select>
                    </td>
                    <td>
                      <div className='admin-row-actions'>
                        <button className='admin-action-btn' onClick={() => setEditingId(isEditing ? null : item.id)}>
                          {isEditing ? 'Done' : 'Edit'}
                        </button>
                        <button className='admin-action-btn admin-action-btn--danger' onClick={() => removeItem(item.id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Sales tab ── */}
      {tab === 'sales' && (
        <div className='admin-card'>
          <p className='admin-card-title'>Sale Management</p>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Original Price</th>
                <th>Sale Price</th>
                <th>Discount</th>
                <th>On Sale</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const discount = item.onSale && item.salePrice
                  ? Math.round((1 - item.salePrice / item.price) * 100)
                  : null
                return (
                  <tr key={item.id}>
                    <td>
                      <p style={{margin:0}}>{item.name}</p>
                      <p className='admin-table-muted' style={{margin:0, fontSize:12}}>{item.colorway}</p>
                    </td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>
                      <input
                        className='admin-input admin-input--inline'
                        type='number'
                        placeholder='Set price'
                        value={item.salePrice ?? ''}
                        onChange={e => setSalePrice(item.id, e.target.value)}
                      />
                    </td>
                    <td>{discount != null ? <span className='admin-badge admin-badge--green'>{discount}% off</span> : '—'}</td>
                    <td>
                      <button
                        className={`admin-toggle${item.onSale ? ' admin-toggle--on' : ''}`}
                        onClick={() => toggleSale(item.id)}
                      >
                        {item.onSale ? 'On' : 'Off'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Display tab ── */}
      {tab === 'display' && (
        <div className='admin-card'>
          <p className='admin-card-title'>Homepage Display Order</p>
          <p className='admin-card-sub'>These 5 items appear on the homepage carousel in this order.</p>
          <div className='admin-display-list'>
            {displayOrder.map((itemId, idx) => {
              const item = items.find(i => i.id === itemId)
              return (
                <div key={idx} className='admin-display-row'>
                  <span className='admin-display-position'>{idx + 1}</span>
                  <div className='admin-display-info'>
                    {item ? (
                      <>
                        <p className='admin-display-name'>{item.name}</p>
                        <p className='admin-display-colorway'>{item.colorway}</p>
                      </>
                    ) : (
                      <p className='admin-display-name admin-table-muted'>Item not found</p>
                    )}
                  </div>
                  <select
                    className='admin-input admin-input--select'
                    value={itemId}
                    onChange={e => swapDisplay(idx, e.target.value)}
                  >
                    {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                  <div className='admin-display-color'>
                    <label className='admin-display-color-label'>Accent</label>
                    <input
                      type='color'
                      className='admin-color-picker'
                      value={displayColors[idx] || '#08060d'}
                      onChange={e => setDisplayColor(idx, e.target.value)}
                    />
                  </div>
                  <div className='admin-display-arrows'>
                    <button className='admin-stock-btn' onClick={() => moveDisplay(idx, -1)} disabled={idx === 0}>↑</button>
                    <button className='admin-stock-btn' onClick={() => moveDisplay(idx,  1)} disabled={idx === displayOrder.length - 1}>↓</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default StockPage
