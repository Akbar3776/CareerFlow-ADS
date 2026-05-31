import { useRef, useEffect } from 'react'
import bgImage from '../assets/bg.png'
import FilterDropdown from './filterdropdown.jsx'


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
      <div className="db-hero__bg-image">
        <img src={bgImage} alt="background" />
      </div>

      <div className="db-hero__content">
        <h1 className="db-hero__welcome">
          <span className="db-hero__welcome-static">Welcome,  </span>
          <span className="db-hero__welcome-name">{userName || 'Andi Nasution'}!</span>
        </h1>

        <div className="db-hero__controls">
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