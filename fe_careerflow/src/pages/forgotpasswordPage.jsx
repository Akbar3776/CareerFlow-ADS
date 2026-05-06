import { useState } from 'react'
import { Link } from 'react-router-dom'

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
const IconCheck = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

// Step: 'email' | 'otp' | 'reset' | 'done'
export default function ForgotPasswordPage() {
  const [step, setStep]         = useState('email')
  const [email, setEmail]       = useState('')
  const [otp, setOtp]           = useState(['', '', '', '', '', ''])
  const [newPass, setNewPass]   = useState('')
  const [confPass, setConfPass] = useState('')
  const [showNew, setShowNew]   = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)

  /* ---- Step 1: Send OTP to email ---- */
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Masukkan email yang valid.' }); return
    }
    setLoading(true)
    // TODO: POST /api/forgot-password/send-otp { email }
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setStep('otp')
  }

  /* ---- OTP input ---- */
  const handleOtpChange = (idx) => (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) document.getElementById(`fp-otp-${idx + 1}`)?.focus()
  }
  const handleOtpKeyDown = (idx) => (e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`fp-otp-${idx - 1}`)?.focus()
    }
  }

  /* ---- Step 2: Verify OTP ---- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.join('').length < 6) { setErrors({ otp: 'Masukkan 6 digit kode OTP.' }); return }
    setLoading(true)
    // TODO: POST /api/forgot-password/verify-otp { email, otp }
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setErrors({})
    setStep('reset')
  }

  /* ---- Step 3: Reset password ---- */
  const handleResetPassword = async (e) => {
    e.preventDefault()
    const errs = {}
    if (newPass.length < 8) errs.newPass = 'Kata sandi minimal 8 karakter.'
    if (newPass !== confPass) errs.confPass = 'Konfirmasi kata sandi tidak cocok.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    // TODO: POST /api/forgot-password/reset { email, newPassword: newPass }
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setStep('done')
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
                <img src="/src/assets/forgot-illustration.png" alt="" />
              */}
            </div>
            <div className="cf-auth-left__text">
              <h2>Pulihkan Akses Akunmu</h2>
              <p>
                Kami akan membantu kamu mengatur ulang kata sandi
                dengan aman melalui verifikasi email.
              </p>
            </div>
          </div>

          {/* ---- RIGHT PANEL ---- */}
          <div className="cf-auth-right">

            {/* STEP 1: Email */}
            {step === 'email' && (
              <>
                <h1 className="cf-auth-right__title">Lupa Kata Sandi?</h1>
                <p className="cf-auth-right__subtitle">
                  Masukkan email akun kamu. Kami akan mengirimkan kode OTP untuk mereset kata sandi.
                </p>

                <form className="cf-form" onSubmit={handleSendOtp} noValidate>
                  <div className="cf-field">
                    <label>Email Akun</label>
                    <div className="cf-field__input-wrap">
                      <span className="cf-field__icon"><IconMail /></span>
                      <input
                        type="email"
                        placeholder="Masukkan email kamu"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setErrors({}) }}
                        className={errors.email ? 'has-error' : ''}
                      />
                    </div>
                    {errors.email && <span className="cf-field__error">{errors.email}</span>}
                  </div>

                  <button type="submit" className="cf-btn-primary" disabled={loading}>
                    {loading ? 'Mengirim OTP...' : <><span>Kirim Kode OTP</span><span className="cf-btn-arrow">→</span></>}
                  </button>
                </form>

                <p className="cf-auth-footer">
                  Ingat kata sandi?{' '}
                  <Link to="/login" className="cf-link">Masuk</Link>
                </p>
              </>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 'otp' && (
              <>
                <h1 className="cf-auth-right__title">Verifikasi Kode OTP</h1>
                <p className="cf-auth-right__subtitle">
                  Kode OTP 6 digit telah dikirim ke <strong>{email}</strong>
                </p>

                <form className="cf-form" onSubmit={handleVerifyOtp} noValidate>
                  <div className="cf-otp-wrap">
                    {otp.map((val, idx) => (
                      <input
                        key={idx}
                        id={`fp-otp-${idx}`}
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
                    <span onClick={() => { setOtp(['','','','','','']); alert(`OTP baru dikirim ke ${email}`) }}>
                      Kirim ulang OTP
                    </span>
                  </p>

                  <button type="submit" className="cf-btn-primary" disabled={loading}>
                    {loading ? 'Memverifikasi...' : <><span>Verifikasi</span><span className="cf-btn-arrow">→</span></>}
                  </button>
                </form>

                <p className="cf-auth-footer">
                  <span className="cf-link" onClick={() => setStep('email')}>← Ganti email</span>
                </p>
              </>
            )}

            {/* STEP 3: Reset Password */}
            {step === 'reset' && (
              <>
                <h1 className="cf-auth-right__title">Buat Kata Sandi Baru</h1>
                <p className="cf-auth-right__subtitle">Pilih kata sandi yang kuat dan mudah diingat.</p>

                <form className="cf-form" onSubmit={handleResetPassword} noValidate>
                  <div className="cf-field">
                    <label>Kata Sandi Baru</label>
                    <div className="cf-field__input-wrap">
                      <span className="cf-field__icon"><IconLock /></span>
                      <input
                        type={showNew ? 'text' : 'password'}
                        placeholder="Min. 8 karakter"
                        value={newPass}
                        onChange={e => { setNewPass(e.target.value); setErrors(prev => ({...prev, newPass: ''})) }}
                        className={`has-right-icon${errors.newPass ? ' has-error' : ''}`}
                      />
                      <span className="cf-field__eye" onClick={() => setShowNew(p => !p)}>
                        {showNew ? <IconEyeOff /> : <IconEye />}
                      </span>
                    </div>
                    {errors.newPass && <span className="cf-field__error">{errors.newPass}</span>}
                  </div>

                  <div className="cf-field">
                    <label>Konfirmasi Kata Sandi</label>
                    <div className="cf-field__input-wrap">
                      <span className="cf-field__icon"><IconLock /></span>
                      <input
                        type={showConf ? 'text' : 'password'}
                        placeholder="Ulangi kata sandi baru"
                        value={confPass}
                        onChange={e => { setConfPass(e.target.value); setErrors(prev => ({...prev, confPass: ''})) }}
                        className={`has-right-icon${errors.confPass ? ' has-error' : ''}`}
                      />
                      <span className="cf-field__eye" onClick={() => setShowConf(p => !p)}>
                        {showConf ? <IconEyeOff /> : <IconEye />}
                      </span>
                    </div>
                    {errors.confPass && <span className="cf-field__error">{errors.confPass}</span>}
                  </div>

                  <button type="submit" className="cf-btn-primary" disabled={loading}>
                    {loading ? 'Menyimpan...' : <><span>Simpan Kata Sandi Baru</span><span className="cf-btn-arrow">→</span></>}
                  </button>
                </form>
              </>
            )}

            {/* STEP 4: Done */}
            {step === 'done' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ color: 'var(--cf-success)', marginBottom: '16px' }}>
                  <IconCheck />
                </div>
                <h1 className="cf-auth-right__title" style={{ marginBottom: '12px' }}>
                  Kata Sandi Berhasil Direset!
                </h1>
                <p className="cf-auth-right__subtitle">
                  Kata sandi akun kamu telah diperbarui. Silakan masuk dengan kata sandi baru.
                </p>
                <Link to="/login">
                  <button className="cf-btn-primary" style={{ marginTop: '24px' }}>
                    <span>Masuk Sekarang</span>
                    <span className="cf-btn-arrow">→</span>
                  </button>
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
