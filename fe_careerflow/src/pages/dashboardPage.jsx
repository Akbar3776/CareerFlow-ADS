import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import JobCard from '../components/JobCard.jsx'
import JobDetail from '../components/JobDetail.jsx'

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen]         = useState(false)
  const [filterOpen, setFilterOpen]           = useState(false)
  const [selectedFilters, setSelectedFilters] = useState([])
  const [searchQuery, setSearchQuery]         = useState('')
  const [activeJob, setActiveJob]             = useState(null)

  // --- States for Backend Fetching ---
  const [jobs, setJobs] = useState([])
  const [currentUser, setCurrentUser] = useState({ name: 'Loading...', role: '' }) // <-- New State
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
          return; // Stop execution
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        // Fetch User Profile
        const profileRes = await fetch('http://localhost:5001/profile', { headers });
        
        // Scenario 2: Token is expired or invalid (Backend returns 401 or 403)
        if (profileRes.status === 401 || profileRes.status === 422 || profileRes.status === 403) {
          console.error("Sesi telah habis. Mengalihkan ke halaman login...");
          localStorage.removeItem('token'); // Clear the bad token
          navigate('/login');               // Redirect to login page
          return;
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCurrentUser(profileData);
        } else {
          throw new Error('Gagal mengambil profil pengguna');
        }

        // Fetch Jobs
        const jobsRes = await fetch('http://localhost:5001/lowongan', { headers });
        if (!jobsRes.ok) throw new Error('Gagal mengambil data lowongan');
        
        const jobsData = await jobsRes.json();
        setJobs(jobsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]); // <-- Add navigate to dependency array

  /* Filter + search logic */
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

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--cf-bg)' }}>
      {/* Pass dynamic user data here */}
      <Navbar
        user={currentUser} 
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      {/* Pass dynamic user name here */}
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
        />
      )}
    </div>
  )
}