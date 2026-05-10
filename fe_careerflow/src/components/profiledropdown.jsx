import { useNavigate } from 'react-router-dom'

export default function ProfileDropdown({ onClose }) {
  const navigate = useNavigate()

  const go = (path) => {
    onClose()
    navigate(path)
  }

  return (
    <div className="db-profile-dropdown">
      <button className="db-profile-dropdown__item" onClick={() => go('/profile')}>
        Lihat Profile
      </button>
      <button className="db-profile-dropdown__item" onClick={() => go('/tracking')}>
        Lihat Tracking
      </button>
    </div>
  )
}
