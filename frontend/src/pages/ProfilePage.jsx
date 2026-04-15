import { useState, useEffect } from 'react'
import '../App.css'

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Arabic', 'Mandarin']
const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'ZAR', label: 'ZAR — South African Rand' },
  { code: 'JPY', label: 'JPY — Japanese Yen' },
  { code: 'AUD', label: 'AUD — Australian Dollar' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
]
const EU_SIZES = [39, 40, 41, 42, 43, 44, 45]

function loadData(key, defaults) {
  try { return { ...defaults, ...(JSON.parse(localStorage.getItem(key)) || {}) } }
  catch { return defaults }
}

const NAV = [
  {
    id: 'profile', label: 'Profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'preferences', label: 'Preferences',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
        <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'security', label: 'Security',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    id: 'about', label: 'About',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
]

function Toggle({ on, onToggle, label }) {
  return (
    <button
      className={`profile-toggle${on ? ' profile-toggle--on' : ''}`}
      onClick={onToggle}
      aria-label={label}
    />
  )
}

function SaveBtn({ saved, onClick }) {
  return (
    <button className={`profile-save-btn${saved ? ' profile-save-btn--saved' : ''}`} onClick={onClick}>
      {saved ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Saved
        </>
      ) : 'Save Changes'}
    </button>
  )
}

