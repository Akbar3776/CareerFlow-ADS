import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar.jsx';
import Hero from '../components/hero.jsx';
import JobCard from '../components/jobcard.jsx';
import JobDetail from '../components/jobDetail.jsx';
import api from '../api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeJob, setActiveJob] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState({ name: 'Loading...', role: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        // Use the 'api' instance directly
        const [profileRes, jobsRes] = await Promise.all([
          api.get('/profile'),
          api.get('/lowongan')
        ]);

        // Process Profile
        const profileData = profileRes.data;
        setCurrentUser({
          ...profileData,
          name: profileData.nama || profileData.name || 'Mahasiswa'
        });

        // Process Jobs
        setJobs(jobsRes.data);

      } catch (err) {
        // Handle unauthorized errors globally
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(err.message || 'Terjadi kesalahan saat memuat data.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleApply = async (jobId, cvDataUrl = 'link-to-cv-default.pdf') => {
    try {
      await api.post('/lamaran', {
        idLowongan: jobId,
        dokumenCV: cvDataUrl
      });
      
      alert("Lamaran berhasil dikirim!");
      setActiveJob(null);
      navigate('/tracking');
    } catch (err) {
      alert(`Gagal melamar: ${err.response?.data?.message || 'Terjadi kesalahan'}`);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = searchQuery === '' ||
      job.title?.toLowerCase().includes(searchLower) ||
      job.company?.toLowerCase().includes(searchLower);

    const matchFilter = selectedFilters.length === 0 ||
      selectedFilters.some(f =>
        job.title?.toLowerCase().includes(f.toLowerCase()) ||
        job.company?.toLowerCase().includes(f.toLowerCase())
      );

    return matchSearch && matchFilter;
  });

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--cf-bg)' }}>
      <Navbar user={currentUser} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
      <Hero
        userName={currentUser.name}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />

      <div className="db-joblist">
        {isLoading ? <p style={{ textAlign: 'center' }}>Memuat dashboard...</p> : 
         error ? <p style={{ textAlign: 'center', color: 'red' }}>Error: {error}</p> : 
         filteredJobs.length === 0 ? <p style={{ textAlign: 'center' }}>Tidak ada lowongan yang sesuai.</p> :
         filteredJobs.map(job => (
            <JobCard key={job.id} job={job} onDetail={setActiveJob} />
         ))}
      </div>

      {activeJob && (
        <JobDetail job={activeJob} onClose={() => setActiveJob(null)} onApply={handleApply} />
      )}
    </div>
  );
}