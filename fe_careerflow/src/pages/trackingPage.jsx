// trackingPage.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import TrackingDrawer from '../components/TrackingDrawer.jsx'
import api from '../api' // Gunakan axios instance

// Standarisasi status lamaran dan warnanya
const DEFAULT_STATUSES = [
  { label: 'Pending', color: '#fef08a' },
  { label: 'Review', color: '#bae6fd' },
  { label: 'Interview', color: '#93c5fd' },
  { label: 'Offered', color: '#bbf7d0' },
  { label: 'Rejected', color: '#fecaca' },
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
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState({ name: 'Loading...', role: 'Mahasiswa' })
  
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('edit')
  const [activeJob, setActiveJob] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const drawerRef = useRef(null)

  // 1. Fetch Profile and Dashboard Data on Mount
  useEffect(() => {
    const fetchTrackingData = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      try {
        // Fetch Profile
        const profileRes = await api.get('/profile')
        setUserProfile({ 
          name: profileRes.data.nama || profileRes.data.name || 'Mahasiswa', 
          role: profileRes.data.role || 'Mahasiswa' 
        })

        // Fetch Dashboard Lamaran
        const dashboardRes = await api.get('/mahasiswa/dashboard')
        
        // Map backend data format to match the frontend table
        const mappedJobs = dashboardRes.data.map(lamaran => ({
          id: lamaran.idLamaran,
          position: lamaran.title,
          company: lamaran.company,
          status: lamaran.statusLamaran || 'Pending',
          dateApplied: lamaran.tanggalApply,
          statuses: DEFAULT_STATUSES // Memasukkan default status untuk siklus badge
        }))

        setJobs(mappedJobs)

      } catch (err) {
        console.error("Error fetching tracking data:", err)
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrackingData()
  }, [navigate])

  const totalApplied = jobs.length
  const totalOffered = jobs.filter(j =>
    j.status?.toLowerCase().includes('offer')
  ).length

  // Handle outside click for Drawer
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

const handleDelete = async (id) => {
    if (window.confirm('Hapus tracking ini?')) {
      try {
        // Panggil backend DELETE endpoint
        await api.delete(`/lamaran/${id}`);
        
        // Hapus dari state lokal setelah sukses di backend
        setJobs(prev => prev.filter(j => j.id !== id));
      } catch (err) {
        console.error("Gagal menghapus lamaran:", err);
        const errorMsg = err.response?.data?.message || 'Terjadi kesalahan jaringan.';
        alert(`Gagal menghapus: ${errorMsg}`);
      }
    }
  }

  const handleAddNew = () => {
    setActiveJob(null)
    setDrawerMode('add')
    setDrawerOpen(true)
  }

  const handleSave = async (data) => {
    if (drawerMode === 'add') {
      // Local addition for custom external jobs (no backend yet)
      setJobs(prev => [...prev, { ...data, id: Date.now(), statuses: data.statuses }]);
      setDrawerOpen(false);
    } else {
      // Backend update for existing jobs
      try {
        // Only the status string goes to the backend Lamaran table
        await api.put(`/lamaran/${data.id}/status`, { statusLamaran: data.status });
        
        // Update local state to reflect the new status (and any custom color pipelines)
        setJobs(prev => prev.map(j => j.id === data.id ? data : j));
        setDrawerOpen(false);
      } catch (err) {
        console.error("Gagal update status dari drawer:", err);
        alert("Gagal menyimpan perubahan. Periksa jaringan Anda.");
      }
    }
  }

  // 2. Integrasi Update Status via API
  const handleCycleStatusDirect = async (job) => {
    const currentIdx = job.statuses.findIndex(s => s.label.toLowerCase() === job.status.toLowerCase())
    const nextIdx = (currentIdx === -1 ? 0 : currentIdx + 1) % job.statuses.length
    const nextStatus = job.statuses[nextIdx].label

    try {
      // Panggil backend API PUT /lamaran/<id>/status
      await api.put(`/lamaran/${job.id}/status`, { statusLamaran: nextStatus })
      
      // Update state lokal jika sukses
      setJobs(prev => prev.map(j => {
        if (j.id !== job.id) return j
        return { ...j, status: nextStatus }
      }))
    } catch (err) {
      console.error("Gagal update status:", err)
      alert("Gagal memperbarui status. Periksa jaringan Anda.")
    }
  }

  return (
    <div className="trk-wrapper">
      <Navbar
        user={userProfile}
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
              {isLoading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Memuat data tracking...</p>
              ) : jobs.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Belum ada lamaran. Mulai explore lowongan!</p>
              ) : (
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
                      // Temukan warna berdasarkan status yang cocok, default ke abu-abu muda jika tidak ada
                      const currentStatus = job.statuses?.find(s => s.label.toLowerCase() === job.status.toLowerCase())
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
                              title="Klik untuk mengubah status"
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
              )}
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