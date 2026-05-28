import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import JobCard from '../components/JobCard.jsx'
import JobDetail from '../components/JobDetail.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'


/* -------------------------------------------------------
   SAMPLE DATA — nanti diganti dengan fetch dari backend
------------------------------------------------------- */
const SAMPLE_JOBS = [
  {
    id: 1,
    title: 'Business Development Manager',
    company: 'PT Antam Tbk',
    dateRange: '27 Oktober – 11 November (2026)',
    type: 'internship',
    location: 'South Tangerang, Banten',
    salary: 'Rp 1.000.000 – Rp 1.500.000',
    logoUrl: '',
    applyUrl: 'https://antam.com',
    workType: 'On-site',
    employmentType: 'Full-time',
    duration: '3 Weeks',
    postedLabel: '2 days ago',
    about: 'We are looking for a passionate Product Design Intern to join our growing design team. You will be working closely with senior designers, product managers, and engineers to craft user-centric experiences for our core platform. This is a hands-on role where you will contribute to real projects that impact our users directly.',
    responsibilities: [
      'Assist in creating wireframes, prototypes, and high-fidelity mockups.',
      'Participate in user research and usability testing sessions.',
      'Collaborate with engineering teams to ensure design implementation meets quality standards.',
      'Maintain and update the existing design system components.',
    ],
  },
  {
    id: 2,
    title: 'Business Development Executive (Entry-Level / Fresh Graduates Welcome)',
    company: 'PT Shopee International Indonesia',
    dateRange: '07 Januari – 20 Februari (2026)',
    type: 'mt',
    location: 'South Jakarta, Jakarta',
    salary: 'Rp 2.000.000 – Rp 3.000.000',
    logoUrl: '',
    applyUrl: 'https://shopee.co.id',
    workType: 'On-site',
    employmentType: 'Full-time',
    duration: '6 Weeks',
    postedLabel: '5 days ago',
    about: 'Join Shopee as a Management Trainee in Business Development. You will be part of a fast-paced team driving growth in one of Southeast Asia\'s leading e-commerce platforms.',
    responsibilities: [
      'Identify and develop new business opportunities.',
      'Manage relationships with key partners and vendors.',
      'Analyze market trends and propose strategic initiatives.',
      'Present findings to senior management regularly.',
    ],
  },
  {
    id: 3,
    title: 'Risk Analyst',
    company: 'Koperasi Astra International',
    dateRange: '20 Juni – 20 Juli (2026)',
    type: 'internship',
    location: 'North Jakarta, Jakarta',
    salary: 'Rp 200.000 – 800.000',
    logoUrl: '',
    applyUrl: 'https://astra.co.id',
    workType: 'On-site',
    employmentType: 'Internship',
    duration: '4 Weeks',
    postedLabel: '1 week ago',
    about: 'Support the risk management team in identifying, assessing, and monitoring operational and financial risks across Koperasi Astra\'s business units.',
    responsibilities: [
      'Collect and analyze risk data from various business units.',
      'Prepare risk assessment reports for management review.',
      'Assist in developing risk mitigation strategies.',
      'Monitor compliance with internal policies and procedures.',
    ],
  },
  {
    id: 4,
    title: 'Data Analyst Staff – Digital Teknova Indonesia (DTI)',
    company: 'PT Kapal Api Global',
    dateRange: '20 Januari – 27 Januari (2026)',
    type: 'internship',
    location: 'Kota Bogor, Bogor',
    salary: 'Rp 200.000 – 800.000',
    logoUrl: '',
    applyUrl: 'https://kapalapi.co.id',
    workType: 'Hybrid',
    employmentType: 'Full-time',
    duration: '2 Weeks',
    postedLabel: '3 days ago',
    about: 'Join the DTI team at Kapal Api Global to support data-driven decision making across the organization. You will work with large datasets and build dashboards to surface key business insights.',
    responsibilities: [
      'Clean, transform, and analyze structured and unstructured data.',
      'Build and maintain dashboards using BI tools.',
      'Collaborate with business units to define KPIs and metrics.',
      'Present data findings in clear, actionable formats.',
    ],
  },
]

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen]         = useState(false)
  const [filterOpen, setFilterOpen]           = useState(false)
  const [selectedFilters, setSelectedFilters] = useState([])
  const [searchQuery, setSearchQuery]         = useState('')
  const [activeJob, setActiveJob]             = useState(null)
  const [jobs, setJobs]                       = useState(SAMPLE_JOBS) // ← pakai state biar bisa hapus
  const [confirmJob, setConfirmJob]   = useState(null)  // job yang mau dihapus
  const [toast, setToast]             = useState(false)  // notif sukses


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

  const handleConfirmHapus = () => {
    setJobs(prev => prev.filter(j => j.id !== confirmJob.id))
    setConfirmJob(null)
    showToast()
  }
  
return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--cf-bg)' }}>

      <Navbar
        user={{ name: 'Andi Nasution', role: 'Admin' }}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      <Hero
        userName="Andi Nasution"
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

      {/* Job List */}
      <div className="db-joblist">
        {filteredJobs.length === 0 ? (
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