function ProfilePage() {
  useEffect(() => {
    const root = document.documentElement.style
    root.removeProperty('--accent')
    root.removeProperty('--accent-bg')
    root.removeProperty('--accent-border')
  }, [])

  const [section, setSection] = useState('profile')
  const [savedSection, setSavedSection] = useState(null)

  const [profile, setProfile] = useState(() => loadData('userProfile', {
    username: '',
    displayName: '',
    bio: '',
    avatarColor: '#7b6ec9',
    visibility: 'public',
  }))

  const [prefs, setPrefs] = useState(() => loadData('userPreferences', {
    language: 'English',
    currency: 'USD',
    defaultSize: '',
    sizeSystem: 'EU',
    newsletter: false,
    orderUpdates: true,
    newArrivals: false,
  }))

  const [security, setSecurity] = useState(() => loadData('userSecurity', {
    email: '',
    twoFactor: false,
  }))

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState(null)

  function save(key, data, id) {
    localStorage.setItem(key, JSON.stringify(data))
    setSavedSection(id)
    setTimeout(() => setSavedSection(null), 2000)
  }

  function handlePasswordChange() {
    if (!passwords.current) { setPasswordMsg({ ok: false, text: 'Enter your current password.' }); return }
    if (passwords.next.length < 8) { setPasswordMsg({ ok: false, text: 'New password must be at least 8 characters.' }); return }
    if (passwords.next !== passwords.confirm) { setPasswordMsg({ ok: false, text: 'Passwords do not match.' }); return }
    setPasswordMsg({ ok: true, text: 'Password updated.' })
    setPasswords({ current: '', next: '', confirm: '' })
    setTimeout(() => setPasswordMsg(null), 3000)
  }

  const initials = (profile.displayName || profile.username || '')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className='profile-page'>

      {/* ── Side panel ── */}
      <aside className='profile-sidenav'>
        <div className='profile-sidenav-header'>
          <div className='profile-avatar' style={{ background: profile.avatarColor }}>{initials}</div>
          <div className='profile-sidenav-id'>
            <p className='profile-sidenav-name'>{profile.displayName || profile.username || 'User'}</p>
            <p className='profile-sidenav-sub'>{profile.visibility === 'private' ? 'Private' : 'Public'} profile</p>
          </div>
        </div>

        <nav className='profile-sidenav-nav'>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`profile-sidenav-item${section === n.id ? ' profile-sidenav-item--active' : ''}`}
              onClick={() => setSection(n.id)}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Content ── */}
      <div className='profile-content'>

        {/* Profile */}
        {section === 'profile' && (
          <div className='profile-section'>
            <h2 className='profile-section-title'>Profile</h2>
            <p className='profile-section-sub'>Manage your public presence and account details.</p>

            <div className='profile-field'>
              <span className='profile-label'>Avatar</span>
              <div className='profile-avatar-editor'>
                <div className='profile-avatar profile-avatar--lg' style={{ background: profile.avatarColor }}>{initials}</div>
                <label className='profile-color-row'>
                  <span className='profile-label'>Color</span>
                  <input
                    type='color'
                    className='profile-color-input'
                    value={profile.avatarColor}
                    onChange={e => setProfile(p => ({ ...p, avatarColor: e.target.value }))}
                  />
                </label>
              </div>
            </div>

            <div className='profile-field'>
              <label className='profile-label' htmlFor='p-username'>Username</label>
              <input
                id='p-username'
                className='profile-input'
                type='text'
                placeholder='username'
                value={profile.username}
                onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
              />
            </div>

            <div className='profile-field'>
              <label className='profile-label' htmlFor='p-displayname'>Display Name</label>
              <input
                id='p-displayname'
                className='profile-input'
                type='text'
                placeholder='Your Name'
                value={profile.displayName}
                onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))}
              />
            </div>

            <div className='profile-field'>
              <label className='profile-label' htmlFor='p-bio'>Bio</label>
              <textarea
                id='p-bio'
                className='profile-textarea'
                placeholder='Tell us a bit about yourself...'
                maxLength={160}
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              />
              <p className='profile-char-count'>{profile.bio.length} / 160</p>
            </div>

            <div className='profile-field'>
              <span className='profile-label'>Profile Visibility</span>
              <div className='profile-radio-group'>
                {['public', 'private'].map(v => (
                  <label key={v} className='profile-radio-option'>
                    <input
                      type='radio'
                      name='visibility'
                      value={v}
                      checked={profile.visibility === v}
                      onChange={() => setProfile(p => ({ ...p, visibility: v }))}
                    />
                    <span>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <SaveBtn saved={savedSection === 'profile'} onClick={() => save('userProfile', profile, 'profile')} />
          </div>
        )}

        {/* Preferences */}
        {section === 'preferences' && (
          <div className='profile-section'>
            <h2 className='profile-section-title'>Preferences</h2>
            <p className='profile-section-sub'>Customize your shopping and browsing experience.</p>

            <div className='profile-field'>
              <label className='profile-label' htmlFor='p-lang'>Language</label>
              <select id='p-lang' className='profile-select' value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className='profile-field'>
              <label className='profile-label' htmlFor='p-currency'>Currency</label>
              <select id='p-currency' className='profile-select' value={prefs.currency} onChange={e => setPrefs(p => ({ ...p, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>

            <div className='profile-row'>
              <div className='profile-field' style={{ flex: 1 }}>
                <label className='profile-label' htmlFor='p-size'>Default Shoe Size</label>
                <select id='p-size' className='profile-select' value={prefs.defaultSize} onChange={e => setPrefs(p => ({ ...p, defaultSize: e.target.value }))}>
                  <option value=''>No preference</option>
                  {EU_SIZES.map(s => <option key={s} value={s}>EU {s}</option>)}
                </select>
              </div>

              <div className='profile-field' style={{ flex: 1 }}>
                <span className='profile-label'>Size System</span>
                <div className='profile-radio-group'>
                  {['EU', 'US'].map(v => (
                    <label key={v} className='profile-radio-option'>
                      <input
                        type='radio'
                        name='sizeSystem'
                        value={v}
                        checked={prefs.sizeSystem === v}
                        onChange={() => setPrefs(p => ({ ...p, sizeSystem: v }))}
                      />
                      <span>{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className='profile-divider' />
            <p className='profile-label' style={{ marginBottom: 12 }}>Notifications</p>

            {[
              { key: 'newsletter',   name: 'Newsletter',    sub: 'New releases and editorial drops' },
              { key: 'orderUpdates', name: 'Order Updates', sub: 'Shipping and delivery status' },
              { key: 'newArrivals',  name: 'New Arrivals',  sub: 'Be first to know about restocks' },
            ].map(n => (
              <div key={n.key} className='profile-toggle-row'>
                <div>
                  <p className='profile-toggle-name'>{n.name}</p>
                  <p className='profile-toggle-sub'>{n.sub}</p>
                </div>
                <Toggle
                  on={prefs[n.key]}
                  onToggle={() => setPrefs(p => ({ ...p, [n.key]: !p[n.key] }))}
                  label={`Toggle ${n.name}`}
                />
              </div>
            ))}

            <SaveBtn saved={savedSection === 'preferences'} onClick={() => save('userPreferences', prefs, 'preferences')} />
          </div>
        )}

        {/* Security */}
        {section === 'security' && (
          <div className='profile-section'>
            <h2 className='profile-section-title'>Security</h2>
            <p className='profile-section-sub'>Manage your account security and login credentials.</p>

            <div className='profile-field'>
              <label className='profile-label' htmlFor='p-email'>Email Address</label>
              <input
                id='p-email'
                className='profile-input'
                type='email'
                placeholder='you@example.com'
                value={security.email}
                onChange={e => setSecurity(s => ({ ...s, email: e.target.value }))}
              />
            </div>

            <SaveBtn saved={savedSection === 'security'} onClick={() => save('userSecurity', { email: security.email, twoFactor: security.twoFactor }, 'security')} />

            <div className='profile-divider' />

            <p className='profile-subsection-label'>Change Password</p>
            <div className='profile-field'>
              <label className='profile-label' htmlFor='p-curr-pw'>Current Password</label>
              <input id='p-curr-pw' className='profile-input' type='password' placeholder='••••••••' value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
            </div>
            <div className='profile-field'>
              <label className='profile-label' htmlFor='p-new-pw'>New Password</label>
              <input id='p-new-pw' className='profile-input' type='password' placeholder='••••••••' value={passwords.next} onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))} />
            </div>
            <div className='profile-field'>
              <label className='profile-label' htmlFor='p-conf-pw'>Confirm New Password</label>
              <input id='p-conf-pw' className='profile-input' type='password' placeholder='••••••••' value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
            </div>
            {passwordMsg && (
              <p className={`profile-pw-msg${passwordMsg.ok ? ' profile-pw-msg--ok' : ' profile-pw-msg--err'}`}>{passwordMsg.text}</p>
            )}
            <button className='profile-save-btn' onClick={handlePasswordChange}>Update Password</button>

            <div className='profile-divider' />

            <p className='profile-subsection-label'>Two-Factor Authentication</p>
            <div className='profile-toggle-row'>
              <div>
                <p className='profile-toggle-name'>Enable 2FA</p>
                <p className='profile-toggle-sub'>Add an extra layer of protection to your account</p>
              </div>
              <Toggle
                on={security.twoFactor}
                onToggle={() => setSecurity(s => {
                  const updated = { ...s, twoFactor: !s.twoFactor }
                  localStorage.setItem('userSecurity', JSON.stringify(updated))
                  return updated
                })}
                label='Toggle 2FA'
              />
            </div>
          </div>
        )}

        {/* About */}
        {section === 'about' && (
          <div className='profile-section'>
            <h2 className='profile-section-title'>About</h2>
            <p className='profile-section-sub'>App information and legal links.</p>

            <div className='profile-about-card'>
              <p className='profile-about-app'>SoleStore</p>
              <p className='profile-about-version'>Version 1.0.0</p>
              <p className='profile-about-build'>Build 2026.04</p>
            </div>

            <div className='profile-about-links'>
              {['Privacy Policy', 'Terms of Service', 'Help & Support', 'Open Source Licenses'].map(link => (
                <button key={link} className='profile-about-link'>
                  {link}
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>

            <div className='profile-divider' />

            <div className='profile-danger-zone'>
              <p className='profile-danger-label'>Danger Zone</p>
              <button className='profile-danger-btn'>Delete Account</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ProfilePage
