// jobDetail.jsx
import { useEffect, useState } from 'react' // Tambahkan useState

const IconBuilding = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
  </svg>
)
const IconMoney = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
)
const IconPin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconMap = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
)
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconOffice = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
)
const IconFull = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

// Tambahkan prop onApply di sini
export default function JobDetail({ job, onClose, onApply }) {
  // State untuk menyimpan file CV
  const [cvFile, setCvFile] = useState(null)

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!job) return null

  // Fungsi untuk melamar secara internal (masuk ke database & Tracking Dashboard)
  const handleInternalApply = () => {
    if (!cvFile) {
      alert("Mohon unggah dokumen CV Anda terlebih dahulu!");
      return;
    }
    
    // Buat dummy URL karena belum ada cloud storage
    const dummyCvUrl = `https://storage.careerflow.com/cv/${cvFile.name.replace(/\s+/g, '-')}`;
    
    // Panggil fungsi onApply dari DashboardPage
    onApply(job.id || job.idLowongan, dummyCvUrl);
  }

  // Fungsi untuk link eksternal perusahaan
  const handleDaftar = () => {
    if (job.applyUrl) window.open(job.applyUrl, '_blank', 'noopener noreferrer')
  }

  return (
    <>
      <div className="db-detail-overlay" onClick={onClose} />

      <div className="db-detail-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="db-detail-panel__header">
          <div className="db-detail-panel__company-icon">
            {job.logoUrl
              ? <img src={job.logoUrl} alt={job.company} />
              : <IconBuilding />
            }
          </div>
          <div className="db-detail-panel__title-wrap">
            <div className="db-detail-panel__title">{job.title}</div>
            <div className="db-detail-panel__company">{job.company}</div>
          </div>
        </div>

        {/* Tags */}
        <div className="db-detail-panel__tags">
          <span className="db-detail-panel__tag">
            <IconOffice /> {job.workType || 'On-site'}
          </span>
          <span className="db-detail-panel__tag">
            <IconFull /> {job.employmentType || 'Full-time'}
          </span>
          {job.duration && (
            <span className="db-detail-panel__tag">
              <IconCalendar /> {job.duration}
            </span>
          )}
        </div>

        {/* Info cards */}
        <div className="db-detail-panel__info-row">
          <div className="db-detail-panel__info-card">
            <div className="db-detail-panel__info-card-label">
              <IconMoney /> Salary Range
            </div>
            <div className="db-detail-panel__info-card-value">{job.salary} / mo</div>
          </div>
          <div className="db-detail-panel__info-card">
            <div className="db-detail-panel__info-card-label">
              <IconPin /> Location
            </div>
            <div className="db-detail-panel__info-card-value">{job.location}</div>
          </div>
          <div className="db-detail-panel__info-card">
            <div className="db-detail-panel__info-card-label">
              <IconClock /> Date Posted
            </div>
            <div className="db-detail-panel__info-card-value">{job.postedLabel || '2 days ago'}</div>
          </div>
        </div>

        <div className="db-detail-panel__divider" />

        {/* About */}
        {job.about && (
          <>
            <div className="db-detail-panel__section-title">About the Role</div>
            <p className="db-detail-panel__description">{job.about}</p>
          </>
        )}

        {/* Responsibilities */}
        {job.responsibilities?.length > 0 && (
          <>
            <div className="db-detail-panel__section-title">Responsibilities</div>
            <ul className="db-detail-panel__list">
              {job.responsibilities.map((item, i) => (
                <li key={i}>
                  <IconCheck />
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* --- UPLOAD CV SECTION --- */}
        <div className="db-detail-panel__divider" />
        <div className="db-detail-panel__section-title">Persyaratan Lamaran</div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'inline-block',
            padding: '10px 16px',
            background: 'var(--cf-bg)',
            border: '1px dashed #cbd5e1',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: 'var(--cf-text)'
          }}>
            {cvFile ? `📄 ${cvFile.name}` : '+ Unggah CV (PDF)'}
            <input 
              type="file" 
              accept=".pdf" 
              hidden 
              onChange={e => setCvFile(e.target.files[0])} 
            />
          </label>
        </div>

        {/* Actions */}
        <div className="db-detail-panel__actions">
          {/* Tombol ini sekarang memanggil API Flask dan masuk ke Tracking */}
          <button className="db-detail-panel__btn-primary" onClick={handleInternalApply}>
            <IconGrid /> Tambahkan ke Tracking Dashboard
          </button>
          
          {job.applyUrl && (
            <button className="db-detail-panel__btn-secondary" onClick={handleDaftar}>
              <IconSend /> Lamar Pekerjaan (Eksternal)
            </button>
          )}
        </div>

      </div>
    </>
  )
}