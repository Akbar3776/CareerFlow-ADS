export default function JobCard({ job, onDetail, isAdmin = false, onEdit, onHapus }) {
  const handleDaftar = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener noreferrer')
    }
  }

  return (
    <div className="db-jobcard">
      {/* Left: info */}
      <div className="db-jobcard__info">
        <div className="db-jobcard__title">{job.title}</div>
        <div className="db-jobcard__company">{job.company}</div>
        <div className="db-jobcard__date">{job.dateRange}</div>

        <div className="db-jobcard__badges">
          {job.type === 'internship' && (
            <span className="db-jobcard__badge db-jobcard__badge--internship">Internship</span>
          )}
          {job.type === 'mt' && (
            <span className="db-jobcard__badge db-jobcard__badge--mt">MT</span>
          )}
        </div>

        <div className="db-jobcard__meta">
          <span className="db-jobcard__location">{job.location}</span>
          <span className="db-jobcard__salary">{job.salary} per month</span>
        </div>
      </div>

      {/* Right: logo + actions */}
      <div className="db-jobcard__right">
        {job.logoUrl ? (
          <img className="db-jobcard__logo" src={job.logoUrl} alt={job.company} />
        ) : (
          <div className="db-jobcard__logo-placeholder">{job.company?.slice(0,2)}</div>
        )}

        <div className="db-jobcard__actions">
          {isAdmin ? (
            <>
              <button className="db-jobcard__btn db-jobcard__btn--edit" onClick={() => onEdit(job)}>
                ✏ Edit
              </button>
              <button className="db-jobcard__btn db-jobcard__btn--hapus" onClick={() => onHapus(job)}>
                🗑 Hapus
              </button>
            </>
          ) : (
            <>
              <button className="db-jobcard__btn db-jobcard__btn--daftar" onClick={handleDaftar}>
                Daftar
              </button>
              <button className="db-jobcard__btn db-jobcard__btn--detail" onClick={() => onDetail(job)}>
                Detail
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}