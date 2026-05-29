import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import TrackingDrawer from '../components/TrackingDrawer.jsx'

const SAMPLE_TRACKING = [
  { id: 1, position: 'Senior Product Designer', company: 'TechFlow Systems', status: 'Interviewing', dateApplied: '2023-10-24', type: 'internship', workType: 'On-site', statuses: [
    { label: 'Applied', color: '#c7d2fe' },
    { label: 'CV Screening', color: '#bbf7d0' },
    { label: 'Technical Test', color: '#bae6fd' },
    { label: 'HR Interview', color: '#fef08a' },
    { label: 'User Interview', color: '#d9f99d' },
    { label: 'Interviewing', color: '#93c5fd' },
    { label: 'Offered', color: '#bbf7d0' },
  ]},
  { id: 2, position: 'Frontend Engineer (Intern)', company: 'Global Nexus Corp', status: 'Pending', dateApplied: '2023-10-21', type: 'internship', workType: 'Remote', statuses: [
    { label: 'Applied', color: '#c7d2fe' },
    { label: 'Pending', color: '#fef08a' },
  ]},
  { id: 3, position: 'UX Researcher', company: 'Creative Solstice', status: 'Offered', dateApplied: '2023-10-15', type: 'mt', workType: 'On-site', statuses: [
    { label: 'Applied', color: '#c7d2fe' },
    { label: 'Offered', color: '#bbf7d0' },
  ]},
  { id: 4, position: 'Data Analyst Intern', company: 'FinTech Hub', status: 'Applied', dateApplied: '2023-10-12', type: 'internship', workType: 'Hybrid', statuses: [
    { label: 'Applied', color: '#c7d2fe' },
  ]},
]

function getAutoTextColorFromHex(hex) {
  if (!hex || hex.length < 7) return '#1e293b'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
      case gn: h = ((bn - rn) / d + 2) / 6; break
      case bn: h = ((rn - gn) / d + 4) / 6; break
    }
  }
  const hDeg = Math.round(h * 360)
  const sPct = Math.round(s * 100)
  const lPct = l * 100
  const textL = lPct > 50 ? Math.max(15, lPct - 60) : Math.min(95, lPct + 60)
  return `hsl(${hDeg}, ${sPct}%, ${textL}%)`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export default function TrackingPage() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState(SAMPLE_TRACKING)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('edit')
  const [activeJob, setActiveJob] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const drawerRef = useRef(null)

  const totalApplied = jobs.length
  const totalOffered = jobs.filter(j =>
    j.statuses?.some(s => s.label.toLowerCase().includes('offer'))
  ).length

  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false)
      }
    }
    if (drawerOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [drawerOpen])

  const handleEdit = (job) => {
    setActiveJob(job)
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Hapus tracking ini?')) {
      setJobs(prev => prev.filter(j => j.id !== id))
    }
  }

  const handleAddNew = () => {
    setActiveJob(null)
    setDrawerMode('add')
    setDrawerOpen(true)
  }

  const handleSave = (data) => {
    if (drawerMode === 'add') {
      setJobs(prev => [...prev, { ...data, id: Date.now() }])
    } else {
      setJobs(prev => prev.map(j => j.id === data.id ? data : j))
    }
    setDrawerOpen(false)
  }

  const handleCycleStatusDirect = (job) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== job.id) return j
      const currentIdx = j.statuses.findIndex(s => s.label === j.status)
      const nextIdx = (currentIdx === -1 ? 0 : currentIdx + 1) % j.statuses.length
      return { ...j, status: j.statuses[nextIdx].label }
    }))
  }

  return (
    <div className="trk-wrapper">
      <Navbar
        user={{ name: 'Andi Nasution', role: 'Member' }}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      <div className="trk-container">
        <div className="trk-header">
          <div>
            <h1 className="trk-header__title">Tracking Dashboard</h1>
            <p className="trk-header__sub">Track your professional journey and manage job applications.</p>
          </div>
        </div>

        <div className="trk-layout">
          {/* Left: Table */}
          <div className="trk-main">
            <div className="trk-table-top">
              <button className="trk-btn-add" onClick={handleAddNew}>
                + Add New
              </button>
            </div>

            <div className="trk-table-wrap">
              <table className="trk-table">
                <thead>
                  <tr>
                    <th>Job Position</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Date Applied</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => {
                    const currentStatus = job.statuses?.find(s => s.label === job.status)
                    const bgColor = currentStatus?.color || '#f1f5f9'
                    const textColor = getAutoTextColorFromHex(bgColor)
                    return (
                      <tr key={job.id}>
                        <td className="trk-table__position">{job.position}</td>
                        <td className="trk-table__company">{job.company}</td>
                        <td>
                          <span
                            className="trk-badge"
                            style={{
                              background: bgColor,
                              color: textColor,
                              cursor: 'pointer',
                              userSelect: 'none',
                            }}
                            onClick={() => handleCycleStatusDirect(job)}
                            title="Klik untuk next stage"
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="trk-table__date">{formatDate(job.dateApplied)}</td>
                        <td>
                          <div className="trk-table__actions">
                            <button
                              className="trk-table__action-btn trk-table__action-btn--edit"
                              onClick={() => handleEdit(job)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              className="trk-table__action-btn trk-table__action-btn--delete"
                              onClick={() => handleDelete(job.id)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="trk-stats">
            <div className="trk-stat-card trk-stat-card--applied">
              <div className="trk-stat-card__num">{totalApplied}</div>
              <div className="trk-stat-card__label">Total Applied</div>
            </div>
            <div className="trk-stat-card trk-stat-card--offered">
              <div className="trk-stat-card__num">{totalOffered}</div>
              <div className="trk-stat-card__label">Total Offered</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="db-footer">
        © 2026 CareerFlow Professional Network. All rights reserved.
      </footer>

      {drawerOpen && (
        <div className="trk-overlay">
          <div ref={drawerRef}>
            <TrackingDrawer
              mode={drawerMode}
              job={activeJob}
              onSave={handleSave}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}