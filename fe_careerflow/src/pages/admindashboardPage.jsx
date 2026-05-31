// admindashboardPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, CheckCircle } from 'lucide-react'
import Navbar from '../components/navbar.jsx'
import Hero from '../components/hero.jsx'
import JobCard from '../components/jobcard.jsx'
import ConfirmModal from '../components/confirmmodal.jsx'
import api from '../api';

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen]         = useState(false)
  const [filterOpen, setFilterOpen]           = useState(false)
  const [selectedFilters, setSelectedFilters] = useState([])
  const [searchQuery, setSearchQuery]         = useState('')
  
  // --- INTEGRATION UPDATES ---
  const [jobs, setJobs]                       = useState([]) 
  const [isLoading, setIsLoading]             = useState(true) 
  const [confirmJob, setConfirmJob]           = useState(null)  
  const [toast, setToast]                     = useState(false) 
  
  // New state for dynamic user profile
  const [userProfile, setUserProfile]         = useState({ name: 'Loading...', role: 'Admin' })

  // 1. Fetch Profile and Jobs on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch both requests in parallel
        const [profileRes, jobsRes] = await Promise.all([
          api.get('/profile', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/lowongan')
        ]);

        // Axios puts data in .data
        const profileData = profileRes.data;
        setUserProfile({ 
          name: profileData.nama || profileData.name || 'Admin', 
          role: profileData.role || 'Admin' 
        });

        setJobs(jobsRes.data);

      } catch (error) {
        console.error("Dashboard Fetch Error:", error.response?.data || error.message);
        // Fallback
        setUserProfile({ name: 'Admin', role: 'Admin' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 2. Filter logic
  const filteredJobs = jobs.filter(job => {
    const matchSearch = searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchFilter = selectedFilters.length === 0 ||
      selectedFilters.some(f =>
        job.title.toLowerCase().includes(f.toLowerCase()) ||
        job.company.toLowerCase().includes(f.toLowerCase())
      )
      
    return matchSearch && matchFilter
  })

  const showToast = () => {
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  const handleHapus = (job) => {
    setConfirmJob(job)  // buka modal
  }

  const handleEdit = (job) => {
    navigate(`/admin/edit-job/${job.id}`)
  }

  // 3. Delete job via backend API
  const handleConfirmHapus = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await api.delete(
        `/admin/lowongan/${confirmJob.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        // Hapus dari state lokal setelah sukses di backend
        setJobs(prev => prev.filter(j => j.id !== confirmJob.id))
        setConfirmJob(null)
        showToast()
      } else {
        const errorData = await response.json()
        alert(`Gagal menghapus: ${errorData.message}`)
        setConfirmJob(null)
      }
    } catch (error) {
      console.error("Error deleting job:", error)
      alert("Terjadi kesalahan jaringan.")
      setConfirmJob(null)
    }
  }
  
  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--cf-bg)' }}>

      {/* Pass dynamic user profile to Navbar */}
      <Navbar
        user={userProfile}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      {/* Pass dynamic name to Hero */}
      <Hero
        userName={userProfile.name}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />

      {/* Tambah Magang button */}
      <div style={{ maxWidth: '860px', margin: '24px auto 0', padding: '0 24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => navigate('/admin/add-job')}
          style={{
            height: '40px',
            padding: '0 20px',
            background: '#000459',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: '500',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <PlusCircle size={16} />
          Add new job
        </button>
      </div>

      {/* Job List with Loading State */}
      <div className="db-joblist">
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--cf-muted)', padding: '40px 0' }}>
            Memuat data lowongan...
          </p>
        ) : filteredJobs.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--cf-muted)', padding: '40px 0' }}>
            Tidak ada lowongan yang sesuai.
          </p>
        ) : (
          filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              isAdmin={true}
              onEdit={handleEdit}
              onHapus={handleHapus}
            />
          ))
        )}
      </div>

      <footer className="db-footer">
        © 2026 CareerFlow Professional Network. All rights reserved.
      </footer>

      {/* Toast notif */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          background: '#0a1f44',
          color: '#fff',
          padding: '14px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.875rem',
          fontWeight: '600',
          boxShadow: '0 8px 32px rgba(10,31,68,0.2)',
          zIndex: 400,
          letterSpacing: '0.02em',
        }}>
          <CheckCircle size={18} color="#22c55e" />
          Lowongan berhasil dihapus
        </div>
      )}

      {/* Confirm Modal */}
      {confirmJob && (
        <ConfirmModal
          onConfirm={handleConfirmHapus}
          onCancel={() => setConfirmJob(null)}
        />
      )}

    </div>
  )
}