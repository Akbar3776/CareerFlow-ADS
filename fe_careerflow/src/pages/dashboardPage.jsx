// dashboardPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/navbar.jsx'
import Hero from '../components/hero.jsx'
import JobCard from '../components/jobcard.jsx'
import JobDetail from '../components/jobDetail.jsx'
import api from '../api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen]         = useState(false)
  const [filterOpen, setFilterOpen]           = useState(false)
  const [selectedFilters, setSelectedFilters] = useState([])
  const [searchQuery, setSearchQuery]         = useState('')
  const [activeJob, setActiveJob]             = useState(null)

  // --- States for Backend Fetching ---
  const [jobs, setJobs] = useState([])
  const [currentUser, setCurrentUser] = useState({ name: 'Loading...', role: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // --- Fetch Data from Backend ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token'); 
        
        // Scenario 1: No token found in localStorage. Redirect immediately.
        if (!token) {
          navigate('/login'); 
          return; 
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        // Fetch User Profile
        const profileRes = await api.get('/profile', {
          headers
        });

        const profileData = profileRes.data;
        
        // Scenario 2: Token is expired or invalid
        if (profileRes.status === 401 || profileRes.status === 422 || profileRes.status === 403) {
          console.error("Sesi telah habis. Mengalihkan ke halaman login...");
          localStorage.removeItem('token'); 
          navigate('/login');               
          return;
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          // Fallback check to support 'nama' vs 'name'
          setCurrentUser({
            ...profileData,
            name: profileData.nama || profileData.name || 'Mahasiswa'
          });
        } else {
          throw new Error('Gagal mengambil profil pengguna');
        }

        // Fetch Jobs
        const jobsRes = await api.get('/lowongan', {
          headers
        });

        const jobsData = jobsRes.data;
        setJobs(jobsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]); 

  // --- Handle Apply Action ---
  const handleApply = async (jobId, cvDataUrl = 'link-to-cv-default.pdf') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/lamaran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idLowongan: jobId,
          dokumenCV: cvDataUrl
        })
      });

      if (response.ok) {
        alert("Lamaran berhasil dikirim!");
        setActiveJob(null);
        // Route the student directly to the tracking page
        navigate('/tracking'); 
      } else {
        const errData = await response.json();
        alert(`Gagal melamar: ${errData.message}`);
      }
    } catch (err) {
      console.error("Error applying for job:", err);
      alert("Terjadi kesalahan jaringan saat mengirim lamaran.");
    }
  };

  /* Filter + search logic */
  const filteredJobs = jobs.filter(job => {
    const matchSearch = searchQuery === '' ||
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchFilter = selectedFilters.length === 0 ||
      selectedFilters.some(f =>
        job.title?.toLowerCase().includes(f.toLowerCase()) ||
        job.company?.toLowerCase().includes(f.toLowerCase())
      )

    return matchSearch && matchFilter
  })

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--cf-bg)' }}>
      <Navbar
        user={currentUser} 
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      <Hero
        userName={currentUser.name} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />

      {/* Job List */}
      <div className="db-joblist" style={{ isolation: 'auto' }}>
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--cf-muted)', padding: '40px 0' }}>
            Memuat dashboard...
          </p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: 'red', padding: '40px 0' }}>
            Error: {error}
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
              onDetail={setActiveJob}
            />
          ))
        )}
      </div>

      <footer className="db-footer">
        © 2026 CareerFlow Professional Network. All rights reserved.
      </footer>

      {activeJob && (
        <JobDetail
          job={activeJob}
          onClose={() => setActiveJob(null)}
          onApply={handleApply} // Pass the new function down as a prop
        />
      )}
    </div>
  )
}