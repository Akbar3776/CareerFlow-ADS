
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Pencil, Info, KeyRound, X } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import api from '../api'

const DEFAULT_USER = {
  name: '',
  username: '',
  email: '',
  bio: '',
  photo: null,
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)


  const [profileOpen, setProfileOpen] = useState(false)
  const [form, setForm] = useState({ ...DEFAULT_USER })
  const [savedForm, setSavedForm] = useState({ ...DEFAULT_USER })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // email change state
  const [showEmailConfirm, setShowEmailConfirm] = useState(false)
  const [showEmailInline, setShowEmailInline] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // Fetch profile on mount
  useEffect(() => {
    setLoading(true)
    setError('')
    api.get('/profile')
      .then(res => {
        // Map backend fields to frontend state
        setForm(f => ({
          ...f,
          name: res.data.name || '',
          username: res.data.username || '',
          email: res.data.email || '',
          bio: res.data.bio || '',
          photo: res.data.photo || null,
        }))
        setSavedForm(f => ({
          ...f,
          name: res.data.name || '',
          username: res.data.username || '',
          email: res.data.email || '',
          bio: res.data.bio || '',
          photo: res.data.photo || null,
        }))
        if (res.data.photo) setPhotoPreview(res.data.photo)
      })
      .catch(err => {
        setError('Gagal memuat profil. Silakan login ulang.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }

  const handleRemovePhoto = () => {
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))


  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      // Prepare payload
      let payload = {
        nama: form.name,
        username: form.username,
        bio: form.bio,
      }
      if (form.email !== savedForm.email) {
        payload.email = form.email
        payload.password = confirmPassword // required for email change
      }
      // Optionally handle photo (not implemented: file upload)
      // if (photoPreview && photoPreview !== form.photo) payload.photo = photoPreview

      const res = await api.put('/profile', payload)
      setSavedForm({ ...form })
      setSuccess('Perubahan berhasil disimpan!')
      setShowEmailInline(false)
      setConfirmPassword('')
      setNewEmail('')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan perubahan')
    } finally {
      setLoading(false)
    }
  }

  const handleDiscard = () => {
    setForm({ ...savedForm })
    setPhotoPreview(null)
  }

  const handleEmailConfirmYes = () => {
    setShowEmailConfirm(false)
    setShowEmailInline(true)
    setNewEmail('')
    setConfirmPassword('')
  }

  const handleEmailConfirmClose = () => {
    setShowEmailConfirm(false)
  }

  const handleEmailInlineCancel = () => {
    setShowEmailInline(false)
    setNewEmail('')
    setConfirmPassword('')
  }

  const handleEmailInlineConfirm = () => {
    if (!newEmail.trim() || !confirmPassword.trim()) return
    setForm(prev => ({ ...prev, email: newEmail }))
    // Do not close inline, let handleSave handle it
  }

  return (
    <div className="prf-wrapper">
      <Navbar
        user={{ name: form.name, role: 'Member' }}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handlePhotoChange}
      />

      {/* Error/Success messages */}
      {error && <div className="prf-alert prf-alert--error">{error}</div>}
      {success && <div className="prf-alert prf-alert--success">{success}</div>}

      {/* Email confirm popup overlay */}
      {showEmailConfirm && (
        <div className="prf-overlay" onMouseDown={handleEmailConfirmClose}>
          <div className="prf-popup" onMouseDown={e => e.stopPropagation()}>
            <button className="prf-popup__close" onClick={handleEmailConfirmClose}>
              <X size={16} />
            </button>
            <h3 className="prf-popup__title">Ganti Email?</h3>
            <p className="prf-popup__desc">
              Apakah Anda yakin ingin mengganti alamat email akun ini?
            </p>
            <div className="prf-popup__actions">
              <button className="prf-popup__btn prf-popup__btn--cancel"
                onClick={handleEmailConfirmClose}>
                Cancel
              </button>
              <button className="prf-popup__btn prf-popup__btn--yes"
                onClick={handleEmailConfirmYes}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="prf-container">

        {/* Photo section */}
        <div className="prf-photo-section">
          <div className="prf-photo-wrap" onClick={handlePhotoClick}>
            {photoPreview ? (
              <img className="prf-photo" src={photoPreview} alt="profile" />
            ) : (
              <div className="prf-photo-placeholder">
                {form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="prf-photo-overlay">
              <Camera size={18} color="#fff" />
            </div>
          </div>

          <div className="prf-photo-info">
            <h2 className="prf-photo-info__title">Your profile picture</h2>
            <p className="prf-photo-info__desc">A clear photo helps you stand out to recruiters.</p>
            <div className="prf-photo-info__actions">
              <button className="prf-photo-btn prf-photo-btn--change" onClick={handlePhotoClick}>
                Change Photo
              </button>
              <button className="prf-photo-btn prf-photo-btn--remove" onClick={handleRemovePhoto}>
                Remove
              </button>
            </div>
          </div>
        </div>

        <div className="prf-divider" />

        {/* Form */}
        <div className="prf-form">

          {/* Full Name + Username */}
          <div className="prf-row">
            <div className="prf-field">
              <label className="prf-field__label">Full Name</label>
              <input
                className="prf-field__input"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
              />
            </div>
            <div className="prf-field">
              <label className="prf-field__label">Username</label>
              <div className="prf-field__input-wrap">
                <span className="prf-field__prefix">@</span>
                <input
                  className="prf-field__input prf-field__input--prefixed"
                  type="text"
                  value={form.username}
                  onChange={handleChange('username')}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="prf-field">
            <label className="prf-field__label">Email Address</label>
            <div
              className="prf-field__input-wrap prf-field__input-wrap--email"
              onClick={() => !showEmailInline && setShowEmailConfirm(true)}
              style={{ cursor: 'pointer' }}
            >
              <input
                className="prf-field__input"
                type="email"
                value={form.email}
                readOnly
                style={{ cursor: 'pointer', pointerEvents: 'none' }}
              />
              <span className="prf-field__icon-right">
                <Pencil size={14} />
              </span>
            </div>
            <div className="prf-field__hint">
              <Info size={12} />
              <span>This email will be used for account recovery and recruiter communication.</span>
            </div>

            {/* Inline email change */}
            {showEmailInline && (
              <div className="prf-email-inline">
                <div className="prf-field">
                  <label className="prf-field__label">New Email</label>
                  <input
                    className="prf-field__input"
                    type="email"
                    placeholder="Enter new email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="prf-field">
                  <label className="prf-field__label">Confirm Password</label>
                  <input
                    className="prf-field__input"
                    type="password"
                    placeholder="Enter your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  <div className="prf-email-inline__forgot"
                    onClick={() => navigate('/forgot-password')}>
                    <KeyRound size={12} />
                    <span>Forgot password?</span>
                  </div>
                </div>
                <div className="prf-email-inline__actions">
                  <button
                    className="prf-email-inline__btn prf-email-inline__btn--cancel"
                    onClick={handleEmailInlineCancel}>
                    Cancel
                  </button>
                  <button
                    className="prf-email-inline__btn prf-email-inline__btn--confirm"
                    onClick={handleEmailInlineConfirm}>
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="prf-field">
            <label className="prf-field__label">Professional Bio</label>
            <textarea
              className="prf-field__textarea"
              rows={5}
              value={form.bio}
              onChange={handleChange('bio')}
            />
          </div>

        </div>

        {/* Actions */}
        <div className="prf-actions">
          <button className="prf-actions__discard" onClick={handleDiscard} disabled={loading}>
            Discard Changes
          </button>
          <button className="prf-actions__save" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>

      <footer className="db-footer">
        © 2026 CareerFlow Professional Network. All rights reserved.
      </footer>
    </div>
  )
}