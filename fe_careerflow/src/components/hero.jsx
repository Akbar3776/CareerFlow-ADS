import { useRef, useEffect } from 'react'
import FilterDropdown from './FilterDropdown.jsx'

const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function Hero({ userName, searchQuery, setSearchQuery, filterOpen, setFilterOpen, selectedFilters, setSelectedFilters }) {
  const filterRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setFilterOpen])

  return (
    <section className="db-hero">
      {/* Background motif image slot */}
      <div className="db-hero__bg-image">
        {/*
          TARUH GAMBAR MOTIF KAMU DI SINI:
          <img src="/src/assets/hero-motif.png" alt="" />
        */}
      </div>

      {/* Geometric SVG shapes */}
      <div className="db-hero__svg-shapes">
        <svg viewBox="0 0 1200 280" preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg">
          {/* large square top-left */}
          <rect x="-40" y="-40" width="210" height="210"
            fill="rgba(1,2,60,0.5)" transform="rotate(10 65 65)" rx="8"/>
          {/* triangle top-left */}
          <polygon points="90,0 220,0 90,140"
            fill="rgba(26,63,143,0.45)"/>
          {/* small square inner */}
          <rect x="30" y="30" width="90" height="90"
            fill="rgba(15,40,100,0.4)" rx="6"/>
          {/* circle bottom-left */}
          <circle cx="60" cy="240" r="80"
            fill="rgba(42,64,141,0.3)"/>
          {/* right shapes */}
          <rect x="980" y="-20" width="160" height="160"
            fill="rgba(26,63,143,0.3)" rx="8"/>
          <polygon points="1100,60 1200,0 1200,160"
            fill="rgba(42,64,141,0.25)"/>
          <circle cx="1150" cy="230" r="65"
            fill="rgba(10,31,68,0.25)"/>
        </svg>
      </div>

      {/* Content */}
      <div className="db-hero__content">
        <h1 className="db-hero__welcome">
          <span className="db-hero__welcome-static">Welcome, </span>
          <span className="db-hero__welcome-name">{userName || 'Andi Nasution'}!</span>
        </h1>

        <div className="db-hero__controls">
          {/* Filter Job button */}
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button
              className={`db-hero__btn${filterOpen ? ' open' : ''}`}
              onClick={() => setFilterOpen(o => !o)}
            >
              Filter Job
              <IconChevron />
            </button>
            {filterOpen && (
              <FilterDropdown
                selected={selectedFilters}
                onChange={setSelectedFilters}
              />
            )}
          </div>

          {/* Search */}
          <div className="db-hero__search-wrap">
            <span className="db-hero__search-icon"><IconSearch /></span>
            <input
              className="db-hero__search-input"
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
