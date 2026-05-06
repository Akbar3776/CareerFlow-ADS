import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/* ---- Icons ---- */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
)
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

// Simulasi daftar username yang sudah terpakai — ganti dengan API call ke backend kamu
const TAKEN_USERNAMES = ['admin', 'careerflow', 'user', 'superadmin', 'test']

export default function SignUpPage() {
  const navigate = useNavigate()

  // Step: 'form' | 'otp'
  const [step, setStep]   = useState('form')
  const [form, setForm]   = useState({ username: '', email: '', password: '', confirm: '' })
  const [otp, setOtp]     = useState(['', '', '', '', '', ''])
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [checkingUser, setCheckingUser] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState(null) // null | 'taken' | 'ok'

  /* ---- Username uniqueness check ---- */
  const checkUsername = async (value) => {
    if (!value || value.length < 3) { setUsernameStatus(null); return }
    setCheckingUser(true)
    // Simulasi API delay — ganti dengan: const res = await fetch(`/api/check-username?u=${value}`)
    await new Promise(r => setTimeout(r, 600))
    const taken = TAKEN_USERNAMES.includes(value.toLowerCase())
    setUsernameStatus(taken ? 'taken' : 'ok')
    setCheckingUser(false)
    if (taken) setErrors(prev => ({ ...prev, username: 'Username already in use, choose another username.' }))
    else setErrors(prev => ({ ...prev, username: '' }))
  }

  const handleChange = (field) => (e) => {
    const val = e.target.value
    setForm(prev => ({ ...prev, [field]: val }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    if (field === 'username') {
      setUsernameStatus(null)
      if (val.length >= 3) checkUsername(val)
    }
  }

  /* ---- Form validation ---- */
  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username wajib diisi.'
    else if (form.username.length < 3) e.username = 'Username minimal 3 karakter.'
    else if (usernameStatus === 'taken') e.username = 'Username already in use, choose another username.'
    if (!form.email.trim()) e.email = 'Email wajib diisi.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Format email tidak valid.'
    if (!form.password.trim()) e.password = 'Kata sandi wajib diisi.'
    else if (form.password.length < 8) e.password = 'Kata sandi minimal 8 karakter.'
    if (form.confirm !== form.password) e.confirm = 'Konfirmasi kata sandi tidak cocok.'
    return e
  }

  /* ---- Submit form → send OTP ---- */
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    // TODO: hit API → POST /api/signup/send-otp { email: form.email }
    // Simulasi kirim OTP
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setStep('otp')
  }

  /* ---- OTP input handling ---- */
  const handleOtpChange = (idx) => (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (idx) => (e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus()
    }
  }

  /* ---- Verify OTP ---- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setErrors({ otp: 'Masukkan 6 digit kode OTP.' }); return }
    setLoading(true)
    // TODO: hit API → POST /api/signup/verify-otp { email: form.email, otp: code }
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    // Berhasil → redirect ke login
    navigate('/login')
  }

  const handleResend = async () => {
    // TODO: hit API → POST /api/signup/resend-otp { email: form.email }
    setOtp(['', '', '', '', '', ''])
    alert(`OTP baru telah dikirim ke ${form.email}`)
  }

  return (
    <>
      <nav className="cf-navbar">
        <span className="cf-navbar__logo">CareerFlow</span>
      </nav>

      <div className="cf-auth-wrapper">
        <div className="cf-auth-card">

          {/* ---- LEFT PANEL ---- */}
          <div className="cf-auth-left">
            <div className="cf-auth-left__image-slot">
              {/*
                TARUH GAMBAR KAMU DI SINI:
                <img src="/src/assets/signup-illustration.png" alt="CareerFlow" />
              */}
            </div>
            <div className="cf-auth-left__text">
              <h2>Mulai Perjalanan Karier Terbaikmu</h2>
              <p>
                Bergabunglah dengan ribuan profesional yang telah
                menemukan peluang karier impian mereka bersama CareerFlow.
              </p>
            </div>
          </div>

          {/* ---- RIGHT PANEL ---- */}
          <div className="cf-auth-right">

            {step === 'form' ? (
              <>
                <h1 className="cf-auth-right__title">Buat Akun Baru</h1>
                <p className="cf-auth-right__subtitle">Isi data diri kamu untuk mulai mendaftar.</p>

                <form className="cf-form" onSubmit={handleSubmit} noValidate>

                  {/* Username */}
                  <div className="cf-field">
                    <label>Username</label>
                    <div className="cf-field__input-wrap">
                      <span className="cf-field__icon"><IconUser /></span>
                      <input
                        type="text"
                        placeholder="Pilih username unik kamu"
                        value={form.username}
                        onChange={handleChange('username')}
                        className={errors.username ? 'has-error' : ''}
                        autoComplete="off"
                      />
                    </div>
                    {checkingUser && <span className="cf-field__hint" style={{color:'var(--cf-muted)'}}>Memeriksa username...</span>}
                    {!checkingUser && usernameStatus === 'ok' && !errors.username && (
                      <span className="cf-field__hint">✓ Username tersedia</span>
                    )}
                    {errors.username && <span className="cf-field__error">{errors.username}</span>}
                  </div>

                  {/* Email */}
                  <div className="cf-field">
                    <label>Email</label>
                    <div className="cf-field__input-wrap">
                      <span className="cf-field__icon"><IconMail /></span>
                      <input
                        type="email"
                        placeholder="Masukkan email aktif kamu"
                        value={form.email}
                        onChange={handleChange('email')}
                        className={errors.email ? 'has-error' : ''}
                      />
                    </div>
                    {errors.email && <span className="cf-field__error">{errors.email}</span>}
                  </div>

                  {/* Password */}
                  <div className="cf-field">
                    <label>Kata Sandi</label>
                    <div className="cf-field__input-wrap">
                      <span className="cf-field__icon"><IconLock /></span>
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Min. 8 karakter"
                        value={form.password}
                        onChange={handleChange('password')}
                        className={`has-right-icon${errors.password ? ' has-error' : ''}`}
                      />
                      <span className="cf-field__eye" onClick={() => setShowPass(p => !p)}>
                        {showPass ? <IconEyeOff /> : <IconEye />}
                      </span>
                    </div>
                    {errors.password && <span className="cf-field__error">{errors.password}</span>}
                  </div>

                  {/* Confirm Password */}
                  <div className="cf-field">
                    <label>Konfirmasi Kata Sandi</label>
                    <div className="cf-field__input-wrap">
                      <span className="cf-field__icon"><IconLock /></span>
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Ulangi kata sandi kamu"
                        value={form.confirm}
                        onChange={handleChange('confirm')}
                        className={`has-right-icon${errors.confirm ? ' has-error' : ''}`}
                      />
                      <span className="cf-field__eye" onClick={() => setShowConfirm(p => !p)}>
                        {showConfirm ? <IconEyeOff /> : <IconEye />}
                      </span>
                    </div>
                    {errors.confirm && <span className="cf-field__error">{errors.confirm}</span>}
                  </div>

                  <button type="submit" className="cf-btn-primary" disabled={loading || usernameStatus === 'taken'}>
                    {loading ? 'Mengirim OTP...' : <><span>Daftar &amp; Verifikasi Email</span><span className="cf-btn-arrow">→</span></>}
                  </button>
                </form>

                <p className="cf-auth-footer">
                  Sudah punya akun?{' '}
                  <Link to="/login" className="cf-link">Masuk</Link>
                </p>
              </>
            ) : (
              /* ---- OTP STEP ---- */
              <>
                <h1 className="cf-auth-right__title">Verifikasi Email</h1>
                <p className="cf-auth-right__subtitle">
                  Kode OTP 6 digit telah dikirim ke <strong>{form.email}</strong>. Masukkan kode di bawah ini.
                </p>

                <form className="cf-form" onSubmit={handleVerifyOtp} noValidate>
                  <div className="cf-otp-wrap">
                    {otp.map((val, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={val}
                        onChange={handleOtpChange(idx)}
                        onKeyDown={handleOtpKeyDown(idx)}
                      />
                    ))}
                  </div>
                  {errors.otp && <span className="cf-field__error" style={{textAlign:'center'}}>{errors.otp}</span>}

                  <p className="cf-otp-hint">
                    Tidak menerima kode?{' '}
                    <span onClick={handleResend}>Kirim ulang OTP</span>
                  </p>

                  <button type="submit" className="cf-btn-primary" disabled={loading}>
                    {loading ? 'Memverifikasi...' : <><span>Verifikasi &amp; Selesai</span><span className="cf-btn-arrow">→</span></>}
                  </button>
                </form>

                <p className="cf-auth-footer">
                  <span className="cf-link" onClick={() => setStep('form')}>← Kembali ke form pendaftaran</span>
                </p>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
