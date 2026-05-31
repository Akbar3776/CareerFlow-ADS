import { useRef, useEffect } from 'react'
import ProfileDropdown from './profiledropdown.jsx'

const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

export default function Navbar({ user, profileOpen, setProfileOpen }) {
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setProfileOpen])

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AN'

  return (
    <nav className="db-navbar">
      <span className="db-navbar__logo">CareerFlow</span>

      <div className="db-navbar__right" ref={ref}>
        <button
          className="db-navbar__profile-btn"
          onClick={() => setProfileOpen(o => !o)}
        >
          <div className="db-navbar__avatar--placeholder">{initials}</div>

          <div className="db-navbar__userinfo">
            <div className="db-navbar__userinfo-name">{user?.name || 'Andi Nasution'}</div>
            <div className="db-navbar__userinfo-role">{user?.role || 'Member'}</div>
          </div>

          <span className={`db-navbar__chevron${profileOpen ? ' open' : ''}`}>
            <IconChevron />
          </span>
        </button>

        {profileOpen && (
          <ProfileDropdown onClose={() => setProfileOpen(false)} />
        )}
      </div>
    </nav>
  )
}
